import sys
from pathlib import Path
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from prepare_web_deploy import make_config

class DeploymentConfigTests(unittest.TestCase):
    def bindings(self,env='staging'):
        return {'d1_databases':[{'binding':'COMMUNITY_DB','database_name':f'velogroupsets-{env}-community','database_id':'01234567-0123-0123-0123-0123456789ab'}],
                'r2_buckets':[{'binding':key,'bucket_name':f'velogroupsets-{env}-{suffix}'} for key,suffix in [('UPLOADS','uploads'),('PHOTOS','photos')]]}

    def test_existing_bindings_are_environment_checked_and_allowlisted(self):
        bindings=self.bindings()
        bindings['d1_databases'][0]['unexpected_secret']='must not escape'
        config=make_config('staging','a'*40,bindings)
        self.assertNotIn('unexpected_secret',config['d1_databases'][0])
        self.assertEqual(config['name'],'velogroupsets-staging')
        self.assertNotIn('routes',config)
        self.assertFalse(config['workers_dev'])
        self.assertEqual(config['assets']['run_worker_first'],['/api','/api/*'])

    def test_staging_cannot_bind_production_resources(self):
        with self.assertRaises(ValueError): make_config('staging','a'*40,self.bindings('production'))

    def test_private_evidence_binding_and_public_config_do_not_export_secrets(self):
        bindings=self.bindings()
        bindings['r2_buckets'].append({'binding':'EVIDENCE','bucket_name':'velogroupsets-staging-evidence','secret':'must not escape'})
        config=make_config('staging','a'*40,bindings,{'GOOGLE_CLIENT_SECRET':'must not escape','PUBLIC_SITE_OPERATOR':'Example Operator'})
        self.assertEqual(config['r2_buckets'][-1],{'binding':'EVIDENCE','bucket_name':'velogroupsets-staging-evidence'})
        self.assertNotIn('GOOGLE_CLIENT_SECRET',config['vars'])
        self.assertEqual(config['vars']['UPLOADS_ENABLED'],'false')
        self.assertEqual(config['vars']['SITE_ORIGIN'],'https://staging.velogroupsets.com')
        self.assertEqual(config['d1_databases'][0]['migrations_dir'],'db/migrations')

    def test_public_photo_origin_cannot_be_redirected_to_another_host(self):
        with self.assertRaises(ValueError):
            make_config('staging','a'*40,self.bindings(),{'PHOTOS_BASE_URL':'https://evil.example'})
