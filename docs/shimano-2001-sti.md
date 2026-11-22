# Shimano 2001 STI hub and Deore service review

Reviewed on **23 November 2026** from the [manufacturer-hosted 2001 Shimano STI manual](https://na.s-tec.shimano.com/s3_assets/filelibrary/STI/1993-2012_STI/2001_Shimano_STI.pdf). The PDF contains **184 pages**; its archive disclaimer explicitly identifies the information as updated in 2001. PDF and printed page numbers differ, so citations record both and URL fragments use PDF pages.

This targeted pass adds **15 components** and enriches **four existing records**, with citations on four existing groupsets. It adds no new ranges or qualified weights. Existing identities, primary technical documents, start years and known masses are preserved. The catalogue contains four manufacturers, 271 groupsets and 1,954 components after this batch.

## Missing MTB hubs

The manufacturer tables on [PDF page 83 / printed page 89](https://na.s-tec.shimano.com/s3_assets/filelibrary/STI/1993-2012_STI/2001_Shimano_STI.pdf#page=83) and [PDF page 84 / printed page 90](https://na.s-tec.shimano.com/s3_assets/filelibrary/STI/1993-2012_STI/2001_Shimano_STI.pdf#page=84) identify the exact models and their named series columns. They add twelve records:

| Range family | Front hubs | Rear hubs |
| --- | --- | --- |
| Deore XT M750 | HB-M750, HB-M755 | FH-M750, FH-M755 |
| Deore LX M560 | HB-M563, HB-M564 | FH-M563, FH-M565 |
| Deore LX M570 | HB-M570 | FH-M570 |
| Deore M510 | HB-M510 | FH-M510 |

These memberships describe the documented series/family inventory, not simultaneous launch dates or exclusive compatibility. Older and newer LX models appear in the same historical series table without being collapsed into one identity.

Each new front record retains the printed **100 mm over-locknut** reference. Rear records select the explicit **135 mm** row. FH-M563 additionally records the available 130 mm option, while its selected centre-to-flange/chainline dimensions come only from the 135 mm row; dimensions from the two rows are not mixed. Flange diameters and centre-to-flange distances are transcribed where printed. FH-M755's blank flange and speed cells are not filled from HB-M755 or another freehub.

The [Deore rear-drive instructions, PDF page 138 / printed page 144](https://na.s-tec.shimano.com/s3_assets/filelibrary/STI/1993-2012_STI/2001_Shimano_STI.pdf#page=138), independently identify FH-M510 as nine-speed with **32/36-hole options**. That row supplies spoke counts; the hub tables' spoke-hole *diameter* is not mistaken for a count.

Some hub rows publish masses, but neither table establishes that those masses exclude quick-release skewers. All twelve new weights therefore remain null with `weight_excludes_skewers: true` expressing the requirement for a future figure. No skewer deduction is estimated, and existing sourced weights are unchanged. The handwritten additions beside the HB-M555/FH-M555 rows are not treated as manufacturer specifications.

## Bottom brackets

| Model | Manufacturer evidence | Outcome |
| --- | --- | --- |
| BB-ES70 | PDF 60 / printed 66: explicitly described for Deore XT/LX, eight serrations and a 9 mm spline dimension | Added as a shared XT M750 / LX M570 component; weight unknown |
| BB-UN40 | PDF 136 / printed 142: named Deore front-drive table, 110/113 mm spindle rows | Added; weight unknown |
| BB-UN40-K | Same table: exact chaincase configuration, 117.5 mm spindle | Added separately; weight unknown |

The [BB-ES70 diagram](https://na.s-tec.shimano.com/s3_assets/filelibrary/STI/1993-2012_STI/2001_Shimano_STI.pdf#page=60) explicitly contrasts its spline dimensions with BB-M950/BB-M952 and warns that the models are not compatible. The nine-millimetre spline dimension is not a spindle length or a weight, and no XTR assembly is treated as an alias.

BB-UN40 and BB-UN40-K retain their separately printed model identities. Available spindle lengths do not establish a weighed spindle configuration. No mass is transferred from another UN model.

## Existing Deore configurations

The [front-drive service table, PDF page 136 / printed page 142](https://na.s-tec.shimano.com/s3_assets/filelibrary/STI/1993-2012_STI/2001_Shimano_STI.pdf#page=136), resolves details left open by the later technical charts:

- **FC-M510 and FC-M510-K:** explicitly listed 170/175 mm arms and 44/32/22T rings. Both records now select a **170 mm, 44/32/22T reference excluding the separately listed bottom bracket**. The previously documented alternative FC-M510 base-model gearing remains available in the data; no mass is inferred for either configuration.
- **FD-M510:** triple-front configuration and explicitly listed 47.5/50 mm chainline options. Its existing weighed 34.9 mm clamp reference, limits and mass remain unchanged.
- **RD-M510:** explicit **SGS** cage designation on PDF page 138 / printed page 144. Its nine-speed configuration, four limits and known weight were already present and are preserved.

The FC-M510 suffix variants added in the [2003 review](shimano-2003-sti.md) remain distinct. The newly sourced base/K crank lengths are not transferred to FC-M510-O or FC-M510-KO without an exact-model reference.

## Further source limits

The manual also contains older road hub tables, wheel specifications, flat-bar road controls, pedal instructions and hybrid/Nexave systems. Those sections are follow-up leads, not a claim of complete review. Whole-wheel masses are not bare-hub masses; generic pedal compatibility does not assign a pedal to an arbitrary groupset; hybrid assemblies are not forced into road or MTB. The selected pages do not establish a new compliant component weight.
