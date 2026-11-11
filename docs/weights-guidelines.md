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

**Prefer 170 mm crank arms when choosing or contributing a reference weight.** This gives readers a consistent basis for comparison. Other lengths are valid when that is the sourced or measured configuration; record the actual length and never convert another length’s weight into an estimated 170 mm figure.

An example configuration is “170 mm crank arms, 50/34T chainrings; excludes bottom bracket.” A manufacturer figure for a crankset with an integrated bottom bracket does not meet this rule. Find a weight for the crankset alone rather than silently relabelling the combined figure or subtracting an assumed bottom-bracket weight.

## Bottom brackets

**Square-taper bottom brackets must state the spindle length in millimetres.** This identifies the measured variant; listing several available spindle lengths does not establish which one was weighed.

Keep spindle length separate from bottom-bracket shell width. For example, a square-taper description could identify a “113 mm spindle, 68 mm shell, BSA thread; complete bottom-bracket assembly.” Describe the actual sourced configuration; this example is not a component specification. Identify the interface for other bottom-bracket types without inventing a square-taper spindle length for a cup-only assembly.

## Shifters

**Shifters are weighed as a pair: the left and right units together.** Say that the weight is for a pair and identify the shifting system and speed configuration. For integrated shift/brake levers, include both complete lever units and describe any additional included hardware.

Catalogue shifter records also represent complete left/right pairs, including records with unknown weights. Use `specifications.weight_basis: "Pair"` and a name that says “pair”. When the two sides have separate manufacturer model numbers, identify both in the record instead of listing them as two standalone shifters.

Use a measured or manufacturer-published pair weight. An individual lever weight is not a compliant pair weight; do not double one side's figure, because the two sides can differ.

## Standalone brake levers

**Standalone brake levers are recorded as a left/right pair**, separately from brake calipers and integrated shift/brake controls. Use a published or measured pair weight, identify the model and lever style, and describe included cables or other hardware where the source establishes it. Do not double an individual lever weight. Known weights require `specifications.weight_basis: "Pair"`; use null when a compliant pair weight is unavailable.

## Cassettes

**Cassette weights must state the tooth-count configuration.** Give the smallest-to-largest sprocket range, such as 11–28T, and the number of sprockets. Include the full sequence of tooth counts when the source provides it. A model number or a list of available ranges does not identify which cassette was weighed.

Assume cassette weights include the lockring; explicit verification of lockring inclusion is not required. State known spacer inclusions or exclusions, and preserve any explicit source statement that the lockring is excluded. Do not infer a tooth sequence or apply one range’s weight to another.

## Brake calipers

**Brake calipers may have a complete front/rear pair weight or separate front and rear weights. All weights must include brake pads and mounting bolts.** Identify the exact model, position and mounting configuration. Use the `brake-calipers` category with `specifications.weight_basis: "Pair"`, `"Front"` or `"Rear"`, even when the weight is unknown.

Keep a published or measured pair total in one pair record. For separate weights, use distinct front and rear records, each with its own `weight_g`, description and sources. Preserve the manufacturer's model number even when it is the same for both positions; record IDs/slugs distinguish them. Do not divide a pair total, double one caliper's weight or calculate the other caliper by subtraction. Do not add overlapping pair and individual records for the same configuration just to repeat a weight.

For known weights, record `includes_brake_pads: true` and `includes_mounting_bolts: true` in `specifications`. These are source-backed inclusion claims, not defaults. Describe standard pads, nut/bolt variants and any further inclusions or exclusions where established. Manufacturer-listed complete factory caliper assemblies can use their listed standard pads and fixing hardware; retain any unspecified hardware variant as an explicit limitation. Bare-caliper or undocumented stripped measurements use a null weight until a compliant reference is available. Hoses, adapters and rotors must not be silently included or deducted. Standalone brake levers remain a separate category.

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
| Brake calipers | `weight_basis: "Pair"`, `"Front"` or `"Rear"`; `includes_brake_pads: true` and `includes_mounting_bolts: true` |
| Front derailleur | `mount: "Braze-on"` or `"Clamp"`; clamp weights require positive `clamp_diameter_mm` or a two-value increasing `clamp_diameter_range_mm` for one documented band |
| Cassette | Integer `rear_speeds` of at least two; an increasing `sprocket_range` such as `11–28T` or a complete increasing `sprockets_teeth` list whose length matches the speed count; if both are present they must agree |

Hub-skewer exclusions remain mandatory even when the weight is unknown. All records still require a `weight_g` field, description and sources. Unknown weights use null, never zero or an invented number.
