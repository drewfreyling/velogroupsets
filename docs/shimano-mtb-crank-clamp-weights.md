# Shimano MTB crank and clamp weight follow-up

Reviewed on **28 November 2026**. This pass adds **eight weighted components** from Shimano’s 2017–2018 specifications v2.8: three crank variants and five Deore XT clamp-mounted front derailleurs. Existing records, IDs, memberships, primary documents and positive weights remain unchanged.

## Cranksets

| Component | Weighed configuration | Weight | BCD | Manufacturer reference |
| --- | --- | ---: | --- | --- |
| [FC-M825](../data/components/shimano-fc-m825.json) | Saint, 175 mm, 34T, 83 mm shell version; excludes BB and chain/bash guard | 838 g | 104 mm | [PDF 62 / printed 59](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=62) |
| [FC-M645](../data/components/shimano-fc-m645.json) | ZEE, 175 mm, 34T, 83 mm shell version; excludes BB and chain/bash guard | 837 g | 104 mm | [PDF 65 / printed 62](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=65) |
| [FC-M8000-B2](../data/components/shimano-fc-m8000-b2.json) | Deore XT, 175 mm, 36/26T; excludes BB and chain/bash guard | 721.6 g | 96/64 mm | [PDF 62 / printed 59](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=62) |

Both pages explicitly define the weight row as **Average weight (175 mm, w/o BB)** and identify the chainrings beside each mass. The mounting rows select no chain/bash guard. The exact service drawings independently identify FC-M825 and FC-M645, their 34T rings and 104 mm BCD. The shared FC-M8000 drawing explicitly names **FC-M8000-B1/B2**, lists the 36/26T combination and gives 96/64 mm outer/inner bolt circles.

FC-M825 and FC-M645 are the **83 mm bottom-bracket-shell versions**, with a documented 57.9 mm chainline. Their weights do not replace the existing FC-M820 and FC-M640 references. FC-M8000-B2 has a **51.8 mm chainline** and the handbook’s specified 3 mm outboard crank/frame/derailleur arrangement; it remains distinct from the standard FC-M8000-2. Series rows establish Saint, ZEE and Deore XT membership.

The [weight guidelines](weights-guidelines.md#cranksets) prefer 170 mm references while accepting other explicitly sourced lengths. These records retain the actual 175 mm manufacturer references, without bottom-bracket subtraction or length conversion. The internally inconsistent earlier FC-M8000-B1 reference remains excluded, as described in the [derailleur follow-up](shimano-mtb-derailleur-weights.md#reference-left-unresolved). A subsequent [2025–2026 source review](shimano-crank-weight-revisions.md#fc-m8000-b1-later-qualified-reference) adds its separately qualified **669 g, 170 mm, 30T** reference.

## Deore XT clamp-mounted front derailleurs

| Component | Weighed configuration | Weight | Manufacturer reference |
| --- | --- | ---: | --- |
| [FD-M785](../data/components/shimano-fd-m785.json) | 2×10-speed, top swing, 34.9 mm clamp | 136 g | [PDF 40 / printed 37](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=40) |
| [FD-M786](../data/components/shimano-fd-m786.json) | 2×10-speed, down swing, 34.9 mm clamp | 155 g | Same table |
| [FD-M771](../data/components/shimano-fd-m771.json) | 3×9-speed, down swing, 34.9 mm clamp | 155 g | [PDF 41 / printed 38](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=41) |
| [FD-M772A](../data/components/shimano-fd-m772a.json) | 3×9-speed, top swing, 34.9 mm clamp | 160 g | Same table |
| [FD-M773](../data/components/shimano-fd-m773.json) | 3×9-speed, down swing, 34.9 mm clamp | 174 g | Same table |

The weight heading explicitly selects **L-size band type**. Mount rows distinguish the unadapted **34.9 mm** band from 28.6 mm with an S reducer and 31.8 mm with an M reducer. The selected reference has no reducer fitted. Manufacturer exploded views confirm the clamp assemblies for FD-M785, FD-M786, FD-M771 and FD-M773; D-type, E-type and ten-speed revisions are not substituted.

FD-M772A retains the handbook’s exact **FD-M772A** spelling and uses that manufacturer specification page as its technical document. No equivalence with an earlier FD-M772 drawing is inferred. These weights follow the [front-derailleur guidelines](weights-guidelines.md#front-derailleurs); other mount sizes do not inherit them.
