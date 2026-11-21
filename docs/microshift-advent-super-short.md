# microSHIFT ADVENT, Super Short and earlier XLE references

Reviewed on 22 November 2026. This batch adds **36 components and 29 sourced weights**, plus the previously missing **ADVENT 9-speed** range. The catalogue now contains **1,738 components across 264 groupsets**. Seven new weights remain unknown because of conflicting figures or an unidentified clamp/reducer configuration.

## Manufacturer publications

The original PDFs are now directly downloadable from microSHIFT:

- [2021 Drivetrain catalogue](https://www.microshift.com/wp-content/uploads/2021/04/microSHIFT_Catalog_2021-20210401.pdf): 48 PDF spreads, cover explicitly labelled **2021 DRIVETRAIN** with © 2021. ADVENT is on PDF spreads 6–7 / printed pp. 7–10; XLE 11 is on PDF spread 10 / printed pp. 15–16.
- [2025 Drivetrain catalogue](https://www.microshift.com/wp-content/uploads/2024/09/Microshift-2025-Catalog-20240911.pdf): 43 PDF spreads. ADVENT is on spread 7 / printed pp. 9–10; nine-speed Super Short on spread 9 / pp. 13–14; eight-speed Super Short on spread 10 / pp. 15–16.

The official 2025 file is not byte-identical to the previously read archived copy. Extracted text agrees exactly on reviewed spreads 6–12, and the product tables were checked visually. All new component records link to the exact manufacturer PDF spread as their technical document. No PDF bytes or images are committed.

The official 2021 edition establishes **2021 documented availability** for ADVENT and XLE 11. ADVENT uses that supported availability year. XLE 11 is corrected from its previous 2025 lower-bound reference to 2021, preserving its ID and slug. Neither year is claimed as a proven first-introduction date; the undated ADVENT launch article is not assigned an inferred date. Later revisions are not dated to the group's first recorded availability.

## ADVENT control weights

| Model | Weight | Reference |
| --- | --- | --- |
| SL-M9295-R | 120 g | Single right-hand 1×9 Trail Trigger Pro, silicone pad |
| SL-M9295-ER | 120 g | Same control class with e-bike single-click shifting |
| SL-M6295-R / SL-M6295-ER | 130 g each | Separate single right-hand indicator/rubber-pad models; ER is e-bike single click |
| SL-M6290-R | 130 g | Single right-hand indicator Quick Trigger |
| SL-M6195-R / SL-M6195-ER | 122 g each | Separate single right-hand rubber-pad controls; ER is e-bike single click |
| SL-M6190-R | 122 g | Single right-hand Quick Trigger |
| SL-M19-R | 64 g | Single right-hand 1×9 flat-bar thumb control, index/friction |
| BS-M19-R | 75 g | Single right-hand 1×9 bar-end control, index/friction |
| SL-M8195-R | 116 g | Single right-hand 1×9 Xpress control, bearings |
| SL-M819-R | 112 g | Single right-hand 1×9 Xpress control |
| SL-M819-L / SL-M819-R | 224 g per pair | Calculated from independently published **112 g left + 112 g right** for the matching 2×9 set |
| SB-M090 | 378 g per pair | Standard-reach integrated 1×9 drop-bar pair, brake-only left unit |

The calculated pair cites the two separate side entries in the 2021 manufacturer table. Equal published side figures are not a duplicated measurement: the left and right have distinct model numbers and individually published weights. The record retains both side models/weights and `weight_method: "Sum of manufacturer side weights"`. Its complete 2×9 assembly is distinct from the separately listed right-hand 1×9 control.

SB-M090 is a complete control pair despite its 1× drivetrain; the left operates the brake. Individual dropper-left and short-reach options are not substituted. Genuine single thumb/bar-end/trigger controls remain right-hand 1× references.

## ADVENT derailleurs and cassettes

| Model | Weight | Reference |
| --- | --- | --- |
| RD-M6195M / RD-M619M | 384 / 314 g | Original medium-cage clutch / non-clutch models in 2021 |
| RD-M6195M-B / RD-M619M-B | 384 / 314 g | Separately named Ver.2 medium-cage models in 2025 |
| CS-H093 11–42T | 530 g | Nine-speed 11/13/15/18/21/24/28/34/42T |
| CS-EH093 11–42T | 530 g | Same gearing, e-bike chromoly 11T reference |
| CS-H093 11–46T | 588 g | Nine-speed 11/13/15/18/21/24/30/37/46T |
| CS-EH093 11–46T | 588 g | Same gearing, e-bike chromoly 11T reference |

The original medium-cage codes and Ver.2 -B codes remain separate. Their matching masses do not prove an identity equivalence. Medium-cage total capacity is 41T, long-cage total capacity 47T. The 2025 largest-sprocket range is 40–46T; the older 2021 medium/long tables specify 42–46T. The selected edition is identified in each record. Smallest sprocket and maximum front difference remain null.

## Super Short references

| Model | Weight | Family / configuration |
| --- | --- | --- |
| RD-M6195S | 361 g | ADVENT 1×9, clutch, 27T total / 38T largest sprocket |
| CS-H093 11–38T | 488 g | ADVENT nine-speed 11/13/15/18/21/24/28/32/38T |
| RD-M5185S | 335 g | Acolyte 1×8, SpringLock, 27T total / 38T largest sprocket |
| RD-M5180S | 284 g | Acolyte 1×8 standard Super Short, 27T total / 38T largest sprocket |
| CS-H083 11–38T | 421 g | Acolyte eight-speed 11/13/15/18/21/24/30/38T |

The manufacturer [ADVENT](https://www.microshift.com/products/groups/advent/) and [Acolyte](https://www.microshift.com/products/groups/acolyte/) range pages explicitly include these Super Short parts. They retain membership in those named families; compatibility alone is not used to create a new arbitrary group. SpringLock is recorded by its actual mechanism name without inferring a conventional clutch specification. Cassette lockring inclusion is assumed under the existing guidelines.

## XLE 11 additions and direct-mount validation

SB-M110 gains its explicitly listed **378 g standard-reach left/right 1×11 drop-bar pair** with brake-only left unit. The manufacturer's FD-M622-D table explicitly identifies **Direct Mount**, dual pull, 10T capacity, 34–38T chainrings and **135 g**. It is recorded as `mount: "Direct mount"`.

Weight validation now accepts manufacturer-identified direct-mount front derailleurs alongside braze-on and clamp references. Clamp references still require actual diameter or documented band range. The component schema already allows the mount string, so no API schema, route or delivery change is needed. The weight guide and AGENTS.md document the mount value. Unit tests cover the direct-mount reference, unrecognised mounts and the unchanged clamp-size requirement.

FD-M622-B and FD-M622G-B identities are also added with the source's 34.9 mm clamp body and optional 31.8 mm reducer. Their 149 g figures remain withheld because reducer inclusion is not selected. The latter has the source's 12T capacity and 42–46T chainrings; FD-M622-B has 10T and 34–38T. Neither is labelled as the direct-mount assembly.

## Unresolved figures

| Model | Sources / limitation | Canonical weight |
| --- | --- | --- |
| SL-M9195-R | 2021: 119 g; 2025: 120 g, without an identified changed weighed assembly | null |
| RD-M6195L | 2021: 384 g; 2025: 388 g, without identified hardware revision | null |
| RD-M619L | 2021: 314 g; 2025: 318 g, without identified hardware revision | null |
| CS-H093A 11–42T | 2021/2025 catalogues: 440 g; [manufacturer product page](https://www.microshift.com/models/cs-h093a-11-42t/): 488 g | null |
| FD-T492B | 2021/2025 catalogues: 159 g; [manufacturer product page](https://www.microshift.com/models/fd-t492b/): 149 g; weighed adapter inclusion unexplained | null |
| FD-M622-B / FD-M622G-B | 149 g listed, but actual clamp/reducer inclusion not selected | null |

No figures are averaged or reconciled by subtracting estimated hardware. The earlier XLE medium-cage conflicts remain unchanged. Sword crank tables identify lengths and rings but still do not explicitly settle BB exclusion, so their weights remain unknown. Non-group parts are not assigned memberships merely to import them.

The 2025 Super Short table also lists **CS-EH093 11–38T at 488 g**. It remains a research lead: compatibility with ADVENT/Sword Black alone does not establish the exact range membership required for import, and the reviewed range inventory did not explicitly list this e-bike variant.
