"""Verify installer failures stop before an executable reaches the runner path."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[2]

class InstallerTests(unittest.TestCase):
    def run_installer(self,version,curl_body,token=None):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            (root/'.opentofu-version').write_text(version+'\n')
            (root/'curl').write_text('#!/usr/bin/env bash\n'+curl_body+'\n')
            (root/'curl').chmod(0o755)
            env={**os.environ,'PATH':str(root)+':'+os.environ['PATH'],
                 'RUNNER_TEMP':str(root),'GITHUB_PATH':str(root/'runner-path')}
            env.pop('GH_TOKEN',None)
            if token is not None:
                env['GH_TOKEN']=token
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

    def test_authenticated_api_fallback_still_rejects_corrupt_archive(self):
        result=self.run_installer('1.13.9',self.fallback_curl(),'synthetic-release-token')
        self.assertIn('API_FALLBACK',result.stdout)
        self.assertIn('FAILED',result.stdout)
        self.assertNotIn('synthetic-release-token',result.stdout+result.stderr)

    def fallback_curl(self):
        return '''args="$*"
archive=""
while [[ $# -gt 0 ]]; do
  if [[ $1 == --output ]]; then archive="$2"; shift; fi
  shift
done
if [[ "$args" != *api.github.com* ]]; then
  [[ "$args" != *Authorization* ]] || exit 99
  exit 22
fi
[[ "$args" == *"Authorization: Bearer synthetic-release-token"* ]] || exit 98
[[ "$args" == *"?download="* ]] || exit 97
echo API_FALLBACK
printf corrupt > "$archive"
'''

    def run_provider_installer(self,lock,curl_body=None,token=None):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            (root/'infra/opentofu').mkdir(parents=True)
            (root/'infra/opentofu/.terraform.lock.hcl').write_text(lock)
            curl_body=curl_body or 'while [[ $# -gt 0 ]]; do\n if [[ $1 == --output ]]; then printf corrupt > "$2"; exit 0; fi\n shift\ndone\nexit 1\n'
            (root/'curl').write_text('#!/usr/bin/env bash\n'+curl_body)
            (root/'curl').chmod(0o755)
            env={**os.environ,'PATH':str(root)+':'+os.environ['PATH'],
                 'RUNNER_TEMP':str(root),'GITHUB_ENV':str(root/'runner-env')}
            env.pop('GH_TOKEN',None)
            if token is not None:
                env['GH_TOKEN']=token
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

    def test_provider_authenticated_fallback_preserves_lock_checksum_verification(self):
        result=self.run_provider_installer((ROOT/'infra/opentofu/.terraform.lock.hcl').read_text(),self.fallback_curl(),'synthetic-release-token')
        self.assertIn('API_FALLBACK',result.stdout)
        self.assertIn('FAILED',result.stdout)
        self.assertNotIn('synthetic-release-token',result.stdout+result.stderr)
