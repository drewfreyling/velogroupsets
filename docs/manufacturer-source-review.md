# Manufacturer source review

Reviewed on **14 November 2026**. This pass adds **two previously unknown weights** and **19 specification fields** across **16 existing components**. Component identities, groupset memberships and technical-document URLs are preserved.

External component indexes were used to discover documents. Each adopted fact was checked against the manufacturer page or original manufacturer publication below. Index entries, retailer descriptions and independent measurements are not evidence for these additions. The review is a partial gap-filling pass, not a claim of complete catalogue coverage.

## Weights

| Component | Weight | Manufacturer reference |
| --- | --- | --- |
| [RD20-CH12](../data/components/campagnolo-rd20-ch12.json) | 220 g | [Campagnolo Chorus twelve-speed mechanical rear derailleur](https://www.campagnolo.com/us-en/chorus-12-speed-rear-derailleur/CRDCHORUS12S.html), Specifications → Weight |
| [RD18-CEB1M](../data/components/campagnolo-rd18-ceb1m.json) | 230 g | [Campagnolo Centaur eleven-speed medium-cage rear derailleur](https://www.campagnolo.com/us-en/centaur-rear-derailleur/CRDCENTAURBLACK11S.html), Specifications → Weight |

These are manufacturer-listed reference weights, not contributor measurements.

## SRAM derailleur limits

The exact-model product pages explicitly support cassettes with **10T smallest sprockets**. That fills the previously null smallest-sprocket field for these models. It does not establish total capacity or maximum front chainring difference by arithmetic.

| Models | Manufacturer compatibility statement |
| --- | --- |
| [RD-RED-E-E1](https://www.sram.com/en/sram/models/rd-red-e-e1), [RD-FRC-E-E1](https://www.sram.com/en/sram/models/rd-frc-e-e1), [RD-RIV-E-E1](https://www.sram.com/en/sram/models/rd-riv-e-e1) | 10–28T through 10–36T cassettes |
| [RD-RIV-E-D1](https://www.sram.com/en/sram/models/rd-riv-e-d1) | 10–28T, 10–30T, 10–33T and 10–36T cassettes |
| [RD-RED1-E-D1](https://www.sram.com/en/sram/models/rd-red1-e-d1), [RD-RIV1-E-D1](https://www.sram.com/en/sram/models/rd-riv1-e-d1), [RD-FRC-1E-D2](https://www.sram.com/en/sram/models/rd-frc-1e-d2) | 1x with 10–44T XPLR and 10–36T cassettes |
| [RD-APX-1E-D1](https://www.sram.com/en/sram/models/rd-apx-1e-d1) | 1x with 11–44T XPLR, 10–44T XPLR and 10–36T cassettes; the 11T option is not a minimum restriction |
| [RD-RED-1E-E1](https://www.sram.com/en/sram/models/rd-red-1e-e1), [RD-FRC-1E-E1](https://www.sram.com/en/sram/models/rd-frc-1e-e1), [RD-RIV-1E-E1](https://www.sram.com/en/sram/models/rd-riv-1e-e1) | 1x with a 10–46T thirteen-speed XPLR cassette |

Two support articles independently establish **39T total capacity**:

- [SRAM RED eTap AXS, explicitly the 36T-max derailleur](https://support.sram.com/hc/en-us/articles/6496587341723-What-is-the-total-drivetrain-tooth-capacity-of-the-SRAM-RED-eTap-AXS-36T-Max-rear-derailleur): applied to RD-RED-E-E1. It is not extended to the older D1 family's 33T reference or to XPLR.
- [SRAM Rival eTap AXS](https://support.sram.com/hc/en-us/articles/6067481878171-What-is-the-total-drivetrain-tooth-capacity-of-Rival-eTap-AXS-rear-derailleurs): applied to the documented 36T-max RD-RIV-E-D1. It is not extended to Rival XPLR.

Existing largest-sprocket limits remain unchanged. The minimum size of the **largest** cassette sprocket is a separate property and is not copied into the smallest-sprocket field.

## Campagnolo crankset dimensions

The original [Campagnolo 1998 technical specifications](https://www.campyonly.com/images/catalogs/1998/1998_tech_specs.pdf), **printed p. 8 / PDF p. 10**, explicitly identify these exact item codes:

| Component | Matching bottom-bracket spindle | Nominal chainline |
| --- | --- | --- |
| [FC-21RE](../data/components/campagnolo-fc-21re.json) | 102 mm | 43.5 mm |
| [FC-21CH](../data/components/campagnolo-fc-21ch.json) | 102 mm | 43.5 mm |
| [FC-21AT](../data/components/campagnolo-fc-21at.json) | 111 mm | 43.5 mm |

The spindle figure describes the matching bottom bracket, not a spindle included in the crankset. This original manufacturer scan is a supplementary citation; it does not change the approved archive rules for primary technical documents.

## Leads not adopted

- The 1998 sheet's **365 g Record lever pair is EC-19RECG**, not our earlier EC-09RECG. Likewise its Chorus pair is EC-19CHCG, not EC-09CHCG. Similar family names do not establish the same assembly.
- The same sheet lists 632 g for FC-21RE, but does not identify the weighed crank length and chainring combination. Its crankset weights remain null under the [weight guidelines](weights-guidelines.md).
- The original [2004 Campagnolo product catalogue](https://www.campagnolo-sirer.cz/img/cms/Produktove_katalogy_Campagnolo/2004_Campagnolo%20product%20catalogue.pdf) describes a newer Record carbon seatpost with a carbon top clamp. Its 185 g reference is not transferred to our earlier SP-10RE assembly without an exact model match.
- Generic current product weights for front derailleurs, cranksets and hydraulic controls are insufficient where the weighed mount, crank/ring configuration, pair basis or brake-system inclusion remains unclear. Those records retain null weights.
- SRAM's [general RED/Force eTap AXS capacity article](https://support.sram.com/hc/en-us/articles/6496285693339-What-is-the-total-drivetrain-tooth-capacity-of-SRAM-RED-or-Force-eTap-AXS-rear-derailleurs) currently says **36T**, without identifying a max-sprocket variant. It does not support a blanket 39T value for newer Force models or a 34T XPLR claim. No such values were added.

No weights were calculated by adding individual controls, subtracting accessories or transferring figures between adjacent model revisions.
