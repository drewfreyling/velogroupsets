# Component weight guidelines

Use these rules when adding or correcting catalogue weights. Each weight must describe an identifiable configuration so readers can compare like with like. Follow the [catalogue guide](catalogue.md) for record fields and citations, and the [contribution instructions](../README.md#contributing) for submitting changes.

## Recording a weight

- Record weights in grams in `weight_g`; explain the weighed configuration in `weight_description`.
- Cite the measurement or the exact manufacturer specification and page. Distinguish your own measurement, another person's published measurement and a manufacturer-listed figure.
- Identify the model, variant, dimensions and included hardware. A weight for one configuration must not imply that every option has the same weight.
- For your own measurement, weigh clean, dry components and describe the scale's resolution. Do not report more precision than the evidence supports.
- Do not guess missing weights, divide a combined weight between parts or estimate deductions for excluded hardware. A source must establish the required configuration. Use explicit `weight_g: null` with an explanation whenever a compliant weight is not sourced; keep the component record and its stable identity.

## Cranksets

**Crankset weights must exclude the bottom bracket and state the crank length in millimetres and the size of every chainring in teeth.** For example, specify 170 mm and 50/34T for a double or 50/39/30T for a triple. Record bottom brackets separately and describe any other included hardware that affects the weight.

A list of available crank lengths or chainring options is not enough: identify the exact combination to which the weight applies.

An example configuration is “170 mm crank arms, 50/34T chainrings; excludes bottom bracket.” A manufacturer figure for a crankset with an integrated bottom bracket does not meet this rule. Find a weight for the crankset alone rather than silently relabelling the combined figure or subtracting an assumed bottom-bracket weight.

## Bottom brackets

**Square-taper bottom brackets must state the spindle length in millimetres.** This identifies the measured variant; listing several available spindle lengths does not establish which one was weighed.

Keep spindle length separate from bottom-bracket shell width. For example, a square-taper description could identify a “113 mm spindle, 68 mm shell, BSA thread; complete bottom-bracket assembly.” Describe the actual sourced configuration; this example is not a component specification. Identify the interface for other bottom-bracket types without inventing a square-taper spindle length for a cup-only assembly.

## Shifters

**Shifters are weighed as a pair: the left and right units together.** Say that the weight is for a pair and identify the shifting system and speed configuration. For integrated shift/brake levers, include both complete lever units and describe any additional included hardware.

Use a measured or manufacturer-published pair weight. An individual lever weight is not a compliant pair weight; do not double one side's figure, because the two sides can differ.

## Standalone brake levers

**Standalone brake levers are recorded as a left/right pair**, separately from brake calipers and integrated shift/brake controls. Use a published or measured pair weight, identify the model and lever style, and describe included cables or other hardware where the source establishes it. Do not double an individual lever weight. Known weights require `specifications.weight_basis: "Pair"`; use null when a compliant pair weight is unavailable.

## Cassettes

**Cassette weights must state the tooth-count configuration.** Give the smallest-to-largest sprocket range, such as 11–28T, and the number of sprockets. Include the full sequence of tooth counts when the source provides it. A model number or a list of available ranges does not identify which cassette was weighed.

Assume cassette weights include the lockring; explicit verification of lockring inclusion is not required. State known spacer inclusions or exclusions, and preserve any explicit source statement that the lockring is excluded. Do not infer a tooth sequence or apply one range’s weight to another.

## Brakes

**Front and rear brakes must have separate weights. Each brake must be weighed with its brake pads and mounting bolts attached.** Identify whether the record describes the front or rear brake and the exact model and mounting configuration.

Do not use a brake-pair total or divide it in half. State any further inclusions or exclusions, such as a hose, adapter or rotor, so the configuration is clear.

Brake calipers are not yet supported by the catalogue's component-type schema; standalone brake levers have their own category. This rule defines the weight standard for their future addition; adding brake records also requires the corresponding schema and UI support.

## Front derailleurs

**Every front-derailleur weight must identify the mount: braze-on or clamp. A clamp-mounted version must include the clamp diameter in millimetres.** If reducers or shims provide several mounting sizes, identify the actual clamp/reducer configuration weighed. A single band documented to fit a range, such as 28.0–28.6 mm, may identify that manufacturer-specified band range; do not substitute a list of different available clamps.

A braze-on derailleur weighed with a clamp adapter must be described as a clamp-mounted assembly, with the adapter and clamp size included in the description. Do not present that assembly's weight as the braze-on-only weight. Also identify double/triple configuration and other relevant variants.

## Hubs

**Front and rear hubs are weighed without skewers.** State that exclusion, identify the spoke-hole count and other dimensions when known, and retain `weight_excludes_skewers: true`. Do not estimate the skewer's mass to derive a hub-only weight.

## Validation fields

For a known `weight_g`, the following `specifications` fields identify the actual weight reference. Broader model options remain separate. Descriptions and citations must support these fields; machine checks do not prove a source's truth.

| Type | Required weight-reference fields |
| --- | --- |
| Crankset | Positive `crank_length_mm`, positive integer `chainrings_teeth` list, `includes_bottom_bracket: false` |
| Bottom bracket | `interface`; square-taper assemblies also require positive `spindle_length_mm` |
| Shifters / standalone brake levers | `weight_basis: "Pair"` |
| Front derailleur | `mount: "Braze-on"` or `"Clamp"`; clamp weights require positive `clamp_diameter_mm` or a two-value increasing `clamp_diameter_range_mm` for one documented band |
| Cassette | Integer `rear_speeds` of at least two; an increasing `sprocket_range` such as `11–28T` or a complete increasing `sprockets_teeth` list whose length matches the speed count; if both are present they must agree |

Hub-skewer exclusions remain mandatory even when the weight is unknown. All records still require a `weight_g` field, description and sources. Unknown weights use null, never zero or an invented number.

## Catalogue audit — 8 November 2026

All existing records were reviewed. Five crankset weights were replaced with directly published crank-only figures from [Shimano's 2017–2018 handbook](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf):

| Model | Weight without bottom bracket | Reference | PDF page |
| --- | --- | --- | --- |
| FC-5800 | 757 g | 170 mm, 50/34T | 170 |
| FC-6750 | 699 g | 170 mm, 50/34T | 171 |
| FC-6703 | 803 g | 170 mm, 52/39/30T | 171 |
| FC-5750 | 716 g | 170 mm, 50/34T | 171 |
| FC-5703 | 831 g | 170 mm, 50/39/30T | 172 |

Sixteen previously numeric weights are now null:

- Ten cranksets with only combined bottom-bracket totals: FC-5600, FC-5603, FC-5700, FC-6600, FC-6601-G, FC-6603, FC-6604-G, FC-6650-G, FC-6650-S and FC-6700.
- Three square-taper bottom brackets without an identified weighed spindle length: BB-1050, BB-1055 and BB-6400.
- ST-R7000-L and ST-R7000-R, whose records identify individual levers rather than a pair.
- FD-1056-B, whose cited weight does not identify the clamp size.

The audit also makes pair weights explicit, records the documented clamp dimensions, and identifies every cassette's speed and tooth range. The eight-speed U-group cassette uses Shimano's documented 12-13-14-15-17-19-21-23T sequence. Original IDs and catalogue memberships are preserved. The seven previously unknown hub weights remain unknown, bringing the total to 23 unknown weights; no undocumented deductions or pair calculations were used.
