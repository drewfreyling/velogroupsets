# Shimano road crankset and cassette weights

Reviewed on **28 November 2026**. This pass adds **four weighted components**: three qualified 170 mm cranksets and the eleven-speed CS-HG800-11 cassette. Existing component records, IDs, memberships, primary documents and positive weights remain unchanged.

## Crankset references

| Component | Weighed configuration | Weight | BCD / spider | Manufacturer weight reference |
| --- | --- | ---: | --- | --- |
| [FC-RS510](../data/components/shimano-fc-rs510.json) | 170 mm, 50/34T, excludes bottom bracket | 908 g | 110 mm / four arms | [2017–2018 specifications v2.8, PDF 171 / printed 168](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=171) |
| [FC-RS500](../data/components/shimano-fc-rs500.json) | 170 mm, 46/36T, excludes bottom bracket | 790 g | 110 mm / five arms | Same table |
| [FC-CX50](../data/components/shimano-fc-cx50.json) | 170 mm, 46/36T, excludes bottom bracket | 798 g | 110 mm / five arms | [PDF 172 / printed 169](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=172) |

Both pages explicitly define their weight row as **170 mm, w/o BB**. The selected tooth counts are retained beside each mass. The exact manufacturer drawings linked on the records confirm the model identities, chainring combinations and 110 mm bolt circles. The four-arm and five-arm patterns remain distinct; matching BCD alone does not establish chainring interchangeability. These are actual 170 mm references under the [crankset guidelines](weights-guidelines.md#cranksets), with no length conversion or bottom-bracket subtraction.

The [2018 105 5800 range chart, PDF/printed page 166](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=166) explicitly lists FC-RS510 with 50/34T and FC-RS500 with 52/36T or 46/36T. This review selects the exact **46/36T** FC-RS500 option and its 790 g figure. The chart also explicitly excludes **FC-RS510 with FD-5800** and **FC-RS500 with FD-5801**. Those exclusions are retained in the records; inclusion in a range chart does not make every listed crank/front-derailleur combination compatible.

The [Tiagra 4700 range chart, page 171](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=171) explicitly lists FC-CX50 with 46/36T. These are manufacturer-listed crank options, with source-backed memberships rather than an inference from generic compatibility.

## CS-HG800-11 reference

The [2017–2018 specification table, PDF 179 / printed 176](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=179) explicitly identifies **CS-HG800-11**, **eleven speeds**, **11–34T** and **335 g** in the same column. Its increasing tooth sequence is **11/13/15/17/19/21/23/25/27/30/34T**, corroborated by the [exact manufacturer exploded view](https://si.shimano.com/en/pdfs/ev/CS-HG800-11-4302/EV-CS-HG800-11-4302.pdf).

The [Ultegra R8000 chart, 2018 page 156](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=156) and [Ultegra Di2 R8050 chart, page 161](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=161) both list this exact 11–34T cassette. One canonical record references both families. The charts place the 11–34T option alongside the GS derailleur configurations; this membership does not expand SS sprocket limits.

Lockring inclusion follows the project’s [cassette rule](weights-guidelines.md#cassettes). Spacer inclusion is not stated in the weight row; no spacer mass is added or deducted. CS-R8000 and other cassette models retain their own identities and references.
