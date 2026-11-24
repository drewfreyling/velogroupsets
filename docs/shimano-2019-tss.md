# Shimano 2019 TSS: XTR crank and control references

Reviewed on **24 November 2026** from the [manufacturer-hosted 2019 Trade Sales Support Manual](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2019_TRADE_SALES_SUPPORT_MANUAL.pdf). The PDF has **456 pages**. PDF and printed page numbers match on the cited pages. Extracted figures were checked against rendered tables.

This focused pass adds **11 components, all with qualified manufacturer weights**: eight crank variants, two complete control pairs and one genuine single right-hand control. It adds no groupsets. Existing canonical IDs, model numbers, primary documents and positive masses are preserved. These additions take the catalogue from 2,161 to **2,172 components**, before the accompanying [2020 GRX pass](shimano-2020-tss.md).

| Range | Inventory before | Inventory after this pass |
| --- | --- | --- |
| XTR M9000 | 10 | 16 |
| XTR Di2 M9050 | 4 | 13 |
| XTR M9100 | 12 | 19 |

## Eight crank variants

The [table on page 348](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2019_TRADE_SALES_SUPPORT_MANUAL.pdf#page=348) explicitly labels its mass row **“Average weight (175mm, w/o BB)”**. Each selected figure therefore identifies arm length, ring teeth and bottom-bracket exclusion.

| Exact model | Selected rings | Length | Weight |
| --- | --- | --- | --- |
| FC-M9120-1 | 30T | 175 mm | 535 g |
| FC-M9120-B2 | 38/28T | 175 mm | 616 g |
| FC-M9000-2 | 34/24T | 175 mm | 611 g |
| FC-M9020-1 | 30T | 175 mm | 578 g |
| FC-M9020-B1 | 30T | 175 mm | 593 g |
| FC-M9020-2 | 34/24T | 175 mm | 629 g |
| FC-M9020-B2 | 34/24T | 175 mm | 645 g |
| FC-M9020-3 | 40/30/22T | 175 mm | 656 g |

The two M9120 identities belong to XTR M9100; product page 17 names their assemblies and available configurations. Older M9000/M9020 identities belong to the existing XTR M9000 and Di2 M9050 ranges. Their memberships are explicit in the [2018 mechanical lineup, page 15](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=15), and the [2019 M9050 lineup, page 23](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2019_TRADE_SALES_SUPPORT_MANUAL.pdf#page=23), rather than inferred from compatibility alone.

The existing FC-M9000 record already selects FC-M9000-1, 175 mm, 30T, 586 g. That assembly is not duplicated or renamed. It gains the explicitly documented Di2 membership. Existing FC-M9100 crank references also remain unchanged. No weight is converted to the preferred 170 mm length, copied to another ring option or calculated by subtracting a bottom bracket.

## Two pairs and one single control

The [side table on page 328](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2019_TRADE_SALES_SUPPORT_MANUAL.pdf#page=328) names each side, mount and individual mass.

| New record | Reference | Weight |
| --- | --- | --- |
| SL-M9100 band-clamp pair | SL-M9100-L 79 g + SL-M9100-R 121 g | 200 g |
| SL-M9100-I I-spec EV pair | SL-M9100-IL 74 g + SL-M9100-IR 117 g | 191 g |
| SL-M9100-IR I-spec EV right control | Genuine single right-hand 1×12 reference | 117 g |

Both pairs use `weight_method: "Sum of manufacturer side weights"` and retain exact side codes and masses. Their selected configuration is double-front twelve-speed. Product page 16 describes the MONO front control, the mounting variants and the right control's 11/12-speed converter. That converter does not establish an undocumented complete drivetrain combination.

The single I-spec EV control uses `weight_basis: "Single"`, `control_side: "Right"`, `front_speeds: 1` and `rear_speeds: 12`. It is distinct from the existing band-clamp SL-M9100-R. No fictitious left partner is added to a single-chainring assembly.

The existing band-clamp SL-M9100-R retains its selected **117 g** reference from another manufacturer edition. This 2019 table instead prints **121 g** for that exact side. The new pair explicitly selects both 2019 side figures; it does not mix the existing later right weight with the older left weight, silently replace the single record or claim a known reason for the edition difference.

## Shared bottom brackets

SM-BB93 and SM-BB94-41A gain XTR M9100 membership from product page 17 and M9050 membership from lineup page 23. Their existing 73 g and 58 g masses, primary documents and identities remain unchanged. Parts shared across mechanical and Di2 ranges are stored once.

## Remaining review

This is a focused XTR pass, not a complete import of all 456 pages. The new XTR product pages leave many mass fields unprinted; qualified figures above come from the detailed specification tables.

Cassette mass reductions are not converted into absolute weights by subtraction. Announced hub and cassette codes are not assumed equivalent to later production codes. Further hub, front-mount and braking variants remain review candidates, with the existing skewer, mount and complete-assembly qualification rules retained.
