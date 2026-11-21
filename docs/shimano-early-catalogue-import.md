# Early Shimano components without technical-document links

On 21 November 2026 the owner approved including components without matching technical-document links. The catalogue now retains the required `technical_document` field as either its existing citation object or explicit `null`. A missing link does not prevent a component identity or a compliant weight supported by reviewed sources. Original manufacturer publications remain the evidence; archive commentary is not substituted for them.

The website shows “No technical document linked. See the sources below.” for null documents. Source citations remain visible and required. Existing document links and component IDs are preserved. The generated OpenAPI schema documents the nullable field; API clients must check it before accessing `.url`. Static API delivery and caching do not change.

## Imported records

This import adds **34 components with 15 sourced weights**, bringing the catalogue to **1,638 components across 262 groupsets**. All new records have null technical-document links and cite the exact original publication/page. The [1973 review](shimano-1973.md) and [June 1978 review](shimano-1978.md) contain the visual source checks and qualifications.

| Range | New records | Known weights | Models |
| --- | --- | --- | --- |
| Original Dura-Ace | 11 | 3 | D-501, E-304, G-210, G-220, G-520, H-731, H-831, L-284, L-600, B-210, M-140 |
| Dura-Ace EX | 11 | 6 | DA-200, EA-200, LA-110, GA-300, GB-110, HF-100 front/rear, BA-200 front/rear, MA-200, UA-110 |
| Shimano 600 EX | 12 | 6 | DC-230, EC-630, LB-630, GC-400, GC-410, GB-210, HF-300 front/rear, BB-330 front/rear, MB-230, UB-100 |

HF-100/HF-300 front/rear and BA-200/BB-330 front/rear keep the printed model number. Position suffixes in their internal IDs/slugs distinguish records; they are not invented manufacturer model suffixes. BB-330 is a brake caliper in this edition, not a bottom bracket.

## Weights added

| Model | Weight | Reference |
| --- | --- | --- |
| D-501 | 225 g | Adapter-free Crane, 1973 PDF p. 4. The printed 7.6 oz conflicts with the gram figure; retain the source discrepancy |
| E-304 | 140 g | 1 1/8-inch clamp Titlist, 1973 PDF p. 4 |
| G-520 | 300 g | Bracket axle and fittings, 112 mm square-taper spindle, 1973 PDF p. 5; separate from cranks |
| DA-200 | 175 g | Dura-Ace EX rear derailleur, 1978 PDF p. 8 |
| EA-200 | 102 g | Lower-inlet 1 1/8-inch clamp front derailleur, 1978 PDF p. 8 |
| BA-200 | 164 g front / 166 g rear | Separate complete caliper positions, pads and mounting bolts as illustrated, 1978 PDF p. 9 |
| MA-200 | 206 g per pair | Explicit left/right pair including rubber covers, 1978 PDF p. 9 |
| UA-110 | 106 g | Complete road headset, 1978 PDF p. 9 |
| DC-230 | 190 g | 600 EX rear derailleur, 1978 PDF p. 10 |
| EC-630 | 112 g | Lower-inlet 1 1/8-inch clamp front derailleur, 1978 PDF p. 10 |
| BB-330 | 159 g front / 157 g rear | Separate complete caliper positions, pads and mounting bolts as illustrated, 1978 PDF p. 11 |
| MB-230 | 209 g per pair | Explicit left/right pair including rubber covers, 1978 PDF p. 11 |
| UB-100 | 150 g | Complete road headset, 1978 PDF p. 11 |

Clamp diameters record the exact 28.575 mm conversion of the printed 1 1/8-inch measurement. The record descriptions preserve the original imperial reference.

## Limits and unresolved configurations

DA-200 records the explicitly listed **26T largest sprocket / 13T front difference**; DC-230 records **28T / 13T**. Total capacity and minimum sprocket remain null. The 1973 D-501’s “28 tooth difference” wording is retained in its description without assigning all four modern limit fields.

All six newly imported front/rear hubs retain null weights: the reviewed QR references do not explicitly exclude skewers. Cranks retain null weights where no mass is published or the actual weighed length/chainrings are not identified. The four shifter records represent left/right pairs with unknown weights; source figures without an explicit pair basis are not doubled or summed. Standalone lever pairs use the explicitly published pair figures where available.

The missing-technical-link policy does not weaken any of those weight rules.

## Identity and remaining research

Early codes are not silently replaced by later RD/FD/FC/BR/BL numbers. Existing later records keep their stable identities and documents. A possible early/later equivalence needs manufacturer evidence before merging; matching appearance or weight alone is insufficient. If an equivalence is established, preserve the old canonical references using the catalogue’s alias mechanism rather than deleting them.

The 1972 scan’s separately listed products still need evidence for appropriate catalogue memberships; absence of a technical link alone no longer blocks them. Threaded freewheels, BMX classification, coaster assemblies and the single combined front/rear Positron console also have separate membership/type-modelling questions documented in the reviews. They are not forced into unrelated groupsets or the existing single right-hand 1× exception.
