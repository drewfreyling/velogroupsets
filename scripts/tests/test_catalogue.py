from copy import deepcopy
import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from check_catalogue import load_catalogue, read_json, unique_keys, validate_catalogue


def fixture():
    # Deliberately fictional data; these are not production catalogue records.
    source = {"url": "https://example.com/specifications", "title": "Example specifications"}
    def record(identifier):
        return {"id": identifier, "slug": identifier, "name": identifier, "sources": [deepcopy(source)]}
    return {
        "manufacturers": [record("example-maker")],
        "groupsets": [dict(record("example-group"), manufacturer_id="example-maker")],
        "components": [dict(record("example-crankset"), manufacturer_id="example-maker", groupset_ids=["example-group"], type="crankset")],
    }


class CatalogueTests(unittest.TestCase):
    def test_component_can_be_shared_by_two_groupsets_without_duplication(self):
        data = fixture()
        second = deepcopy(data["groupsets"][0])
        second.update(id="example-second-group", slug="second-group")
        data["groupsets"].append(second)
        data["components"][0]["groupset_ids"].append(second["id"])
        self.assertEqual(validate_catalogue(data), [])

    def test_missing_or_wrong_manufacturer_relationships_are_rejected(self):
        for field, value in (("manufacturer_id", "missing-maker"), ("groupset_ids", ["missing-group"])):
            data = fixture()
            data["components"][0][field] = value
            with self.subTest(field=field):
                self.assertTrue(validate_catalogue(data))
        data = fixture()
        maker = deepcopy(data["manufacturers"][0])
        maker.update(id="other-maker", slug="other-maker")
        data["manufacturers"].append(maker)
        data["groupsets"][0]["manufacturer_id"] = maker["id"]
        self.assertTrue(validate_catalogue(data))

    def test_ids_and_scoped_slugs_must_be_unique(self):
        data = fixture()
        data["components"].append(deepcopy(data["components"][0]))
        self.assertTrue(validate_catalogue(data))
        data["components"][1]["id"] = "different-component"
        self.assertTrue(validate_catalogue(data))

    def test_rejects_typo_category_unsourced_records_and_unknown_fields(self):
        for mutate in (
            lambda c: c.update(type="rear-derauilleur"),
            lambda c: c.update(sources=[]),
            lambda c: c.update(groupset_ids=[]),
            lambda c: c.update(manufacturer="typo-field"),
            lambda c: c["sources"][0].update(url="https://"),
        ):
            data = fixture()
            mutate(data["components"][0])
            self.assertTrue(validate_catalogue(data))

    def test_variants_and_unknown_specifications_are_allowed(self):
        data = fixture()
        data["components"][0]["specifications"] = {"crank_length_mm": 170, "chainrings_teeth": [50, 34], "weight_g": None}
        variant = deepcopy(data["components"][0])
        variant.update(id="another-crankset", slug="another-crankset")
        data["components"].append(variant)
        self.assertEqual(validate_catalogue(data), [])

    def test_json_keys_cannot_silently_overwrite_each_other(self):
        with self.assertRaises(ValueError):
            json.loads('{"id":"first","id":"second"}', object_pairs_hook=unique_keys)

    def test_record_filename_must_match_id(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            for kind in ("manufacturers", "groupsets", "components"):
                (root / kind).mkdir()
            (root / "manufacturers" / "incorrect.json").write_text(json.dumps(fixture()["manufacturers"][0]))
            _, errors = load_catalogue(root)
            self.assertTrue(any("filename must match" in error for error in errors))

    def test_non_json_numeric_constants_are_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / "record.json"
            for value in ("NaN", "Infinity", "-Infinity"):
                path.write_text('{"weight_g":' + value + '}')
                with self.subTest(value=value), self.assertRaises(ValueError):
                    read_json(path)


if __name__ == "__main__":
    unittest.main()
