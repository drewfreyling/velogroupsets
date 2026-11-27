# Shimano MTB derailleur weight follow-up

Reviewed on **28 November 2026**. Shimano’s [2017–2018 specifications, v2.8](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf) supplies **seven additional weights**: two previously unknown rear-derailleur weights and five newly catalogued direct-mount front derailleurs. Existing IDs, primary documents, memberships and positive weights remain unchanged.

## Rear derailleurs

| Component | Reference configuration | Weight |
| --- | --- | ---: |
| [RD-M771-SGS](../data/components/shimano-rd-m771-sgs.json) | Deore XT, nine-speed, SGS | 238 g |
| [RD-M772-SGS](../data/components/shimano-rd-m772-sgs.json) | Deore XT Shadow, nine-speed, SGS | 229 g |

[PDF page 31 / printed page 28](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=31) publishes separate model columns and average weights per derailleur. Both retain 45T total capacity, 22T maximum front difference and an 11T smallest sprocket. RD-M771-SGS retains its 34T largest sprocket.

The later table explicitly lists **36T** as RD-M772-SGS’s largest sprocket, compared with the selected 2009 reference’s 34T. Its canonical maximum is updated to the later documented 36T limit, with both sources retained. The 229 g figure is not copied from the existing 227 g GS record. Earlier primary documents remain linked, even where they did not supply a weight.

## Direct-mount front derailleurs

| Component | Reference configuration | Weight | Manufacturer weight reference |
| --- | --- | ---: | --- |
| [FD-M771-D](../data/components/shimano-fd-m771-d.json) | Deore XT, 3×9-speed, down swing | 147 g | [PDF 41 / printed 38](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=41) |
| [FD-M8000-D](../data/components/shimano-fd-m8000-d.json) | Deore XT, 3×11-speed, side swing | 136 g | [PDF 38 / printed 35](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=38) |
| [FD-M8020-D](../data/components/shimano-fd-m8020-d.json) | Deore XT, 2×11-speed, side swing | 134 g | [PDF 39 / printed 36](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=39) |
| [FD-M9000-D](../data/components/shimano-fd-m9000-d.json) | XTR, 3×11-speed, side swing | 117 g | [PDF 36 / printed 33](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=36) |
| [FD-M9020-D](../data/components/shimano-fd-m9020-d.json) | XTR, 2×11-speed, side swing | 116 g | [PDF 37 / printed 34](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=37) |

Every selected column explicitly identifies **Direct Mount**. The weight-row heading specifies **direct type w/ bolt**, so the mounting bolt is included. These are manufacturer-identified direct-mount assemblies under the [front-derailleur guidelines](weights-guidelines.md#front-derailleurs); no clamp diameter is invented and no clamp or E-type mass is transferred. The manufacturer exploded views linked on the records confirm the exact model or shared model family, while the specification columns establish each D-suffix mount and its weight. The series rows establish XTR or Deore XT membership.

## Reference left unresolved

The same handbook’s [FC-M8000-B1 column, PDF 63 / printed 60](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=63) lists 30T/32T chainring options but associates its 698 g reference with 36T. That internally inconsistent configuration is not added as a qualified crankset weight, nor silently corrected to an assumed tooth count.
