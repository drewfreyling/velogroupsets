# Catalogue weight review

Reviewed on 16 November 2026. This pass fills **78 previously unknown weights** in existing records: **34 Shimano and 44 Campagnolo**. No component identities, group memberships, technical-document URLs or API contracts change. Catalogue figures remain manufacturer-listed references, not contributor measurements.

The quoted gap counts predated recent inventory additions. The baseline for this review is commit `7ea1d41`; it contains 1,385 components, including 206 cranksets and 238 shifter records. Counts below cover the six requested types only.

## Results

| Type | Records | Unknown before | Weights added | Unknown after |
| --- | ---: | ---: | ---: | ---: |
| Cranksets | 206 | 143 | 1 | 142 |
| Rear derailleurs | 320 | 130 | 30 | 100 |
| Front derailleurs | 209 | 122 | 18 | 104 |
| Shifters | 238 | 142 | 27 | 115 |
| Front hubs | 34 | 22 | 1 | 21 |
| Rear hubs | 43 | 30 | 1 | 29 |

The six types have **511 unknown weights remaining**, down from 589. This is a source review, not a claim of complete weight coverage.

## Publications and matching

Sources are original manufacturer product catalogues, trade manuals and specification handbooks. Archive hosts preserve the original publication; their own descriptions are not specification evidence. Existing manufacturer technical documents remain unchanged. Supporting citations do not expand the technical-document archive exception.

| Reference | Publication | Pages used (PDF numbering) |
| --- | --- | --- |
| S05 | [Shimano 2005 Trade Sales Support Manual](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2005_Trade_Sales_Support_Manual.pdf) | 73, 75, 85 |
| S06 | [Shimano 2006 Trade Sales Support Manual](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2006_Trade_Sales_Support_Manual.pdf) | 81, 133, 182–183, 187 |
| S07 | [Shimano 2007 Trade Sales Support Manual](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2007_Trade_Sales_Support_Manual.pdf) | 91, 210 |
| S08 | [Shimano 2008 Trade Support Manual](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/2008_Trade_Support_Manual.pdf) | 192 |
| S14 | [Shimano 2014–2015 specification handbook](https://productinfo.shimano.com/pdfs/product/archive/2014-2015_Specifications_v020_en.pdf) | 6, 108 |
| S17 | [Shimano 2017–2018 specification handbook](https://productinfo.shimano.com/pdfs/product/archive/2017-2018_Specifications_v028_en.pdf) | 10, 31–32, 43, 144 |
| S25 | [Shimano 2025–2026 specification handbook, v3.5](https://productinfo.shimano.com/pdfs/product/archive/2025-2026_Specifications_v035_en.pdf) | 8–9, 31, 35–36, 101–103, 118, 123, 125 |
| C01 | [Campagnolo 2001 product catalogue](https://www.campagnolo-sirer.cz/img/cms/Produktove_katalogy_Campagnolo/2001_Campagnolo%20product%20catalogue.pdf) | 35 |
| C08 | [Campagnolo 2008 product catalogue](https://www.campagnolo-sirer.cz/img/cms/Produktove_katalogy_Campagnolo/2008_Campagnolo%20product%20catalogue.pdf) | 4, 18, 21, 23 |
| C13 | [Campagnolo 2013 product catalogue](https://www.campagnolo-sirer.cz/img/cms/Produktove_katalogy_Campagnolo/2013_Campagnolo%20product%20catalogue.pdf) | 125, 133, 137 |
| C17 | [Campagnolo 2017 product catalogue](https://www.campagnolo-sirer.cz/img/cms/Produktove_katalogy_Campagnolo/2017_Campagnolo%20product%20catalogue.pdf) | 35–38 |

Campagnolo's product names are matched to the existing complete-assembly codes in the corresponding spare-parts publications, rather than transferring a family weight across generations. For example, the 2008 Mirage/Xenon tables describe the 2008 ten-speed assemblies, not the earlier eight-speed hubs or derailleurs bearing the same range names. The [2008 Part B hub drawings](https://www.bikeschematics.com/wp-content/uploads/schematics/Campagnolo/Campagnolo%20Spare%20Parts%202008%20-%20Part%20B.pdf#page=18) identify the HB7/FH7 Record family and 32/36-hole shells; the existing 2017 assembly table identifies the exact 32-hole HB7-RE2 and FH7-RE2 codes. The 2008 product-table footnote explicitly excludes quick releases. No skewer weight is deducted.

Shimano rear weights retain the selected cage reference used for existing capacity limits. Where a generic record had no selected cage, the newly sourced weight names its actual reference cage. A band-clamp front derailleur uses an explicitly identified diameter: for example, Shimano's L-size 34.9 mm reference, and FD-M960's explicitly labelled M-size 31.8 mm reference. Di2 front assemblies requiring separate mounting adapters are not silently treated as weighed clamp assemblies.

Campagnolo's 2017 front-derailleur rows explicitly describe braze-on assemblies with optional clamp kits. The new weights describe the braze-on version without those kits, distinguishing the S2-equipped versions. Ergopower weights describe the complete left/right assembly identified by the manufacturer's pair code. Shimano pair weights come from explicit per-pair rows or complete shift-lever-set tables; SL-M640 remains a genuine single right-hand control.

## Added reference weights

Each linked JSON record contains the identifying configuration and exact source citation. Page references below use the publication keys above.

| Model | Weight (g) | Reference |
| --- | ---: | --- |
| [FC-RX600](../data/components/shimano-fc-rx600.json) | 817 | S25, 118 |
| [RD01-DA210](../data/components/campagnolo-rd01-da210.json) | 223 | C01, 35 |
| [RD11-AT1](../data/components/campagnolo-rd11-at1.json) | 209 | C13, 133 |
| [RD11-VLBXM](../data/components/campagnolo-rd11-vlbxm.json) | 260 | C17, 38 |
| [RD11-VLBXS](../data/components/campagnolo-rd11-vlbxs.json) | 227 | C17, 38 |
| [RD13-AT1EPS](../data/components/campagnolo-rd13-at1eps.json) | 225 | C13, 125 |
| [RD13-ATB13](../data/components/campagnolo-rd13-atb13.json) | 216 | C13, 137 |
| [RD13-CEBX3](../data/components/campagnolo-rd13-cebx3.json) | 238 | C13, 137 |
| [RD13-VLBX3](../data/components/campagnolo-rd13-vlbx3.json) | 238 | C13, 137 |
| [RD17-POB1M](../data/components/campagnolo-rd17-pob1m.json) | 211 | C17, 38 |
| [RD17-POB1S](../data/components/campagnolo-rd17-pob1s.json) | 209 | C17, 38 |
| [RD7-COXL](../data/components/campagnolo-rd7-coxl.json) | 238 | C08, 23 |
| [RD7-CP9L](../data/components/campagnolo-rd7-cp9l.json) | 263 | C08, 23 |
| [RD7-MIXM](../data/components/campagnolo-rd7-mixm.json) | 274 | C08, 18 |
| [RD7-MIXS](../data/components/campagnolo-rd7-mixs.json) | 269 | C08, 18 |
| [RD7-RAXL](../data/components/campagnolo-rd7-raxl.json) | 275 | C08, 23 |
| [RD7-XEXM](../data/components/campagnolo-rd7-xexm.json) | 258 | C08, 21 |
| [RD7-XEXS](../data/components/campagnolo-rd7-xexs.json) | 253 | C08, 21 |
| [RD-M510](../data/components/shimano-rd-m510.json) | 300 | S05, 85 |
| [RD-M580](../data/components/shimano-rd-m580.json) | 311 | S06, 187 |
| [RD-M600](../data/components/shimano-rd-m600.json) | 428 | S06, 187 |
| [RD-M640](../data/components/shimano-rd-m640.json) | 275 | S17, 32 |
| [RD-M7000-11](../data/components/shimano-rd-m7000-11.json) | 323 | S17, 31 |
| [RD-M760](../data/components/shimano-rd-m760.json) | 262 | S05, 75 |
| [RD-M800](../data/components/shimano-rd-m800.json) | 395 | S05, 73 |
| [RD-M8050](../data/components/shimano-rd-m8050.json) | 319 | S25, 9 |
| [RD-M820](../data/components/shimano-rd-m820.json) | 280 | S25, 31 |
| [RD-M9050](../data/components/shimano-rd-m9050.json) | 295 | S25, 8 |
| [RD-M960](../data/components/shimano-rd-m960.json) | 205 | S06, 81 |
| [RD-M970](../data/components/shimano-rd-m970.json) | 199 | S07, 91 |
| [RD-RX815](../data/components/shimano-rd-rx815.json) | 287 | S25, 102 |
| [FD15-CH2B](../data/components/campagnolo-fd15-ch2b.json) | 76 | C17, 37 |
| [FD15-CH2BEPS](../data/components/campagnolo-fd15-ch2beps.json) | 149 | C17, 37 |
| [FD15-CH2BS2](../data/components/campagnolo-fd15-ch2bs2.json) | 79 | C17, 37 |
| [FD15-RE2B](../data/components/campagnolo-fd15-re2b.json) | 75 | C17, 36 |
| [FD15-RE2BEPS](../data/components/campagnolo-fd15-re2beps.json) | 133 | C17, 36 |
| [FD15-RE2BS2](../data/components/campagnolo-fd15-re2bs2.json) | 78 | C17, 36 |
| [FD15-SR2B](../data/components/campagnolo-fd15-sr2b.json) | 71 | C17, 35 |
| [FD15-SR2BEPS](../data/components/campagnolo-fd15-sr2beps.json) | 127 | C17, 35 |
| [FD15-SR2BS2](../data/components/campagnolo-fd15-sr2bs2.json) | 74 | C17, 35 |
| [FD17-POB2B](../data/components/campagnolo-fd17-pob2b.json) | 94 | C17, 38 |
| [FD-M510](../data/components/shimano-fd-m510.json) | 128 | S05, 85 |
| [FD-M530](../data/components/shimano-fd-m530.json) | 167 | S06, 183 |
| [FD-M600](../data/components/shimano-fd-m600.json) | 174 | S06, 183 |
| [FD-M660](../data/components/shimano-fd-m660.json) | 155 | S25, 36 |
| [FD-M7020](../data/components/shimano-fd-m7020.json) | 147 | S17, 43 |
| [FD-M770](../data/components/shimano-fd-m770.json) | 152 | S25, 35 |
| [FD-M960](../data/components/shimano-fd-m960.json) | 132 | S06, 182 |
| [FD-RX815](../data/components/shimano-fd-rx815.json) | 135 | S25, 103 |
| [EP01-DA10](../data/components/campagnolo-ep01-da10.json) | 399 | C01, 35 |
| [EP11-AT1C](../data/components/campagnolo-ep11-at1c.json) | 372 | C13, 133 |
| [EP12-RE1CEPS](../data/components/campagnolo-ep12-re1ceps.json) | 266 | C17, 36 |
| [EP12-SR1CEPS](../data/components/campagnolo-ep12-sr1ceps.json) | 262 | C17, 35 |
| [EP13-AT1CEPS](../data/components/campagnolo-ep13-at1ceps.json) | 288 | C13, 125 |
| [EP13-CEBX3C](../data/components/campagnolo-ep13-cebx3c.json) | 376 | C13, 137 |
| [EP13-VLBX3C](../data/components/campagnolo-ep13-vlbx3c.json) | 376 | C13, 137 |
| [EP15-CH1C](../data/components/campagnolo-ep15-ch1c.json) | 350 | C17, 37 |
| [EP15-CH1CEPS](../data/components/campagnolo-ep15-ch1ceps.json) | 293 | C17, 37 |
| [EP15-RE1C](../data/components/campagnolo-ep15-re1c.json) | 348 | C17, 36 |
| [EP15-SR1C](../data/components/campagnolo-ep15-sr1c.json) | 342 | C17, 35 |
| [EP15-VLBXC](../data/components/campagnolo-ep15-vlbxc.json) | 368 | C17, 38 |
| [EP17-POB1C](../data/components/campagnolo-ep17-pob1c.json) | 370 | C17, 38 |
| [EP7-MIXC](../data/components/campagnolo-ep7-mixc.json) | 352 | C08, 18 |
| [EP7-XEXC](../data/components/campagnolo-ep7-xexc.json) | 363 | C08, 21 |
| [SL-BS79](../data/components/shimano-sl-bs79.json) | 153 | S17, 144 |
| [SL-M640](../data/components/shimano-sl-m640.json) | 127 | S17, 10 |
| [SL-M670](../data/components/shimano-sl-m670.json) | 265 | S17, 10 |
| [SL-M760](../data/components/shimano-sl-m760.json) | 260 | S07, 210 |
| [SL-M770](../data/components/shimano-sl-m770.json) | 255 | S08, 192 |
| [SL-M780](../data/components/shimano-sl-m780.json) | 255 | S14, 6 |
| [SL-M970](../data/components/shimano-sl-m970.json) | 215 | S07, 210 |
| [ST-4600](../data/components/shimano-st-4600.json) | 510 | S14, 108 |
| [ST-7803](../data/components/shimano-st-7803.json) | 420 | S06, 133 |
| [ST-R8150](../data/components/shimano-st-r8150.json) | 295 | S25, 125 |
| [ST-R8170](../data/components/shimano-st-r8170.json) | 391 | S25, 123 |
| [ST-RX815](../data/components/shimano-st-rx815.json) | 373 | S25, 101 |
| [HB7-RE2](../data/components/campagnolo-hb7-re2.json) | 116 | C08, 4 |
| [FH7-RE2](../data/components/campagnolo-fh7-re2.json) | 231 | C08, 4 |

## Unresolved evidence

- **Cranksets:** only FC-RX600 gains a compliant weight in this pass: the FC-RX600-11 reference, 170 mm, 46/30T, explicitly without the bottom bracket. The -10 and -1 variants have distinct weights and are not merged into that reference. Shimano's 2005–2008 trade tables commonly include the bottom bracket, including FC-M960/M760 and the contemporary road Hollowtech II totals. Several later handbook totals do too. No bottom-bracket mass is subtracted. Campagnolo's later catalogues often provide one “lighter specification” weight beside several arm lengths and chainring combinations; that does not establish an exact weighed combination. These figures remain withheld under the [weight guidelines](weights-guidelines.md).
- **Shifters:** Shimano often publishes individual-side figures, for example SL-M8000 and ST-R8000. At the time of this review they were kept separate. From 19 November 2026, the revised [shifter rules](weights-guidelines.md#shifters) permit a clearly labelled sum of separately manufacturer-published left/right figures for the exact matching configuration; doubling a side remains prohibited. SRAM's hydraulic shift/brake-system figures cannot become standalone control-pair weights.
- **Front derailleurs:** a shared figure beside braze-on and several clamp options is insufficient to identify a weighed mount. No diameter is selected merely because it is an available option. Original Campagnolo 1997 codes and later similarly named ranges remain distinct.
- **Hubs:** 50 remain unknown. Many older catalogues include quick releases; some Shimano handbooks describe weights without an axle or other hardware. Neither a skewer-inclusive total nor a stripped-axle total is silently relabelled as a complete hub without its skewer. Campagnolo's 2017 Super Record table also conflicts with the adjacent Record hub table; this pass cross-checks the consistent 2017 Record table against the 2008 table, explicit exclusion footnote and assembly match instead.
- **Other remaining models:** this pass adds no SRAM or microSHIFT weights. The existing model- and configuration-specific manufacturer evidence is retained; range-name similarity, a later revision or a general compatibility listing does not resolve a missing mass. Further original catalogues, exact manufacturer weight references or compliant contributor measurements are still needed.

The remaining counts describe absent compliant evidence in this catalogue, not proof that the manufacturers never published a weight. Future reviews should concentrate on configuration-specific crank references, exact cage variants and explicit hub-skewer exclusions.

The [20 November 2026 source review](weight-review-2026-11-20.md) subsequently fills nine existing brake, bottom-bracket and cassette weights, with exact configuration references. The counts above remain the results of this earlier review.

The [targeted Shimano MTB crank review](shimano-mtb-crank-weights.md) records the later FC-M550 weight, separate FC-M730-SG and FC-M751 references and remaining measurement queue.

The [28 November 2026 weight review](weight-review-2026-11-28.md) subsequently fills seven microSHIFT and Campagnolo weights, with model and battery-inclusion limitations recorded.

The [period Shimano brake and derailleur review](shimano-period-brake-weights.md) subsequently adds six components with qualified weights, preserving the earlier records and reference configurations.

The [Shimano MTB control and crank review](shimano-mtb-control-crank-weights.md) adds three revision-specific control pairs and two qualified crankset references, including both calculated side weights and explicit bottom-bracket exclusion.

The [Shimano MTB derailleur follow-up](shimano-mtb-derailleur-weights.md) supplies two previously unknown SGS weights and five direct-mount front-derailleur weights, with a documented later sprocket-limit update.

The [Shimano MTB clamp-mounted front-derailleur review](shimano-mtb-clamp-weights.md) adds eight high/low-clamp variants with explicit 34.9 mm weight references.

The [SLX and outboard-chainline front-derailleur review](shimano-slx-front-derailleur-weights.md) covers nineteen qualified clamp/direct-mount references, including eleven further clamp and nine-speed additions, while preserving the existing FD-M7020 high-clamp identity.

The [MTB crank and clamp follow-up](shimano-mtb-crank-clamp-weights.md) adds three qualified 175 mm crank variants with BCDs and five 34.9 mm Deore XT front-derailleur references.

The [2014–2015 direct-mount front-derailleur review](shimano-2014-direct-mount-weights.md) adds seven model-specific weights, with explicit dual-pull selections and mounting-hardware uncertainty.

The [road front-derailleur variant review](shimano-road-front-weight-variants.md) adds seven explicitly L-size 34.9 mm band weights and the Tiagra FD-4603-F braze-on triple, with model/table alignment and clamp-size evidence.

The [Shimano SPD pedal-pair review](shimano-spd-pedal-weights.md) adds seven corroborated pair weights with source-backed family options and documents three unresolved pin/platform references.
