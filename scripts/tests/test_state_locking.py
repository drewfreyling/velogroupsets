from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from check_state_locking import check_locking, probe_failure
from infra import BUCKET, CommandFailure, check_state_access


class LockFailureTests(unittest.TestCase):
    def test_state_access_preflight_only_lists_an_isolated_empty_prefix(self):
        client = Mock()
        check_state_access(client)
        options = client.list_objects_v2.call_args.kwargs
        self.assertEqual(options['Bucket'], BUCKET)
        self.assertTrue(options['Prefix'].startswith('lock-checks/access-'))
        self.assertEqual(options['MaxKeys'], 1)
        client.get_object.assert_not_called()
        client.put_object.assert_not_called()
        client.delete_object.assert_not_called()

    def test_state_access_preflight_reports_only_known_s3_codes_without_message_or_credentials(self):
        from botocore.exceptions import ClientError
        for code in ('AccessDenied', 'InvalidAccessKeyId', 'SignatureDoesNotMatch', 'private-test-credential'):
            client = Mock()
            client.list_objects_v2.side_effect = ClientError({'Error':{'Code':code,'Message':'private-test-credential'},
                'ResponseMetadata':{'HTTPStatusCode':403}}, 'ListObjectsV2')
            with self.subTest(code=code), self.assertRaises(RuntimeError) as failure:
                check_state_access(client)
            self.assertIn('HTTP 403', str(failure.exception))
            self.assertIn(code if code != 'private-test-credential' else 'unclassified', str(failure.exception))
            self.assertNotIn('private-test-credential', str(failure.exception))

    def test_native_probe_failures_expose_categories_and_status_without_private_text(self):
        failures = [
            ('Error acquiring the state lock: S3 PutObject StatusCode: 403 AccessDenied', 'HTTP 403'),
            ('S3 GetObject StatusCode: 403 SignatureDoesNotMatch', 'authentication or permission error'),
            ('Unable to decrypt state: cipher: message authentication failed', 'decryption failed'),
        ]
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / 'probe.log'
            for native, expected in failures:
                with self.subTest(native=native):
                    path.write_text(native + '\nprivate-test-credential private-state-path')
                    message = str(probe_failure('acquire', path))
                    self.assertIn(expected, message)
                    self.assertNotIn('private-test-credential', message)
                    self.assertNotIn('private-state-path', message)

    def test_failed_acquisition_stops_before_contention_and_never_deletes_remote_state(self):
        process = Mock(returncode=1)
        process.poll.return_value = 1
        def failed_process(*args, **kwargs):
            kwargs['stdout'].write('Error acquiring the state lock: StatusCode: 403 AccessDenied private-test-credential')
            kwargs['stdout'].flush()
            return process
        client = Mock()
        with patch('infra.tofu') as tofu, patch('check_state_locking.subprocess.Popen', side_effect=failed_process), \
             patch('check_state_locking.subprocess.run') as contender:
            with self.assertRaises(CommandFailure) as failure:
                check_locking({}, backend='/synthetic/backend.hcl', client=client)
        self.assertIn('HTTP 403', str(failure.exception))
        self.assertNotIn('private-test-credential', str(failure.exception))
        self.assertEqual(tofu.call_count, 1)  # initialization only
        contender.assert_not_called()
        client.delete_object.assert_not_called()
        process.wait.assert_called_once_with(timeout=30)
