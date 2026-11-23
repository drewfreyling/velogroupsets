# Shimano 1997 STI Alivio/LX inventory and source conflicts

Reviewed on **23 November 2026** from the [manufacturer-hosted 1997 Shimano STI manual](https://na.s-tec.shimano.com/s3_assets/filelibrary/STI/1993-2012_STI/1997_Shimano_STI.pdf), cross-checked against the original [1997 dealer manual, page 44](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/1997_Shimano_Dealer_Sales_Support_Manual.pdf#page=44). The STI archive disclaimer identifies the information as updated in 1997; the PDF has **154 pages**. Printed and PDF numbering differ, and citations use both explicitly.

This pass adds **eight components**, enriches **seven existing component records**, and expands **Alivio MC16 from two to thirteen records**. It adds no new weights or groupsets. Existing IDs, masses, primary documents and range start years are preserved. Unresolved specification conflicts are retained as unknowns with both original sources cited. The catalogue contains four manufacturers, 272 groupsets and 1,984 components after this batch.

## Alivio MC16 inventory

The [front-drive table, PDF 119 / printed 120](https://na.s-tec.shimano.com/s3_assets/filelibrary/STI/1993-2012_STI/1997_Shimano_STI.pdf#page=119), explicitly lists Alivio alongside STX and STX RC. The [rear-drive table, PDF 122 / printed 123](https://na.s-tec.shimano.com/s3_assets/filelibrary/STI/1993-2012_STI/1997_Shimano_STI.pdf#page=122), supplies the corresponding seven-speed control, hub and cassette identities.

| Added model / reference | Evidence |
| --- | --- |
| FD-MC14 | STI PDF 119 / printed 120: exact Alivio clamp front model, 18T capacity, 8T top/middle minimum and band/chainline options |
| ST-MC12-C | Dealer PDF/printed 44: complete 3×7 combined-control reference with 2.5-finger levers |
| ST-MC15-C | Same table: complete 3×7 combined-control reference with three-finger levers |
| BR-MC16 | Same table: exact Alivio cantilever brake model; complete front/rear weight remains unknown |
| FH-MC12 | STI PDF 122 / printed 123: seven-speed freehub with 32/36-hole options |
| CS-IG50, 7-speed 11–28T | Same table: ag, 11/13/15/18/21/24/28T |
| CS-IG50, 7-speed 11–30T | Same table: am, 11/13/15/18/21/24/30T |

Four existing identities gain explicit Alivio MC16 membership instead of being duplicated: **SL-MC37**, **BL-MC16**, **BB-LP26-E** and **FH-R050**. Their model numbers, known/unknown masses and primary technical documents remain unchanged. SL-MC37, BB-LP26-E and FH-R050 receive neutral descriptions to reflect sharing across ranges.

The exact **FH-MC12** code is retained separately from the **FH-MC12-P** printed in another manufacturer's table; no suffix alias is asserted. Both new and shared hub references require future weights to exclude skewers.

The STI cassette table's **ag** code and exact tooth sequence are used for the selected 11–28T reference; the other dealer table's different letter code is not silently substituted. These are seven-speed **CS-IG50** references, not HG50 or later eight-speed assemblies. All new control/lever records represent complete pairs, and none receives an estimated single-side or neighbouring-model weight.

The BB-LP26-E service row prints a 110 mm spindle reference, while its existing dealer-table options include 110.5/113 mm. Existing options are retained and each source is cited; 110 and 110.5 mm are not declared aliases or used to justify a weight.

## Existing FC-MC16 configuration

The STI front-drive table explicitly identifies **FC-MC16**, **170/175 mm** arms, **42/34/24T** and a **67 mm bolt circle**. Its existing record now selects a **170 mm reference excluding the separately listed bottom bracket**. Its mass remains unknown. A subsequent installation caption names FC-MC14; the exact FC-MC16 identity/configuration comes from the model table rather than treating those model numbers as interchangeable.

## Deore LX RD-M567

The [LX rear-drive table, PDF 114 / printed 115](https://na.s-tec.shimano.com/s3_assets/filelibrary/STI/1993-2012_STI/1997_Shimano_STI.pdf#page=114), identifies a missing **RD-M567 SGS** eight-speed assembly with **39T total capacity, 32T largest sprocket, 11T smallest sprocket and 20T maximum front difference**. All four fields are transcribed directly. No capacity is recalculated from the other limits, and no RD-M560/RD-M570 mass is transferred.

## Conflicting original rear-derailleur specifications

| Model / field | 1997 STI, PDF 122 / printed 123 | 1997 dealer manual, PDF/printed 44 | Catalogue outcome |
| --- | --- | --- | --- |
| RD-MC16 total capacity | 35T | 37T | Remains null; both figures cited |
| RD-MC34 total capacity | 37T | 29T | Previous 29T withdrawn; field now null |
| RD-MC34 largest sprocket | 28T | 30T | Previous 30T withdrawn; field now null |

For RD-MC16, both tables agree on **30T largest, 11T smallest and 18T maximum front difference**. Those three limits are filled, with the service sheet's explicit **GS cage / seven-speed** configuration. Total capacity stays unknown, and the record states the precise 35T/37T disagreement.

RD-MC34 keeps its agreed **11T smallest sprocket, 20T front difference and seven-speed reference**. Its two conflicting fields are withheld with separate explanatory notes and both original citations. No source is silently treated as a correction to the other, and arithmetic or cage conventions are not used to resolve the disagreement.

## Further review

The Dura-Ace technical sheets, remaining LX/XTR front assemblies, Altus/Tourney and internal-gear sections remain further review material. Accessory/remote controls and power modulators are not forced into an unsupported component assembly type. The selected STI/dealer pages do not publish new qualified weights. This is a targeted Alivio/LX and source-discrepancy review, not a full page-by-page audit.
