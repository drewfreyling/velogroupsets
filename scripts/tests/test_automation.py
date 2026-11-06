import hashlib
import io
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from check_commits import valid_header
from infra import encryption_env, encrypted, plan_key, require_reviewers, snapshot, verify_plan


class PlanSafetyTests(unittest.TestCase):
    def test_encryption_requires_a_safe_full_length_secret(self):
        for key in ('', 'short', 'a' * 63, '"\nmethod unsafe {}'):
            with self.subTest(key=key), self.assertRaises(ValueError):
                encryption_env(key)
        config = encryption_env('a' * 64)['TF_ENCRYPTION']
        self.assertIn('aes_gcm', config)
        self.assertEqual(config.count('enforced = true'), 2)

    def test_rejects_corrupt_or_plaintext_plan(self):
        ciphertext = json.dumps({'encryption_version': 'v0', 'encrypted_data': 'example'}).encode()
        digest = hashlib.sha256(ciphertext).hexdigest()
        verify_plan(ciphertext, digest)
        for data, expected in ((ciphertext + b'changed', digest), (b'plaintext', hashlib.sha256(b'plaintext').hexdigest())):
            with self.subTest(data=data), self.assertRaises(ValueError):
                verify_plan(data, expected)

    def test_plan_keys_are_bound_to_commit_run_attempt_and_environment(self):
        self.assertEqual(plan_key('staging', '42', '1', 'a' * 40), f'plans/staging/42/1/{"a" * 40}/plan.tofuplan')
        self.assertNotEqual(plan_key('staging', '42', '1', 'a' * 40), plan_key('production', '42', '1', 'a' * 40))
        for env, run, attempt, sha in (('other', '42', '1', 'a' * 40), ('staging', '../42', '1', 'a' * 40), ('staging', '42', '1', 'main')):
            with self.subTest(environment=env), self.assertRaises(ValueError):
                plan_key(env, run, attempt, sha)

    def test_apply_refuses_an_environment_without_required_reviewers(self):
        with patch('infra.urlopen') as request:
            request.return_value.__enter__.return_value = io.StringIO(json.dumps({'protection_rules': []}))
            with self.assertRaises(ValueError):
                require_reviewers('example/repo', 'staging', 'fake-test-token')

    def test_configured_reviewer_gate_is_accepted(self):
        with patch('infra.urlopen') as request:
            request.return_value.__enter__.return_value = io.StringIO(json.dumps({'protection_rules': [
                {'type': 'required_reviewers', 'reviewers': [{'type': 'User', 'reviewer': {'id': 1}}]},
            ]}))
            require_reviewers('example/repo', 'production', 'fake-test-token')

    def test_snapshots_are_immutable_and_ciphertext_only(self):
        client = Mock()
        client.get_object.return_value = {'Body': io.BytesIO(b'{"encryption_version":"v0"}')}
        snapshot(client, 'staging', '42', '1', 'before-apply')
        self.assertEqual(client.put_object.call_args.kwargs['IfNoneMatch'], '*')
        self.assertEqual(client.put_object.call_args.kwargs['Key'], 'snapshots/staging/42/1/before-apply.tfstate')
        client.reset_mock()
        client.get_object.return_value = {'Body': io.BytesIO(b'{"version":4,"resources":[]}')}
        with self.assertRaises(ValueError):
            snapshot(client, 'staging', '42', '1', 'before-apply')
        client.put_object.assert_not_called()

    def test_missing_initial_state_is_ok_but_denied_access_is_not(self):
        from botocore.exceptions import ClientError
        client = Mock()
        client.get_object.side_effect = ClientError({'Error': {'Code': 'NoSuchKey'}}, 'GetObject')
        snapshot(client, 'staging', '42', '1', 'before-plan')
        client.put_object.assert_not_called()
        client.get_object.side_effect = ClientError({'Error': {'Code': 'AccessDenied'}}, 'GetObject')
        with self.assertRaises(ClientError):
            snapshot(client, 'staging', '42', '1', 'before-plan')


class CommitTests(unittest.TestCase):
    def test_valid_and_invalid_headers(self):
        for subject in ('feat(api)!: change response format', 'data(components): add model', 'ci: validate infrastructure'):
            with self.subTest(subject=subject):
                self.assertTrue(valid_header(subject))
        for subject in ('update readme', 'feat:no space', 'fix: ', 'docs(): missing scope', 'feat: first\nsecond'):
            with self.subTest(subject=subject):
                self.assertFalse(valid_header(subject))


if __name__ == '__main__':
    unittest.main()
