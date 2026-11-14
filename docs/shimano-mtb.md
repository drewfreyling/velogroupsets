# Shimano MTB and GRX sources

This review adds 65 MTB series and four GRX gravel offerings. It supplies 32 component identities: 26 rear derailleurs, four complete brake/shifter pairs and two cranksets. This is initial coverage, not a complete component inventory for those series. Several historical series currently have no component records.

## Series and dates

The primary date source is [Shimano’s product-history data](https://www.shimano.com/en/100th/history/products/products.csv) and its linked history pages. Each record cites its relevant history. The history’s dated galleries distinguish individual series; a dated reference is not necessarily the exact announcement or first retail year.

- XTR: M900, M950, M960, M970, M980, M9000, M9100 and M9050 Di2. The history gallery dates M950 to 1995 although its narrative describes 1996. The M9050 name comes from the narrative and actual specification tables; the gallery’s “M9070” text is not adopted as a separate series.
- Deore XT: M700, M730, M732, M735, M737, M739, M750, M760, M770, M780, M8000, M8100 and M8050 Di2. M780 uses the manufacturer’s dated 2012 gallery reference.
- Deore LX: M550, M560, M570 and M580. The 1994 manual’s M563 HyperDrive-C revisions belong within M560; revision codes do not automatically establish separate groupsets.
- SLX: M660, M670, M7000 and M7100.
- Deore: MT60, II, DX M650, M510, M530, M590, M610, M6000, M6100, M5100 and M4100. Original touring Deore and later T-series trekking groups are not relabelled MTB.
- Alivio: MC10, MC12, MC16, MC20, M410, M430, M4000 and M3100.
- Acera: X, M300, M340, M360, M390 and M3000.
- Altus: CT50, M310, M370 and M2000. CT50 uses a 1994 manual reference, not an inferred launch date. Older road Altus/AX offerings remain road records.
- Saint M800, M810 and M820; Hone M600; ZEE M640; STX MC30 and STX Special Edition MC31. Saint M800 follows the history gallery’s 2003 reference. STX MC30 uses the 1993 range introduction, and the Special Edition uses its explicit 1994 dealer reference.

[Shimano’s GRX range](https://bike.shimano.com/products/series/grx.html), its 2019 history entry and the [2021 dealer manual, p. 167](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2021_TRADE_SALES_SUPPORT_MANUAL_U_v04.pdf#page=167) identify RX810, RX600, RX400 and RX815 Di2. These are separate documented offerings; shared components must retain one identity when their memberships are established.

The category field describes the reference offering. Existing SRAM XPLR and Campagnolo Super Record All Road are gravel; Campagnolo Super Record Road 1x13 stays road. Original SRAM Force 1/Rival 1/Apex 1 road/cyclocross offerings stay road. The existing Dura-Ace track group stays track. These categories do not claim that parts are restricted to one riding use.

## Component tables

The [1994 manufacturer manual](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/1994_Shimano_Bicycle_System_Component_Dealer_Product_Manual.pdf) has matching PDF/printed page numbers:

| Page | Added records and limits |
| --- | --- |
| 10 | RD-M900, 230 g, medium cage; ST-M900, 411 g per pair |
| 16 | RD-M737-SGS, 235 g, and GS with unknown weight; ST-M737, 385 g per pair; FC-M737, 694 g at 175 mm and 42/32/22T |
| 23 | RD-M560-SGS, 304 g, and GS with unknown weight; ST-M560, 387 g per pair; FC-M560, 701 g at 170 mm and 46/36/26T |
| 29 | RD-MC30, 266 g, long cage; ST-MC30, 385 g per pair |

A weight explicitly marked SGS is not copied to GS. RD-M900 and RD-MC30 keep their printed model numbers rather than invented cage suffixes. Crank weights exclude the separately listed bottom brackets. Hub weights with quick-release skewers are not published or converted by subtraction.

The [2021 manufacturer manual](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2021_TRADE_SALES_SUPPORT_MANUAL_U_v04.pdf) also has matching PDF/printed numbers:

| Page | Added rear derailleur references |
| --- | --- |
| 239 | XTR RD-M9100-GS/SGS, RD-M9120-SGS, RD-M9000-SGS; XT RD-M8100-SGS, RD-M8120-SGS, RD-M8000-GS/SGS |
| 240 | SLX RD-M7100-SGS, RD-M7120-SGS, RD-M670-GS/SGS |
| 241 | Deore RD-M6100-SGS, RD-M6000-GS/SGS, RD-M5100-SGS, RD-M610-GS; the selected table leaves weights blank; an older reference now supplies RD-M610-GS at 299 g, while the other four remain null |
| 290 | GRX RD-RX810, RD-RX812 and RD-RX400; RX812 front-difference entry stays null because the table prints a dash |

Each rear derailleur records total capacity, maximum sprocket, minimum sprocket and front difference. For models with configuration-dependent limits, the record selects one documented configuration: RD-M9000-SGS and RD-M8000-SGS use 3×11, and RD-M8000-GS uses 2×11. Their larger single-chainring sprocket limits are not combined with triple/double front differences. Shimano’s smallest low-sprocket limit is different from the minimum top sprocket; the latter supplies `minimum_sprocket_teeth`.

## 1994 road weight corrections

The road tables from p. 42 onward resolve four previously null weights without overwriting contributor measurements:

| Model | Reference weight | Page |
| --- | --- | --- |
| ST-7400 | 480 g, explicitly left/right pair | 42 |
| FC-7410 | 589 g, 170 mm, 53/39T, without bottom bracket | 43 |
| BB-7410 | 230 g, square taper, 103 mm spindle; shell/thread variant unspecified | 43 |
| SL-6401 | 67 g, explicitly SL-6401-F*CAI eight-speed braze-on pair | 48 |

The earlier ST-7400 560 g figure without an explicit pair basis is not reused. Existing compliant road weights are retained even when a different edition supplies another reference. The 1994 front/rear hub figures with QR remain unsuitable for the project’s no-skewer convention. This review is not a claim that every road weight gap has been filled.

## Remaining coverage

Historical range records need further verified component lists, and the newer MTB Di2 and GRX families need additional controls, brakes, cranksets, hubs and front derailleurs. Exage MTB/LX, STX RC, Tourney and later series outside these reviewed sources still need a separate membership/date review. No compatibility table alone establishes group membership. Single right-hand 1× trigger-shifter weights are not fabricated into pairs under the current shifter policy.

The [rear-derailleur weight review](shimano-rear-derailleur-weights.md) supplies the earlier RD-M610-GS figure and documents why M560-GS and M737-GS still cannot use their SGS weights.
