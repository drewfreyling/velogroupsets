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
        "groupsets": [dict(record("example-group"), manufacturer_id="example-maker", model_number="EG-100", start_year=2000)],
        "components": [dict(record("example-crankset"), manufacturer_id="example-maker", groupset_ids=["example-group"], type="crankset", model_number="EC-100", weight_g=500, weight_description="170 mm crank arms, 50/34T chainrings; no bottom bracket", technical_document=deepcopy(source), specifications={"crank_length_mm":170, "chainrings_teeth":[50,34], "includes_bottom_bracket":False})],
    }


class CatalogueTests(unittest.TestCase):
    def test_caliper_pair_and_individual_weights_require_pads_and_mounting_bolts(self):
        for basis in ('Pair', 'Front', 'Rear'):
            with self.subTest(basis=basis):
                data = fixture()
                part = data['components'][0]
                part.update(type='brake-calipers', specifications={'weight_basis':basis,
                    'includes_brake_pads':True, 'includes_mounting_bolts':True})
                self.assertEqual(validate_catalogue(data), [])
                for field in ('includes_brake_pads', 'includes_mounting_bolts'):
                    for value in (False, None, 1):
                        part['specifications'][field] = value
                        self.assertTrue(validate_catalogue(data))
                    del part['specifications'][field]
                    self.assertTrue(validate_catalogue(data))
                    part['specifications'][field] = True

    def test_unknown_caliper_weights_still_identify_pair_front_or_rear(self):
        data = fixture()
        part = data['components'][0]
        part.update(type='brake-calipers', weight_g=None, specifications={})
        self.assertTrue(validate_catalogue(data))
        for basis in ('Single', 'Left', ['Front', 'Rear'], None):
            part['specifications']['weight_basis'] = basis
            self.assertTrue(validate_catalogue(data))
        for basis in ('Pair', 'Front', 'Rear'):
            part['specifications']['weight_basis'] = basis
            self.assertEqual(validate_catalogue(data), [])

    def test_known_crankset_weights_require_the_exact_configuration_without_bb(self):
        for field, value in [('includes_bottom_bracket', True), ('crank_length_mm', None),
                             ('crank_length_mm', True), ('crank_length_mm', [170, 175]),
                             ('chainrings_teeth', ['50/34T']), ('chainrings_teeth', [])]:
            data = fixture()
            data['components'][0]['specifications'][field] = value
            with self.subTest(field=field, value=value):
                self.assertTrue(validate_catalogue(data))
        data['components'][0]['weight_g'] = None
        self.assertEqual(validate_catalogue(data), [])

    def test_square_taper_weight_requires_spindle_length_not_just_shell_width(self):
        data = fixture()
        part = data['components'][0]
        part.update(type='bottom-bracket', specifications={'interface':'Square taper', 'bb_shell_width_mm':68})
        self.assertTrue(validate_catalogue(data))
        part['specifications']['spindle_length_mm'] = [113, 115]
        self.assertTrue(validate_catalogue(data))
        part['specifications']['spindle_length_mm'] = 113
        self.assertEqual(validate_catalogue(data), [])
        part['specifications'] = {'interface':'External cups'}
        self.assertEqual(validate_catalogue(data), [])

    def test_individual_control_lever_weights_cannot_be_used_as_pair_weights(self):
        for kind in ('shifters', 'brake-levers'):
            with self.subTest(kind=kind):
                data = fixture()
                part = data['components'][0]
                part.update(type=kind, specifications={'weight_basis':'Single lever'})
                self.assertTrue(validate_catalogue(data))
                part['weight_g'] = None
                self.assertEqual(bool(validate_catalogue(data)), kind == 'shifters')
                part.update(weight_g=500, specifications={'weight_basis':'Pair'})
                self.assertEqual(validate_catalogue(data), [])

    def test_unknown_shifters_still_represent_pairs(self):
        data = fixture()
        part = data['components'][0]
        part.update(type='shifters', weight_g=None, specifications={'weight_basis':'Pair'})
        self.assertEqual(validate_catalogue(data), [])
        part['specifications'] = {}
        self.assertTrue(validate_catalogue(data))

    def test_merged_component_aliases_reserve_identifiers_and_slugs(self):
        data = fixture()
        part = data['components'][0]
        part['aliases'] = [{'id':'old-crankset', 'slug':'old-crankset'}]
        self.assertEqual(validate_catalogue(data), [])
        for alias in [{'id':part['id'],'slug':'old-crankset'},
                      {'id':'old-crankset','slug':part['slug']},
                      {'id':data['groupsets'][0]['id'],'slug':'old-crankset'}]:
            part['aliases'] = [alias]
            self.assertTrue(validate_catalogue(data))

    def test_front_derailleur_weights_require_mount_and_the_actual_clamp_size(self):
        data = fixture()
        part = data['components'][0]
        part.update(type='front-derailleur', specifications={'mount':'Clamp'})
        self.assertTrue(validate_catalogue(data))
        for size in (True, None, -1, [28.6, 31.8]):
            part['specifications']['clamp_diameter_mm'] = size
            with self.subTest(size=size):
                self.assertTrue(validate_catalogue(data))
        part['specifications']['clamp_diameter_mm'] = 28.6
        self.assertEqual(validate_catalogue(data), [])
        part['specifications']['clamp_diameter_range_mm'] = [28, 28.6]
        self.assertTrue(validate_catalogue(data), 'Cannot claim two different reference configurations')
        del part['specifications']['clamp_diameter_mm']
        self.assertEqual(validate_catalogue(data), [])
        part['specifications']['clamp_diameter_range_mm'] = [31.8, 28.6]
        self.assertTrue(validate_catalogue(data))
        part['specifications'] = {'mount':'Braze-on'}
        self.assertEqual(validate_catalogue(data), [])

    def test_cassette_weights_require_matching_tooth_counts_and_speed(self):
        data = fixture()
        part = data['components'][0]
        part.update(type='cassette', specifications={'rear_speeds':7, 'sprocket_range':'13–23T'})
        self.assertEqual(validate_catalogue(data), [])
        part['specifications']['sprockets_teeth'] = [13,14,15,17,19,21,23]
        self.assertEqual(validate_catalogue(data), [])
        for field, value in [('rear_speeds',8), ('rear_speeds',True), ('sprocket_range','23–13T'),
                             ('sprocket_range','11–28T'), ('sprockets_teeth',[13,13,15,17,19,21,23])]:
            original = deepcopy(part['specifications'])
            part['specifications'][field] = value
            with self.subTest(field=field, value=value):
                self.assertTrue(validate_catalogue(data))
            part['specifications'] = original
        part['specifications'] = {'rear_speeds':7, 'sprocket_group':'I'}
        self.assertTrue(validate_catalogue(data), 'A group name alone does not identify the tooth range')

    def rear_derailleur_fixture(self):
        data = fixture()
        data['components'][0].update(type='rear-derailleur', specifications={
            'total_capacity_teeth': 29, 'maximum_sprocket_teeth': 27,
            'minimum_sprocket_teeth': 11, 'maximum_front_difference_teeth': 16,
        })
        return data

    def test_rear_derailleurs_require_all_four_limits(self):
        for field in self.rear_derailleur_fixture()['components'][0]['specifications']:
            data = self.rear_derailleur_fixture()
            del data['components'][0]['specifications'][field]
            with self.subTest(field=field):
                self.assertTrue(validate_catalogue(data))
        data = self.rear_derailleur_fixture()
        del data['components'][0]['specifications']
        self.assertTrue(validate_catalogue(data))

    def test_rear_derailleur_limits_are_integer_teeth_or_explicit_unknown(self):
        for field in self.rear_derailleur_fixture()['components'][0]['specifications']:
            for value in (-1, 12.5, '28T', True, [28]):
                data = self.rear_derailleur_fixture()
                data['components'][0]['specifications'][field] = value
                with self.subTest(field=field, value=value):
                    self.assertTrue(validate_catalogue(data))
            data = self.rear_derailleur_fixture()
            data['components'][0]['specifications'][field] = None
            self.assertEqual(validate_catalogue(data), [])
            data['components'][0]['specifications'][field] = 0
            self.assertEqual(bool(validate_catalogue(data)), field != 'maximum_front_difference_teeth')

    def test_rear_derailleur_sprocket_bounds_and_independent_maxima(self):
        data = self.rear_derailleur_fixture()
        # Published individual limits need not be usable simultaneously.
        self.assertEqual(validate_catalogue(data), [])
        data['components'][0]['specifications']['minimum_sprocket_teeth'] = 30
        self.assertTrue(any('smallest sprocket' in error for error in validate_catalogue(data)))

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
        data["components"][0]["specifications"] = {"crank_length_mm": 170, "chainrings_teeth": [50, 34], "chainline_mm": None, "includes_bottom_bracket": False}
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
        for value in (0, -1, '500 g', True):
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

    def test_reviewed_campagnolo_archives_are_allowed_only_for_campagnolo(self):
        data = fixture()
        data['manufacturers'][0].update(id='campagnolo', website_url='https://www.campagnolo.com/')
        data['groupsets'][0]['manufacturer_id'] = 'campagnolo'
        data['components'][0]['manufacturer_id'] = 'campagnolo'
        base = 'https://www.disraeligears.co.uk/site/'
        for path in ('campagnolo_spare_parts_catalogue_-_1994_product_range_page_1.html',
                     'campagnolo_spare_parts_catalogue_-_1994_product_range_page_58.html',
                     'campagnolo_spare_parts_catalogue_-_1997_page_1.html',
                     'campagnolo_spare_parts_catalogue_-_1997_page_88.html#drawing',
                     'campagnolo_-_catalogue_n_18_bis_april_1985_version_page_56.html',
                     'campagnolo_-_chorus_july_1987_version_scan_14.html',
                     'campagnolo_-_croce_daune_november_1987_version_scan_12.html',
                     'campagnolo_-_athena_scan_10.html'):
            data['components'][0]['technical_document']['url'] = base + path
            with self.subTest(path=path):
                self.assertEqual(validate_catalogue(data), [])
        valid_url = base + 'campagnolo_spare_parts_catalogue_-_1997_page_24.html'
        invalid_urls = (
            valid_url.replace('https:', 'http:'),
            valid_url.replace('www.disraeligears.co.uk', 'www.disraeligears.co.uk.attacker.test'),
            valid_url.replace('www.disraeligears.co.uk', 'shop.disraeligears.co.uk'),
            valid_url.replace('www.disraeligears.co.uk', 'user:password@www.disraeligears.co.uk'),
            valid_url.replace('www.disraeligears.co.uk', 'www.disraeligears.co.uk:8080'),
            valid_url + '?redirect=https://attacker.test',
            base + 'campagnolo_spare_parts_catalogue_-_1998_page_24.html',
            base + 'campagnolo_spare_parts_catalogue_-_1997_page_0.html',
            base + 'campagnolo_spare_parts_catalogue_-_1997_page_89.html',
            base + 'campagnolo_spare_parts_catalogue_-_1994_product_range_page_59.html',
            base + 'campagnolo_-_1992_road_range.html',
            base + 'campagnolo_-_catalogue_n_18_bis_april_1985_version_page_57.html',
            base + 'campagnolo_-_chorus_july_1987_version_scan_15.html',
            base + 'campagnolo_-_croce_daune_november_1987_version_scan_13.html',
            base + 'campagnolo_-_athena_scan_11.html',
            base + 'campagnolo_-_athena_scan_0.html',
            base + 'campagnolo_-_athena_scan_01.html',
            base + 'campagnolo_-_athena_scan_1.html?redirect=evil',
        )
        for url in invalid_urls:
            data['components'][0]['technical_document']['url'] = url
            with self.subTest(url=url):
                self.assertTrue(validate_catalogue(data))
        unrelated = fixture()
        unrelated['components'][0]['technical_document']['url'] = valid_url
        self.assertTrue(validate_catalogue(unrelated))
        data['components'][0]['technical_document']['url'] = valid_url
        data['manufacturers'][0]['website_url'] = 'https://example.com/'
        self.assertTrue(validate_catalogue(data))

    def test_groupset_model_and_single_start_year_are_required(self):
        for field in ('model_number', 'start_year'):
            data = fixture()
            del data['groupsets'][0][field]
            self.assertTrue(validate_catalogue(data))
        for value in (None, '2000', True, 2000.5, 1700, 2200):
            data = fixture()
            data['groupsets'][0]['start_year'] = value
            with self.subTest(year=value):
                self.assertTrue(validate_catalogue(data))
        data = fixture()
        self.assertEqual(validate_catalogue(data), [])
        data['groupsets'][0]['year_range'] = {'start':2000, 'end':None}
        self.assertTrue(validate_catalogue(data))

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

    def test_unknown_weights_are_explicit_and_do_not_bypass_hub_rules(self):
        for kind in ('rear-hub', 'front-hub', 'crankset'):
            data = fixture()
            component = data['components'][0]
            component.update(type=kind, weight_g=None, weight_description='Weight without skewer not yet sourced')
            if kind.endswith('hub'):
                component['weight_excludes_skewers'] = True
            with self.subTest(kind=kind):
                self.assertEqual(validate_catalogue(data), [])
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
