#!/usr/bin/env python3
"""Send configured credentials to Wrangler over stdin, without public artifacts."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys

NAMES = ('GOOGLE_CLIENT_SECRET', 'TURNSTILE_SECRET', 'MODERATOR_EMAILS', 'PHOTO_CACHE_PURGE_TOKEN')

def activation_errors(config, values):
    settings = config.get('vars', {})
    if settings.get('UPLOADS_ENABLED') != 'true':
        return []
    missing = [name for name in NAMES if not values.get(name)]
    for name in ('PUBLIC_SITE_OPERATOR', 'GOOGLE_CLIENT_ID', 'TURNSTILE_SITE_KEY', 'PHOTOS_BASE_URL'):
        if not settings.get(name):
            missing.append(name)
    if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', settings.get('PUBLIC_CONTACT_EMAIL', '')):
        missing.append('PUBLIC_CONTACT_EMAIL')
    for flag in ('CONTACT_READY', 'CSAM_SCANNING_CONFIRMED'):
        if settings.get(flag) != 'true':
            missing.append(flag)
    if 'EVIDENCE' not in {b['binding'] for b in config.get('r2_buckets', [])}:
        missing.append('EVIDENCE binding')
    return missing


def main():
    values = {name: os.environ[name] for name in NAMES if os.environ.get(name)}
    config = json.loads(Path('wrangler.generated.json').read_text())
    missing = activation_errors(config, values)
    if missing:
        print('Uploads were requested but setup is incomplete: ' + ', '.join(missing), file=sys.stderr)
        return 1
    if not values:
        print('No new community credentials supplied; community readiness gates remain in force.')
        return 0
    result = subprocess.run(['npx', '--no-install', 'wrangler', 'secret', 'bulk', '--config', 'wrangler.generated.json'],
                            input=json.dumps(values), text=True, capture_output=True)
    if result.returncode:
        print('Worker credential configuration failed. Check the Cloudflare token and existing Worker.', file=sys.stderr)
        return 1
    print('Updated configured Worker credentials without printing their values.')
    return 0

if __name__ == '__main__':
    sys.exit(main())
