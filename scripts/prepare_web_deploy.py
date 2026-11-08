#!/usr/bin/env python3
"""Read encrypted state privately and export only allowlisted Wrangler bindings."""
import json
import os
from pathlib import Path
import re
import sys
import tempfile
from urllib.error import HTTPError

from infra import ROOT, BUCKET, CommandFailure, encryption_env, encrypted, failure_summary, s3_client, tofu, require_reviewers


def make_config(environment, sha, bindings, settings=None):
    settings = settings or {}
    if environment not in ('staging', 'production') or not re.fullmatch(r'[a-f0-9]{40}', sha):
        raise ValueError('Invalid deployment environment or commit.')
    d1 = bindings['d1_databases']
    buckets = bindings['r2_buckets']
    if len(d1) != 1 or len(buckets) not in (2, 3):
        raise ValueError('Expected one community database and two or three application buckets.')
    expected = f'velogroupsets-{environment}'
    db = d1[0]
    if db['binding'] != 'COMMUNITY_DB' or db['database_name'] != expected+'-community' or not re.fullmatch(r'[a-f0-9-]{36}', db['database_id']):
        raise ValueError('Unexpected database binding.')
    safe_buckets = []
    names = [('UPLOADS', 'uploads'), ('PHOTOS', 'photos')]
    if len(buckets) == 3:
        names.append(('EVIDENCE', 'evidence'))
    for binding, suffix in names:
        bucket = next(b for b in buckets if b['binding'] == binding)
        if bucket['bucket_name'] != expected+'-'+suffix:
            raise ValueError('Unexpected storage binding.')
        safe_buckets.append({'binding': binding, 'bucket_name': bucket['bucket_name']})
    public_settings = {key: str(settings.get(key, '')) for key in (
        'PUBLIC_SITE_OPERATOR', 'PUBLIC_CONTACT_EMAIL', 'GOOGLE_CLIENT_ID',
        'TURNSTILE_SITE_KEY', 'CONTACT_READY', 'UPLOADS_ENABLED', 'CSAM_SCANNING_CONFIRMED',
    )}
    for flag in ('CONTACT_READY', 'UPLOADS_ENABLED', 'CSAM_SCANNING_CONFIRMED'):
        public_settings[flag] = public_settings[flag] or 'false'
        if public_settings[flag] not in ('true', 'false'):
            raise ValueError('Community readiness flags must be true or false.')
    photos_url = settings.get('PHOTOS_BASE_URL') or ''
    expected_photos = f'https://images.{"staging." if environment == "staging" else ""}velogroupsets.com'
    if photos_url and photos_url != expected_photos:
        raise ValueError('Unexpected approved-photo hostname.')
    public_settings.update(SITE_ORIGIN=f'https://{"staging." if environment == "staging" else ""}velogroupsets.com',
                           PHOTOS_BASE_URL=photos_url, CLOUDFLARE_ZONE_ID='7f6cc6f517450ef96d9f8b2bd891ee80')
    config = json.loads((ROOT/'wrangler.jsonc').read_text())
    config.update(name=expected, account_id='5ccb67114ff0fa1a13cb46ef3d08cb49',
                  d1_databases=[{**{key: db[key] for key in ('binding', 'database_name', 'database_id')}, 'migrations_dir': 'db/migrations'}],
                  r2_buckets=safe_buckets,
                  vars={'ENVIRONMENT': environment, 'RELEASE_SHA': sha, **public_settings})
    return config


def read_state_outputs(state, env):
    """Decrypt a downloaded local snapshot without provider schemas or a backend."""
    if not encrypted(state):
        raise ValueError('Refusing unencrypted infrastructure state.')
    with tempfile.TemporaryDirectory() as temp:
        path = Path(temp) / 'encrypted.tfstate'
        path.write_bytes(state)
        # The empty working directory uses the implicit local backend. -state
        # selects only this downloaded ciphertext, never the project's R2 backend.
        # output reads output metadata directly; show also needs resource schemas.
        outputs = json.loads(tofu(['output', '-json', '-state=' + str(path)], env, cwd=Path(temp)))
    if not isinstance(outputs, dict):
        raise ValueError('Unexpected infrastructure output format.')
    return outputs


def config_from_outputs(environment, sha, outputs, settings):
    binding_output = outputs['wrangler_bindings']
    if binding_output.get('sensitive') is not False:
        raise ValueError('Wrangler bindings must be explicitly non-secret.')
    settings = dict(settings)
    for output, setting in [('turnstile_site_key', 'TURNSTILE_SITE_KEY'), ('photos_base_url', 'PHOTOS_BASE_URL')]:
        item = outputs.get(output, {})
        if item and item.get('sensitive') is not False:
            raise ValueError('Community public settings must be explicitly non-secret.')
        settings[setting] = item.get('value') or ''
    return make_config(environment, sha, binding_output['value'], settings)


def safe_failure_reason(error):
    """Classify failures without echoing exception text, URLs or state values."""
    if isinstance(error, CommandFailure):
        return 'OpenTofu command failed: ' + failure_summary(error.stdout + '\n' + error.stderr)
    if isinstance(error, HTTPError):
        return 'HTTP ' + str(error.code)
    response = getattr(error, 'response', None)
    if isinstance(response, dict):
        reasons = {'AccessDenied': 'state access denied', 'NoSuchKey': 'state object not found',
                   'InvalidAccessKeyId': 'state access key rejected', 'SignatureDoesNotMatch': 'state request signature rejected'}
        code = response.get('Error', {}).get('Code')
        if code in reasons:
            return reasons[code]
        status = response.get('ResponseMetadata', {}).get('HTTPStatusCode')
        if type(status) is int and 400 <= status <= 599:
            return 'state storage HTTP ' + str(status)
    if isinstance(error, (KeyError, TypeError)):
        return 'missing or malformed configuration fields'
    if isinstance(error, ValueError):
        return 'invalid configuration or output format'
    if isinstance(error, OSError):
        return 'network or local file operation failed'
    return 'unexpected failure; private details were not logged'


def main():
    stage = 'deployment inputs'
    try:
        environment = os.environ['TARGET_ENVIRONMENT']
        sha = os.environ['GITHUB_SHA']
        if (os.environ.get('GITHUB_REF') != 'refs/heads/main' or environment not in ('staging', 'production')
                or not re.fullmatch(r'[a-f0-9]{40}', sha)):
            raise ValueError('Deployments require main and a supported environment/commit.')
        stage = 'GitHub reviewer policy'
        require_reviewers(os.environ['GITHUB_REPOSITORY'], environment, os.environ['GH_TOKEN'])
        stage = 'state encryption configuration'
        env = encryption_env(os.environ.get('TOFU_ENCRYPTION_PASSPHRASE'))
        stage = 'encrypted state download'
        # Read the encrypted state object directly: no backend writes or snapshots.
        state = s3_client().get_object(Bucket=BUCKET, Key=f'state/{environment}/terraform.tfstate')['Body'].read()
        stage = 'encrypted output decoding'
        outputs = read_state_outputs(state, env)
        stage = 'binding and public-setting validation'
        settings = {key: os.environ.get(key, '') for key in (
            'PUBLIC_SITE_OPERATOR', 'PUBLIC_CONTACT_EMAIL', 'GOOGLE_CLIENT_ID',
            'CONTACT_READY', 'UPLOADS_ENABLED', 'CSAM_SCANNING_CONFIRMED',
        )}
        config = config_from_outputs(environment, sha, outputs, settings)
        stage = 'deployment configuration writing'
        (ROOT/'wrangler.generated.json').write_text(json.dumps(config, indent=2)+'\n')
        print('Prepared deployment configuration from existing infrastructure outputs.')
        return 0
    except Exception as error:
        print(f'Deployment configuration failed at {stage}: {safe_failure_reason(error)}.', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
