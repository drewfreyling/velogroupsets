# Shimano MTB crank weight review

Reviewed on 20 November 2026, starting from `6765add`. This pass reviews 14 existing unknown Deore, Deore XT/LX and XTR crank records. It fills FC-M550 and adds separately identified FC-M730-SG and FC-M751 references. The existing FC-M730 Round Gear SG-X assembly keeps its unknown weight; its display name now identifies that configuration.

There are now 208 crankset records, including 141 with unknown weights, compared with 206 records and 142 unknowns before this pass. Overall component count rises from 1,386 to 1,388; unknown weights fall from 645 to 644. Existing IDs, slugs, memberships and primary technical-document URLs are preserved.

## Qualified manufacturer references

The manufacturer-hosted [1991 Shimano dealer product manual](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/1991_Shimano_Bicycle_System_Component_Dealer_Product_Manual.pdf) supplies the exact crank lengths and every chainring tooth count beside the weights. It lists a separate bottom-bracket weight in the same entry. These are crankset figures; no bottom-bracket subtraction is performed.

| Record | Weight | Exact reference | Manufacturer page |
| --- | ---: | --- | --- |
| [FC-M550](../data/components/shimano-fc-m550.json) | 752 g | 170 mm arms, 48/38/28T SG triple; excludes BB-M550 | [PDF p. 67 / printed p. 64](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/1991_Shimano_Bicycle_System_Component_Dealer_Product_Manual.pdf#page=67) |
| [FC-M730-SG](../data/components/shimano-fc-m730-sg.json) | 730 g | 170 mm arms, 46/36/26T SG triple; excludes BB-M730 | [PDF p. 54 / printed p. 51](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/1991_Shimano_Bicycle_System_Component_Dealer_Product_Manual.pdf#page=54) |
| [FC-M751](../data/components/shimano-fc-m751.json) | 647 g | 175 mm arms, 44/32/22T, four-arm crankset; excludes BB-ES70 | [2000 manual, PDF p. 22 / printed p. 20](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2000_Shimano_Trade_Sales_Support_Manual.pdf#page=22) |

The M550 weight line does not distinguish Biopace SG from round SG rings; its description records that limitation rather than inventing a ring profile. The existing M550 exploded view covers both SG ring options. The separate [FC-M730 drawing](https://si.shimano.com/en/pdfs/ev/FC-M730-1322/EV-FC-M730-1322.pdf) explicitly identifies the later **Round Gear SG-X** assembly. Its mass is not established by the older SG figure, so the manufacturer-named FC-M730-SG gets its own identity and catalogue page.

The 2000 manual likewise specifies 175 mm and 44/32/22T beside FC-M751’s 647 g figure and lists the bottom bracket separately. Its Deore XT table establishes membership in the same family as the existing M750 components. The reference retains the actual 175 mm length; no estimated conversion to 170 mm is made. It does not fill the distinct FC-M750-4 weight.

Page numbers above refer to the manufacturer-hosted editions checked in this pass. The archived 1991 scan at Vintage Cannondale has different pagination; its page numbers must not be substituted into these links. Publication dates establish the reviewed weight references, not inferred introduction years.

## Measurement queue

Prefer 170 mm arms when choosing a new measurement, but accept any explicitly identified length. For each record below, a contributor measurement or further original manufacturer publication must establish the complete crankset weight, actual arm length, every chainring tooth count and bottom-bracket exclusion. The cited review does not prove that no suitable weight was ever published.

| Existing record | What the reviewed evidence establishes | Remaining evidence needed |
| --- | --- | --- |
| FC-M6100-1 | [2025–2026 handbook, PDF p. 51](https://productinfo.shimano.com/pdfs/product/archive/2025-2026_Specifications_v035_en.pdf#page=51) identifies the model/options but leaves the numerical average-weight entry blank | Complete 1× crankset measurement, identifying its ring and arm length |
| FC-M5100-1 | [Same handbook, PDF p. 53](https://productinfo.shimano.com/pdfs/product/archive/2025-2026_Specifications_v035_en.pdf#page=53) likewise has no numerical average weight | Complete 1× crankset measurement, identifying its ring and arm length |
| FC-M730 | Existing manufacturer drawing identifies Round Gear SG-X; the 1991 SG reference is catalogued separately above | Weight for the actual Round Gear SG-X configuration |
| FC-M739-4 | [1998 dealer manual, PDF p. 34](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/1998_Shimano_Dealer_Sales_Support_Manual.pdf#page=34) lists 42T/44T outer-ring options without identifying the weighed ring combination | Four-arm reference with every ring identified; do not guess an outer ring |
| FC-M750-4 | [2000 dealer manual, PDF p. 22](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2000_Shimano_Trade_Sales_Support_Manual.pdf#page=22) lists FC-M751, a different model | Exact FC-M750-4 measurement rather than a transferred M751 figure |
| FC-M760 | [2005 manual, PDF p. 77](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2005_Trade_Sales_Support_Manual.pdf#page=77) describes the crankset with its BB unit | A crankset-only reference |
| FC-M770 | [2008 manual, PDF p. 73](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2008_Trade_Support_Manual.pdf#page=73) describes the crankset with its BB unit | A crankset-only reference |
| FC-M780 | [2014–2015 handbook, PDF p. 50](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=50) does not establish a qualified crankset-only reference in the selected weight entry | Arm length, full ring combination and explicit BB exclusion |
| FC-M580 | [2006 manual, PDF p. 97](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2006_Trade_Sales_Support_Manual.pdf#page=97) describes the crankset with its BB unit | A crankset-only reference |
| FC-M950 | [1997 dealer manual, PDF p. 32](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/1997_Shimano_Dealer_Sales_Support_Manual.pdf#page=32) leaves its weight blank; later M951/M952 figures are different model references | Exact FC-M950 measurement |
| FC-M960 | [2005 manual, PDF p. 67](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2005_Trade_Sales_Support_Manual.pdf#page=67) gives total weight including the BB | A crankset-only reference, without deducting an assumed BB mass |
| FC-M970 | [2007 manual, PDF p. 89](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2007_Trade_Sales_Support_Manual.pdf#page=89) describes the crankset with its BB unit | A crankset-only reference |
| FC-M980 | [2014–2015 handbook, PDF p. 49](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=49) does not establish a qualified crankset-only reference in the selected weight entries | Arm length, full ring combination and explicit BB exclusion |

## Supplying a reference

Use the [contribution form](https://github.com/drewfreyling/velogroupsets/issues/new?template=contribution.yml) and select “Component weight”. Identify the model/record, grams, actual crank length, every ring tooth count, included hardware and source limitations in the weight/configuration details. For your own measurement, supply the scale resolution, date and component condition in the evidence field. For manufacturer figures, supply the exact publication/page and evidence for the weight configuration.

The form creates a reviewable GitHub issue; it does not write catalogue data automatically. Maintainers still follow the [weight guidelines](weights-guidelines.md#cranksets), confirm the exact model/variant, distinguish manufacturer figures from contributor measurements and run catalogue validation before merging. Retailer shipping weights, arithmetic deductions and a list of merely available sizes do not fill these gaps.

The [crank and clamp follow-up](shimano-mtb-crank-clamp-weights.md) adds distinct FC-M825, FC-M645 and FC-M8000-B2 references with explicit arm lengths, chainrings and bottom-bracket exclusion. It does not fill the earlier models’ unknown weights by transferring those figures.
