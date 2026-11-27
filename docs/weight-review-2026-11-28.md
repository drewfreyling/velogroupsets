# Component weight review — 28 November 2026

This pass fills **seven existing unknown weights**, using the original microSHIFT 2021 catalogue and Campagnolo’s manufacturer product specifications. It adds no components and changes no existing positive weights, canonical IDs, memberships or primary technical documents.

## Weights added

| Model | Weight | Reference configuration | Manufacturer source |
| --- | ---: | --- | --- |
| [RD-M5185M](../data/components/microshift-rd-m5185m.json) | 387.5 g | Manufacturer-listed 387.5 g for the original RD-M5185M medium-cage steel Acolyte 1×8 rear derailleur with SpringLock clutch, in the 2021 catalogue. This is distinct from the later Ver.2 RD-M5185M-B, whose weight is not transferred. | [microSHIFT 2021 manufacturer catalogue, PDF spread 8 / printed page 11: original RD-M5185M, 387.5 g](https://www.microshift.com/wp-content/uploads/2021/04/microSHIFT_Catalog_2021-20210401.pdf#page=8) |
| [SL-M7180-R](../data/components/microshift-sl-m7180-r.json) | 139 g | Manufacturer-listed 139 g for one SL-M7180-R right-hand Acolyte 1×8 Xpress trigger shifter with indicator and aluminum handlebar clamp; not a left/right pair. The 2021 catalogue identifies this exact control. | [microSHIFT 2021 manufacturer catalogue, PDF spread 8 / printed page 11: SL-M7180-R right-hand 1×8 control with indicator, aluminum clamp, 139 g](https://www.microshift.com/wp-content/uploads/2021/04/microSHIFT_Catalog_2021-20210401.pdf#page=8) |
| [RD23-SR12WRL](../data/components/campagnolo-rd23-sr12wrl.json) | 295 g | Manufacturer-listed 295 g for the original Super Record Wireless twelve-speed rear derailleur, RD23-SR12WRL. The product page does not state whether its removable battery is included in this weight; no battery mass is added or deducted. This reference is not assigned to Super Record S. | [Campagnolo Super Record Wireless twelve-speed rear derailleur: published 295 g reference; battery inclusion unspecified](https://www.campagnolo.com/au-en/super-record-wireless-rear-derailleur/CRDSUPERRECORDWRLDB12S.html) |
| [RD02-SR13WRL](../data/components/campagnolo-rd02-sr13wrl.json) | 286 g | Manufacturer-listed 286 g for the Super Record thirteen-speed wireless rear derailleur, RD02-SR13WRL, with its battery included. This is the road model, not the Nano Clutch or X assembly. | [Campagnolo Super Record 13 road rear derailleur: 286 g, battery included](https://www.campagnolo.com/us-en/super-record-13-rear-derailleur/CRDSUPERRECORD13.html) |
| [FD02-SR13WRL](../data/components/campagnolo-fd02-sr13wrl.json) | 153 g | Manufacturer-listed 153 g for the braze-on Super Record thirteen-speed wireless front derailleur, FD02-SR13WRL, with its battery included; no clamp adapter is selected. | [Campagnolo Super Record 13 braze-on front derailleur: 153 g, battery included](https://www.campagnolo.com/ca-en/super-record-13-front-derailleur/CFDSUPERRECORD13.html) |
| [FD03-RE13WRL](../data/components/campagnolo-fd03-re13wrl.json) | 142 g | Manufacturer-listed 142 g for the braze-on Record thirteen-speed wireless double front derailleur, FD03-RE13WRL. The product page does not state battery inclusion for this figure; no battery mass is added or deducted and no clamp adapter is selected. | [Campagnolo Record 13 braze-on front derailleur: published 142 g reference; battery inclusion unspecified](https://www.campagnolo.com/be-en/record-13-front-derailleur/CFDRECORD13.html) |
| [FDSRS-2WL](../data/components/campagnolo-fdsrs-2wl.json) | 130 g | Manufacturer-listed 130 g for the braze-on Super Record S Wireless twelve-speed double front derailleur, FDSRS-2WL. The product page does not state battery inclusion for this figure; no battery mass is added or deducted and no clamp adapter is selected. This is not a weight for the original FD23-SR12WRL. | [Campagnolo Super Record S Wireless braze-on front derailleur: published 130 g reference; battery inclusion unspecified](https://www.campagnolo.com/ro-en/super-record-s-wireless-front-derailleur-/CFDSUPERRECORDSWRLDB12S.html) |

## Source interpretation

The original microSHIFT 2021 catalogue was checked visually at PDF **spread 8**, printed **page 11**. It explicitly lists **387.5 g for RD-M5185M**, separately from the non-clutch RD-M5180M. The later 2025 **RD-M5185M-B Ver.2 / 387 g** row is a different revision and remains distinct. This older exact-model reference resolves the missing weight without rounding or transferring the later model’s mass.

The same 2021 spread explicitly describes **SL-M7180-R as a right-hand 1×8 shifter**, with indicator and aluminum clamp, and prints **139 g**. It uses the existing genuine-single-control exception. No left-hand unit or calculated pair is created.

Campagnolo’s dedicated Super Record 13 product pages explicitly say **battery included** for both the 286 g rear and 153 g front references. The 295 g original twelve-speed rear, 142 g Record 13 front and 130 g Super Record S front pages do not state battery inclusion in their weight entries. Their descriptions retain that limitation, and no battery inclusion/exclusion flag is invented. Front references use their existing braze-on identities; no separate clamp adapter is included or inferred. These manufacturer figures are reference weights, not contributor measurements.

The original **FD23-SR12WRL** front derailleur remains unknown: the newer product page alone does not resolve its documented single-hole versus later mounting-position distinction. The S and original Super Record models do not inherit each other’s weights. Super Record 13 Nano Clutch and X rear assemblies are likewise not assigned the road rear-derailleur weight.

## References left unresolved

- SRAM’s reviewed Eagle crank service pages list specific arm/ring/guard configurations, but do not resolve the explicit bottom-bracket-exclusion gap already recorded in those catalogue entries. Those weights remain null; neither installation instructions nor a list of compatible bottom brackets is treated as proof of what was weighed.
- The Force 1 service page’s 542 g BB30 / 42T / 172.5 mm entry likewise does not explicitly resolve bottom-bracket inclusion in this pass.
- SRAM’s RED shift/brake system figure is a combined lever/caliper/hydraulic-system reference. It is not copied into the shifter-pair weight.
- The conflicting microSHIFT long-cage and cassette figures documented in the existing records remain unresolved. No conflicting figures are selected, averaged or transferred between revisions.

The [weight guidelines](weights-guidelines.md) remain unchanged. This is a bounded source review, not a claim that every remaining missing weight has been exhausted.
