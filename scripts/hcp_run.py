#!/usr/bin/env python3
"""Upload only Terraform configuration and queue a remote HCP run; never apply."""
import argparse
import io
import json
import os
from pathlib import Path
import re
import sys
import tarfile
import time
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlsplit
from urllib.request import Request, urlopen

API = "https://app.terraform.io/api/v2"
ROOT = Path(__file__).resolve().parents[1] / "infra" / "terraform"


class HCPError(RuntimeError):
    pass


class Client:
    def __init__(self, token):
        if not token:
            raise HCPError("TF_API_TOKEN is required.")
        self.token = token

    def request(self, method, path, payload=None):
        data = json.dumps(payload).encode() if payload is not None else None
        request = Request(API + path, data=data, method=method, headers={
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/vnd.api+json",
        })
        try:
            with urlopen(request, timeout=30) as response:
                return json.load(response)
        except HTTPError as error:
            # Response bodies and request URLs may contain sensitive values.
            raise HCPError(f"HCP API request failed (HTTP {error.code}).") from None
        except (URLError, TimeoutError):
            raise HCPError("HCP API request failed or timed out.") from None


def archive_configuration(root, environment):
    if environment not in ("staging", "production"):
        raise HCPError("Unknown environment.")
    files = sorted(root.glob("*.tf"))
    lockfile = root / ".terraform.lock.hcl"
    selected = root / "environments" / f"{environment}.tfvars"
    if not files or not lockfile.is_file() or not selected.is_file():
        raise HCPError("Terraform files, provider lock file and environment inputs are required.")
    # Explicit allowlist: never upload state, credentials, plans, tests, or both environments.
    content = io.BytesIO()
    with tarfile.open(fileobj=content, mode="w:gz") as archive:
        for path in [*files, lockfile]:
            if path.is_symlink():
                raise HCPError("Terraform configuration files must not be symlinks.")
            archive.add(path, arcname=path.name, recursive=False)
        if selected.is_symlink():
            raise HCPError("Environment input files must not be symlinks.")
        archive.add(selected, arcname="environment.auto.tfvars", recursive=False)
    return content.getvalue()


def upload_archive(url, content):
    if urlsplit(url).scheme != "https":
        raise HCPError("HCP upload URL must use HTTPS.")
    # This presigned URL gets NO HCP Authorization header.
    try:
        request = Request(url, data=content, method="PUT", headers={"Content-Type": "application/octet-stream"})
        with urlopen(request, timeout=30):
            pass
    except (HTTPError, URLError, TimeoutError):
        raise HCPError("HCP configuration upload failed.") from None


def queue_run(client, organization, workspace, environment, sha, plan_only, root=ROOT, upload=upload_archive):
    if workspace != f"velogroupsets-{environment}":
        raise HCPError("Workspace must match the selected environment: velogroupsets-<environment>.")
    if not organization or not re.fullmatch(r"[0-9a-f]{40}", sha):
        raise HCPError("Organization and full source commit SHA are required.")
    content = archive_configuration(root, environment)
    ws = client.request("GET", f"/organizations/{quote(organization, safe='')}/workspaces/{quote(workspace, safe='')}")["data"]
    if ws["attributes"].get("execution-mode") != "remote":
        raise HCPError("HCP workspace must use remote execution.")
    if ws["attributes"].get("auto-apply") is not False:
        raise HCPError("Disable workspace auto-apply before queueing a run.")
    versions_path = f'/workspaces/{ws["id"]}/configuration-versions'
    config = client.request("POST", versions_path, {"data": {
        "type": "configuration-versions",
        "attributes": {"auto-queue-runs": False, "speculative": plan_only},
    }})["data"]
    upload(config["attributes"]["upload-url"], content)
    for _ in range(30):
        current = client.request("GET", f'/configuration-versions/{config["id"]}')["data"]["attributes"]["status"]
        if current == "uploaded":
            break
        if current in ("errored", "archived"):
            raise HCPError("HCP rejected the configuration upload.")
        time.sleep(2)
    else:
        raise HCPError("Timed out waiting for HCP to accept the configuration upload.")
    run = client.request("POST", "/runs", {"data": {
        "type": "runs",
        "attributes": {
            "message": f"velogroupsets {environment} commit {sha}",
            "plan-only": plan_only,
            # Explicitly override workspace settings. There is no apply API call here.
            "auto-apply": False,
            "is-destroy": False,
        },
        "relationships": {
            "workspace": {"data": {"type": "workspaces", "id": ws["id"]}},
            "configuration-version": {"data": {"type": "configuration-versions", "id": config["id"]}},
        },
    }})["data"]
    if not re.fullmatch(r"run-[A-Za-z0-9]+", run["id"]):
        raise HCPError("Unexpected HCP run identifier.")
    return f"https://app.terraform.io/app/{quote(organization, safe='')}/workspaces/{workspace}/runs/{run['id']}"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--environment", choices=("staging", "production"), required=True)
    parser.add_argument("--plan-only", action="store_true", help="Queue a speculative run that cannot be applied.")
    args = parser.parse_args()
    try:
        url = queue_run(
            Client(os.environ.get("TF_API_TOKEN")),
            os.environ.get("TF_CLOUD_ORGANIZATION", ""),
            os.environ.get("TF_WORKSPACE", ""),
            args.environment,
            os.environ.get("GITHUB_SHA", ""),
            args.plan_only,
        )
        print(f"Queued HCP Terraform run: {url}")
        summary = os.environ.get("GITHUB_STEP_SUMMARY")
        if summary:
            with open(summary, "a") as output:
                output.write(f"### Terraform run queued\n\n[Review run in HCP Terraform]({url})\n\n")
                output.write("Run submission succeeded; planning and apply results must be checked in HCP.\n")
                output.write("Speculative plan: cannot be applied.\n" if args.plan_only else "Auto-apply is off. Review and explicitly approve this plan in HCP before applying.\n")
        return 0
    except (HCPError, KeyError, ValueError) as error:
        # Do not emit request bodies, tokens, presigned URLs, or tracebacks.
        print(str(error) if isinstance(error, HCPError) else "Unexpected HCP API response.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
