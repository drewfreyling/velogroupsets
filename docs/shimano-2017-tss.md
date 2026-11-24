# Shimano 2017 TSS: SLX and XT inventory and weights

Reviewed on **24 November 2026** from the [manufacturer-hosted 2017 Trade Sales Support Manual](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2017_TRADE_SALES_SUPPORT_MANUAL.pdf). The PDF has **396 pages**. PDF and printed page numbers match on the cited product and specification pages. The text extraction was checked against the relevant rendered tables and product pages.

This focused pass adds **19 components, all with qualified manufacturer weights**, and fills **all four previously unknown limits on RD-M9000-GS**. No groupsets are added. Existing IDs, model numbers, primary documents and positive masses are preserved. The catalogue now contains four manufacturers, **277 groupsets and 2,144 components**.

| Range | Inventory before | Inventory after |
| --- | --- | --- |
| SLX M7000 | 4 | 18 |
| Deore XT M8000 | 12 | 19 |
| Deore XT Di2 M8050 | 3 | 8 |

Shared cassettes and bottom brackets are stored once with multiple explicitly sourced memberships.

## Four qualified SLX crank variants

The [crank specification table, page 297](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2017_TRADE_SALES_SUPPORT_MANUAL.pdf#page=297), labels its weight row **“Average weight (175mm, w/o BB)”**. That supplies the exact weighed length and exclusion missing from many product-page figures.

| Exact model | Weighed rings | Length | Weight | Product page |
| --- | --- | --- | --- | --- |
| FC-M7000-11-1 | 30T | 175 mm | 699.3 g | 36 |
| FC-M7000-11-B1 | 30T | 175 mm | 702.3 g | 37 |
| FC-M7000-11-B2 | 34/24T | 175 mm | 742.8 g | 37 |
| FC-M7000-10-3 | 40/30/22T | 175 mm | 801.1 g | 38 |

All four exclude the bottom bracket. The B1/B2 outboard-chainline models remain distinct identities. Other available arm lengths and rings do not receive these masses; no conversion to the preferred 170 mm reference is attempted. The existing FC-M7000 record already selects FC-M7000-11-2 at 175 mm with 34/24T, 739.8 g, so that assembly is not duplicated or renamed.

The same table prints an inconsistent **“28-28T”** label beside the 788.7 g double figure, whereas the product page lists 38/28T. That row is not used for a new selected weight. The four selected configurations above agree with their product pages.

## Seven shifter pairs

| Exact catalogue model / mount | Left reference | Right reference | Pair weight | Basis |
| --- | --- | --- | --- | --- |
| SL-M8000-I, I-spec II | SL-M8000-IL, 110 g | SL-M8000-IR, 120 g | 230 g | Explicit manufacturer Pair |
| SL-M8000-B-I, I-spec B | SL-M8000-B-IL, 107 g | SL-M8000-B-IR, 117 g | 224 g | Explicit manufacturer Pair |
| SL-M7000-11-I, I-spec II | SL-M7000-IL, 115 g | SL-M7000-11-IR, 120 g | 235 g | Sum of manufacturer side weights |
| SL-M7000-11-B-I, I-spec B | SL-M7000-B-IL, 120 g | SL-M7000-11-B-IR, 127 g | 247 g | Sum of manufacturer side weights |
| SL-M7000-10, band clamp | SL-M7000-L, 130 g | SL-M7000-10-R, 135 g | 265 g | Sum of manufacturer side weights |
| SL-M7000-10-I, I-spec II | SL-M7000-IL, 115 g | SL-M7000-10-IR, 120 g | 235 g | Sum of manufacturer side weights |
| SL-M7000-10-B-I, I-spec B | SL-M7000-B-IL, 120 g | SL-M7000-10-B-IR, 127 g | 247 g | Sum of manufacturer side weights |

The [XT product page, 27](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2017_TRADE_SALES_SUPPORT_MANUAL.pdf#page=27), explicitly labels both XT figures **Pair**. Their separately printed side figures on page 272 corroborate the totals.

The SLX product pages (36 and 38) list weights without an explicit Pair label. Rather than presume their basis, the new records calculate each pair from the exact side columns on [page 273](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2017_TRADE_SALES_SUPPORT_MANUAL.pdf#page=273). Each calculated record stores `weight_method: "Sum of manufacturer side weights"`, both side codes and both side masses. No side is doubled, borrowed from another mount, or combined with the wrong rear-speed variant. The selected SLX pairs are 2×11 or 3×10 as shown on their product pages.

The original band-mounted SL-M8000 and SL-M7000-11 records remain unchanged. Pair model labels follow the product pages; side codes follow the detailed tables, including the letter I in the mounting suffix.

## Five cassette configurations

| Exact model | Weighed configuration | Weight | Product page |
| --- | --- | --- | --- |
| CS-M8000 | 11-speed 11–40T | 411 g | 29 |
| CS-M8000 | 11-speed 11–42T | 447 g | 29 |
| CS-M8000 | 11-speed 11–46T | 437 g | 29 |
| CS-M7000-11 | 11-speed 11–40T | 450 g | 37 |
| CS-M7000-11 | 11-speed 11–42T | 476 g | 37 |

Each gear range has its own stable configuration record. All five weights are explicitly attached to their ranges, rather than copied across a model family. Lockring inclusion follows the contribution convention. Individual tooth sequences are not invented.

The [XT page, 29](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2017_TRADE_SALES_SUPPORT_MANUAL.pdf#page=29), restricts 11–46T to single-chainring use. The M8050 lineup on page 32 explicitly lists CS-M8000 and the same range options, supporting its shared memberships; no additional memberships are inferred solely from compatibility.

## Two bottom brackets and two rear-derailleur references

The [bottom-bracket table, page 302](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2017_TRADE_SALES_SUPPORT_MANUAL.pdf#page=302), identifies **BB-MT800 threaded HOLLOWTECH II, 82.1 g**, and **BB-MT800-PA press-fit HOLLOWTECH II, 68.2 g**. SLX page 38 also prints those weights. XT page 28, the M8050 lineup on page 32 and the SLX pages directly establish membership. Available shell-width options are not misrepresented as a uniquely identified weighed shell width.

**RD-M7000-10-SGS** is added at **313 g**, explicitly separate from the existing eleven-speed GS model. Product page 39 and the [table, page 284](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2017_TRADE_SALES_SUPPORT_MANUAL.pdf#page=284), agree on that mass and its **43T capacity**. The table directly gives **36T largest sprocket, 11T smallest sprocket and 22T maximum front difference**.

The [XTR table, page 283](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2017_TRADE_SALES_SUPPORT_MANUAL.pdf#page=283), fills RD-M9000-GS's four missing limits: **37T total capacity, 42T largest sprocket for 2×11, 11T smallest sprocket and 10T maximum front difference**. The separate **46T** largest-sprocket allowance is explicitly for **1×11**; it is explained in the reference configuration rather than combined with the double-chainring limits. Its existing selected 221 g weight and primary 2015 document are preserved.

## Remaining review and withheld figures

This is a focused MTB inventory and weight pass, not a complete import of all 396 pages. Other road, trekking, urban, front-mount and disc-system sections remain further review material.

Front-kit hydraulic brake figures are not copied into bare caliper records or used without the required complete assembly details. Rotor weights still require an explicit mounting-hardware inclusion/exclusion reference. Hub weights without explicit skewer exclusion remain withheld. No crank-arm length, weighed band size, assembly inclusion or derailleur limit is inferred from adjacent products or compatibility lists.
