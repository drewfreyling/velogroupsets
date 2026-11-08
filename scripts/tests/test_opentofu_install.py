"""Verify installer failures stop before an executable reaches the runner path."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[2]

class InstallerTests(unittest.TestCase):
    def run_installer(self,version,curl_body):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            (root/'.opentofu-version').write_text(version+'\n')
            (root/'curl').write_text('#!/usr/bin/env bash\n'+curl_body+'\n')
            (root/'curl').chmod(0o755)
            env={**os.environ,'PATH':str(root)+':'+os.environ['PATH'],
                 'RUNNER_TEMP':str(root),'GITHUB_PATH':str(root/'runner-path')}
            result=subprocess.run(['bash',str(ROOT/'scripts/install_opentofu.sh')],cwd=root,env=env,capture_output=True,text=True)
            self.assertNotEqual(result.returncode,0)
            self.assertFalse((root/'runner-path').exists())
            self.assertFalse((root/'opentofu/tofu').exists())
            return result

    def test_rejects_unverified_version_before_download(self):
        result=self.run_installer('0.0.0','echo DOWNLOAD_SHOULD_NOT_RUN; exit 0')
        self.assertIn('No verified OpenTofu release digest',result.stderr)
        self.assertNotIn('DOWNLOAD_SHOULD_NOT_RUN',result.stdout)

    def test_rejects_corrupt_download(self):
        result=self.run_installer('1.13.9','printf corrupt > "$RUNNER_TEMP/opentofu.zip"')
        self.assertIn('FAILED',result.stdout)

    def test_failed_download_never_installs(self):
        self.run_installer('1.13.9','exit 22')

    def run_provider_installer(self,lock):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            (root/'infra/opentofu').mkdir(parents=True)
            (root/'infra/opentofu/.terraform.lock.hcl').write_text(lock)
            (root/'curl').write_text('#!/usr/bin/env bash\nwhile [[ $# -gt 0 ]]; do\n if [[ $1 == --output ]]; then printf corrupt > "$2"; exit 0; fi\n shift\ndone\nexit 1\n')
            (root/'curl').chmod(0o755)
            env={**os.environ,'PATH':str(root)+':'+os.environ['PATH'],
                 'RUNNER_TEMP':str(root),'GITHUB_ENV':str(root/'runner-env')}
            result=subprocess.run(['bash',str(ROOT/'scripts/install_cloudflare_provider.sh')],cwd=root,env=env,capture_output=True,text=True)
            self.assertNotEqual(result.returncode,0)
            self.assertFalse((root/'runner-env').exists())
            self.assertFalse((root/'provider-mirror.tfrc').exists())
            return result

    def test_provider_mirror_rejects_unlocked_version(self):
        result=self.run_provider_installer('version = "0.0.0"')
        self.assertIn('must match the committed dependency lock',result.stderr)

    def test_provider_mirror_rejects_corrupt_download(self):
        result=self.run_provider_installer((ROOT/'infra/opentofu/.terraform.lock.hcl').read_text())
        self.assertIn('FAILED',result.stdout)
