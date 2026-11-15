# Modern MTB and gravel ranges

Reviewed on **15 November 2026**. This review adds **19 groupsets and 65 component identities**, with **32 manufacturer-listed reference weights**. The catalogue now contains **257 groupsets and 1,312 components**. Every new group has at least two documented assemblies. These are starter inventories, not complete historical coverage or universal compatibility lists.

| Manufacturer | New groupsets | New components | Known weights |
| --- | --- | --- | --- |
| SRAM | 14 | 38 | 16 |
| microSHIFT | 3 | 17 | 7 |
| Shimano | 2 | 10 | 9 |

## Ranges and dates

| Range | Category | Start/availability year | Components |
| --- | --- | --- | --- |
| [ADVENT X 10-speed](../data/groupsets/microshift-advent-x.json) | mtb | 2021 | 5 |
| [Acolyte 8-speed](../data/groupsets/microshift-acolyte.json) | mtb | 2021 | 4 |
| [Sword 10-speed](../data/groupsets/microshift-sword.json) | gravel | 2024 | 9 |
| [GRX RX820](../data/groupsets/shimano-grx-rx820.json) | gravel | 2023 | 7 |
| [GRX Di2 RX825](../data/groupsets/shimano-grx-di2-rx825.json) | gravel | 2024 | 4 |
| [X01 Eagle 12-speed](../data/groupsets/sram-x01-eagle.json) | mtb | 2016 | 3 |
| [XX1 Eagle 12-speed](../data/groupsets/sram-xx1-eagle.json) | mtb | 2016 | 3 |
| [GX Eagle 12-speed](../data/groupsets/sram-gx-eagle.json) | mtb | 2017 | 3 |
| [X01 Eagle AXS 12-speed](../data/groupsets/sram-x01-eagle-axs.json) | mtb | 2019 | 2 |
| [XX1 Eagle AXS 12-speed](../data/groupsets/sram-xx1-eagle-axs.json) | mtb | 2019 | 2 |
| [NX Eagle 12-speed](../data/groupsets/sram-nx-eagle.json) | mtb | 2020 | 3 |
| [SX Eagle 12-speed](../data/groupsets/sram-sx-eagle.json) | mtb | 2020 | 3 |
| [GX Eagle AXS 12-speed](../data/groupsets/sram-gx-eagle-axs.json) | mtb | 2021 | 2 |
| [GX Eagle Transmission T-Type AXS](../data/groupsets/sram-gx-eagle-transmission.json) | mtb | 2023 | 4 |
| [X0 Eagle Transmission T-Type AXS](../data/groupsets/sram-x0-eagle-transmission.json) | mtb | 2023 | 4 |
| [XX Eagle Transmission T-Type AXS](../data/groupsets/sram-xx-eagle-transmission.json) | mtb | 2023 | 4 |
| [XX SL Eagle Transmission T-Type AXS](../data/groupsets/sram-xx-sl-eagle-transmission.json) | mtb | 2023 | 4 |
| [Eagle 70 Transmission T-Type mechanical](../data/groupsets/sram-eagle-70-transmission.json) | mtb | 2025 | 3 |
| [Eagle 90 Transmission T-Type mechanical](../data/groupsets/sram-eagle-90-transmission.json) | mtb | 2025 | 4 |

The catalogue uses the earliest reviewed manufacturer availability year where the original introduction has not been established. NX/SX Eagle use the reviewed 2020 parts book; ADVENT X and Acolyte use the 2021 microSHIFT catalogue; Sword uses its 2024 catalogue. Their generation notes explicitly distinguish these dates from first launch dates. Earlier primary launch documents remain a chronology gap. SRAM's manufacturer history supplies the 2016 XX1/X01 Eagle, 2017 GX Eagle and 2019 XX1/X01 Eagle AXS dates. Its 2021, 2023 and 2025 parts catalogues establish GX AXS, Transmission and Eagle 70/90 availability. Later component revisions can belong to an earlier family without implying the revision existed in its first year.

## Single controls and complete pairs

The former universal pair-only rule excluded real rear-shift controls. `shifters` now has two schema variants, valid with positive or null weight:

- `weight_basis: "Pair"`: complete left/right set, preserving all existing pair identities.
- `weight_basis: "Single"`: requires `control_side: "Right"`, `front_speeds: 1`, and integer `rear_speeds` ≥ 2. A real manufacturer-documented single control or right-hand configuration is required.

This applies to SRAM Eagle trigger shifters, Eagle 70/90 Transmission controls, ADVENT X/Acolyte triggers and the previously excluded **SL-M861R** in XCD 11. The original microSHIFT catalogue explicitly calls SL-M861R right-side-only and lists 104 g; its record cites both the group page and technical table. Standalone brake levers retain their pair rule.

SRAM's Pod and Pod Ultimate hardware is ambidextrous. Their records identify the **right-hand rear-shift configuration** explicitly listed in the corresponding Transmission groupset specifications. The IDs/slugs include `-right`; the manufacturer model numbers remain unchanged. No inherent right-only hardware claim or unsupported mounting-kit weight is made.

Sword SB-G7000 remains a **pair**: its left unit is brake-only. SB-G7020 and Shimano GRX dual controls also remain pairs. The individual Sword and ST-RX820 side figures are not summed or doubled into unpublished pair totals. Shimano explicitly publishes ST-RX825's 415 g as **per pair** in its 2025–2026 handbook.

The generated OpenAPI 3.1 schema includes both configurations under v1. Existing pair records, paths and IDs are unchanged; consumers must read `weight_basis` before comparing control weights. The UI displays “Single right-hand control” or “Left and right pair”. The API remains entirely generated static JSON with the existing Cloudflare caching policy.

## Primary sources and configuration decisions

- **Shimano:** exact GRX exploded views from [Shimano SI](https://si.shimano.com/) establish model/assembly identity. The [2025–2026 specifications handbook v3.5](https://productinfo.shimano.com/pdfs/product/archive/2025-2026_Specifications_v035_en.pdf) supplies RX825 controls/derailleurs on PDF pp. 101–103, RX820 controls on p. 104, RX820/RX822 derailleurs on p. 112, FD-RX820 on p. 114 and FC-RX820 cranksets on p. 117. The [RX825 announcement](https://bike.shimano.com/en-UK/stories/article/shimano-expands-gravel-lineup-with-new-2x12-speed-grx-di2.html) explicitly lists the shared RX820 crankset. Only the double crank belongs to this original 2×12 Di2 offering. Crank weights use 170 mm arms, 40T or 48/31T rings, and exclude BBs. FD weights use braze-on/direct mount with screw. RX822's front-difference dash remains null.
- **SRAM:** [manufacturer history](https://www.sram.com/en/company/about/history), manufacturer model pages and the original parts catalogues linked in each record establish family and model identity. Matching Transmission groupset pages explicitly identify their cassette and right-hand controller. Hanger-mounted Eagle X-Actuation and Full Mount T-Type Transmission remain distinct families. AXS does not make an Eagle cassette a T-Type cassette.
- **microSHIFT:** [official catalogue archive](https://www.microshift.com/pdf-catalog/) and exact manufacturer model pages establish each family and configuration. Original RD-M6205AM is 313 g with 41T capacity; RD-M6205AM-B Ver.2 has 37T capacity and an unknown weight in this review. Sword 1× and 2× rear derailleurs are distinct 305 g and 329 g assemblies. CS-G104/CS-H104 have one canonical identity per gearing configuration, shared by ADVENT X and Sword where the maker explicitly names both groups. FD-G7020-F uses the published 108 g braze-on figure, not an assumed clamp mass.

SRAM's **“RD Minimum (Cassette)” is the minimum largest sprocket**, not the smallest cassette sprocket. It is retained as `minimum_largest_sprocket_teeth`; the four universal limit fields stay null where not explicitly specified. Neither 1× designation nor cassette tooth subtraction is used to invent total capacity or front-difference limits.

SRAM's Transmission RD engineering estimates identify battery inclusion: XX SL 440 g, XX 450 g and X0 466 g include the battery; GX's 470 g excludes it. NX shifter's 112 g is specifically the MMX-clamp reference; Eagle 70's 145 g uses its integrated clamp and cable. Do not treat these as bare controls or interchangeable mounting variants. Cassette weights identify the exact tooth range, with lockring inclusion assumed under the contribution rules.

Cranksets without an explicit BB-exclusion statement remain unknown despite a product-page number. Hydraulic disc brakes are not inserted into the rim-brake-caliper category. Chains, batteries sold separately, mounting kits and spare derailleur cages remain outside the current component inventory unless modelled as complete assemblies of an existing type.

## Remaining coverage

Further manufacturer evidence is needed for older SRAM MTB systems, S-Series/OEM and DH variants, full Eagle crank inventories, the individual AXS controller revisions, ADVENT/Sword Black/ADVENT MX, and GRX RX827/RX717. This review does not claim those ranges are complete. Many new records still have unknown weights or limits under the same contribution rules as older records.

After these additions, 164 of 320 rear derailleurs still lack at least one universal limit field. Unknown means the selected manufacturer sources do not explicitly establish that field; cassette compatibility alone does not fill it.
