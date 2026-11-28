# Shimano road pedals and press-fit bottom-bracket weights

Reviewed on **28 November 2026**. This pass fills the existing **BB-RS500-PB** weight and adds **five pedal records**, for six newly recorded manufacturer weights. Existing IDs, memberships, primary documents and previously known weights remain unchanged.

## BB-RS500-PB: 71 g

The [2017–2018 specifications v2.8, PDF page 176 / printed page 173](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=176) explicitly names **BB-RS500-PB** in the **86.5 mm press-fit shell** row beneath the BB-RS500-P column heading. That column gives an average weight of **71 g**. The [exact manufacturer drawing](https://si.shimano.com/en/pdfs/ev/BB-RS500-PB-4626/EV-BB-RS500-PB-4626.pdf) independently identifies the complete press-fit assembly and its inner cover/O-rings.

The existing [BB-RS500-PB record](../data/components/shimano-bb-rs500-pb.json) retains its HOLLOWTECH II interface, primary document and Tiagra/GRX memberships. Its reference now identifies the 86.5 mm shell and the 71 g manufacturer average. This is the explicitly named PB assembly; no equivalence between arbitrary P/PB suffixes or a neighboring threaded-column weight is assumed.

BB-MT500-PA remains unknown: the [MTB bottom-bracket table, PDF page 71 / printed page 68](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf#page=71) identifies that assembly in its installation rows but leaves its average weight blank. The nearby 58 g XTR reference does not supply its mass.

## Road pedal pairs

The [2018 TSS manual, PDF/printed page 411](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=411) explicitly labels each figure **Average weight (pair)**. Each new record retains that pair basis and cites the exact model service drawing.

| Component | Reference configuration | Pair weight | Corroborating manufacturer product page |
| --- | --- | ---: | --- |
| [PD-R550](../data/components/shimano-pd-r550.json) | SPD-SL | 310 g | [2018 TSS, page 283](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=283) |
| [PD-R540](../data/components/shimano-pd-r540.json) | SPD-SL | 330 g | Same page |
| [PD-R540-LA](../data/components/shimano-pd-r540-la.json) | Lighter-spring-action SPD-SL | 330 g | Same page |
| [PD-A530](../data/components/shimano-pd-a530.json) | SPD binding on one face, flat platform on the other | 383 g | [2018 TSS, page 289](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=289) |
| [PD-A520](../data/components/shimano-pd-a520.json) | Single-sided SPD binding | 315 g | [2018 TSS, page 290](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=290) |

The [Tiagra 4700 chart, page 171](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=171) and [Sora R3000 chart, page 174](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2018_TSS_MANUAL_EN.pdf#page=174) explicitly list all five as pedal options. Each shared model has one canonical record referencing both families.

The [PD-R540 service drawing](https://si.shimano.com/en/pdfs/ev/PD-R540-2304/EV-PD-R540-2304D.pdf) separately identifies **PD-R540-LA**, its lighter spring tension and distinct binding/spring parts. Its own published 330 g pair total is retained; it is not inferred from the standard model’s equal figure. Cleat and loose-accessory inclusion is not specified by the weight row, so no inclusion claim, doubling or accessory subtraction is made.

See the [weight guidelines](weights-guidelines.md) and [MTB SPD pedal review](shimano-spd-pedal-weights.md).
