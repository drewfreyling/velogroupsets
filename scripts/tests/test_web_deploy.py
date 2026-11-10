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
        self.assertEqual(config['assets']['run_worker_first'],['/api','/api/*','!/api/v1/*'])

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

class EncryptedOutputTests(unittest.TestCase):
    bindings = DeploymentConfigTests.bindings
    def test_downloaded_ciphertext_uses_only_local_output_command(self):
        import json
        from unittest.mock import patch
        import prepare_web_deploy as deploy
        state=b'{"encryption_version":"v0","encrypted_data":"synthetic"}'
        outputs={'private': {'sensitive':True,'value':'private fixture'}}
        def output_command(args,env,cwd):
            self.assertEqual(args[:2],['output','-json'])
            self.assertEqual(args[2],'-state='+str(cwd/'encrypted.tfstate'))
            self.assertEqual(list(cwd.iterdir()),[cwd/'encrypted.tfstate'])
            self.assertEqual((cwd/'encrypted.tfstate').read_bytes(),state)
            return json.dumps(outputs)
        with patch.object(deploy,'tofu',side_effect=output_command) as command:
            self.assertEqual(deploy.read_state_outputs(state,{}),outputs)
            command.assert_called_once()
        with patch.object(deploy,'tofu') as command:
            with self.assertRaises(ValueError): deploy.read_state_outputs(b'{"version":4}',{})
            command.assert_not_called()

    def test_sensitive_or_unlabelled_outputs_cannot_be_exported(self):
        from prepare_web_deploy import config_from_outputs
        outputs={'wrangler_bindings':{'value':self.bindings(),'sensitive':False},
                 'private_destination':{'value':'private fixture','sensitive':True}}
        config=config_from_outputs('staging','a'*40,outputs,{})
        self.assertNotIn('private fixture',str(config))
        for flag in (True,None):
            outputs['wrangler_bindings']['sensitive']=flag
            with self.assertRaises(ValueError): config_from_outputs('staging','a'*40,outputs,{})
        outputs['wrangler_bindings']['sensitive']=False
        outputs['turnstile_site_key']={'value':'private fixture','sensitive':True}
        with self.assertRaises(ValueError): config_from_outputs('staging','a'*40,outputs,{})

    def test_failure_diagnostics_never_echo_private_exception_text(self):
        from prepare_web_deploy import safe_failure_reason
        from infra import CommandFailure
        from urllib.error import HTTPError
        errors=[ValueError('private fixture'),KeyError('private fixture'),
                HTTPError('https://private.invalid','403','private fixture',None,None),
                CommandFailure('show','private fixture','Error: Unable to decrypt state: private fixture')]
        for error in errors:
            reason=safe_failure_reason(error)
            self.assertNotIn('private',reason)
            self.assertNotIn('https://',reason)

    def test_main_reports_failing_stage_without_error_body(self):
        import io
        from contextlib import redirect_stderr
        from unittest.mock import patch
        from urllib.error import HTTPError
        import prepare_web_deploy as deploy
        env={'TARGET_ENVIRONMENT':'staging','GITHUB_SHA':'a'*40,'GITHUB_REF':'refs/heads/main',
             'GITHUB_REPOSITORY':'owner/repo','GH_TOKEN':'synthetic'}
        error=HTTPError('https://private.invalid',403,'private fixture',None,None)
        log=io.StringIO()
        with patch.dict(deploy.os.environ,env,clear=True), patch.object(deploy,'require_reviewers',side_effect=error), redirect_stderr(log):
            self.assertEqual(deploy.main(),1)
        self.assertIn('GitHub reviewer policy: HTTP 403',log.getvalue())
        self.assertNotIn('private',log.getvalue())
