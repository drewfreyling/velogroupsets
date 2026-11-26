# Shimano 2021 TSS: MTB references and crankset BCDs

Reviewed on **26 November 2026** from the [manufacturer-hosted 2021 Trade Sales Support Manual, v04](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2021_TRADE_SALES_SUPPORT_MANUAL_U_v04.pdf). The PDF has **372 pages**. PDF and printed page numbers match on the cited pages. Exact model columns, dimensions and weights were checked against the rendered tables, including the model/PCD row pairs used for BCD backfilling.

This focused pass adds **25 components: 19 with qualified manufacturer weights and six with unknown weights**. It adds no groupsets. The catalogue now contains four manufacturers, **277 groupsets and 2,209 components**. Existing IDs, model numbers, primary documents and all existing weight values are preserved.

It also backfills sourced **BCD or chainring-mount information on 50 existing crankset records**, using the 2021 tables for 43 and the previously reviewed 2017 tables for seven more. All ten new crank records receive documented interface details too.

| Range | Inventory before | Inventory after |
| --- | --- | --- |
| XTR M9100 | 19 | 21 |
| Deore XT M8100 | 12 | 19 |
| SLX M7100 | 12 | 19 |
| Deore M6100 | 5 | 7 |
| Deore M5100 | 3 | 9 |
| Deore M4100 | 3 | 9 |

## Seven weighed crank models

| Exact model | Selected rings | Arm length | Weight | Page |
| --- | --- | --- | --- | --- |
| FC-M9130-1 | 30T | 175 mm | 560 g | 253 |
| FC-M8120-B2 | 36/26T | 175 mm | 662 g | 253 |
| FC-M8120-1 | 30T | 175 mm | 630 g | 254 |
| FC-M8130-1 | 30T | 175 mm | 639 g | 254 |
| FC-M7120-B2 | 36/26T | 175 mm | 684 g | 254 |
| FC-M7120-1 | 30T | 175 mm | 641 g | 254 |
| FC-M7130-1 | 30T | 175 mm | 650 g | 255 |

The weight rows explicitly say **175 mm, without bottom bracket**. No 170 mm estimate is calculated and no mass is transferred to another ring option. All seven model columns identify **Direct** in the PCD row, so their `chainring_mount` is `Direct mount`; a numerical BCD is not invented. Model-specific chainline and ring interfaces must still be checked before assuming interchangeability.

Existing weighed FC-M9100, M9120, M8100 and M7100 references are preserved even when this edition gives a different figure for another length/configuration or edition.

## Four complete control pairs and two single controls

| Complete pair | Exact left / right figures | Calculated pair |
| --- | --- | --- |
| SL-M8100-L / SL-M8100-R | 78 g + 117 g | 195 g |
| SL-M8100-IL / SL-M8100-IR | 78 g + 120 g | 198 g |
| SL-M7100-L / SL-M7100-R | 77 g + 117 g | 194 g |
| SL-M7100-IL / SL-M7100-IR | 77 g + 117 g | 194 g |

Pages **228–229** explicitly name each side, mount and per-unit mass. Each pair stores the exact side codes and masses with `weight_method: "Sum of manufacturer side weights"`. Band-clamp and I-spec EV controls remain separate; pair model labels name the actual side codes rather than inventing a manufacturer pair SKU. These are 2×12 references, without doubling one side or borrowing another mount's figure.

The genuine single right-hand I-spec EV controls are also added: **SL-M8100-IR, 120 g**, and **SL-M7100-IR, 117 g**, selected for the documented 1×12 configurations. They retain the required Single/Right/front-one/rear-twelve fields. Existing band-clamp single controls remain unchanged.

## Six cassette configurations

All selected weights and complete tooth sequences are printed in the [cassette table, page 266](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2021_TRADE_SALES_SUPPORT_MANUAL_U_v04.pdf#page=266).

| Exact model | Selected range | Speed count | Weight |
| --- | --- | --- | --- |
| CS-M9100-12 | 10–45T | 12 | 357 g |
| CS-M8100-12 | 10–45T | 12 | 461 g |
| CS-M7100-12 | 10–45T | 12 | 513 g |
| CS-M7000-11 | 11–46T | 11 | 482 g |
| CS-M771-10 | 11–34T | 10 | 323 g |
| CS-M771-10 | 11–36T | 10 | 343 g |

Each range has a distinct stable configuration identity. The three twelve-speed 10–45T sequences are **10/12/14/16/18/21/24/28/32/36/40/45T**. The eleven-speed 11–46T sequence is **11/13/15/17/19/21/24/28/32/37/46T**. The XT ten-speed sequences are **11/13/15/17/19/21/23/26/30/34T** and **11/13/15/17/19/21/24/28/32/36T**. Cassette lockring inclusion follows the contribution convention.

Older-range membership is supported by the named CS-M771-10 XT options on 2015 page 28 and the CS-M7000-11 SLX 11–46T option on 2018 page 41. Existing selected weights remain unchanged, including the differing CS-M9001 and CS-M8000 11–42T references from other editions.

## Deore inventory with unknown masses

The six new unknown-weight records are **FC-M5100-2, FC-M5100-B2, FC-M4100-B2, FD-M5100-D, FD-M4100-D and RD-M5120-SGS**. Pages **39–43** identify their actual models/configurations, while their specification tables leave masses blank. No neighbouring model's figure fills those gaps.

The three double cranks identify 36/26T rings and **96/64 mm BCDs**, with their actual source pages cited. Front records identify the D-type assembly and 10T capacity without guessing a weight.

The RD-M5120-SGS reference is explicitly double-front 10/11-speed, with **41T capacity, 42T largest sprocket, 11T smallest sprocket and 10T front difference**, from page **241**. The source separately allows **46T for single-front ten-speed**; that conditional allowance is retained in the description instead of mixing it with the double-front limits.

The named lineup on page **34** supports SM-BB52 and BB-MT500-PA in all three Deore ranges; their existing identities gain memberships and retain unknown weights. FC-M5100-1 gains the explicit M4100 membership from page 43. Some product captions abbreviate the press-fit BB as BB-MT500-P; this does not rename or establish an equivalence to the existing PA identity. Membership here follows the explicit PA code in the lineup.

## BCD backfill and display

The [weight guidelines](weights-guidelines.md#cranksets) and [catalogue guide](catalogue.md) now document BCD independently of whether a weight is known. Existing numeric fields are retained: `bolt_circle_diameter_mm` for one diameter and `bolt_circle_diameters_mm` for several. Manufacturer-identified direct-mount/riveted designs use `chainring_mount`, never zero or an invented numerical diameter.

The 2021 model/PCD rows reviewed are on pages **253–262, 287, 291, 307–310 and 329**. Only exact matching crank model columns or an existing documented `reference_model` are used. Blank entries remain unknown. The 2017 pages **296–297** fill seven additional existing M780/M8000/M7000 references. Every changed record receives its own exact model/page citation; existing BCD fields are not replaced.

Component pages show one **BCD (bolt circle diameter)** row: a dimension such as **110 mm**, multiple dimensions such as **110 / 80 mm**, the documented **Direct mount / Riveted** assembly, or **Not yet sourced**. Existing raw BCD fields are not rendered again as duplicate rows. BCD alone does not establish compatibility, particularly for asymmetric/proprietary patterns. Validation rejects invalid/non-positive/duplicate dimensions and conflicting single/plural values, including on records with unknown weights; BCD remains optional when not sourced.

## Remaining review

This is a focused MTB and crank-interface pass, not a complete import of all 372 pages. Deore's unprinted weights remain gaps. Further hub, front-mount, brake and other-year references still need source review under the existing configuration rules. No infrastructure, caching, authentication or community-upload behaviour changes.
