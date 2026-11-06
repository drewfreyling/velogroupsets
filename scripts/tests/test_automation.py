import io
import json
from pathlib import Path
import sys
import tarfile
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from check_commits import valid_header
from hcp_run import HCPError, archive_configuration, queue_run, upload_archive


class FakeClient:
    def __init__(self, auto_apply=False, mode="remote", upload_status="uploaded"):
        self.calls = []
        self.auto_apply = auto_apply
        self.mode = mode
        self.upload_status = upload_status

    def request(self, method, path, payload=None):
        self.calls.append((method, path, payload))
        if "/organizations/" in path:
            return {"data": {"id": "ws-example", "attributes": {
                "auto-apply": self.auto_apply, "execution-mode": self.mode,
            }}}
        if method == "POST" and path.endswith("/configuration-versions"):
            return {"data": {"id": "cv-example", "attributes": {
                "upload-url": "https://uploads.example.test/config",
            }}}
        if method == "GET" and path == "/configuration-versions/cv-example":
            return {"data": {"attributes": {"status": self.upload_status}}}
        if method == "POST" and path == "/runs":
            return {"data": {"id": "run-example"}}
        raise AssertionError(f"Unexpected API call: {method} {path}")


class HCPRunTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "environments").mkdir()
        (self.root / "main.tf").write_text('terraform {}\n')
        (self.root / ".terraform.lock.hcl").write_text("# locked\n")
        for environment in ("staging", "production"):
            (self.root / "environments" / f"{environment}.tfvars").write_text(f'environment = "{environment}"\n')
        for filename in ("terraform.tfstate", "credentials.tfrc.json", "saved.tfplan"):
            (self.root / filename).write_text("MUST NOT UPLOAD")
        self.uploads = []

    def queue(self, client, plan_only=False, workspace="velogroupsets-staging"):
        return queue_run(client, "example-org", workspace, "staging", "a" * 40,
                         plan_only, root=self.root,
                         upload=lambda url, content: self.uploads.append((url, content)))

    def test_archive_includes_only_config_lock_and_selected_environment(self):
        data = archive_configuration(self.root, "staging")
        with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
            self.assertEqual(set(archive.getnames()), {"main.tf", ".terraform.lock.hcl", "environment.auto.tfvars"})
            self.assertEqual(archive.extractfile("environment.auto.tfvars").read(), b'environment = "staging"\n')

    def test_apply_capable_run_always_requires_native_approval(self):
        client = FakeClient()
        url = self.queue(client)
        self.assertTrue(url.endswith("/workspaces/velogroupsets-staging/runs/run-example"))
        payload = next(payload for method, path, payload in client.calls if path == "/runs")
        self.assertEqual(payload["data"]["attributes"], {
            "message": f'velogroupsets staging commit {"a" * 40}',
            "plan-only": False, "auto-apply": False, "is-destroy": False,
        })
        self.assertFalse(any("/actions/apply" in path for _, path, _ in client.calls))

    def test_speculative_configuration_and_run_cannot_be_applied(self):
        client = FakeClient()
        self.queue(client, plan_only=True)
        configurations = [payload for method, path, payload in client.calls if method == "POST" and path.endswith("/configuration-versions")]
        self.assertTrue(configurations[0]["data"]["attributes"]["speculative"])
        run = next(payload for _, path, payload in client.calls if path == "/runs")
        self.assertTrue(run["data"]["attributes"]["plan-only"])

    def test_rejects_auto_apply_or_local_workspace_before_upload(self):
        for client in (FakeClient(auto_apply=True), FakeClient(mode="local")):
            with self.subTest(client=client), self.assertRaises(HCPError):
                self.queue(client)
            self.assertFalse(any(method == "POST" for method, _, _ in client.calls))
        self.assertEqual(self.uploads, [])

    def test_rejects_environment_workspace_mismatch(self):
        client = FakeClient()
        with self.assertRaises(HCPError):
            self.queue(client, workspace="velogroupsets-production")
        self.assertEqual(client.calls, [])

    def test_failed_upload_never_creates_run(self):
        client = FakeClient(upload_status="errored")
        with self.assertRaises(HCPError):
            self.queue(client)
        self.assertFalse(any(path == "/runs" for _, path, _ in client.calls))

    def test_upload_has_no_hcp_authorization_header(self):
        with patch("hcp_run.urlopen") as opener:
            upload_archive("https://uploads.example.test/config", b"config")
            request = opener.call_args.args[0]
            self.assertIsNone(request.get_header("Authorization"))
        with self.assertRaises(HCPError):
            upload_archive("http://uploads.example.test/config", b"config")


class CommitTests(unittest.TestCase):
    def test_valid_and_invalid_headers(self):
        for subject in ("feat(api)!: change response format", "data(components): add model", "ci: validate infrastructure"):
            with self.subTest(subject=subject):
                self.assertTrue(valid_header(subject))
        for subject in ("update readme", "feat:no space", "fix: ", "docs(): missing scope", "feat: first\nsecond"):
            with self.subTest(subject=subject):
                self.assertFalse(valid_header(subject))


if __name__ == "__main__":
    unittest.main()
