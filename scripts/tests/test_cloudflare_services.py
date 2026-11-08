import io
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import Mock, patch
from urllib.error import HTTPError

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from cloudflare_services import check_mail_adoption, cloudflare_json, contact_metadata, csam_status, mail_plan_environment

ZONE = 'a' * 32
DESTINATION = 'private-destination@example.test'


def rule(**changes):
    return dict(id='b' * 32, name='Existing contact rule', priority=17, source='api', enabled=True,
                actions=[{'type': 'forward', 'value': [DESTINATION]}],
                matchers=[{'type': 'literal', 'field': 'to', 'value': 'contact@example.test'}], **changes)


class CloudflareServicesTests(unittest.TestCase):
    def test_private_discovery_finds_the_existing_rule_across_pages(self):
        fetch = Mock(side_effect=[{'result': [], 'result_info': {'total_pages': 2}},
                                  {'result': [rule()], 'result_info': {'total_pages': 2}}])
        values = mail_plan_environment(ZONE, 'example.test', DESTINATION, 'fictional-token', fetch)
        self.assertEqual(values['TF_VAR_email_forwarding_destination'], DESTINATION)
        metadata = json.loads(values['TF_VAR_email_contact_metadata'])
        self.assertEqual(metadata, {'id': 'b' * 32, 'name': 'Existing contact rule', 'priority': 17})
        self.assertNotIn(DESTINATION, values['TF_VAR_email_contact_metadata'])
        self.assertIn('page=2', fetch.call_args.args[0])

    def test_missing_duplicate_mismatched_disabled_and_foreign_rules_fail_closed(self):
        original = rule()
        for records in [[], [original, original], [{**original, 'enabled': False}],
                        [{**original, 'source': 'wrangler'}],
                        [{**original, 'actions': [{'type': 'forward', 'value': ['other@example.test']}]}],
                        [{**original, 'matchers': [{'type': 'all'}]}]]:
            with self.subTest(records=records):
                with self.assertRaises(ValueError) as error:
                    contact_metadata(ZONE, 'example.test', DESTINATION, 'token', Mock(return_value={'result': records}))
                self.assertNotIn(DESTINATION, str(error.exception))

    def test_missing_or_malformed_secrets_never_reach_the_api(self):
        for destination in [None, '', 'not-an-email', DESTINATION + '\n']:
            fetch = Mock()
            with self.assertRaises(ValueError):
                contact_metadata(ZONE, 'example.test', destination, 'token', fetch)
            fetch.assert_not_called()

    def test_csam_inspection_only_returns_finite_readiness_fields(self):
        fetch = Mock(return_value={'result': {'value': {'enabled': True, 'email_state': 'valid', 'email': DESTINATION, 'sources': {'cache': True}}}})
        self.assertEqual(csam_status(ZONE, 'token', fetch), {'enabled': True, 'email_state': 'valid'})
        for value in [{'enabled': 'true', 'email_state': 'valid'}, {'enabled': True, 'email_state': DESTINATION}]:
            with self.assertRaises(ValueError) as error:
                csam_status(ZONE, 'token', Mock(return_value={'result': {'value': value}}))
            self.assertNotIn(DESTINATION, str(error.exception))

    def test_http_errors_never_echo_private_provider_bodies_or_headers(self):
        error = HTTPError('https://api.cloudflare.com/private', 403, DESTINATION, {'Authorization': 'fictional-token'}, io.BytesIO(DESTINATION.encode()))
        with patch('cloudflare_services.urlopen', side_effect=error), self.assertRaises(RuntimeError) as raised:
            cloudflare_json('/zones/' + ZONE + '/email/routing/rules', 'fictional-token')
        self.assertIn('403', str(raised.exception))
        self.assertNotIn(DESTINATION, str(raised.exception))
        self.assertNotIn('fictional-token', str(raised.exception))

    def test_imports_must_not_change_dns_or_forwarding(self):
        addresses = ['cloudflare_email_routing_dns.mail[0]', 'cloudflare_email_routing_rule.contact[0]']
        entries = [{'address': address, 'change': {'actions': ['no-op'], 'importing': {'id': 'opaque'}}} for address in addresses]
        check_mail_adoption({'resource_changes': entries})
        for actions in [['create'], ['update'], ['delete', 'create'], ['delete']]:
            with self.assertRaises(ValueError):
                check_mail_adoption({'resource_changes': [entries[0], {'address': addresses[1], 'change': {'actions': actions}}]})
        with self.assertRaises(ValueError):
            check_mail_adoption({'resource_changes': entries[:1]})
