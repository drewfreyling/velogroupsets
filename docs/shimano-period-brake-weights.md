# Shimano period brake and derailleur weights

Reviewed on **28 November 2026**, after the GitHub Actions pin update. This pass adds **six components with manufacturer-listed weights**: four position-specific hydraulic calipers, one size-specific six-bolt rotor and one cage-specific rear derailleur. Existing records, positive weights, IDs, primary documents and group start years remain unchanged. All source documents are hosted by Shimano.

## References added

| Component | Position/configuration | Weight | Manufacturer weight reference |
| --- | --- | ---: | --- |
| [BR-M601](../data/components/shimano-br-m601-front.json) | Front; pads, bolts and IS adapter | 198 g | [2007 dealer manual, PDF 211; corroborated by 2008 PDF 193](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2007_Trade_Sales_Support_Manual.pdf#page=211) |
| [BR-M601](../data/components/shimano-br-m601-rear.json) | Rear; pads, bolts and IS adapter | 207 g | [2007 dealer manual, PDF 211; corroborated by 2008 PDF 193](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2007_Trade_Sales_Support_Manual.pdf#page=211) |
| [BR-M585](../data/components/shimano-br-m585-front.json) | Front; pads, bolts and IS adapter | 183 g | [2007 dealer manual, PDF 211; corroborated by 2008 PDF 193](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2007_Trade_Sales_Support_Manual.pdf#page=211) |
| [BR-M585](../data/components/shimano-br-m585-rear.json) | Rear; pads, bolts and IS adapter | 188 g | [2007 dealer manual, PDF 211; corroborated by 2008 PDF 193](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2007_Trade_Sales_Support_Manual.pdf#page=211) |
| [SM-RT75MA](../data/components/shimano-sm-rt75ma-180.json) | 180 mm, six bolts included | 156 g | [2007 dealer manual, PDF 210](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2007_Trade_Sales_Support_Manual.pdf#page=210) |
| [RD-M952-GS](../data/components/shimano-rd-m952-gs.json) | Nine-speed GS middle cage | 207 g | [2006 dealer manual, PDF 186](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2006_Trade_Sales_Support_Manual.pdf#page=186) |

## Caliper assembly boundaries

The 2007 table separates **Brake Caliper**, **Brake Lever**, hose and **Brake Rotor** rows. The caliper weight heading explicitly says **with fixing bolts**. Both BR-M601 and BR-M585 entries explicitly include an adapter; BR-M601 additionally specifies metal pads. The 2008 table repeats all four position-specific values.

The exact front/rear exploded views linked on each record establish the complete factory assemblies: pad/spring units, A-standard adapters and fixing hardware. BR-M601’s drawing identifies its metal M06 pads. BR-M585’s weight table does not identify the pad compound, so none is selected or claimed. These are the manufacturer’s complete factory-caliper references with pads and bolts, following the existing [weight rule](weights-guidelines.md#brake-calipers); they are not stripped bare-caliper or lever/hose system weights.

The chosen mount describes the **International Standard adapter assembly**. The same caliper body also supports post mounting, but the adapter-inclusive mass is not assigned to a bare post-mount configuration. The weight tables do not select an adapter diameter, so none is inferred from optional service-drawing adapters. Front/rear IDs distinguish the sourced assemblies while retaining the actual manufacturer model numbers **BR-M601** and **BR-M585**; no manufacturer positional suffix is invented.

BR-M535’s 180 g front / 185 g rear values remain outside this pass: its table lists International Standard and post-mount options without selecting adapter inclusion for the weighed reference. A neighboring model’s adapter statement is not transferred.

## Rotor identity and hardware

The 2007 table explicitly identifies **SM-RT75MA**, **180 mm**, six bolts / 44 mm mounting PCD, and **156 g with fixing bolts**. The manufacturer’s [rotor drawing 2429E](https://si.shimano.com/en/pdfs/ev/DISC_ROTOR-2429/EV-DISC_ROTOR-2429E.pdf#page=1) separately lists the 160 mm S, 170 mm M and 180 mm MA units, together with their fixing-bolt/plate hardware. The new record retains the actual **SM-RT75MA** code; it is not aliased to the existing unsuffixed 160 mm SM-RT75 record. No Center Lock lockring inference or hardware-weight subtraction is involved.

## Nine-speed XTR middle cage

The [1999 STI XTR page](https://na.s-tec.shimano.com/s3_assets/filelibrary/STI/1993-2012_STI/1999_Shimano_STI.pdf#page=57) documents the M952/M953 nine-speed update alongside the existing M950 hub family. Its unqualified 200 g statement covers a broader family and does not establish a specific cage reference; that figure is not assigned to the new record.

The 2006 table explicitly selects **207 g for RD-M952 GS**, with **33T capacity, 34T largest / 11T smallest sprocket and 22T front difference**. The manufacturer drawing independently identifies the nine-speed middle-cage assembly and its distinct SGS alternative. The record joins the existing M950 family’s later nine-speed inventory and the explicitly documented 2006 XTR/M960-era offering, without changing either group’s start or treating compatibility as membership. The earlier eight-speed RD-M950-GS and existing generic unknown records remain unchanged; no GS weight is transferred to SGS.

See the [disc-brake data model](disc-brakes.md) and [weight guidelines](weights-guidelines.md).
