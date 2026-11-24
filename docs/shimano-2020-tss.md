# Shimano 2020 TSS: GRX inventory and weights

Reviewed on **24 November 2026** from the [manufacturer-hosted 2020 Trade Sales Support Manual](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2020_TRADE_SALES_SUPPORT_MANUAL.pdf). The PDF has **456 pages**. PDF and printed page numbers match on the cited pages. The selected figures and mounting/configuration labels were checked against rendered tables and the GRX lineup.

This focused pass adds **12 components: ten with qualified manufacturer weights and two calipers with unknown weights**. Four existing bottom-bracket records gain explicitly documented GRX memberships. No groupsets are added. Existing IDs, model numbers, primary documents and positive masses are preserved. After the accompanying [2019 XTR pass](shimano-2019-tss.md), the catalogue contains four manufacturers, **277 groupsets and 2,184 components**.

| Range | Inventory before | Inventory after |
| --- | --- | --- |
| GRX RX810 | 2 | 9 |
| GRX Di2 RX815 | 3 | 10 |
| GRX RX600 | 2 | 8 |
| GRX RX400 | 2 | 7 |

## Five cranksets at 170 mm

The [GRX table on page 369](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2020_TRADE_SALES_SUPPORT_MANUAL.pdf#page=369) explicitly states **“Average Weight (170 mm, w/o bottom bracket)”**. This resolves the arm-length and BB-exclusion uncertainty left by the product-page figures alone.

| Exact model | Weighed rings | Length | Weight | Membership |
| --- | --- | --- | --- | --- |
| FC-RX810-1 | 40T | 170 mm | 644 g | RX810 and Di2 RX815 |
| FC-RX810-2 | 48/31T | 170 mm | 710 g | RX810 and Di2 RX815 |
| FC-RX600-1 | 40T | 170 mm | 743 g | RX600 |
| FC-RX600-11 | 46/30T | 170 mm | 806 g | RX600 |
| FC-RX600-10 | 46/30T | 170 mm | 810 g | RX400 |

Membership follows the [named lineup on page 168](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2020_TRADE_SALES_SUPPORT_MANUAL.pdf#page=168). In particular, FC-RX600-10 belongs to the ten-speed RX400 configuration despite its RX600 model prefix. The single-ring RX810 record selects 40T; the separately listed 42T option does not inherit 644 g. Other available lengths do not receive the selected masses.

## One complete control pair

**ST-RX810 is 570 g per pair**, calculated as **284 g ST-RX810-L + 286 g ST-RX810-R**. Product page 169 and the [side table on page 368](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2020_TRADE_SALES_SUPPORT_MANUAL.pdf#page=368) agree on the exact side figures. The record stores the calculation method, both side codes and both masses for the 2×11 configuration. No single side is doubled. This is a lever-pair weight, not a complete hydraulic brake system.

The existing ST-RX600 613 g calculated pair and ST-RX815 373 g manufacturer pair remain unchanged. The left-only dropper-post and non-shifting brake controls are not misclassified as a conventional shifting pair or assigned a fictitious partner.

## Three braze-on front derailleurs

| Exact model | Mount | Weight | Total capacity | Source page |
| --- | --- | --- | --- | --- |
| FD-RX810-F | Braze-on | 96 g | 17T | 369 |
| FD-RX400-F | Braze-on | 96 g | 16T | 369 |
| FD-RX815-F | Braze-on | 135 g | 17T | 423 |

The mounting rows explicitly mark **Brazed-On**, so these are not inferred solely from the F suffix. The records do not include a presumed clamp-band adapter. The lineup directly supports FD-RX810-F in both RX810 and RX600 mechanical configurations, FD-RX400-F in RX400 and FD-RX815-F in Di2 RX815.

Page 369 has an inconsistent **11 rear speeds** cell for FD-RX400-F, alongside its HG-X ten-speed chain designation. The RX400 product page 172 explicitly identifies ten-speed, and the lineup and control specification agree. The record uses **10 rear speeds**, citing both sources; the inconsistent cell is not copied.

## Di2 rear derailleur and two calipers

**RD-RX817** is added at **318 g**, with **31T capacity, 42T largest sprocket and 11T smallest sprocket**, directly printed on product page 171 and the [Di2 table on page 423](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2020_TRADE_SALES_SUPPORT_MANUAL.pdf#page=423). It is an eleven-speed single-chainring reference. The source leaves cage code and numerical front difference unspecified; both remain null rather than assuming a cage or inventing a 0T limit.

**BR-RX810 and BR-RX400** are added as hydraulic, flat-mount, two-piston calipers. Their weights remain **null**. The table on page 369 does not provide a qualified front/rear/pair mass including pads and mounting bolts. Each is an unpositioned `Single` caliper record, separate from a complete lever/hose system. BR-RX810 is shared by RX810 and Di2 RX815; BR-RX400 is shared by RX400 and RX600, as explicitly shown in the lineup.

## Shared bottom brackets

The lineup on page 168 names SM-BBR60 and SM-BB72-41B for RX810/Di2 RX815, and BB-RS500 and BB-RS500-PB for RX600/RX400. Those existing records gain memberships and a source citation. Their selected positive weights and primary documents are preserved; BB-RS500-PB remains unknown.

The product page's 69 g SM-BB72-41B figure does not overwrite its selected 63 g reference from another edition. Likewise, RD-RX810's 255 g figure here does not silently replace its existing selected 295 g manufacturer reference. Differences between editions remain further source-review work unless a specific correction is established.

## Remaining review

This is a focused GRX pass, not a complete import of all 456 pages. Further shared cassette, pedal, hub, rotor and system references remain review candidates. Compatibility alone does not add memberships.

Hub masses still require explicit axle/skewer exclusion. Rotor masses require their actual hardware basis. Caliper masses require a qualified position/pair and included pads/bolts, and complete brake systems require all hose, lever-hand and inclusion details. None is inferred from recommended part combinations, and no incomplete assembly total is reused as a component weight.
