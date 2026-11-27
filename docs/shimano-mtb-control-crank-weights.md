# Shimano MTB control and crank weights

Reviewed on **28 November 2026**. This pass adds **five weighted components** from Shimano’s [2017–2018 specifications, v2.8](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf), cross-checked against the exact manufacturer exploded views linked on each record. Existing records, positive weights, IDs and primary documents remain unchanged.

## Control pairs

| Component | Configuration | Weight | Manufacturer reference |
| --- | --- | ---: | --- |
| [SL-M980-A](../data/components/shimano-sl-m980-a.json) | XTR band clamp; 10-speed rear, selectable 2/3-chainring front | 203 g calculated | [PDF page 5 / printed page 2](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=5): SL-M980-A-L 104 g + SL-M980-A-R 99 g |
| [SL-M980-B-I](../data/components/shimano-sl-m980-b-i.json) | XTR I-spec B; 10-speed rear, selectable 2/3-chainring front | 201 g calculated | [PDF page 6 / printed page 3](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=6): SL-M980-B-IL 98 g + SL-M980-B-IR 103 g |
| [SL-M770-A](../data/components/shimano-sl-m770-a.json) | Deore XT band clamp; 3×9-speed | 255 g published pair | [PDF page 8 / printed page 5](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=8): SL-M770-A-L / SL-M770-A-R, explicitly g/pair |

The XTR records retain both actual side codes, both manufacturer average weights and the calculated method under the [shifter weight rules](weights-guidelines.md#shifters). Neither side is inferred. The XTR controls have no optical gear displays; SL-M770-A has removable displays. The source does not specify cable/housing inclusion.

SL-M770-A’s repeated **255 g/pair** cells describe one complete pair, not 255 g per side. Its exploded view names the A revision and distinguishes it from SL-M770. The existing original SL-M770 remains unchanged even though its selected reference has the same total.

The XTR exploded views separately identify **SL-M980-A** and **SL-M980-B-I**. Their weights are not assigned to the original SL-M980, the distinct SL-M980-A-I assembly or another mounting option. The original SL-M980 remains unknown. These are additions to the existing M980 family, not replacements for its earlier controls.

## Cranksets

| Component | Weighed configuration | Weight | BCD |
| --- | --- | ---: | --- |
| [FC-M782](../data/components/shimano-fc-m782.json) | 175 mm, 40/30/22T, excludes bottom bracket | 778 g | 96/64 mm |
| [FC-M785](../data/components/shimano-fc-m785.json) | 175 mm, 38/26T, excludes bottom bracket | 717.6 g | 104/64 mm |

Both appear in the Deore XT columns on [PDF page 63 / printed page 60](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=63). The weight-row heading explicitly states **Average weight (175 mm, w/o BB)**. FC-M782 has one listed chainring combination; FC-M785’s weight cell separately identifies 40/28T, 38/26T and 38/24T. The catalogue selects the explicit **717.6 g / 38/26T** reference rather than combining options.

The exact exploded views independently confirm the model identities, chainring combinations and outer/inner bolt-circle diameters. These ten-speed double and triple records join the existing M780 family. FC-M780 retains its earlier unknown weight; a later model’s qualified reference does not resolve it.

The [weight guidelines](weights-guidelines.md#cranksets) prefer 170 mm reference cranks but accept other explicitly sourced lengths. These manufacturer references remain **175 mm**; no length conversion, bottom-bracket subtraction or weight estimate is used.
