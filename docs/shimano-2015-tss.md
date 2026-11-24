# Shimano 2015 TSS: XTR, XT and SLX weight references

Reviewed on **24 November 2026** from the [manufacturer-hosted 2015 TSS manual](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2015_TSS_MANUAL.pdf). The PDF has **268 pages**. PDF and printed page numbers match in the selected MTB sections.

This pass adds **18 components, all with qualified manufacturer weights**. It adds no groupsets and changes no existing component record, positive mass, canonical ID, model number or primary document. The catalogue now contains four manufacturers, **277 groupsets and 2,117 components**.

| Range | Inventory before | Inventory after |
| --- | --- | --- |
| XTR M9000 | 4 | 9 |
| XTR Di2 M9050 | 3 | 4 |
| Deore XT M780 | 4 | 12 |
| SLX M670 | 4 | 8 |

## Eight cage-specific rear references

| Exact model | Weight | Total capacity printed in this source | PDF / printed page |
| --- | --- | --- | --- |
| RD-M9000-GS | 221 g | Not specified | 18 |
| RD-M9050-GS | 289 g | Not specified | 22 |
| RD-M781-GS | 234 g | 35T | 28 |
| RD-M781-SGS | 238 g | 43T | 28 |
| RD-M786-GS | 262 g | 35T | 28 |
| RD-M786-SGS | 266 g | 43T | 28 |
| RD-M675-GS | 306 g | 35T | 36 |
| RD-M675-SGS | 313 g | 43T | 36 |

The [XT table, page 28](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2015_TSS_MANUAL.pdf#page=28), explicitly names **M781**, not M780. These new identities do not rename the existing RD-M780 or transfer its configuration. Likewise, SLX **M675 SHADOW RD+** remains separate from the existing **M670 SHADOW RD** records.

All eight records identify the actual cage and rear speed count. The selected tables do not print cage-specific largest/smallest sprocket limits or maximum front differences, so those three required fields remain explicit nulls. XTR's unprinted total capacities also remain null. No limit is borrowed from a neighbouring cage, later model, compatible cassette or chainring arithmetic. A sourced mass does not establish undocumented compatibility.

The existing **RD-M9050** record keeps its selected **295 g SGS** reference from the later handbook. The 2015 spread separately prints 292 g for SGS; that older figure does not overwrite the selected reference or justify a second SGS identity. Only the previously missing GS variant is added at its directly printed 289 g.

## Three complete shifter pairs

| Exact model / mount | Pair weight | PDF / printed page |
| --- | --- | --- |
| SL-M9000-I, I-spec II | 205 g | 16 |
| SL-M780-B-I, I-spec | 220 g | 26 |
| SL-M670-B-I, I-spec | 237 g | 34 |

Each weight explicitly says **Pair** and names the corresponding mount variant. No single side is doubled. The I-spec suffixes are retained exactly, including the letter **I**; they are not numeric `1` model codes. The band-mounted SL-M9000 / M780 / M670 records and their known pair weights remain unchanged.

The XTR product family is labelled 3/2/1×11; the XT/SLX products are labelled 3/2×10 with mode converters. Those available front modes are recorded without reclassifying the weighed pair as a genuine single right-hand 1× control.

The 2015 **SW-M9050 128 g pair** figure does not overwrite its existing selected **132 g pair** reference from another manufacturer edition. No side mass or revised control assembly is inferred from that difference.

## Three cassette configurations

| Exact model | Weighed configuration | Weight | PDF / printed page |
| --- | --- | --- | --- |
| CS-M9000 | 11-speed 11–40T | 331 g | 18 |
| CS-M771-10 | 10-speed 11–32T | 294 g | 28 |
| CS-HG81-10 | 10-speed 11–32T | 317 g | 36 |

CS-M9000's complete printed sequence is **11/13/15/17/19/21/24/27/31/35/40T**. The other two tables name the weighed 11–32T reference separately from their available 11–34T and 11–36T options; those alternatives do not receive the selected mass. Unprinted individual tooth sequences are not invented. Cassette lockring inclusion follows the contribution convention.

Membership comes from the named XTR, XT and SLX product sections. Further Di2 memberships are not inferred solely from compatibility.

## Two bottom brackets and two front derailleurs

The [XTR crank/BB page, 17](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2015_TSS_MANUAL.pdf#page=17), directly lists **SM-BB93 threaded HOLLOWTECH II at 73 g** and **SM-BB94-41A press-fit HOLLOWTECH II at 58 g**. They remain distinct model identities with their actual interface and installation type. A weighed shell dimension is not specified; no subtraction of the advertised weight differences is used.

The [XT page, 26](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2015_TSS_MANUAL.pdf#page=26), explicitly says **“Direct mount (FD-M785-E2)”** and **“Direct mount (FD-M786-D)”**, assigning **127 g** and **146 g** respectively. These are manufacturer-identified direct-mount double-front, ten-speed assemblies: top swing for FD-M785-E2 and down swing for FD-M786-D. They do not require choosing a weighed clamp diameter, and they do not inherit the neighbouring band-model weights.

This classification follows the manufacturer's explicit wording. It is not a general rule that every E/E2/D suffix means the same mount, nor an assertion that an older bottom-bracket-plate E-type is a modern direct-mount assembly.

## Figures withheld and remaining review

The selected crank figures do not identify weighed arm lengths and therefore do not replace existing qualified crank references. Hub figures do not establish skewer exclusion. Bare disc-caliper, lever, rotor and front-kit figures are not transferred across assembly types or used without all required hardware/position/length qualifications.

Clamped front-derailleur weights do not identify an actual weighed band, and modular Di2 front-body/adapter masses are not combined into a presumed mounting configuration. Unreviewed D/E mount descriptions are not silently mapped to a modern mount category.

This is a focused XTR/XT/SLX follow-up, not a complete import of all 268 pages. Deore, Alivio and lower-range inventories, further front-mount variants, disc systems, other years' precise rear limits, and road sections remain further review material. Existing qualified manufacturer references are preserved when another edition gives a different figure.

The [2014 catalogue follow-up](shimano-2014-catalogue.md) subsequently supplies the missing sprocket and front-difference limits for the six XT/SLX records while preserving their selected weights.
