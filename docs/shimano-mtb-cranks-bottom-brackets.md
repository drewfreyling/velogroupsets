# Shimano MTB crank options and bottom-bracket weights

Reviewed on **28 November 2026**. This pass adds **six weighted components** with exact manufacturer references: two FC-MT700 cranksets and four threaded/press-fit bottom brackets. Existing component records, positive weights, IDs and primary documents remain unchanged.

## Qualified references

| Component | Weighed configuration | Weight | Manufacturer reference |
| --- | --- | ---: | --- |
| [FC-MT700-2](../data/components/shimano-fc-mt700-2.json) | 175 mm, 36/26T, without bottom bracket or chain/bash guard | 735.4 g | [2017–2018 specifications v2.8, PDF 64 / printed 61](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=64) |
| [FC-MT700-B2](../data/components/shimano-fc-mt700-b2.json) | 170 mm, 36/26T, without bottom bracket or chain/bash guard | 728 g | [2025–2026 specifications v3.5, PDF 53 / printed 50](https://productinfo.shimano.com/pdfs/product/archive/2025-2026_Specifications_v035_en.pdf#page=53) |
| [SM-BB80](../data/components/shimano-sm-bb80.json) | HOLLOWTECH II threaded assembly, selected 68/73 mm shell-width reference | 95 g | [2025–2026 specifications, PDF 61 / printed 58](https://productinfo.shimano.com/pdfs/product/archive/2025-2026_Specifications_v035_en.pdf#page=61) |
| [SM-BB71-41A](../data/components/shimano-sm-bb71-41a.json) | Exact A press-fit assembly; table lists 89.5/92 mm shell options | 71 g | Same table |
| [SM-BB71-41C](../data/components/shimano-sm-bb71-41c.json) | Exact C press-fit assembly; table lists 104.5/107 mm shell options | 73 g | Same table |
| [BB-MT800-PC](../data/components/shimano-bb-mt800-pc.json) | Exact PC press-fit assembly; table lists 104.5/107 mm shell options | 71 g | Same table |

The crankset headings explicitly identify the reference arm length and **without BB**. Both selected masses identify 36/26T chainrings; the mounting rows select no chain/bash guard. The B2 record uses the later actual 170 mm reference preferred by the [weight guidelines](weights-guidelines.md#cranksets). FC-MT700-2 retains its actual 175 mm figure without length conversion or bottom-bracket subtraction. No claim is made that other chainring combinations have these same masses.

The [shared manufacturer drawing](https://si.shimano.com/en/pdfs/ev/FC-MT700-2-3898/EV-FC-MT700-2-3898B.pdf) explicitly names **FC-MT700-2 and FC-MT700-B2**, confirms 36/26T and 34/24T options, and gives **96/64 mm outer/inner bolt circles**. The standard crank has a **48.8 mm chainline** and a documented special spider angle; B2 has a **51.8 mm chainline**. Matching BCD alone does not establish chainring interchangeability.

## Source-backed range options

The [2018 M8000 chart, PDF/printed page 27](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=27) and [M8050 chart, page 34](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=34) explicitly list both FC-MT700 cranksets. The M8050 chart selects 36/26T. These Shimano-branded cranks are recorded as manufacturer-listed range options, with one identity per model shared by both groupsets.

The [2014–2015 Saint M820 chart, PDF 10 / printed 8](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Line-up_chart_all_v016_en.pdf#page=10) lists **SM-BB80, SM-BB71-41A and SM-BB71-41C**, explicitly identifying C for FC-M825. The same original line-up explicitly lists A for [Deore XT M780, PDF 11](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Line-up_chart_all_v016_en.pdf#page=11), [SLX M670, PDF 13](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Line-up_chart_all_v016_en.pdf#page=13), [ZEE M640, PDF 15](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Line-up_chart_all_v016_en.pdf#page=15) and [Deore M610, PDF 16](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Line-up_chart_all_v016_en.pdf#page=16). Those references share one A record rather than duplicating it by range.

The [2018 ZEE chart, PDF/printed page 58](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=58) explicitly lists **SM-BB71-41C for FC-M645**. The [2025–2026 Saint chart, PDF 27 / printed 25](https://productinfo.shimano.com/pdfs/product/archive/2025-2026_Line-up_chart_v033_en.pdf#page=27) lists **SM-BB80, SM-BB71-41C and BB-MT800-PC**. These memberships come from the actual range charts; generic interface compatibility does not establish other memberships.

## Bottom-bracket configuration limits

The SM-BB80 specification gives **95 g for 68/73 mm** and **96 g for 83 mm**. This record selects the 95 g reference and retains its width qualification; the 83 mm figure is not merged into it. These are the bottom-bracket assemblies, independent of the crankset weights above.

For each press-fit model, the table publishes one exact-model average alongside two available shell widths without identifying a single weighed width. The descriptions retain that limitation and list the widths as options. No width is invented, no spacer mass is deducted and equal masses do not imply interchangeable parts. These assemblies do not use a square-taper spindle, so the square-taper spindle-length requirement does not apply.

The [BB-MT800-P drawing](https://si.shimano.com/en/pdfs/ev/BB-MT800-P-4621/EV-BB-MT800-P-4621.pdf) explicitly distinguishes **PA and PC** complete assemblies and their different inner covers. The existing BB-MT800-PA weight and source remain unchanged. The nearby BB-MT500-PA and SM-BB52 weight cells remain blank in the reviewed specification table; neither receives an adjacent model’s figure.
