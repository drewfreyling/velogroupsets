#!/usr/bin/env python3
"""Read encrypted state privately and export only allowlisted Wrangler bindings."""
import json
import os
from pathlib import Path
import re
import sys
import tempfile

from infra import ROOT, BUCKET, encryption_env, encrypted, s3_client, tofu, require_reviewers


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


def main():
    try:
        environment = os.environ['TARGET_ENVIRONMENT']
        sha = os.environ['GITHUB_SHA']
        if os.environ.get('GITHUB_REF') != 'refs/heads/main':
            raise ValueError('Deployments must use main.')
        require_reviewers(os.environ['GITHUB_REPOSITORY'], environment, os.environ['GH_TOKEN'])
        env = encryption_env(os.environ.get('TOFU_ENCRYPTION_PASSPHRASE'))
        # Read the encrypted state object directly: no backend writes or snapshots.
        state = s3_client().get_object(Bucket=BUCKET, Key=f'state/{environment}/terraform.tfstate')['Body'].read()
        if not encrypted(state):
            raise ValueError('Refusing unencrypted infrastructure state.')
        tofu(['init', '-backend=false', '-lockfile=readonly'], env)
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp)/'encrypted.tfstate'
            path.write_bytes(state)
            details = json.loads(tofu(['show', '-json', str(path)], env))
        binding_output = details['values']['outputs']['wrangler_bindings']
        if binding_output.get('sensitive', False):
            raise ValueError('Wrangler bindings must be explicitly non-secret.')
        settings = {key: os.environ.get(key, '') for key in (
            'PUBLIC_SITE_OPERATOR', 'PUBLIC_CONTACT_EMAIL', 'GOOGLE_CLIENT_ID',
            'CONTACT_READY', 'UPLOADS_ENABLED', 'CSAM_SCANNING_CONFIRMED',
        )}
        for output, setting in [('turnstile_site_key', 'TURNSTILE_SITE_KEY'), ('photos_base_url', 'PHOTOS_BASE_URL')]:
            item = details['values']['outputs'].get(output, {})
            if item.get('sensitive', False):
                raise ValueError('Community public settings must be non-secret.')
            settings[setting] = item.get('value') or ''
        config = make_config(environment, sha, binding_output['value'], settings)
        (ROOT/'wrangler.generated.json').write_text(json.dumps(config, indent=2)+'\n')
        print('Prepared deployment configuration from existing infrastructure outputs.')
        return 0
    except Exception:
        # SDK/provider errors can contain credentials; do not echo their text.
        print('Deployment configuration failed. Check reviewer policy, encrypted state access, passphrase and expected bindings.', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
