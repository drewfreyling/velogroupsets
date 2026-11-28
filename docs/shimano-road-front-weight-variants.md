# Shimano road front-derailleur weight variants

Reviewed on **28 November 2026**. This pass adds **eight weighted road front derailleurs**: seven integral clamp-band variants and the braze-on Tiagra triple. All figures come from Shimano’s 2014–2015 specifications v2.0 and identify the exact mount. Existing component records, positive weights, IDs, memberships and primary documents remain unchanged.

## Manufacturer references

| Component | Weighed configuration | Weight | Manufacturer reference |
| --- | --- | ---: | --- |
| [FD-6800-B](../data/components/shimano-fd-6800-b.json) | Ultegra, 2×11-speed, L-size 34.9 mm band | 104 g | [PDF 122 / printed 119, upper table](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=122) |
| [FD-6700-B](../data/components/shimano-fd-6700-b.json) | Ultegra, 2×10-speed, L-size 34.9 mm band | 104 g | Same upper table |
| [FD-6703-B](../data/components/shimano-fd-6703-b.json) | Ultegra, 3×10-speed, L-size 34.9 mm band | 131 g | [PDF 122 / printed 119, lower table](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=122) |
| [FD-5700-B](../data/components/shimano-fd-5700-b.json) | 105, 2×10-speed, L-size 34.9 mm band | 105 g | [PDF 123 / printed 120, upper table](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=123) |
| [FD-5703-B](../data/components/shimano-fd-5703-b.json) | 105, 3×10-speed, L-size 34.9 mm band | 132 g | Same upper table |
| [FD-4600-B](../data/components/shimano-fd-4600-b.json) | Tiagra, 2×10-speed, L-size 34.9 mm band | 105 g | [PDF 123 / printed 120, lower table](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=123) |
| [FD-4603-B](../data/components/shimano-fd-4603-b.json) | Tiagra, 3×10-speed, L-size 34.9 mm band | 132 g | Same lower table |
| [FD-4603-F](../data/components/shimano-fd-4603-f.json) | Tiagra, 3×10-speed, braze-on | 114 g | Same lower table |

## Mount and model identification

Every selected B-model weight cell explicitly says **L size**. Shimano’s [FD-6700 service instructions](https://si.shimano.com/en/pdfs/si/5LW0A/SI-5LW0A-001-ENG.pdf), under specifications, explicitly define **S (28.6 mm), M (31.8 mm), L (34.9 mm)** installation band diameters. The handbook’s mount rows identify 31.8 and 34.9 mm band options, with an adapter for 28.6 mm. The weighed L-size reference therefore identifies the actual **34.9 mm integral band**, rather than choosing a diameter from an unqualified options list.

The exact manufacturer exploded views linked on the records show separate **Band Type** and **Brazed-on Type** assemblies. Optional add-on clamps for a braze-on derailleur are separate parts; their diameter does not turn the braze-on model’s weight into an integral-band weight. These eight records retain the manufacturer’s B/F mount codes from the specification tables. L-size band notation is separate from any colour/finish suffix in a service drawing; no finish is selected for the average weight.

Both handbook pages contain **two independent tables**. Weights were matched visually to their own table’s model columns, including the lower-table **132 g / 114 g** Tiagra triple B/F figures. The existing braze-on Ultegra and 105 references remain unchanged. All eight additions use down swing; speed counts and mounting configurations are retained from their exact columns.

These references follow the [front-derailleur weight guidelines](weights-guidelines.md#front-derailleurs). Smaller band sizes and braze-on units fitted with accessory clamps do not inherit the selected L-size masses.
