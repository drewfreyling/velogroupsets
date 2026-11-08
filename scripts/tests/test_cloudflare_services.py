import io
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import Mock, patch
from urllib.error import HTTPError

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from cloudflare_services import check_google_verification_adoption, google_verification_metadata, check_mail_adoption, cloudflare_json, contact_metadata, csam_status, mail_plan_environment

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


class GoogleVerificationTests(unittest.TestCase):
    def record(self, **changes):
        return dict({'id': 'c' * 32, 'name': 'example.test', 'type': 'TXT',
                     'content': 'google-site-verification=fictional-proof', 'ttl': 1,
                     'proxied': False, 'comment': 'Existing note', 'tags': ['owner:example']}, **changes)

    def discover(self, records, **response):
        fetch = Mock(return_value={'result': records, **response})
        return google_verification_metadata(ZONE, 'example.test', 'google-site-verification=fictional-proof', 'token', fetch)

    def test_discovery_preserves_existing_metadata_and_ignores_other_txt_records(self):
        spf = self.record(content='v=spf1 -all')
        fetch = Mock(side_effect=[{'result': [spf], 'result_info': {'total_pages': 2}},
                                  {'result': [self.record()], 'result_info': {'total_pages': 2}}])
        result = google_verification_metadata(ZONE, 'example.test', 'google-site-verification=fictional-proof', 'token', fetch)
        self.assertEqual(result, {'id': 'c' * 32, 'content': 'google-site-verification=fictional-proof', 'ttl': 1, 'comment': 'Existing note', 'tags': ['owner:example']})
        self.assertIn('page=2', fetch.call_args.args[0])
        self.assertIn('type=TXT', fetch.call_args.args[0])

    def test_quoted_txt_content_is_matched_without_changing_its_api_representation(self):
        quoted = json.dumps('google-site-verification=fictional-proof')
        self.assertEqual(self.discover([self.record(content=quoted)])['content'], quoted)
        for value in [quoted + ' "another-chunk"', '""google-site-verification=fictional-proof""',
                      'google-site-verification=fictional-proof ']:
            with self.subTest(value=value), self.assertRaises(ValueError):
                self.discover([self.record(content=value)])

    def test_missing_ambiguous_or_mismatched_records_fail_without_guessing(self):
        for records in [[], [self.record(), self.record()],
                        [self.record(name='sub.example.test')], [self.record(type='CNAME')],
                        [self.record(content='google-site-verification=another-proof')]]:
            with self.subTest(records=records), self.assertRaises(ValueError):
                self.discover(records)

    def test_malformed_metadata_and_unbounded_pagination_are_rejected(self):
        for changes in [{'ttl': True}, {'ttl': 0}, {'id': '../record'}, {'proxied': True},
                        {'tags': 'owner:example'}, {'comment': []}]:
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                self.discover([self.record(**changes)])
        for total in [True, 0, 21, '2']:
            with self.subTest(total=total), self.assertRaises(ValueError):
                self.discover([], result_info={'total_pages': total})

    def test_only_import_or_noop_is_accepted_for_the_existing_record(self):
        def plan(actions):
            return {'resource_changes': [{'address': 'cloudflare_dns_record.google_site_verification[0]',
                                          'change': {'actions': actions, 'importing': {'id': 'opaque'}}}]}
        check_google_verification_adoption(plan(['no-op']))
        for actions in [['create'], ['update'], ['delete'], ['delete', 'create']]:
            with self.subTest(actions=actions), self.assertRaises(ValueError):
                check_google_verification_adoption(plan(actions))
        with self.assertRaises(ValueError):
            check_google_verification_adoption({'resource_changes': []})
