"""Read existing mail configuration privately and report finite CSAM status only."""
import json
import re
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def cloudflare_json(path, token):
    request = Request('https://api.cloudflare.com/client/v4' + path,
                      headers={'Authorization': 'Bearer ' + token, 'Accept': 'application/json'})
    try:
        with urlopen(request, timeout=20) as response:
            body = response.read(1_048_577)
        if len(body) > 1_048_576:
            raise ValueError()
        data = json.loads(body)
        if data.get('success') is not True:
            raise ValueError()
        return data
    except HTTPError as error:
        # Never echo response bodies, request headers or provider exceptions.
        raise RuntimeError(f'Cloudflare service inspection failed (HTTP {error.code}); check zone-scoped API permissions.') from None
    except (URLError, ValueError, TimeoutError):
        raise RuntimeError('Cloudflare service inspection failed; no private response was logged.') from None


def contact_metadata(zone, domain, destination, token, fetcher=cloudflare_json):
    if not re.fullmatch('[a-f0-9]{32}', zone) or not re.fullmatch(r'[a-z0-9.-]+', domain):
        raise ValueError('Invalid mail zone configuration.')
    if not isinstance(destination, str) or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', destination):
        raise ValueError('Set EMAIL_FORWARDING_DESTINATION in the target GitHub environment before importing mail.')
    matches = []
    for page in range(1, 21):
        data = fetcher(f'/zones/{zone}/email/routing/rules?page={page}&per_page=50', token)
        for rule in data.get('result', []):
            matchers = rule.get('matchers')
            if matchers == [{'type': 'literal', 'field': 'to', 'value': 'contact@' + domain}]:
                matches.append(rule)
        info = data.get('result_info') or {}
        total = info.get('total_pages', 1)
        if not isinstance(total, int) or total < 1 or total > 20:
            raise ValueError('Mail rule pagination could not be safely inspected.')
        if page >= total:
            break
    if len(matches) != 1:
        raise ValueError('Expected exactly one existing literal contact forwarding rule; no rules were changed.')
    rule = matches[0]
    expected = [{'type': 'forward', 'value': [destination]}]
    if rule.get('actions') != expected or rule.get('enabled') is not True or rule.get('source', 'api') != 'api':
        raise ValueError('The existing contact rule does not match the enabled forwarding secret, or another tool owns it. No rules were changed.')
    identifier = rule.get('id') or rule.get('tag')
    if not isinstance(identifier, str) or not re.fullmatch(r'[A-Za-z0-9_-]{1,128}', identifier):
        raise ValueError('The existing contact rule has no supported import identifier.')
    return {'id': identifier, 'name': rule.get('name'), 'priority': rule.get('priority')}


def csam_status(zone, token, fetcher=cloudflare_json):
    if not re.fullmatch('[a-f0-9]{32}', zone):
        raise ValueError('Invalid CSAM zone configuration.')
    result = fetcher(f'/zones/{zone}/settings/csam_scanner_third_party', token).get('result') or {}
    value = result.get('value') or {}
    enabled = value.get('enabled')
    email_state = value.get('email_state')
    if not isinstance(enabled, bool) or email_state not in ('valid', 'pending', 'unverified'):
        raise ValueError('CSAM status was not recognised; no private response was logged.')
    # Drop notification address and all other provider fields deliberately.
    return {'enabled': enabled, 'email_state': email_state}


def mail_plan_environment(zone, domain, destination, token, fetcher=cloudflare_json):
    metadata = contact_metadata(zone, domain, destination, token, fetcher)
    return {'TF_VAR_email_forwarding_destination': destination,
            'TF_VAR_email_contact_metadata': json.dumps(metadata)}


def check_mail_adoption(details):
    """Allow state adoption/no-op only; never silently change working email."""
    addresses = {'cloudflare_email_routing_dns.mail[0]', 'cloudflare_email_routing_rule.contact[0]'}
    found = set()
    for item in details.get('resource_changes', []):
        if item['address'] in addresses:
            found.add(item['address'])
            if item['change']['actions'] != ['no-op']:
                change = item['change']
                before, after = change.get('before') or {}, change.get('after') or {}
                allowed = {'actions', 'matchers', 'enabled', 'name', 'priority', 'source', 'owner_worker_tag', 'zone_id', 'subdomain', 'support_subaddress'}
                fields = sorted(key for key in allowed if before.get(key) != after.get(key))
                raise ValueError('Mail adoption would change ' + item['address'] + '; refusing to save that plan. Changed attribute names: ' + ', '.join(fields) + '. Values remain private.')
    if found != addresses:
        raise ValueError('Mail adoption plan is missing an expected resource; refusing to save it.')


def google_verification_metadata(zone, domain, content, token, fetcher=cloudflare_json):
    """Find one exact existing public verification record without changing DNS."""
    from urllib.parse import urlencode
    if not re.fullmatch('[a-f0-9]{32}', zone) or not re.fullmatch(r'[a-z0-9.-]+', domain):
        raise ValueError('Invalid verification zone configuration.')
    if not isinstance(content, str) or not re.fullmatch(r'google-site-verification=[A-Za-z0-9_-]+', content):
        raise ValueError('Invalid Google site-verification TXT value.')
    matches = []
    for page in range(1, 21):
        query = urlencode({'type': 'TXT', 'name': domain, 'page': page, 'per_page': 100})
        data = fetcher(f'/zones/{zone}/dns_records?{query}', token)
        for record in data.get('result', []):
            if record.get('type') == 'TXT' and record.get('name') == domain and record.get('content') == content:
                matches.append(record)
        total = (data.get('result_info') or {}).get('total_pages', 1)
        if type(total) is not int or not 1 <= total <= 20:
            raise ValueError('DNS pagination could not be safely inspected.')
        if page >= total:
            break
    if len(matches) != 1:
        raise ValueError('Expected exactly one existing matching Google verification TXT record; no DNS was changed.')
    record = matches[0]
    identifier, ttl = record.get('id'), record.get('ttl')
    comment, tags = record.get('comment'), record.get('tags', [])
    if (not isinstance(identifier, str) or not re.fullmatch('[a-f0-9]{32}', identifier)
            or type(ttl) is not int or not (ttl == 1 or 30 <= ttl <= 86400)
            or record.get('proxied') is not False
            or (comment is not None and not isinstance(comment, str))
            or not isinstance(tags, list) or not all(isinstance(tag, str) for tag in tags)):
        raise ValueError('Existing verification record metadata is unsupported; no DNS was changed.')
    return {'id': identifier, 'ttl': ttl, 'comment': comment, 'tags': tags}


def check_google_verification_adoption(details):
    """Keep working ownership verification unchanged during state adoption."""
    matches = [item for item in details.get('resource_changes', [])
               if item['address'] == 'cloudflare_dns_record.google_site_verification[0]']
    if len(matches) != 1 or matches[0]['change']['actions'] != ['no-op']:
        raise ValueError('Google verification adoption must import/no-op the existing TXT record; refusing to save a DNS-changing plan.')
