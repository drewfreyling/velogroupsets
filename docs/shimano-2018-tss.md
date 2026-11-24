# Shimano 2018 TSS: Deore inventory and additional weight references

Reviewed on **24 November 2026** from the [manufacturer-hosted 2018 Trade Sales Support Manual](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf). The PDF has **448 pages**. PDF and printed page numbers match on the pages cited below. Selected weights and their configuration labels were checked against rendered product pages as well as extracted text.

This focused pass adds **17 components: seven with qualified manufacturer weights and ten with explicit unknown weights**. It also adds Deore membership and its documented range options to the existing CS-HG500-10 record, rather than duplicating that shared model. No groupsets are added. The catalogue now contains four manufacturers, **277 groupsets and 2,161 components**. Existing canonical IDs, model numbers, primary documents and positive masses are preserved.

| Range | Inventory before | Inventory after |
| --- | --- | --- |
| Deore M6000 | 5 | 16 |
| Dura-Ace R9100 | 9 | 13 |
| Dura-Ace Di2 R9150 | 10 | 14 |
| XTR M9000 | 9 | 10 |
| Ultegra Di2 R8050 | 10 | 11 |
| Saint M820 | 6 | 7 |

Shared Dura-Ace cassette configurations have one identity each, with both explicitly supported range memberships.

## Deore M6000 inventory

| Added model | Identified configuration | PDF / printed page |
| --- | --- | --- |
| FD-M6000-D | Triple-front ten-speed, D-type | 47 |
| FD-M6000-E | Triple-front ten-speed, E-type | 47 |
| FD-M6020-D | Double-front ten-speed, D-type | 48 |
| FD-M6020-E | Double-front ten-speed, E-type | 48 |
| FC-M6000-3 | Triple ten-speed, 40/30/22T | 49, 341 |
| FC-M6000-B2 | Outboard-chainline double ten-speed, 36/26T | 49, 341 |
| SM-BB52 | Threaded HOLLOWTECH II | 49, 345 |
| BB-MT500-PA | Press-fit HOLLOWTECH II | 49, 345 |
| SL-M6000-I | I-spec II left/right pair, double/triple ten-speed | 47 |
| CS-HG50-10 | Ten-speed 11–36T | 50 |

All ten new Deore weights remain **null**. Product pages establish identities, membership and available configurations, but do not print usable weights. The detailed crank table on page 341 and bottom-bracket table on page 345 also leave their weight entries blank. No neighbouring model's mass, comparative weight reduction or inferred average fills those gaps.

The front records retain the manufacturer's D/E mounting descriptions. They do not assume that every E-type shares one mounting classification across generations. Before adding a positive mass, the actual mount assembly must satisfy the weight guidelines. No undocumented clamp size or arm length is selected.

The existing **CS-HG500-10** gains Deore membership from [page 50](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=50), which explicitly lists 11–32T, 11–34T and the new 11–42T option. Its name becomes the neutral “HG500 10-speed cassette”, its existing Tiagra membership and primary exploded-view document remain, and 11–42T joins its model-wide available ranges. This does not assert that every listed derailleur accepts every range. Its weight remains unknown; no duplicate unknown-weight model is created just for the additional membership.

This is still a partial Deore inventory. Further band-mounted front options, conventional-swing variants, brake assemblies, hubs and other configurations remain review candidates.

## Five cassette weight references

| Exact model | Weighed configuration | Weight | PDF / printed page |
| --- | --- | --- | --- |
| CS-R9100 | Eleven-speed 11–28T | 193 g | 145 |
| CS-R9100 | Eleven-speed 11–30T | 211 g | 145 |
| CS-R9100 | Eleven-speed 12–25T | 189 g | 145 |
| CS-R9100 | Eleven-speed 12–28T | 205 g | 145 |
| CS-M9001 | Eleven-speed 11–40T | 331 g | 17 |

The [Dura-Ace cassette page, 145](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=145), explicitly associates each mass with its gearing. The existing CS-R9100 11–25T 175 g reference is preserved. Each new range has a separate stable configuration record. R9100 and R9150 memberships follow the existing shared cassette identity, corroborated by the R9150 lineup on page 150; they do not imply every rear-derailleur cage supports every cassette.

The [XTR page, 17](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=17), prints the complete CS-M9001 sequence **11/13/15/17/19/21/24/27/31/35/40T** and 331 g. This directly identifies the weighed range and speed count. **CS-M9001 remains distinct from CS-M9000** even though the selected mass and gear sequence match. No further Di2 membership is inferred solely from compatibility.

Cassette lockring inclusion follows the contribution convention. No unprinted individual tooth sequence is invented for the Dura-Ace ranges.

## One complete pair and one genuine single control

[Page 162](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=162) explicitly lists **ST-R8060 at 138 g/pair** in the Ultegra R8050 TT/Triathlon section. The new record represents both controls. The neighbouring 147.5 g ST-R8050 and 180 g ST-R8070 figures do not carry an explicit pair label on this page; neither is doubled or used to overwrite their existing qualified pair references.

[Page 54](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=54) explicitly lists **SL-M820-B-I at 114 g, Right**, within the Saint 1×10 section. The record uses `weight_basis: "Single"`, `control_side: "Right"`, `front_speeds: 1` and `rear_speeds: 10`. It is an I-spec model distinct from the existing band-mounted SL-M820 123 g right-hand control. No left counterpart or fictitious pair mass is created.

## Withheld figures and remaining review

This is a focused inventory and weight pass, not a complete import of all 448 pages. The unprinted Deore weights remain gaps for future sources or qualified contributor measurements.

Existing positive masses are not replaced merely because this edition gives a different figure. Examples include XTR RD-M9000 GS/SGS figures, ST-R9170's 360 g pair and the Ultegra Di2 rear figures. Other unresolved product-page labels, crank references without complete weighed configurations, hub weights without explicit skewer exclusion and disc assemblies without all required inclusions remain withheld. No component weight is calculated by subtracting a bottom bracket, axle, rotor or other assembly part.
