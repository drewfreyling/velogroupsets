# Campagnolo component coverage audit

Reviewed on **15 November 2026**. This update fills all **30 previously empty Campagnolo groupsets**, adding **61 component identities** and documenting further memberships for four existing shared components. All **61 Campagnolo groupsets** now contain at least one sourced component. Stable IDs and start years are preserved. The full catalogue contains **1,179 components across 238 groupsets and four manufacturers**.

These are starter inventories. A populated group is not a complete build kit: Campagnolo brake calipers, many hubs and other variants still need review. Weights remain unknown for 48 of the new identities; no crank or hub weight is inferred from a generic family figure.

## Previously empty ranges

| Groupset | Sourced component models now listed |
| --- | --- |
| [Gran Sport 1003](../data/groupsets/campagnolo-gran-sport-original.json) | [1005/2](../data/components/campagnolo-1005-2.json), [1012/4](../data/components/campagnolo-1012-4.json), [1014](../data/components/campagnolo-1014.json) |
| [Record 1032](../data/groupsets/campagnolo-record-original.json) | [1012/4](../data/components/campagnolo-1012-4.json), [1014](../data/components/campagnolo-1014.json), [1037](../data/components/campagnolo-1037.json), [1044](../data/components/campagnolo-1044.json), [1046](../data/components/campagnolo-1046.json), [1049](../data/components/campagnolo-1049.json) |
| [Athena 9-speed](../data/groupsets/campagnolo-athena-9-speed.json) | [EC-09ATCG](../data/components/campagnolo-ec-09atcg.json), [FC-21AT](../data/components/campagnolo-fc-21at.json), [RD-09AT](../data/components/campagnolo-rd-09at.json) |
| [Racing Triple 9-speed](../data/groupsets/campagnolo-racing-triple-9-speed.json) | [FD-11SRA3](../data/components/campagnolo-fd-11sra3.json), [RD-09RA3](../data/components/campagnolo-rd-09ra3.json) |
| [Veloce 9-speed](../data/groupsets/campagnolo-veloce-9-speed.json) | [EC-09VLCG](../data/components/campagnolo-ec-09vlcg.json), [FD-41SVL](../data/components/campagnolo-fd-41svl.json), [RD-09VL](../data/components/campagnolo-rd-09vl.json) |
| [Mirage 9-speed](../data/groupsets/campagnolo-mirage-9-speed.json) | [EC-09MICG](../data/components/campagnolo-ec-09micg.json), [FD-11SMI](../data/components/campagnolo-fd-11smi.json), [RD-09MI](../data/components/campagnolo-rd-09mi.json) |
| [Chorus 10-speed](../data/groupsets/campagnolo-chorus-10-speed.json) | [EP00-CH10CG](../data/components/campagnolo-ep00-ch10cg.json), [RD00-CH210](../data/components/campagnolo-rd00-ch210.json), [RD00-CH210L](../data/components/campagnolo-rd00-ch210l.json) |
| [Daytona 9-speed](../data/groupsets/campagnolo-daytona-9-speed.json) | [EP00-DA09CG](../data/components/campagnolo-ep00-da09cg.json), [RD00-DA209](../data/components/campagnolo-rd00-da209.json) |
| [Record 10-speed](../data/groupsets/campagnolo-record-10-speed.json) | [EP00-RE10CG](../data/components/campagnolo-ep00-re10cg.json), [RD00-RE210](../data/components/campagnolo-rd00-re210.json), [RD00-RE210L](../data/components/campagnolo-rd00-re210l.json) |
| [Daytona 10-speed](../data/groupsets/campagnolo-daytona-10-speed.json) | [EP01-DA10](../data/components/campagnolo-ep01-da10.json), [RD01-DA210](../data/components/campagnolo-rd01-da210.json) |
| [Centaur 10-speed](../data/groupsets/campagnolo-centaur-10-speed.json) | [EP02-CE10](../data/components/campagnolo-ep02-ce10.json), [RD02-CE210](../data/components/campagnolo-rd02-ce210.json) |
| [Centaur 9-speed](../data/groupsets/campagnolo-centaur-9-speed.json) | [EP02-CE09](../data/components/campagnolo-ep02-ce09.json), [RD02-CE209](../data/components/campagnolo-rd02-ce209.json) |
| [Xenon 9-speed](../data/groupsets/campagnolo-xenon-9-speed.json) | [EP02-XE09](../data/components/campagnolo-ep02-xe09.json) |
| [Champ Triple 9-speed](../data/groupsets/campagnolo-champ-triple-9-speed.json) | [RD7-CP9L](../data/components/campagnolo-rd7-cp9l.json) |
| [Comp Triple 10-speed](../data/groupsets/campagnolo-comp-triple-10-speed.json) | [RD7-COXL](../data/components/campagnolo-rd7-coxl.json) |
| [Mirage 10-speed](../data/groupsets/campagnolo-mirage-10-speed.json) | [EP7-MIXC](../data/components/campagnolo-ep7-mixc.json), [RD7-MIXM](../data/components/campagnolo-rd7-mixm.json), [RD7-MIXS](../data/components/campagnolo-rd7-mixs.json) |
| [Race Triple 10-speed](../data/groupsets/campagnolo-race-triple-10-speed.json) | [RD7-RAXL](../data/components/campagnolo-rd7-raxl.json) |
| [Xenon 10-speed](../data/groupsets/campagnolo-xenon-10-speed.json) | [EP7-XEXC](../data/components/campagnolo-ep7-xexc.json), [RD7-XEXM](../data/components/campagnolo-rd7-xexm.json), [RD7-XEXS](../data/components/campagnolo-rd7-xexs.json) |
| [Athena 11-speed](../data/groupsets/campagnolo-athena-11-speed.json) | [EP11-AT1C](../data/components/campagnolo-ep11-at1c.json), [FD11-AT2B](../data/components/campagnolo-fd11-at2b.json), [RD11-AT1](../data/components/campagnolo-rd11-at1.json) |
| [Athena EPS 11-speed](../data/groupsets/campagnolo-athena-eps-11-speed.json) | [EP13-AT1CEPS](../data/components/campagnolo-ep13-at1ceps.json), [FD13-AT2BEPS](../data/components/campagnolo-fd13-at2beps.json), [RD13-AT1EPS](../data/components/campagnolo-rd13-at1eps.json) |
| [Centaur Triple 10-speed](../data/groupsets/campagnolo-centaur-triple-10-speed.json) | [EP13-CEBX3C](../data/components/campagnolo-ep13-cebx3c.json), [FC13-CEB0092](../data/components/campagnolo-fc13-ceb0092.json), [FD13-CEB3B](../data/components/campagnolo-fd13-ceb3b.json), [OC13-CEG](../data/components/campagnolo-oc13-ceg.json), [OC13-CEI](../data/components/campagnolo-oc13-cei.json), [RD13-CEBX3](../data/components/campagnolo-rd13-cebx3.json) |
| [Veloce Triple 10-speed](../data/groupsets/campagnolo-veloce-triple-10-speed.json) | [EP13-VLBX3C](../data/components/campagnolo-ep13-vlbx3c.json), [FD13-VLB3B](../data/components/campagnolo-fd13-vlb3b.json), [OC13-CEG](../data/components/campagnolo-oc13-ceg.json), [OC13-CEI](../data/components/campagnolo-oc13-cei.json), [RD13-VLBX3](../data/components/campagnolo-rd13-vlbx3.json) |
| [Record 12-speed](../data/groupsets/campagnolo-record-12-speed.json) | [RD20-RE124](../data/components/campagnolo-rd20-re124.json) |
| [Super Record 12-speed](../data/groupsets/campagnolo-super-record-12-speed.json) | [RD20-SR124](../data/components/campagnolo-rd20-sr124.json) |
| [Super Record EPS 12-speed](../data/groupsets/campagnolo-super-record-eps-12-speed.json) | [RD19-SR12EPS](../data/components/campagnolo-rd19-sr12eps.json) |
| [Super Record S Wireless 12-speed](../data/groupsets/campagnolo-super-record-s-wireless-12-speed.json) | [RDSRS-2WL](../data/components/campagnolo-rdsrs-2wl.json) |
| [Super Record 1x13](../data/groupsets/campagnolo-super-record-1x13.json) | [RD02-SR13WRLC](../data/components/campagnolo-rd02-sr13wrlc.json) |
| [Super Record All Road 13-speed](../data/groupsets/campagnolo-super-record-all-road-13-speed.json) | [RD02-SR13WRLC](../data/components/campagnolo-rd02-sr13wrlc.json) |
| [Super Record Ultra 13-speed](../data/groupsets/campagnolo-super-record-ultra-13-speed.json) | [CS02-UL1303](../data/components/campagnolo-cs02-ul1303.json), [CS02-UL1316](../data/components/campagnolo-cs02-ul1316.json) |
| [Record 13-speed](../data/groupsets/campagnolo-record-13-speed.json) | [RD03-RE13DHWRL](../data/components/campagnolo-rd03-re13dhwrl.json) |

## Source review and assembly identity

The original manufacturer plates and spare-parts books establish complete assemblies. Their component codes are distinct from replacement cages, lever bodies, chain guards and compatibility markings. The catalogue 12 Gran Sport group plate lists 1012/4, 1014 and 1005/2; catalogue 14 lists the shared derailleur/control pair within Record road group 1032, plus 1037 pedals, 1044 seatpost, 1046 bottom bracket and 1049 crankset. Combined hub-set codes are not repurposed as individual front/rear hubs.

The 1998, 1999, 2000, 2001, 2002 and 2008 manufacturer spare-parts books distinguish the nine-/ten-speed and cage revisions. In particular, the 2002 Xenon rear-derailleur plate repeats Veloce assembly codes; that apparent error is not used to create a Xenon derailleur identity. EP02-XE09 provides verified component coverage instead. The 2013 manufacturer diagrams and distributor range sheet identify Athena, Athena EPS and the Centaur/Veloce triples. The Veloce triple crank entries have conflicting tooth descriptions in the range sheet, so no crank configuration is inferred from them.

Current manufacturer pages establish the twelve-/thirteen-speed products. Distributor and retailer identifiers are used only to match exact complete-assembly codes to those primary specifications. Record and Super Record mechanical twelve-speed RD20 revisions are distinct from their original launch revisions. RDSRS-2WL remains separate from RD23-SR12WRL. RD02-SR13WRLC is the Nano Clutch assembly listed by Campagnolo for both [Super Record 1×13](https://www.campagnolo.com/us-en/super-record-1x13/) and [Super Record All Road](https://www.campagnolo.com/ca-en/super-record-2x13-all-road/); it is not substituted for the existing non-clutch RD02-SR13WRL. Ultra is represented by its documented cassette upgrades, without inventing an Ultra derailleur.

## Compliant manufacturer-listed weights

| Models | Reference configuration | Weight |
| --- | --- | --- |
| RD-09AT | 1998 short-cage nine-speed assembly | 237 g |
| RD-09RA3 | 1998 long-cage nine-speed triple assembly | 261 g |
| RD-09VL | 1998 short-cage nine-speed assembly | 251 g |
| EC-09ATCG | Complete left/right nine-speed Ergopower pair | 435 g |
| EC-09VLCG | Complete left/right nine-speed Ergopower pair | 453 g |
| RD20-RE124 | Record mechanical twelve-speed, 34T-compatible revision | 216 g |
| RD20-SR124 | Super Record mechanical twelve-speed, 34T-compatible revision | 181 g |
| RD19-SR12EPS | Complete Super Record twelve-speed wired EPS derailleur | 234 g |
| RDSRS-2WL | Complete Super Record S twelve-speed wireless derailleur | 269 g |
| RD02-SR13WRLC | Nano Clutch rear derailleur, with battery | 315 g |
| RD03-RE13DHWRL | Record thirteen-speed direct-mount rear derailleur, without battery | 297 g |
| CS02-UL1303 | Complete thirteen-speed Ultra cassette, 10–33T | 215 g |
| CS02-UL1316 | Complete thirteen-speed Ultra cassette, 11–36T | 238 g |

The original [1998 technical specifications](https://www.campyonly.com/images/catalogs/1998/1998_tech_specs.pdf) provide the first five weights: PDF pages 17–18 for derailleurs and page 25 for complete control pairs. The remaining figures are attached to the current manufacturer product pages linked by their records. Do not copy weights between revisions or add a battery inclusion that the manufacturer does not state. Cassette lockring inclusion is assumed under the [weight guidelines](weights-guidelines.md). All unsupported weights and derailleur limits remain explicitly null.

## Exact archived publications reviewed

The review checked the original Campagnolo plates, diagrams, group headings and complete assembly codes rather than archive commentary. The technical-document exception is extended only to these exact publications; it does not approve arbitrary documents on their hosts:

- [Original Campagnolo catalogue 12, printed page 15: Gran Sport group 1003 and complete component codes](https://ebykr.com/wp-content/uploads/2026/10/ebykr-campagnolo-catalogo-12-p17-scaled.webp).
- [Original Campagnolo catalogue 14, printed page 4: Record road group 1032 and complete component codes](https://ebykr.com/wp-content/uploads/2026/10/ebykr-campagnolo-catalogo-14-p06.webp).
- [Original Campagnolo 1998 - Part A spare-parts catalogue](https://www.bikeschematics.com/wp-content/uploads/schematics/Campagnolo/Campagnolo%20Spare%20Parts%201998%20-%20Part%20A.pdf).
- [Original Campagnolo 1999 - Part B spare-parts catalogue](https://www.bikeschematics.com/wp-content/uploads/schematics/Campagnolo/Campagnolo%20Spare%20Parts%201999%20-%20Part%20B.pdf).
- [Original Campagnolo 2000 - Part B spare-parts catalogue](https://www.bikeschematics.com/wp-content/uploads/schematics/Campagnolo/Campagnolo%20Spare%20Parts%202000%20-%20Part%20B.pdf).
- [Original Campagnolo 2001 spare-parts catalogue](https://www.bikeschematics.com/wp-content/uploads/schematics/Campagnolo/Campagnolo%20Spare%20Parts%202001.pdf).
- [Original Campagnolo 2002 spare-parts catalogue](https://www.bikeschematics.com/wp-content/uploads/schematics/Campagnolo/Campagnolo%20Spare%20Parts%202002.pdf).
- [Original Campagnolo 2008 - Part A spare-parts catalogue](https://www.bikeschematics.com/wp-content/uploads/schematics/Campagnolo/Campagnolo%20Spare%20Parts%202008%20-%20Part%20A.pdf).
- [Original Campagnolo 2013 spare-parts catalogue part A](https://www.bikeschematics.com/wp-content/uploads/schematics/Campagnolo/Campagnolo%20Spare%20Parts%202013%20-%20Part%20A.pdf).
- [Original Campagnolo 2014 EPS configuration chart: Athena EPS MY2013 complete assembly codes](https://www.starbike.com/data-sheets/Campagnolo/2014/campagnolo-super-record-eps-2014-groupset-configuration-comparison.pdf).

The [archive policy](campagnolo-record.md#approved-archived-manufacturer-documents) and validator restrict these sources to Campagnolo with exact HTTPS host/path matches. Query strings, credentials, ports, lookalike hosts and unreviewed neighbouring editions are rejected. Normal manufacturer-hosted documents remain valid. Source review establishes provenance; offline validation cannot verify a live document's factual content.

## Regression coverage

The public catalogue test rejects empty Campagnolo groupsets. Desktop/mobile browser tests follow Athena's model-number links, verify its complete control-pair weight and citation, check the shared Nano Clutch identity through both groups, and retain separate Ultra cassette configurations in the static API. Archive-boundary tests protect the exact source exceptions.
