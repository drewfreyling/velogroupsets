# Shimano SLX and outboard-chainline front-derailleur weights

Reviewed on **28 November 2026**. This pass adds **eight weighted front derailleurs** from Shimano’s 2017–2018 specifications v2.8, cross-checked against the manufacturer service drawings linked on each record. Existing records, positive weights, IDs, primary documents and memberships remain unchanged.

## References added

| Component | Weighed configuration | Weight | Manufacturer reference |
| --- | --- | ---: | --- |
| [FD-M7000-10-H](../data/components/shimano-fd-m7000-10-h.json) | SLX, 3×10-speed, side swing, 34.9 mm high clamp | 152.1 g | [PDF 41 / printed 38](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=41) |
| [FD-M7000-10-L](../data/components/shimano-fd-m7000-10-l.json) | SLX, 3×10-speed, side swing, 34.9 mm low clamp | 136.5 g | Same table |
| [FD-M7000-10-D](../data/components/shimano-fd-m7000-10-d.json) | SLX, 3×10-speed, side swing, direct mount with bolt | 140.5 g | [PDF 42 / printed 39](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=42) |
| [FD-M7005-10-D](../data/components/shimano-fd-m7005-10-d.json) | SLX, 3×10-speed, down swing, direct mount with bolt | 140.9 g | Same table |
| [FD-M7020-11-L](../data/components/shimano-fd-m7020-11-l.json) | SLX, 2×11-speed, side swing, 34.9 mm low clamp | 132 g | [PDF 43 / printed 40](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=43) |
| [FD-M7020-11-D](../data/components/shimano-fd-m7020-11-d.json) | SLX, 2×11-speed, side swing, direct mount with bolt | 136 g | Same table |
| [FD-M9025-D](../data/components/shimano-fd-m9025-d.json) | XTR, 2×11-speed, down swing, direct mount with bolt | 141.3 g | [PDF 37 / printed 34](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=37) |
| [FD-M8025-D](../data/components/shimano-fd-m8025-d.json) | Deore XT, 2×11-speed, down swing, direct mount with bolt | 139 g | [PDF 39 / printed 36](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=39) |

## Configuration and identity

The band-mounted weight heading explicitly selects **L size**. Mount rows identify 31.8 mm with an M-size reducer and the unadapted **34.9 mm** band. The S-size adapter appears as an optional separately packaged accessory for the selected SLX models; no reducer weight is inferred or subtracted. The three selected clamp weights identify the actual large 34.9 mm reference rather than choosing a diameter from a generic options list. The model’s **-L** suffix means low clamp, independently of the weight heading’s L-size band.

The five D-suffix columns explicitly identify **Direct Mount**, and their weight headings specify **direct type w/ bolt**. Manufacturer service drawings separately show D-type, E-type, high-clamp and low-clamp assemblies. No E-type or alternate-band weight is copied to a D-type record. Source series rows establish each model’s SLX, Deore XT or XTR membership; front/rear speed rows distinguish 3×10 from 2×11 configurations. The M9025-D and M8025-D footnotes identify their specified outboard-chainline crank/frame arrangement; they remain distinct from M9020-D and M8020-D.

The existing [FD-M7020 record](../data/components/shimano-fd-m7020.json) already selects **FD-M7020-11-H**, 34.9 mm high clamp, at **147 g**. Its stable identity and weight are preserved, and no second high-clamp record is added. The new low-clamp and direct-mount versions describe different assemblies.

See the [earlier MTB direct-mount review](shimano-mtb-derailleur-weights.md), [XTR/XT clamp review](shimano-mtb-clamp-weights.md) and [front-derailleur weight guidelines](weights-guidelines.md#front-derailleurs).
