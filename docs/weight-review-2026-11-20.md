# Additional manufacturer weight references

Reviewed on 20 November 2026, starting from commit `7b9e0ea`. This review fills **nine existing unknown weights**: six Campagnolo brake references, two SRAM bottom brackets and one Shimano cassette. The catalogue retains 1,386 component identities; unknown weights fall from **654 to 645**. IDs, slugs, group memberships and primary technical-document URLs are preserved.

## Added weights

| Model | Weight | Reference configuration | Weight source |
| --- | ---: | --- | --- |
| BR15-SR | 272 g | Complete Super Record pair: dual-pivot front, single-pivot rear | [Campagnolo 2017 product catalogue, PDF p. 35](https://www.campagnolo-sirer.cz/img/cms/Produktove_katalogy_Campagnolo/2017_Campagnolo%20product%20catalogue.pdf#page=35) |
| BR15-SRDP | 297 g | Complete Super Record pair: dual-pivot front and rear, the explicitly listed optional configuration | [Same manufacturer table, PDF p. 35](https://www.campagnolo-sirer.cz/img/cms/Produktove_katalogy_Campagnolo/2017_Campagnolo%20product%20catalogue.pdf#page=35) |
| BR15-RE | 284 g | Complete Record pair: dual-pivot front, single-pivot rear | [Campagnolo 2017 product catalogue, PDF p. 36](https://www.campagnolo-sirer.cz/img/cms/Produktove_katalogy_Campagnolo/2017_Campagnolo%20product%20catalogue.pdf#page=36) |
| BR15-REDP | 309 g | Complete Record pair: dual-pivot front and rear, the explicitly listed optional configuration | [Same manufacturer table, PDF p. 36](https://www.campagnolo-sirer.cz/img/cms/Produktove_katalogy_Campagnolo/2017_Campagnolo%20product%20catalogue.pdf#page=36) |
| BR15-CHDP | 302 g | Complete Chorus pair: dual-pivot front and rear | [Campagnolo 2017 product catalogue, PDF p. 37](https://www.campagnolo-sirer.cz/img/cms/Produktove_katalogy_Campagnolo/2017_Campagnolo%20product%20catalogue.pdf#page=37) |
| BR16-REDMRBB | 158 g | One Record rear direct-mount caliper, under the bottom bracket | [Campagnolo 2017 product catalogue, PDF p. 36](https://www.campagnolo-sirer.cz/img/cms/Produktove_katalogy_Campagnolo/2017_Campagnolo%20product%20catalogue.pdf#page=36) |
| BB-DUB-BSA-A1 | 76 g | DUB BSA standard, with the appropriate spacers for a 68 mm shell | [SRAM exact-model service specifications](https://www.sram.com/en/service/models/bb-dub-bsa-a1) |
| BB-DUB-PF-A1 | 72 g | DUB PressFit, BB92 reference | [SRAM exact-model service specifications](https://www.sram.com/en/service/models/bb-dub-pf-a1) |
| CS-M9100-12 | 367 g | Complete 12-speed 10–51T cassette, ICSM9100051 | [Shimano XTR M9100 Series Genuine Parts, June 2018, PDF p. 1](https://si.shimano.com/en/pdfs/sm/XTR_M9100_WOP/XTR_M9100_WOP_v03_ENG.pdf#page=1) |

## Configuration checks

The original Campagnolo product catalogue was already reviewed in the [earlier source audit](catalogue-weight-review.md). Its tables give different weights for the standard Super Record/Record pairs and optional dual-pivot rear versions. The existing original [2017 assembly-code catalogue, part D](https://www.bikeschematics.com/wp-content/uploads/schematics/Campagnolo/Campagnolo%20Spare%20Parts%202017%20-%20Part%20D.pdf) maps those combinations to their exact model codes. These are published complete-pair totals, not sums or divided individual weights.

The original [2017 spare-parts catalogue, part B](https://www.bikeschematics.com/wp-content/uploads/schematics/Campagnolo/Campagnolo%20Spare%20Parts%202017%20-%20Part%20B.pdf) shows the complete factory calipers, brake shoes/pads and mounting hardware: PDF pp. 1–3 for Super Record, Record and Chorus, and p. 6 for Record direct mount. The selected caliper references include their standard pads and mounting bolts. The publications do not identify the weighed mounting-bolt/nut variant, which remains an explicit limitation. The 158 g figure is expressly for the under-BB rear version; it does not fill either the front-fork or rear-seatstay record.

SRAM's service tables supply both a numerical weight and a named weight basis. The model-wide DUB records remain shared across their existing groupsets. Their new weights identify the manufacturer's particular shell/spacer references; 72 g for BB92 is not presented as a BB86.5 road weight, and 76 g is not applied to every BSA shell or spacer combination.

Shimano lists both cassette combinations on the same genuine-parts page: 357 g for 10–45T and 367 g for 10–51T. The existing record is 10–51T and uses only its matching figure, with the complete published tooth sequence. Lockring inclusion follows the established [cassette convention](weights-guidelines.md#cassettes).

## Gaps retained

Unknown values remain where the available publication does not identify the weighed mounting option, exact revision, crank arm/ring combination or bottom-bracket exclusion. In particular, later SL-M980-A/B figures are not transferred to the original SL-M980, hydraulic-system totals are not copied into caliper records, and hub weights are not filled by subtracting an assumed skewer mass. This review does not change the weight rules or infer any missing measurements.
