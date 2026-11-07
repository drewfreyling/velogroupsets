import hashlib
import base64
import io
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from check_commits import valid_header
from infra import CommandFailure, encryption_env, encrypted, failure_summary, inspect_state, plan_key, require_reviewers, review_actions, snapshot, verify_plan


class PlanSafetyTests(unittest.TestCase):
    def test_import_only_adoption_is_visible_without_exposing_ids(self):
        details = {"resource_changes": [
            {"address": "cloudflare_zone_setting.hsts[0]", "change": {
                "actions": ["no-op"], "importing": {"id": "private-import-id"}}},
            {"address": "cloudflare_zone_setting.tls", "change": {
                "actions": ["update"], "importing": {"id": "private-import-id"}}},
            {"address": "cloudflare_d1_database.community", "change": {"actions": ["no-op"]}},
        ]}
        actions = review_actions(details)
        self.assertEqual(actions, [("cloudflare_zone_setting.hsts[0]", "import/no-op"),
                                   ("cloudflare_zone_setting.tls", "import/update")])
        self.assertNotIn("private-import-id", str(actions))

    def test_failure_summary_never_echoes_raw_secret_text(self):
        raw = 'Authentication error HTTP status: 403 {"code":10000,"token":"test-secret-value"} with cloudflare_d1_database.community'
        summary = failure_summary(raw)
        self.assertIn('authentication or permission error', summary)
        self.assertIn('403', summary)
        self.assertIn('10000', summary)
        self.assertIn('cloudflare_d1_database.community', summary)
        self.assertNotIn('test-secret-value', summary)
        self.assertNotIn('test-secret-value', str(CommandFailure('apply', '', raw)))
        self.assertNotIn('test-secret-value', failure_summary('opaque response: test-secret-value'))

    def test_inspect_only_reads_objects_and_reports_resource_addresses(self):
        client = Mock()
        client.get_object.return_value = {'Body': io.BytesIO(b'{"encryption_version":"v0"}')}
        details = {'values': {'root_module': {'resources': [
            {'address': 'cloudflare_d1_database.community', 'values': {'secret': 'test-private-state-value'}},
        ]}}}
        with patch('infra.tofu', side_effect=['', json.dumps(details)]), patch('sys.stdout', new_callable=io.StringIO) as output:
            inspect_state(client, {}, 'staging', '')
        self.assertIn('cloudflare_d1_database.community', output.getvalue())
        self.assertNotIn('test-private-state-value', output.getvalue())
        client.put_object.assert_not_called()
        client.delete_object.assert_not_called()

    def test_inspection_rejects_cross_environment_keys_before_reading(self):
        client = Mock()
        with patch('infra.tofu'), self.assertRaises(ValueError):
            inspect_state(client, {}, 'staging', 'diagnostics/production/42/1/apply-failure.tfstate')
        client.get_object.assert_not_called()

    def test_encryption_requires_a_safe_full_length_secret(self):
        for key in (None, '', 'short', 'a' * 15):
            with self.subTest(key=key), self.assertRaises(ValueError):
                encryption_env(key)
        config = encryption_env('a' * 64)['TF_ENCRYPTION']
        self.assertIn('aes_gcm', config)
        self.assertEqual(config.count('enforced = true'), 2)

    def test_password_manager_passphrases_are_literal_and_not_interpolated(self):
        key = 'test-only ${literal} %{literal} "passphrase"\n'
        config = encryption_env(key)['TF_ENCRYPTION']
        self.assertNotIn(key, config)
        encoded = config.split('base64decode("', 1)[1].split('"', 1)[0]
        self.assertEqual(base64.b64decode(encoded).decode('utf-8'), key)

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
