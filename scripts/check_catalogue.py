#!/usr/bin/env python3
"""Validate JSON catalogue records and manufacturer/groupset/component relationships offline."""
from functools import lru_cache
import json
from pathlib import Path
import sys
from urllib.parse import urlsplit

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

DATA = Path(__file__).resolve().parents[1] / "data"
KINDS = ("manufacturers", "groupsets", "components")


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
            for source in record["sources"]:
                try:
                    url = urlsplit(source["url"])
                    valid = url.scheme in ("http", "https") and url.hostname and not url.username and not url.password and not any(c.isspace() for c in source["url"])
                except ValueError:
                    valid = False
                if not valid:
                    failures.append(f"{kind}/{identifier}: source must be an HTTP(S) URL without credentials")
    for kind in ("groupsets", "components"):
        for record in catalogue[kind]:
            if record["manufacturer_id"] not in indices["manufacturers"]:
                failures.append(f"{kind}/{record['id']}: unknown manufacturer_id")
    for component in catalogue["components"]:
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
