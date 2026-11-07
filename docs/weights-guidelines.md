# Component weight guidelines

Use these rules when adding or correcting catalogue weights. Each weight must describe an identifiable configuration so readers can compare like with like. Follow the [catalogue guide](catalogue.md) for record fields and citations, and the [contribution instructions](../README.md#contributing) for submitting changes.

## Recording a weight

- Record weights in grams in `weight_g`; explain the weighed configuration in `weight_description`.
- Cite the measurement or the exact manufacturer specification and page. Distinguish your own measurement, another person's published measurement and a manufacturer-listed figure.
- Identify the model, variant, dimensions and included hardware. A weight for one configuration must not imply that every option has the same weight.
- For your own measurement, weigh clean, dry components and describe the scale's resolution. Do not report more precision than the evidence supports.
- Do not guess missing weights, divide a combined weight between parts or estimate deductions for excluded hardware. A source must establish the required configuration. The catalogue guide describes which records currently permit unknown weights.

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

## Cassettes

**Cassette weights must state the tooth-count configuration.** Give the smallest-to-largest sprocket range, such as 11–28T, and the number of sprockets. Include the full sequence of tooth counts when the source provides it. A model number or a list of available ranges does not identify which cassette was weighed.

State whether the weight includes the lockring and any spacers. Do not infer a tooth sequence or apply one range’s weight to another.

## Brakes

**Front and rear brakes must have separate weights. Each brake must be weighed with its brake pads and mounting bolts attached.** Identify whether the record describes the front or rear brake and the exact model and mounting configuration.

Do not use a brake-pair total or divide it in half. State any further inclusions or exclusions, such as a hose, adapter or rotor, so the configuration is clear.

Brakes are not yet supported by the catalogue's component-type schema. This rule defines the weight standard for their future addition; adding brake records also requires the corresponding schema and UI support.

## Front derailleurs

**Every front-derailleur weight must identify the mount: braze-on or clamp. A clamp-mounted version must include the clamp diameter in millimetres.** If reducers or shims provide several mounting sizes, identify the actual clamp/reducer configuration weighed.

A braze-on derailleur weighed with a clamp adapter must be described as a clamp-mounted assembly, with the adapter and clamp size included in the description. Do not present that assembly's weight as the braze-on-only weight. Also identify double/triple configuration and other relevant variants.

## Hubs

**Front and rear hubs are weighed without skewers.** State that exclusion, identify the spoke-hole count and other dimensions when known, and retain `weight_excludes_skewers: true`. Do not estimate the skewer's mass to derive a hub-only weight.

## Existing records and validation

These are the contribution standards. Some existing records need correction: 14 crankset entries currently include bottom brackets, ST-R7000-L and ST-R7000-R currently carry individual lever weights, and some crankset, bottom-bracket and front-derailleur descriptions do not identify the required dimensions or variant precisely enough. Their historical source descriptions do not make them exceptions to these rules.

Replace those values only with evidence for the required configuration, preserving stable identities and explaining any change in what a record represents. Do not rename a single-lever record into a pair or claim that the existing catalogue already complies. The current schema enforces required weight fields and hub-skewer exclusions, but does not automatically enforce every configuration rule in this guide; contributor and reviewer checks are still needed.
