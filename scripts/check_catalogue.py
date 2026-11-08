#!/usr/bin/env python3
"""Validate JSON catalogue records and manufacturer/groupset/component relationships offline."""
from functools import lru_cache
import json
import re
from pathlib import Path
import sys
from urllib.parse import urlsplit

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

DATA = Path(__file__).resolve().parents[1] / "data"
KINDS = ("manufacturers", "groupsets", "components")


def approved_archived_document(manufacturer, document_url):
    """Allow the reviewed Campagnolo manuals; other archive URLs need review."""
    if manufacturer['id'] != 'campagnolo' or urlsplit(manufacturer['website_url']).hostname not in ('campagnolo.com', 'www.campagnolo.com'):
        return False
    url = urlsplit(document_url)
    if url.scheme != 'https' or url.netloc not in ('www.disraeligears.co.uk', 'disraeligears.co.uk') or url.query:
        return False
    match = re.fullmatch(r'/site/campagnolo_spare_parts_catalogue_-_(1994_product_range|1997)_page_([1-9][0-9]?)\.html', url.path)
    return bool(match and int(match[2]) <= {'1994_product_range': 58, '1997': 88}[match[1]])


def weight_configuration_errors(component):
    """Check declared weight configurations; source truth still needs review."""
    if component['weight_g'] is None:
        return []
    specs = component.get('specifications', {})
    kind = component['type']
    errors = []

    def positive(value):
        return type(value) in (int, float) and value > 0

    def teeth(values):
        return isinstance(values, list) and bool(values) and all(type(v) is int and v > 0 for v in values)

    if kind == 'crankset':
        if not positive(specs.get('crank_length_mm')):
            errors.append('a crankset weight requires its reference crank_length_mm')
        if not teeth(specs.get('chainrings_teeth')):
            errors.append('a crankset weight requires its reference chainrings_teeth')
        elif specs.get('front_speeds') is not None and specs['front_speeds'] != len(specs['chainrings_teeth']):
            errors.append('crankset chainrings_teeth must identify every chainring in front_speeds')
        if specs.get('includes_bottom_bracket') is not False:
            errors.append('a crankset weight requires includes_bottom_bracket: false')
    elif kind == 'bottom-bracket':
        interface = specs.get('interface')
        if not isinstance(interface, str) or not interface.strip():
            errors.append('a bottom-bracket weight requires an identified interface')
        elif interface.casefold().replace('-', ' ').startswith('square taper') and not positive(specs.get('spindle_length_mm')):
            errors.append('a square-taper bottom-bracket weight requires the weighed spindle_length_mm')
    elif kind in ('shifters', 'brake-levers'):
        if specs.get('weight_basis') != 'Pair':
            errors.append(f'a {kind.removesuffix("s")} weight requires weight_basis: Pair')
    elif kind == 'front-derailleur':
        if specs.get('mount') not in ('Braze-on', 'Clamp'):
            errors.append('a front-derailleur weight requires mount: Braze-on or Clamp')
        elif specs['mount'] == 'Clamp':
            size = specs.get('clamp_diameter_mm')
            band = specs.get('clamp_diameter_range_mm')
            valid_band = isinstance(band, list) and len(band) == 2 and all(positive(v) for v in band) and band[0] < band[1]
            if not (positive(size) or valid_band):
                errors.append('a clamp-mounted front-derailleur weight requires its clamp diameter or actual band range')
            if size is not None and band is not None:
                errors.append('identify one weighed clamp size or band range, not conflicting alternatives')
    elif kind == 'cassette':
        count = specs.get('rear_speeds')
        if type(count) is not int or count < 2:
            errors.append('a cassette weight requires its sprocket count in rear_speeds')
        sequence = specs.get('sprockets_teeth')
        span = specs.get('sprocket_range')
        match = re.fullmatch(r'([1-9][0-9]*)[–-]([1-9][0-9]*)T', span) if isinstance(span, str) else None
        valid_span = match is not None and int(match[1]) < int(match[2])
        valid_sequence = teeth(sequence) and len(sequence) >= 2 and sequence == sorted(set(sequence))
        if not (valid_span or valid_sequence):
            errors.append('a cassette weight requires its reference sprocket_range or sprockets_teeth')
        if sequence is not None and (not valid_sequence or len(sequence) != count):
            errors.append('cassette sprockets_teeth must be increasing tooth counts matching rear_speeds')
        if span is not None and not valid_span:
            errors.append('cassette sprocket_range must be an increasing range such as 11–28T')
        if valid_sequence and valid_span and (sequence[0], sequence[-1]) != (int(match[1]), int(match[2])):
            errors.append('cassette tooth sequence and range must agree')
    return errors


def unique_keys(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON key: {key}")
        result[key] = value
    return result


def read_json(path):
    def reject_constant(value):
        raise ValueError(f"Non-JSON numeric constant: {value}")
    return json.loads(path.read_text(), object_pairs_hook=unique_keys, parse_constant=reject_constant)


@lru_cache
def validator():
    schemas = [read_json(path) for path in sorted((DATA / "schemas").glob("*.schema.json"))]
    for schema in schemas:
        Draft202012Validator.check_schema(schema)
    registry = Registry().with_resources((schema["$id"], Resource.from_contents(schema)) for schema in schemas)
    catalogue = next(schema for schema in schemas if schema["$id"].endswith("/catalogue.schema.json"))
    return Draft202012Validator(catalogue, registry=registry, format_checker=FormatChecker())


def validate_catalogue(catalogue):
    failures = [f"{'/'.join(map(str, error.absolute_path)) or 'catalogue'}: {error.message}" for error in validator().iter_errors(catalogue)]
    if failures:
        return failures
    indices = {}
    ids = set()
    for kind in KINDS:
        indices[kind] = {}
        slugs = set()
        for record in catalogue[kind]:
            identifier = record["id"]
            if identifier in ids:
                failures.append(f"{kind}/{identifier}: duplicate catalogue ID")
            ids.add(identifier)
            indices[kind][identifier] = record
            scope = (record.get("manufacturer_id"), record["slug"])
            if scope in slugs:
                failures.append(f"{kind}/{identifier}: duplicate slug within its manufacturer")
            slugs.add(scope)
            urls = [source["url"] for source in record["sources"]]
            if kind == "manufacturers":
                urls.append(record["website_url"])
            if kind == "components":
                urls.append(record["technical_document"]["url"])
            for source_url in urls:
                try:
                    url = urlsplit(source_url)
                    valid = url.scheme in ("http", "https") and url.hostname and not url.username and not url.password and not any(c.isspace() for c in source_url)
                except ValueError:
                    valid = False
                if not valid:
                    failures.append(f"{kind}/{identifier}: source must be an HTTP(S) URL without credentials")
    if failures:
        return failures
    # Merged records reserve their previous IDs and manufacturer-scoped slugs.
    component_slugs = {(c['manufacturer_id'], c['slug']) for c in catalogue['components']}
    for component in catalogue['components']:
        for alias in component.get('aliases', []):
            if alias['id'] in ids:
                failures.append(f"components/{component['id']}: alias ID conflicts with a catalogue ID or alias")
            ids.add(alias['id'])
            scope = (component['manufacturer_id'], alias['slug'])
            if scope in component_slugs:
                failures.append(f"components/{component['id']}: alias slug conflicts within its manufacturer")
            component_slugs.add(scope)
    for kind in ("groupsets", "components"):
        for record in catalogue[kind]:
            if record["manufacturer_id"] not in indices["manufacturers"]:
                failures.append(f"{kind}/{record['id']}: unknown manufacturer_id")
    for component in catalogue["components"]:
        failures.extend(f"components/{component['id']}: {error}" for error in weight_configuration_errors(component))
        if component['type'] == 'rear-derailleur':
            specs = component['specifications']
            smallest = specs['minimum_sprocket_teeth']
            largest = specs['maximum_sprocket_teeth']
            if smallest is not None and largest is not None and smallest > largest:
                failures.append(f"components/{component['id']}: smallest sprocket must not exceed largest sprocket")
        manufacturer = indices["manufacturers"].get(component["manufacturer_id"])
        if manufacturer:
            official_host = urlsplit(manufacturer["website_url"]).hostname
            if official_host.startswith("www."):
                official_host = official_host[4:]
            document_host = urlsplit(component["technical_document"]["url"]).hostname
            official_document = document_host and (document_host == official_host or document_host.endswith("." + official_host))
            if not official_document and not approved_archived_document(manufacturer, component['technical_document']['url']):
                failures.append(f"components/{component['id']}: technical_document must be on the manufacturer's website, a subdomain, or an explicitly approved archived manufacturer document")
        for group_id in component["groupset_ids"]:
            group = indices["groupsets"].get(group_id)
            if group is None:
                failures.append(f"components/{component['id']}: unknown groupset_id {group_id}")
            elif group["manufacturer_id"] != component["manufacturer_id"]:
                failures.append(f"components/{component['id']}: groupset manufacturer does not match component manufacturer")
    return failures


def load_catalogue(root=DATA):
    catalogue = {kind: [] for kind in KINDS}
    failures = []
    for kind in KINDS:
        folder = root / kind
        if not folder.is_dir():
            failures.append(f"Missing record directory: {kind}")
            continue
        for path in sorted(folder.iterdir()):
            if path.name.startswith("."):
                continue
            if not path.is_file() or path.suffix != ".json":
                failures.append(f"{kind}/{path.name}: expected a flat directory of JSON record files")
                continue
            try:
                record = read_json(path)
                if not isinstance(record, dict) or record.get("id") != path.stem:
                    failures.append(f"{kind}/{path.name}: filename must match the record ID")
                catalogue[kind].append(record)
            except (OSError, ValueError) as error:
                failures.append(f"{kind}/{path.name}: {error}")
    return catalogue, failures


def main():
    catalogue, failures = load_catalogue()
    failures.extend(validate_catalogue(catalogue))
    if failures:
        print("\n".join(failures), file=sys.stderr)
        return 1
    counts = ", ".join(f"{len(catalogue[kind])} {kind}" for kind in KINDS)
    print(f"Catalogue schemas and relationships passed: {counts}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
