import sys
from pathlib import Path
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from configure_worker_secrets import activation_errors

class CommunityActivationTests(unittest.TestCase):
    def test_disabled_community_does_not_send_supplied_credentials_to_wrangler(self):
        from unittest.mock import patch
        import configure_worker_secrets as secrets
        with patch.dict(secrets.os.environ,{'GOOGLE_CLIENT_SECRET':'synthetic'},clear=True), \
             patch.object(secrets.Path,'read_text',return_value='{"vars":{"COMMUNITY_ENABLED":"false","UPLOADS_ENABLED":"false"}}'), \
             patch.object(secrets.subprocess,'run') as command:
            self.assertEqual(secrets.main(),0)
            command.assert_not_called()

    def test_disabled_features_allow_a_static_only_deployment(self):
        self.assertEqual(activation_errors({'vars':{'UPLOADS_ENABLED':'false'}},{}),[])

    def test_upload_activation_requires_contact_scanning_storage_and_credentials(self):
        config={'vars':{'UPLOADS_ENABLED':'true'},'r2_buckets':[]}
        missing=activation_errors(config,{})
        for key in ('GOOGLE_CLIENT_SECRET','TURNSTILE_SECRET','MODERATOR_EMAILS','PHOTO_CACHE_PURGE_TOKEN','PUBLIC_CONTACT_EMAIL','CONTACT_READY','CSAM_SCANNING_CONFIRMED','EVIDENCE binding'):
            self.assertIn(key,missing)
        config['vars'].update(PUBLIC_SITE_OPERATOR='Example Operator',PUBLIC_CONTACT_EMAIL='contact@example.test',GOOGLE_CLIENT_ID='test-client',TURNSTILE_SITE_KEY='test-widget',PHOTOS_BASE_URL='https://images.staging.velogroupsets.com',CONTACT_READY='true',CSAM_SCANNING_CONFIRMED='true')
        config['r2_buckets']=[{'binding':'EVIDENCE'}]
        values={key:'fictional-test-value' for key in ('GOOGLE_CLIENT_SECRET','TURNSTILE_SECRET','MODERATOR_EMAILS','PHOTO_CACHE_PURGE_TOKEN')}
        self.assertEqual(activation_errors(config,values),[])
