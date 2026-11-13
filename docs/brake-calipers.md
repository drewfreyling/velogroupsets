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

## Additional Shimano road calipers

The additional records fill documented gaps in 1050, 105 SC, RX100, Exage 500EX/400EX/300EX/Sport/Motion, RSX, 105 5700/5800 and Ultegra 6700/6800. All are complete front/rear pairs. Each manufacturer-hosted technical document covers the caliper assembly or installation; archived original catalogues establish period specifications and weights.

| Models | Known pair weight | Weight source / boundary |
| --- | --- | --- |
| BR-1050-49 / BR-1050-57 | 335 g for the 49 type; 57 type unknown | [December 1987 catalogue, scan 23](https://www.disraeligears.co.uk/site/shimano_bicycle_system_components_december_1987_-_scan_23.html), explicitly F&R, 49 type |
| BR-1055-49 / BR-1055-57 | 360 g for the 49 type; 57 type unknown | [1990 manual, p. 24](https://www.disraeligears.co.uk/site/shimano_-_dealers_1990_product_manual_-_page_24.html), F&R, 49 type |
| BR-A550-49 / BR-A550-57 | 348 g for the 49 type; 57 type unknown | [Same manual, p. 28](https://www.disraeligears.co.uk/site/shimano_-_dealers_1990_product_manual_-_page_28.html) |
| BR-A500-49 / BR-A500-57 | 326 g for the 49 type; 57 type unknown | [Same manual, p. 32](https://www.disraeligears.co.uk/site/shimano_-_dealers_1990_product_manual_-_page_32.html) |
| BR-A350-49 / BR-A350-57 | 310 g for the 49 type; 57 type unknown | [Same manual, p. 33](https://www.disraeligears.co.uk/site/shimano_-_dealers_1990_product_manual_-_page_33.html) |
| BR-A250-49 / BR-A250-57 | 313 g for the 49 type; 57 type unknown | [Same manual, p. 34](https://www.disraeligears.co.uk/site/shimano_-_dealers_1990_product_manual_-_page_34.html) |
| BR-A450-49 / BR-A450-57 | Unknown | Sport identity and variants from the manufacturer drawing; membership also in the [August 1988 Exage brochure, p. 9](https://www.disraeligears.co.uk/site/shimano_-_the_new_system_component_family_for_every_riding_style_-_page_9.html) |
| BR-A410 / BR-A416 | Unknown | Separate RSX manufacturer drawings; [1995 catalogue, p. 53](https://www.disraeligears.co.uk/site/shimano_bicycle_system_components_-_95_page_53.html) leaves the RSX weight blank |
| BR-5700 / BR-6700 | Unknown | [2010–2011 specifications, PDF / printed p. 90](https://productinfo.shimano.com/pdfs/product/archive/2011_SPECIFICATION.pdf#page=90), no weight row |
| BR-5800 | 388 g | [2014–2015 specifications, PDF p. 117 / printed p. 114](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=117), explicit pair with standard R55C4 pads |
| BR-6800 | 335 g | [Same handbook, PDF p. 116 / printed p. 113](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=116), explicit pair with standard R55C4 pads |

The six early known weights describe factory caliper pairs with their shoes and mounting bolts, corroborated by the assembly drawings and installation diagrams. None specifies the weighed mounting-nut/bolt variant. Keep the 49- and 57-type identities separate; a nominal reach-type label is not a second weight reference. The BR-1055/A500/A550 drawings give actual adjustment ranges of 39–50 mm and 47–58 mm despite their 49/57 type names; the records preserve both the nominal designation and the drawing’s range.

The [Exage source notes](exage.md#caliper-weights-and-shared-models) explain why only BR-A250-57 is shared with Motion, and why BR-A250-49 uses the family installation document plus the later 300EX catalogue. A generic family listing does not establish every reach variant’s membership. BR-6700 is also listed for Di2 6770 in the [2012–2013 line-up, PDF p. 46](https://productinfo.shimano.com/pdfs/product/archive/2012-2013_Line-up_chart_all_v017_public_en.pdf#page=46); BR-6800 is shared by mechanical 6800 and Di2 6870 in the [2014–2015 line-up, PDF pp. 50–51](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Line-up_chart_all_v016_en.pdf#page=50). Shared models retain one identity.

## Remaining gaps

The catalogue contains 43 Shimano caliper records, 24 with sourced weights and 19 with explicit unknowns. The [6400 source notes](ultegra.md#6400-calipers-and-eight-speed-downtube-shifters) distinguish the original single-pivot models from the later dual-pivot model and document their complete-pair weight references. It is not complete caliper coverage: Golden Arrow, earlier Shimano 600/Dura-Ace, Santé, Light Action, several Tiagra/Claris generations, other finish/reach revisions, Campagnolo and SRAM calipers still need reviewed records. Ultegra SL finishes must not inherit the standard BR-6600 weight or identity automatically. Disc calipers and their hoses, adapters and rotor configurations also need their own source review; rim-caliper weights cannot supply them.

The later BR-1056 and BR-A551 models appear in the 1995 catalogue, but their exact manufacturer-hosted technical references still need review. They are not substituted for the earlier BR-1055 and BR-A550 records. Direct-mount variants of 5800/6800 and disc systems also remain separate source work. Missing records do not establish that a groupset lacked brakes; track groups are not assigned road calipers merely to fill a category.
