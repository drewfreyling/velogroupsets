# Brake calipers

Brake calipers use the `brake-calipers` component type, separate from standalone brake levers and integrated shift/brake controls. The catalogue, groupset lists, search and static API expose these records through the shared taxonomy.

## Weight contract

Every caliper record declares `specifications.weight_basis` as `Pair`, `Front` or `Rear`, even when `weight_g` is null. A pair record contains the complete front/rear total. Separate weights use separate records; for example, `shimano-br-r8000-front` and `shimano-br-r8000-rear` both retain the manufacturer model number **BR-R8000**. The description identifies the position; the hyperlink remains the model number.

Known weights require `includes_brake_pads: true` and `includes_mounting_bolts: true`, supported by the cited complete factory assembly or contributor measurement. They are not automatic assumptions for bare calipers. Keep a published pair total intact: never divide it, double an individual weight or derive a missing side by subtraction. See the [weight guidelines](weights-guidelines.md#brake-calipers).

The component page labels the weight basis, the search index includes `weight_basis`, and the static API preserves these fields in `specifications`. Unknown weights remain null throughout. No database or Worker execution is added to curated catalogue reads.

## Sourced records

| Caliper | Weight basis | Weight | Reference |
| --- | --- | --- | --- |
| BR-6400-49 | Front/rear pair | 360 g | Shimano 1990 dealer manual, p. 20; 49 type only |
| BR-6400-57 | Front/rear pair | Not yet sourced | Same table; 360 g is not specified for the 57 type |
| BR-6403-49 | Front/rear pair | 424 g | Shimano 1991 dealer catalogue, printed p. 29 / PDF p. 32 |
| BR-7700 | Front/rear pair | 317.5 g | Shimano 2001 dealer catalogue, printed p. 65 |
| BR-6500 | Front/rear pair | 334.5 g | Same table |
| BR-5500 | Front/rear pair | 352 g | Same table |
| BR-4400 | Front/rear pair | 355 g | Shimano 2001 dealer catalogue, printed p. 34 |
| BR-R7000 | Front/rear pair | 379 g | Shimano 2022–2023 specifications, PDF p. 159 / printed p. 156 |
| BR-R7010-F | Front | 174 g | Same table |
| BR-R7010-R | Rear, under bottom bracket | 173 g | Same table; separate SM-CB90 cable adjuster required |
| BR-R7010-RS | Rear, seatstay | 174 g | Same table |
| BR-R8000 | Separate front / rear | 182 g / 178 g | Shimano 2022–2023 specifications, PDF p. 157 / printed p. 154 |
| BR-R8100 | Separate front / rear | 182 g / 180 g | Same table |
| BR-R8110-F | Front | 180 g | Same table |
| BR-R8110-RS | Rear, seatstay | 178 g | Same table |
| BR-4700, BR-R3000 | Front/rear pair | Not yet sourced | PDF p. 159 leaves their weights blank |
| BR-7800, BR-6600, BR-5600 | Front/rear pair | Not yet sourced | Shimano 2006 specifications, printed p. 107 has no weight row |
| BR-3300 | Front/rear pair | Not yet sourced | Same handbook, printed p. 108 |

These are manufacturer figures for complete factory calipers with their listed standard pads and fixing hardware, rather than weighed bare arms. The 2001 table specifies R55C pads for BR-7700/6500/5500; the service documents identify complete assemblies, mounting fasteners and shoes. The later BR-7700 spare-parts drawing also offers thicker R55C+1 shoes: it does not redefine the earlier R55C weight reference. The later 2006 table lists R50T pads as standard for BR-4400, but the 2001 weight reference does not identify its pad variant; its description preserves that limitation. The 2022–2023 tables specify R55C4 pads for the weighed models. None identifies a particular reference mounting-nut/bolt length, so descriptions retain that limitation. Do not apply these figures to optional pads or claim every fastener variant weighs the same.

The [2001 p. 64–65 scan](https://www.charlie-taylor.net/bikes/library/shimano/2001/large/01Shimano64-65.jpg) and [p. 34–35 scan](https://www.charlie-taylor.net/bikes/library/shimano/2001/large/01Shimano34-35.jpg) preserve the original manufacturer tables. Manufacturer-hosted Shimano service documents remain the primary technical links for those records. Modern records link directly to the [manufacturer specification handbook](https://productinfo.shimano.com/pdfs/product/archive/2022-2023_Specifications_v035_en.pdf). Group membership follows the documented series, not assumed compatibility.

## Remaining gaps

The catalogue contains 23 Shimano caliper records, 16 with sourced weights and seven with explicit unknowns. The [6400 source notes](ultegra.md#6400-calipers-and-eight-speed-downtube-shifters) distinguish the original single-pivot models from the later dual-pivot model and document their complete-pair weight references. It is not complete caliper coverage: earlier Shimano/Exage/RSX models, other Ultegra and Dura-Ace generations, Campagnolo and SRAM calipers still need reviewed records. Ultegra SL finishes must not inherit the standard BR-6600 weight or identity automatically. Disc calipers and their hoses, adapters and rotor configurations also need their own source review; rim-caliper weights cannot supply them.
