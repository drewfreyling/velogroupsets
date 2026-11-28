# Shimano SPD pedal-pair weights

Reviewed on **28 November 2026**. This review covers **twelve pedal records with manufacturer-listed pair weights**. Each cites an explicit pair-weight row and exact manufacturer model drawing; product pages provide additional corroboration where listed. Existing component records, positive weights, IDs, memberships and primary documents remain unchanged.

## Qualified references

All seven figures appear under **Average weight (pair)** in the [2017–2018 specifications v2.8, PDF page 220 / printed page 217](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=220). PD-M520 is in that page’s lower table; the other six are in its upper table. The 2018 TSS manual’s [PDF/printed page 411](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=411) repeats the same seven pair totals.

| Component | Manufacturer-listed family/option | Pair weight | Corroborating manufacturer product page |
| --- | --- | ---: | --- |
| [PD-M9000](../data/components/shimano-pd-m9000.json) | XTR M9000 | 310 g | [2018 TSS, page 284](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=284) |
| [PD-M9020](../data/components/shimano-pd-m9020.json) | XTR M9000 | 379 g | Same page |
| [PD-M8000](../data/components/shimano-pd-m8000.json) | Deore XT M8000 | 343 g | Same page |
| [PD-M8020](../data/components/shimano-pd-m8020.json) | Deore XT M8000 | 408 g | [2018 TSS, page 285](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=285) |
| [PD-M540](../data/components/shimano-pd-m540.json) | SLX M7000 pedal option | 352 g | Same page |
| [PD-M530](../data/components/shimano-pd-m530.json) | SLX M7000 and Deore M6000 pedal option | 455 g | Same page |
| [PD-M520](../data/components/shimano-pd-m520.json) | Deore M6000 pedal option | 380 g | [2018 TSS, page 286](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=286) |

## Further pedal references

Five further pair totals come from [2018 TSS, PDF/printed page 411](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=411), with the following explicit range-chart options:

| Component | Manufacturer-listed option | Pair weight | Range chart |
| --- | --- | ---: | --- |
| [PD-M505](../data/components/shimano-pd-m505.json) | Alivio M4000 SPD | 443 g | [Page 73](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=73) |
| [PD-M424](../data/components/shimano-pd-m424.json) | Deore M6000 SPD | 472 g | [Page 46](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=46) |
| [PD-M545](../data/components/shimano-pd-m545.json) | SLX M7000 / ZEE M640 SPD | 567 g | [Page 39](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=39) / [58](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=58) |
| [PD-M647](../data/components/shimano-pd-m647.json) | Saint M820 / ZEE M640 SPD | 568 g | [Page 53](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=53) / [58](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=58) |
| [PD-M324](../data/components/shimano-pd-m324.json) | Alivio M4000 SPD/flat | 533 g | [Page 73](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=73) |

The product pages corroborate PD-M647 at 568 g on [page 286](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=286), PD-M545 at 567 g and PD-M424 at 472 g on [page 287](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=287), and PD-M324 at 533 g on [page 289](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=289). PD-M505 uses the explicit specification-table pair reference and its exact service drawing; no separate product-page figure is claimed.

PD-M324 has one SPD-binding face and one flat face. Its service drawing also shows alternate axle threads; the weight table does not select a thread, so that detail remains unspecified. All five retain the publisher’s pair average with cleat/accessory inclusion unreported. Shared options have one canonical record and multiple sourced memberships rather than duplicated component identities.

## Pair basis, identity and membership

These are published left/right **pair totals**, retained directly with `weight_basis: "Pair"`. No individual pedal is doubled, no pair is divided and no accessory mass is deducted. The weight rows do not specify cleat or loose-accessory inclusion. Packaging rows that list supplied cleats or spacers are not treated as proof that those accessories are included in the published mass.

The exact manufacturer exploded views linked on each record confirm the pedal assemblies. PD-M8000’s Type/Binding cells in the specification grid conflict with the manufacturer’s **XC SPD** product description and its SPD service drawing. Those two cells are not copied; the product page independently corroborates **343 g**, while the specification row explicitly establishes the pair basis.

Membership comes from actual Shimano range charts: [XTR M9000, 2018 page 15](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=15), [Deore XT M8000, page 27](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=27), [SLX M7000, page 39](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=39), and [Deore M6000, page 46](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=46). PD-M540, PD-M530 and PD-M520 are explicitly listed pedal options. The shared PD-M530 has one canonical record with both sourced family references.

## References left unresolved

Three additional models have differing manufacturer figures or hardware qualifications and are excluded from this weight pass:

| Model | Specification-table reference | Product-page reference | Unresolved detail |
| --- | --- | --- | --- |
| PD-M820 | 568 g/pair | [2018 page 286](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=286): 546 g **without pins** | The table does not select the pin inclusion or provide a reconciled configuration; no pin mass is inferred by subtraction. |
| PD-M828 | 477 g/pair | [2018 page 287](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=287): 493 g, with long/short pin options | No exact weighed pin configuration reconciles the two figures. |
| PD-M8040 | SM 469 g / ML 514 g per pair | [2018 page 288](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=288): SM 460 g / ML 503 g, with long/short pin options | Platform size alone does not reconcile the differing masses. No size average or pin-weight deduction is used. |

See the [weight guidelines](weights-guidelines.md). Further manufacturer configuration details or compliant contributor measurements are needed for those references.
