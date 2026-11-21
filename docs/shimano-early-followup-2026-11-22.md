# Early Shimano catalogue follow-up — 22 November 2026

This review adds **26 components and five sourced weights** from the already reviewed original [1981 Shimano catalogue](https://drive.google.com/file/d/1nhlBEB76WGQO9qj5PtkOyTIPzvBFie6V/view) and [April 1982 catalogue](https://drive.google.com/file/d/17QiI_JPy9NX1NiRCOWtYQDXxmGbQAJ5N/view). It follows the [optional technical-document policy and first early-model import](shimano-early-catalogue-import.md).

The catalogue now contains **1,664 components across 262 groupsets**. Existing canonical component IDs, weights and technical-document links are unchanged. The original Dura-Ace and Shimano 600 range records gain period-publication citations; their documented start years do not change. Availability in 1981/82 does not date every numbered assembly to the ranges’ 1973/75 launches.

## New weights

| Model | Weight | Reference configuration | Source |
| --- | --- | --- | --- |
| RD-7100 | 174 g | Complete Dura-Ace rear derailleur | 1981 PDF p. 38 / printed p. 28 |
| FD-7100 | 110 g | Lower-inlet 1 1/8-inch clamp; exact conversion 28.575 mm | 1981 PDF p. 38 / printed p. 28 |
| RD-6100 | 235 g | Original 600 short-cage derailleur; not its RD-6101 long-cage option | 1981 PDF p. 42 / printed p. 31; 1982 PDF p. 65 / printed p. 62 |
| SL-BC10 | 160 g per pair | Explicitly published left/right bar-end pair with spiral balance springs | 1981 PDF p. 42 / printed p. 31; 1982 PDF p. 69 / printed p. 66 |
| BB-SL32 | 325 g | Integer AX Octa Joint bottom-bracket parts, separately listed from crank/chainwheel and protector figures | 1982 PDF p. 87 / printed p. 84 |

BB-SL32 is **Octa Joint**, not square taper; its weighed spindle/shell variant is not selected in the source. It is not asserted to be BB-AX31, and the existing BB-AX31 weight stays null. FC-AX21 also remains unweighed: its chainwheel/protector references and multiple available crank lengths do not establish a complete weighed crankset configuration.

SL-BC10’s pair figure is explicit in both editions. The 1981 catalogue also identifies **LD-500** as its old model number; this is retained as sourced metadata. No pair total is inferred by doubling a single control.

## New component coverage

| Existing range | Additions |
| --- | --- |
| Original Dura-Ace | RD-7100, FD-7100, FC-7110, BB-7200, HP-7100, HB-7120 front/rear |
| Dura-Ace EX | PD-7200 pedal pair |
| Dura-Ace AX | FD-7322 oval C-tube front derailleur; SP-7322 oval E-tube seatpost |
| Original Shimano 600 | RD-6100, RD-6101, SL-6100, SL-QB11, SL-BC10, HB-6120 front/rear and HB-6110 rear |
| Shimano 600 AX | SP-6322 oval E-tube seatpost |
| Adamas AX | SL-AD12 down-tube B type, SL-AD15 braze-on A type and SL-AD24 top-tube control pairs |
| Altus-LT within the existing Altus/Selecta range | SL-AT12 stem control pair |
| Shimano AX road/touring ensemble | BB-SL32, FD-AX10 and SL-AX10 |

The model number stays exactly as printed. Front/rear suffixes in internal hub IDs/slugs distinguish positions; they are not invented manufacturer model suffixes. No early/later code equivalence is assumed from matching appearance or mass.

## Other specifications

- RD-7100 records **26T largest sprocket** and **13T front difference**; total capacity and smallest sprocket remain null.
- RD-6100 records **28T total capacity**, **28T largest sprocket** and **13T front difference**. Its smallest sprocket remains null. The optional long-cage RD-6101 retains unknown limits and weight rather than inheriting the short-cage block.
- FD-7100 has a **16T** front capacity in the 1981 spread. FD-7322 and FD-AX10 each have an explicit **14T** figure in 1982.
- **FD-7322 uses oval C tubing, 18 × 34.1 mm**. **SP-7322 and SP-6322 use oval E tubing, 18.5 × 29 mm**. A common numeric suffix does not establish a common tube profile across different component types.
- BB-7200’s 112/113 mm spindle options are tied to 68/70 mm shells respectively. These are available configurations, not a weighed reference.

## Figures still withheld

The five new hub records remain unweighed because the QR assembly references do not explicitly exclude skewers. No skewer mass is subtracted. The existing HB-6110 front record is preserved.

The generic AX braze-on front-derailleur figure does not select FD-7322’s oval C mounting. SP-7322/SP-6322 do not inherit adjacent round/semi-oval seatpost weights. FD-AX10 lists body and separate cable-guide figures with more than one inlet size; no complete mount-specific total is inferred.

SL-6100/SL-QB11, the Adamas mounting variants and SL-AT12 remain unknown because their figures do not explicitly establish complete-pair weights for the selected models. PD-7200’s 173 g reference includes a toe clip and strap but does not establish a complete pedal pair. SL-AX10’s 140 g is labelled as a bracket figure, not a complete-pair total.

Unlike the earlier combined front/rear Positron console, **SL-AX10 explicitly has separate front and rear levers**, shown in the original parts list. It therefore fits the existing pair model without a schema change. No console-specific or BMX category/type extension is introduced.

## Technical documents and validation

The new HB-6120 front record links to the reviewed [Shimano HB-6110/HB-6120 front-hub drawing](https://si.shimano.com/en/pdfs/ev/HB-6110_6120%20F-0666/EV-HB-6110_6120%20F-0666.pdf), which explicitly identifies the large-flange model. SL-AX10 links to its [exact front/rear lever drawing](https://si.shimano.com/en/pdfs/ev/SL-AX10_1-0486/EV-SL-AX10-0486A.pdf). Both PDFs were checked visually; the fetched SL-AX10 drawing matches the previously inspected copy.

The other 24 new records use `technical_document: null` and cite their original manufacturer catalogue pages. The optional-link rule does not waive evidence, configuration requirements or existing link-host checks. Scan images and PDFs remain outside the repository.
