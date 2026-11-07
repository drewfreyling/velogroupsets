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
        "manufacturers": [dict(record("example-maker"), website_url="https://example.com/")],
        "groupsets": [dict(record("example-group"), manufacturer_id="example-maker", model_number="EG-100", year_range={"start":2000,"end":None})],
        "components": [dict(record("example-crankset"), manufacturer_id="example-maker", groupset_ids=["example-group"], type="crankset", model_number="EC-100", weight_g=500, weight_description="170 mm crank arms, 50/34T chainrings; no bottom bracket", technical_document=deepcopy(source))],
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
        data["components"][0]["specifications"] = {"crank_length_mm": 170, "chainrings_teeth": [50, 34], "chainline_mm": None}
        variant = deepcopy(data["components"][0])
        variant.update(id="another-crankset", slug="another-crankset")
        data["components"].append(variant)
        self.assertEqual(validate_catalogue(data), [])

    def test_required_component_identity_weight_description_and_document(self):
        for field in ('model_number', 'weight_g', 'weight_description', 'technical_document'):
            data = fixture()
            del data['components'][0][field]
            with self.subTest(field=field):
                self.assertTrue(validate_catalogue(data))
        for value in (0, -1, None, '500 g', True):
            data = fixture()
            data['components'][0]['weight_g'] = value
            with self.subTest(weight=value):
                self.assertTrue(validate_catalogue(data))
        for field in ('model_number', 'weight_description'):
            data = fixture()
            data['components'][0][field] = '  '
            self.assertTrue(validate_catalogue(data))

    def test_technical_document_must_use_manufacturer_https_domain(self):
        for url in ('https://retailer.test/spec.pdf', 'https://example.com.attacker.test/spec.pdf',
                    'https://notexample.com/spec.pdf', 'http://example.com/spec.pdf',
                    'https://user:password@example.com/spec.pdf'):
            data = fixture()
            data['components'][0]['technical_document']['url'] = url
            with self.subTest(url=url):
                self.assertTrue(validate_catalogue(data))
        data = fixture()
        data['manufacturers'][0]['website_url'] = 'https://www.example.com/'
        data['components'][0]['technical_document']['url'] = 'https://docs.example.com/spec.pdf#page=2'
        self.assertEqual(validate_catalogue(data), [])

    def test_groupset_model_and_ordered_year_range_are_required(self):
        for field in ('model_number', 'year_range'):
            data = fixture()
            del data['groupsets'][0][field]
            self.assertTrue(validate_catalogue(data))
        for value in ({'start':2000}, {'start':None,'end':2005}, {'start':2005,'end':2000},
                      {'start':2000,'end':'present'}):
            data = fixture()
            data['groupsets'][0]['year_range'] = value
            with self.subTest(years=value):
                self.assertTrue(validate_catalogue(data))
        for value in ({'start':2000,'end':None}, {'start':2000,'end':2000}, {'start':2000,'end':2005}):
            data = fixture()
            data['groupsets'][0]['year_range'] = value
            self.assertEqual(validate_catalogue(data), [])

    def test_hub_weights_must_explicitly_exclude_skewers(self):
        for kind in ('front-hub', 'rear-hub'):
            for excludes in (None, False, True):
                data = fixture()
                component = data['components'][0]
                component.update(type=kind, weight_description='100 mm hub, 32 holes; excludes skewer')
                if excludes is not None:
                    component['weight_excludes_skewers'] = excludes
                with self.subTest(kind=kind, excludes=excludes):
                    self.assertEqual(bool(validate_catalogue(data)), excludes is not True)
        data = fixture()
        data['components'][0]['specifications'] = {'weight_g':500}
        self.assertTrue(validate_catalogue(data), 'Weight must not have two conflicting locations')

    def test_rear_hubs_can_have_unknown_weight_but_cannot_bypass_weight_rules(self):
        for kind in ('rear-hub', 'front-hub', 'crankset'):
            data = fixture()
            component = data['components'][0]
            component.update(type=kind, weight_g=None, weight_description='Weight without skewer not yet sourced')
            if kind.endswith('hub'):
                component['weight_excludes_skewers'] = True
            with self.subTest(kind=kind):
                self.assertEqual(bool(validate_catalogue(data)), kind != 'rear-hub')
        for value in (0, -1, 'unknown', True):
            data = fixture()
            data['components'][0].update(type='rear-hub', weight_g=value, weight_excludes_skewers=True)
            with self.subTest(weight=value):
                self.assertTrue(validate_catalogue(data))
        for excludes in (False, None):
            data = fixture()
            component = data['components'][0]
            component.update(type='rear-hub', weight_g=None)
            if excludes is not None:
                component['weight_excludes_skewers'] = excludes
            self.assertTrue(validate_catalogue(data))
        data = fixture()
        component = data['components'][0]
        component.update(type='rear-hub', weight_excludes_skewers=True)
        del component['weight_g']
        self.assertTrue(validate_catalogue(data), 'Unknown weights must be explicit nulls')

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
