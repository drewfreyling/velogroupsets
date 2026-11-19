# Shimano MTB inventories, Eagle AXS controls and crank weights

Reviewed on **15 November 2026**. This review adds **73 component identities**, expands **30 existing Shimano MTB groupsets**, and supplies **29 newly sourced weights**, including **13 crankset references**. The catalogue now has **1,385 components across the existing 257 groupsets**. No groupset starts, existing IDs or rim-brake types are changed.

## Expanded Shimano inventories

| Existing range | Before | After |
| --- | --- | --- |
| [Deore XT M739](../data/groupsets/shimano-deore-xt-m739.json) | 3 | 4 |
| [XTR M950](../data/groupsets/shimano-xtr-m950.json) | 3 | 4 |
| [Deore LX M570](../data/groupsets/shimano-deore-lx-m570.json) | 3 | 4 |
| [Deore XT M750](../data/groupsets/shimano-deore-xt-m750.json) | 3 | 4 |
| [Deore M510](../data/groupsets/shimano-deore-m510.json) | 3 | 4 |
| [Deore XT M760](../data/groupsets/shimano-deore-xt-m760.json) | 3 | 4 |
| [Deore LX M580](../data/groupsets/shimano-deore-lx-m580.json) | 3 | 4 |
| [Deore M530](../data/groupsets/shimano-deore-m530.json) | 3 | 4 |
| [XTR M970](../data/groupsets/shimano-xtr-m970.json) | 3 | 4 |
| [Deore XT M770](../data/groupsets/shimano-deore-xt-m770.json) | 3 | 4 |
| [SLX M660](../data/groupsets/shimano-slx-m660.json) | 3 | 4 |
| [Deore M590](../data/groupsets/shimano-deore-m590.json) | 3 | 4 |
| [XTR M980](../data/groupsets/shimano-xtr-m980.json) | 3 | 4 |
| [Deore XT M780](../data/groupsets/shimano-deore-xt-m780.json) | 3 | 4 |
| [SLX M670](../data/groupsets/shimano-slx-m670.json) | 2 | 4 |
| [Saint M820](../data/groupsets/shimano-saint-m820.json) | 2 | 6 |
| [ZEE M640](../data/groupsets/shimano-zee-m640.json) | 2 | 4 |
| [Deore M610](../data/groupsets/shimano-deore-m610.json) | 2 | 3 |
| [XTR M9000](../data/groupsets/shimano-xtr-m9000.json) | 2 | 4 |
| [XTR Di2 M9050](../data/groupsets/shimano-xtr-di2-m9050.json) | 2 | 3 |
| [Deore XT M8000](../data/groupsets/shimano-deore-xt-m8000.json) | 2 | 12 |
| [Deore XT Di2 M8050](../data/groupsets/shimano-deore-xt-di2-m8050.json) | 2 | 3 |
| [SLX M7000](../data/groupsets/shimano-slx-m7000.json) | 3 | 4 |
| [Deore M6000](../data/groupsets/shimano-deore-m6000.json) | 2 | 5 |
| [XTR M9100](../data/groupsets/shimano-xtr-m9100.json) | 3 | 12 |
| [Deore XT M8100](../data/groupsets/shimano-deore-xt-m8100.json) | 2 | 12 |
| [SLX M7100](../data/groupsets/shimano-slx-m7100.json) | 2 | 12 |
| [Deore M4100](../data/groupsets/shimano-deore-m4100.json) | 2 | 3 |
| [Deore M6100](../data/groupsets/shimano-deore-m6100.json) | 2 | 5 |
| [Deore M5100](../data/groupsets/shimano-deore-m5100.json) | 2 | 3 |

Controls span M739/M950 through current mechanical and Di2 MTB generations. Old left/right sets remain pairs. The [subsequent pair-weight review](shifter-pair-weight-review.md) adds labelled totals where both matching manufacturer side weights are published. SL-M9000's 200 g is explicitly per pair in the manufacturer handbook. Right-hand 1× controls retain actual band-clamp model codes and distinguish I-SPEC hardware; unsupported weights remain null. This review adds complete crank, cassette, caliper and rotor references where manufacturer documents establish the association. It does not claim complete build-kit coverage for every historical MTB generation.

Across all manufacturers, the number of groupsets with only two or three components falls from **117 to 91**. Shimano MTB groupsets without a shifter record fall from **61 to 31**. The crank review fills **four existing unknown weights** and adds **nine newly catalogued weighed configurations**. Overall unknown-weight count rises from 702 to 746 because the expanded inventories include further genuine assemblies whose weights are not yet supported; unknowns are not filled with estimates.

## Three Eagle AXS controller identities

- **EC-AXS-SRAM-A1:** one original right-hand controller record shared by XX1 Eagle AXS and X01 Eagle AXS.
- **EC-GX-AXS-A1:** GX Eagle AXS controller, explicitly listed by the manufacturer's GX upgrade kit.
- **EC-AXS-ROCK-A1:** the right-hand rear-shift configuration of the ambidextrous Rocker controller, explicitly listed in the X01 AXS upgrade kit. Left-hand seatpost configurations are not represented by this record.

The original controller is not duplicated per groupset. EC-AXS-RKSX-A1 is a left-hand RockShox seatpost controller, and EC-AXS-ST-A1 is a left-hand e-bike controller; neither is mislabelled as a right-hand Eagle shifter. Clamp/battery-specific weights for the three added rear-shift references remain unknown.

## Crank references

All known weights identify arm length and every ring, and exclude bottom brackets. The 2025–2026 handbook provides 170 mm XTR M9100, XT M8100 and SLX M7100 single/double references, plus Saint FC-M820 and ZEE FC-M640. The 2017–2018 v2.8 handbook provides explicit 175 mm BB-free references for XT M8000, XTR FC-M9000-1 and SLX FC-M7000-11-2. The actual 175 mm source is retained without conversion to a guessed 170 mm figure. Generic existing FC-M9000/FC-M7000 IDs retain their identities and name the selected `reference_model` explicitly.

| Model | Reference | Weight |
| --- | --- | --- |
| [FC-M640](../data/components/shimano-fc-m640.json) | 170 mm, 34T; no BB | 797 g |
| [FC-M7000](../data/components/shimano-fc-m7000.json) | 175 mm, 34/24T; no BB | 739.8 g |
| [FC-M7100-1](../data/components/shimano-fc-m7100-1.json) | 170 mm, 32T; no BB | 620 g |
| [FC-M7100-2](../data/components/shimano-fc-m7100-2.json) | 170 mm, 36/26T; no BB | 663 g |
| [FC-M8000-1](../data/components/shimano-fc-m8000-1.json) | 175 mm, 30T; no BB | 680 g |
| [FC-M8000-2](../data/components/shimano-fc-m8000-2.json) | 175 mm, 34/24T; no BB | 695.5 g |
| [FC-M8000-3](../data/components/shimano-fc-m8000-3.json) | 175 mm, 40/30/22T; no BB | 773.9 g |
| [FC-M8100-1](../data/components/shimano-fc-m8100-1.json) | 170 mm, 32T; no BB | 624 g |
| [FC-M8100-2](../data/components/shimano-fc-m8100-2.json) | 170 mm, 36/26T; no BB | 657 g |
| [FC-M820](../data/components/shimano-fc-m820.json) | 170 mm, 34T; no BB | 814 g |
| [FC-M9000](../data/components/shimano-fc-m9000.json) | 175 mm, 30T; no BB | 586 g |
| [FC-M9100-1](../data/components/shimano-fc-m9100-1.json) | 170 mm, 32T; no BB | 530 g |
| [FC-M9100-2](../data/components/shimano-fc-m9100-2.json) | 170 mm, 38/28T; no BB | 606 g |

The 2014 road/MTB figures labelled integrated BB or lacking a clear exclusion are not reused. A blank or dash in the modern tables is not zero. SRAM product-page crank weights still need an explicit BB-exclusion reference where not already established by the manufacturer's weight-methodology documents.

## Disc-brake model and remaining work

See [the disc-brake contract](disc-brakes.md) for caliper, rotor and complete hydraulic-system records, exact mounting/hardware requirements and initial handbook pages. The new API type values are additive; existing paths, envelopes, IDs and fields remain unchanged. Catalogue responses remain generated static assets without runtime database or Worker reads.

Further work includes the oldest Shimano MTB controls and hubs, XTR M960 dual-control variants, additional cassette/BB options, compliant caliper-only weights and fully identified front/rear hydraulic references. These inventories remain documented starter lists. Missing records are not evidence that a family lacked the component.
