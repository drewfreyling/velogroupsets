# Shimano front-derailleur weight review

On 14 November 2026, the requested **33 model records** were checked against selected manufacturer catalogues and specification handbooks. **Eight previously null weights** now have identified mounting references; **25 remain null** because a qualified model/mount/diameter reference was not established.

## Confirmed references

All figures below are manufacturer-listed, not contributor measurements. Braze-on references exclude a separate clamp adapter. Clamp weights must identify the actual diameter or a single documented band range under the [weight guidelines](weights-guidelines.md).

| Catalogue model | Weight | Reference mount | Selected source |
| --- | --- | --- | --- |
| FD-1056-B | 105 g | Clamp, 28.0–28.6 mm band | [Shimano 1994 dealer manual, PDF/printed page 52: FD-1056-B, 105 g, 28.0–28.6 mm band](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/1994_Shimano_Bicycle_System_Component_Dealer_Product_Manual.pdf#page=52) |
| FD-4600-F | 89 g | Braze-on | [Shimano 2014–2015 specifications, printed page 120 (PDF page 123): FD-4600-F braze-on, 89 g](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=123) |
| FD-6770-F | 167 g | Braze-on | [Shimano 2014–2015 specifications, printed page 190 (PDF page 193): FD-6770-F braze-on, 167 g](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=193) |
| FD-7703 | 103 g | Braze-on, FD-7703-F | [Shimano 2005 Trade Sales Support Manual, printed page 130 (PDF page 118): FD-7703-F 103 g versus FD-7703-B 113 g](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2005_Trade_Sales_Support_Manual.pdf#page=118) |
| FD-7803 | 106 g | Braze-on, FD-7803-F | [Shimano 2008 Trade Support Manual, PDF/printed page 200: FD-7803-F braze-on, 106 g](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2008_Trade_Support_Manual.pdf#page=200) |
| FD-7900 | 67 g | Braze-on, FD-7900-F | [Shimano 2012 Trade-Sales Manual, PDF/printed page 121: FD-7900-F, 67 g](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2012_Shimano_Trade-Sales_Manual.pdf#page=121) |
| FD-7970 | 124 g | Braze-on, FD-7970-F | [Shimano 2012 Trade-Sales Manual, PDF/printed page 127: FD-7970-F ten-speed Di2 front derailleur, 124 g](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2012_Shimano_Trade-Sales_Manual.pdf#page=127) |
| FD-R8150 | 110 g | Braze-on | [Shimano 2025–2026 specifications, printed page 127 (PDF page 130): FD-R8150 braze-on with fixing screw, 110 g](https://productinfo.shimano.com/pdfs/product/archive/2025-2026_Specifications_v035_en.pdf#page=130) |

FD-1056-B’s 1994 reference explicitly couples **105 g** to its **28.0–28.6 mm band**, resolving the earlier reference’s missing diameter. This is a documented band range, not a choice between independently sized clamps.

FD-7703, FD-7803, FD-7900 and FD-7970 retain their existing generic model IDs and URLs. Their `specifications.mount` and weight descriptions now explicitly select the cited F/braze-on configuration. That does not assert equal weight for clamp variants. In particular, the 2005 FD-7703-B figure is 113 g, distinct from the selected 103 g F reference.

FD-R8150’s table expressly includes its fixing screw in the direct-type weight. The clamp adapter is listed separately and is not included.

The 2014–2015 handbook lists FD-6770-F at **167 g**. The [2017–2018 handbook, PDF p. 237 / printed p. 234](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=237), later lists **160 g** with its fixing bolt. Both citations are preserved; the canonical record selects the explicit 2014–2015 reference and does not average the figures or invent an explanation for the difference.

## Unresolved records

A published mass without the required mounting configuration is not a compliant canonical weight. Raw figures mentioned below remain source notes rather than `weight_g` values.

| Model | Why the weight remains unknown / reviewed reference |
| --- | --- |
| FD-2200 | [2006 TSS p. 193](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2006_Trade_Sales_Support_Manual.pdf#page=193) lists **113 g for FD-2200-B**, but does not identify which available clamp diameter was weighed. It is not a braze-on weight. |
| FD-2300 | [2013 TSS, PDF p. 243 / printed p. 244](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2013_Trade_Sales_Support_Manual.pdf#page=243) lists the B/F mounting variants but leaves their average-weight cells blank. |
| FD-2400-F | [2014–2015 specifications, PDF p. 124 / printed p. 121](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=124) identifies the braze-on model but gives a dash for its average weight. |
| FD-3300 | [2006 TSS p. 193](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2006_Trade_Sales_Support_Manual.pdf#page=193) lists **110 g for each band version**, with 28.6/31.8 mm options and no weighed diameter. The braze-on versions do not receive that figure. |
| FD-3400 | [2008 TSS p. 201](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2008_Trade_Support_Manual.pdf#page=201) identifies mounting options but leaves the corresponding weight cells blank. Older 3300/4400 figures are not substituted. |
| FD-3500-F | [2014–2015 specifications, PDF p. 124 / printed p. 121](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=124) identifies the braze-on model but gives a dash for its average weight. |
| FD-4400 | [2006 TSS p. 193](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2006_Trade_Sales_Support_Manual.pdf#page=193) lists **110 g for each band version**, with 28.6/31.8 mm options and no weighed diameter. The braze-on versions do not receive that figure. |
| FD-4500 | [2008 TSS p. 201](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2008_Trade_Support_Manual.pdf#page=201) identifies mounting options but leaves the corresponding weight cells blank. Older 3300/4400 figures are not substituted. |
| FD-4700-F | [2017–2018 specifications, PDF p. 166 / printed p. 163](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=166) gives a dash for the braze-on model; the 2025–2026 handbook likewise omits its mass. |
| FD-5000 | No qualified period weight located for this exact Santé model. The later FD-5001 model is not treated as the same identity. |
| FD-7200 | [June 1984 component book p. 41](https://www.disraeligears.co.uk/site/shimano_bicycle_system_components_june_1984_-_page_41.html) gives **102 g** under a shared FD-7200/7210 heading. The band and braze-on assemblies differ, and the 28.0/28.6 mm band options do not identify the weighed assembly. |
| FD-7210 | [June 1984 component book p. 41](https://www.disraeligears.co.uk/site/shimano_bicycle_system_components_june_1984_-_page_41.html) identifies FD-7210 as braze-on but does not assign the shared **102 g** figure specifically to that assembly. A band figure is not converted by subtraction. |
| FD-7300 | [June 1984 component book p. 41](https://www.disraeligears.co.uk/site/shimano_bicycle_system_components_june_1984_-_page_41.html) gives **96 g for the band type**, but lists two distinct clamp parts for 28.0 mm and 28.6 mm. The weighed diameter is not specified; these are not one documented adjustable band range. |
| FD-A050 | [2014–2015 specifications, PDF p. 124 / printed p. 121](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=124) lists the matching A050 / A070-A models but gives no average weight. No figure is borrowed from another Tourney model. |
| FD-A070 | [2014–2015 specifications, PDF p. 124 / printed p. 121](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf#page=124) lists the matching A050 / A070-A models but gives no average weight. No figure is borrowed from another Tourney model. |
| FD-A250 | The August 1988 *New System Component Family for Every Riding Style* p. 9 identifies these earlier Exage models but supplies no weight there. No qualified model/mount/diameter reference was located; later A300/A400/A500 figures are not substituted. |
| FD-A410 | [1995 dealer manual p. 53](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/1995_Shimano_Dealer_Sales_Support_Manual.pdf#page=53) identifies the clamp-mounted RSX model and diameter options but leaves its weight blank. The adjacent RX100 weight does not apply. |
| FD-A416 | No qualified period weight located for these later eight-speed RSX double/triple variants. Neither FD-A410 nor neighbouring RX100 figures establish their masses. |
| FD-A417 | No qualified period weight located for these later eight-speed RSX double/triple variants. Neither FD-A410 nor neighbouring RX100 figures establish their masses. |
| FD-A450 | The August 1988 *New System Component Family for Every Riding Style* p. 9 identifies these earlier Exage models but supplies no weight there. No qualified model/mount/diameter reference was located; later A300/A400/A500 figures are not substituted. |
| FD-A451 | The August 1988 *New System Component Family for Every Riding Style* p. 9 identifies these earlier Exage models but supplies no weight there. No qualified model/mount/diameter reference was located; later A300/A400/A500 figures are not substituted. |
| FD-R2000-F | [2017–2018 specifications, PDF p. 168 / printed p. 165](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=168) gives a dash for the braze-on weight; the newer 2025–2026 table does too. |
| FD-R3000-F | [2017–2018 specifications, PDF p. 167 / printed p. 164](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=167) gives a dash for the braze-on weight; the newer 2025–2026 table does too. |
| FD-R4000-F | [2025–2026 specifications, PDF p. 162 / printed p. 159](https://productinfo.shimano.com/pdfs/product/archive/2025-2026_Specifications_v035_en.pdf#page=162) identifies the braze-on model but gives no average weight. Earlier TSS editions predate this model. |
| FD-U6030-F | [2025–2026 specifications, PDF p. 219 / printed p. 216](https://productinfo.shimano.com/pdfs/product/archive/2025-2026_Specifications_v035_en.pdf#page=219) identifies the braze-on CUES variant but does not publish an average weight. |

## Scope and source handling

This review uses the [dealer-manual source index](shimano-dealer-manuals.md), cached period table scans, the 1984 component book and the manufacturer-hosted 2014–2015, 2017–2018 and 2025–2026 specification handbooks. Exact adopted PDF/printed page numbers are recorded above and in each component. Selected TSS tables supplement the shorter handbooks: an empty or dash cell in a later handbook does not invalidate an explicitly qualified earlier reference.

OCR and PDF text were discovery aids; adopted values and mounting configurations were checked against the relevant table images. This is a model-specific review, not a claim that every page of every indexed edition has been exhausted. Existing manufacturer-hosted technical-document links, IDs and memberships are preserved. Archived manufacturer scans are source evidence; no new technical-document archive exception is introduced.
