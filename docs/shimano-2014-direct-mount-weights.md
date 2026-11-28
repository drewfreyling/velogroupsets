# Shimano 2014–2015 direct-mount front-derailleur weights

Reviewed on **28 November 2026**. This pass adds **seven weighted front derailleurs** from Shimano’s [2014–2015 specifications v2.0](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf), cross-checked against their manufacturer exploded views. Existing records, positive weights, IDs, memberships and primary documents remain unchanged.

## Manufacturer references

| Component | Weighed configuration | Weight | Manufacturer reference |
| --- | --- | ---: | --- |
| [FD-M981-D](../data/components/shimano-fd-m981-d.json) | XTR, 3×10-speed, direct mount | 143 g | [PDF 30 / printed 27](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=30) |
| [FD-M986-D](../data/components/shimano-fd-m986-d.json) | XTR, 2×10-speed, direct mount | 122 g | [PDF 31 / printed 28](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=31) |
| [FD-M781-A-D](../data/components/shimano-fd-m781-a-d.json) | Deore XT, 3×10-speed, direct mount, dual pull | 143 g | [PDF 32 / printed 29](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=32) |
| [FD-M671-A-D](../data/components/shimano-fd-m671-a-d.json) | SLX, 3×10-speed, direct mount | 145 g | [PDF 34 / printed 31](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=34) |
| [FD-M676-D](../data/components/shimano-fd-m676-d.json) | SLX, 2×10-speed, direct mount | 148 g | [PDF 35 / printed 32](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=35) |
| [FD-M611-D](../data/components/shimano-fd-m611-d.json) | Deore, 3×10-speed, direct mount, dual pull | 146 g | [PDF 36 / printed 33](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=36) |
| [FD-M616-D](../data/components/shimano-fd-m616-d.json) | Deore, 2×10-speed, direct mount, dual pull | 149 g | [PDF 37 / printed 34](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=37) |

## Configuration and source limits

Every selected column explicitly identifies **Direct Mount**. The exact manufacturer drawings linked on the records separately name the D-type/direct-attachment assemblies. No band diameter is invented, and no band or E-type weight is transferred. All seven use down swing and ten-speed rear shifting. The same tables establish **18T front capacity for the triples** and **14T for the doubles**, now retained in their specifications. Source series rows establish XTR, Deore XT, SLX and Deore membership.

Three weight cells explicitly distinguish cable-pull configurations. This review selects the published **dual-pull** masses: FD-M781-A-D **143 g** rather than its 139 g top-pull reference; FD-M611-D **146 g** rather than 141 g; FD-M616-D **149 g** rather than 142 g. Their records retain `cable_route: "Dual pull"`. The other four model columns publish a single average weight; no separate pull-specific mass is inferred.

The weight rows do **not specify mounting-hardware inclusion**. This remains explicit in every description; no mounting-bolt weight is added, deducted or claimed to be included. The [front-derailleur guidelines](weights-guidelines.md#front-derailleurs) require an identified mount and require diameter only for clamp-mounted references. These are exact manufacturer-identified direct mounts, with hardware uncertainty preserved.

The **-A** revisions remain part of the manufacturer model identities. Earlier generic or band-mounted records retain their own evidence and unknown weights; the later references do not resolve those gaps by substitution. The original FD-M980, for example, remains unknown rather than receiving FD-M981-D’s figure.
