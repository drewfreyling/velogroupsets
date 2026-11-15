# Disc brakes

The catalogue distinguishes three assemblies. Existing `brake-calipers` records and URLs remain unchanged for rim brakes. The new types are additive to the v1 API and use the shared component-type schema for search, groupset sections and API labels.

| Type | Assembly | Required identity/configuration, including unknown weights |
| --- | --- | --- |
| `disc-brake-caliper` | Caliper only | `weight_basis`: `Single`, `Front`, `Rear` or `Pair`; `actuation`: `Hydraulic` or `Mechanical`; `mount`: `Post mount`, `Flat mount` or `International Standard`; `piston_count`: positive integer or null |
| `disc-brake-rotor` | One rotor | `weight_basis: "Single"`; positive integer `diameter_mm`; `mount`: `Center Lock` or `6-bolt` |
| `disc-brake-system` | One complete hydraulic brake | `weight_basis: "Single"`; `actuation: "Hydraulic"`; `position`: `Front` or `Rear`; non-empty `lever_model` and `caliper_model`; `lever_side`: `Left`, `Right` or null; `hose_model`, `hose_length_mm`, `includes_rotor` explicitly present, nullable when unresolved |

Rotor diameters have distinct IDs/slugs, such as `shimano-rt-mt800-160` and `shimano-rt-mt800-180`, retaining the actual manufacturer model number `RT-MT800`. A shared rotor has one record with multiple documented groupset memberships. Calipers with no documented positional difference have one unpositioned `Single` record with an unknown weight. A sourced weight must identify a front, rear or pair reference, following the existing brake-weight rule. Distinct front/rear assemblies need distinct IDs and the actual manufacturer model code; do not invent a model suffix.

Complete systems use the actual lever/caliper code combination as the displayed model, with a configuration-specific ID/slug. This is an assembly reference, not a claim that the manufacturer printed that combination as a separate SKU. Position does not determine lever hand: front-left and front-right layouts both exist. A null hand must not be silently treated as left.

## Weight validation

All components retain a positive `weight_g` or explicit null and an identifying description. The Python catalogue validator adds these known-weight requirements to the shape constraints in the catalogue/OpenAPI schemas:

- **Caliper:** `weight_basis` must identify `Front`, `Rear` or `Pair`; an unpositioned `Single` cannot publish a weight. Require `includes_brake_pads: true` and `includes_mounting_bolts: true`. A bare-caliper average with unspecified hardware does not establish this reference. A hydraulic kit total must never be reused here.
- **Rotor:** boolean `includes_mounting_hardware`, stating whether its lockring or six bolts are included. The cassette-lockring assumption does not apply to rotors. A heading saying “without lock ring” establishes Center Lock exclusion; it does not establish the inclusion of six-bolt hardware for a different mount.
- **Hydraulic system:** an identified lever hand and hose model, positive hose length, pads and mounting bolts included, and boolean `includes_adapter`, `includes_rotor` and `includes_fluid`. If a rotor is included, also require `rotor_model`, positive `rotor_diameter_mm` and boolean `includes_rotor_mounting_hardware`. Describe the fluid state and any additional included hardware in the weight reference.

Do not infer weights from hose lengths, sum individual unpublished weights, split pair totals, subtract rotor/lever weights or assume a recommended rotor is included. Unknown configurations remain visible and editable while their weight stays null. Source truth requires review; schema validation alone cannot establish inclusions.

## Initial manufacturer references

The [Shimano 2025–2026 specifications handbook v3.5](https://productinfo.shimano.com/pdfs/product/archive/2025-2026_Specifications_v035_en.pdf) separates caliper averages from complete-kit averages on PDF pp. 42–44. Kit headings identify a front 800 mm hose, Standard 1 pad, no adapter and two fixing screws. That heading does not explicitly identify lever hand and rotor inclusion; initial front-kit records therefore retain null weights rather than treating their totals as fully specified measurements.

PDF p. 279 explicitly lists Center Lock rotor weights **without lockring**. RT-MT900, RT-MT800 and SM-RT70 have distinct 160/180/203 mm records using those figures. SM-RT86 six-bolt references remain unknown because the selected table does not establish mounting-bolt inclusion. Rotor membership follows explicit manufacturer brake drawings and named rotor recommendations in the selected edition; later recommendations do not imply the rotor existed at the original groupset launch.

Manufacturer exploded views establish complete model identity, rotor/hose associations and service parts. They are not themselves weight measurements. Standalone calipers stay null until pad/bolt-inclusive weights are sourced, even if a bare average is printed elsewhere. Additional road/gravel disc systems, mechanical brakes, alternative pads, rear hoses and rotor mounts remain future source work.
