# XT, DX and LX: the manufacturer-hosted 1990 dealer manual

Reviewed on 21 November 2026 from Shimano's [1990 Dealer Product Manual](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/1990_Dealer_Product_Manual.pdf). The file has 68 PDF pages. Its final page states copyright **August 1989** and print code `0889`; the archive's 1990 edition label is not used to infer component introduction dates. The selected specification tables are PDF pages 41, 47 and 51 / printed pages 38, 44 and 48.

This batch adds **ten records** and establishes **thirteen manufacturer-listed weights**: ten on new records and three previously unknown front-derailleur weights. It also fills RD-M650-SS's missing 13T maximum front difference. The complete catalogue now contains 1,457 records. Existing IDs, slugs, model numbers, memberships and primary technical documents are preserved.

## Qualified weight references

| Model | Weight | Exact reference configuration | PDF / printed page |
| --- | --- | --- | --- |
| FD-M735 | 116 g | Normal-band front derailleur, actual band fitting 28.0–28.6 mm | 41 / 38 |
| FD-M650 | 117 g | Normal-band front derailleur, actual band fitting 28.0–28.6 mm | 47 / 44 |
| FD-M550 | 119 g | Normal-band front derailleur, actual band fitting 28.0–28.6 mm | 51 / 48 |
| BB-M730 | 295 g | Complete square-taper BB set, 68 mm shell reference, 122.5 mm spindle | 41 / 38 |
| FC-MT60-SG | 740 g | SG triple crankset, 170 mm, 48/38/28T, excluding the separately listed BB-MT60 | 47 / 44 |
| BB-MT60 | 320 g | Complete square-taper BB set, 68 mm shell reference, 122.5 mm spindle | 47 / 44 |
| BB-M500 | 339 g | Complete square-taper BB set, 121.1 mm spindle, listed with FC-M550 | 51 / 48 |
| HP-M650 | 121 g | Complete off-road threaded headset | 47 / 44 |
| HP-M651 | 149 g | Separate complete off-road threaded headset | 47 / 44 |
| PD-MT60 | 412 g | Complete left/right pedal pair | 47 / 44 |
| PD-M650 | 385 g | Complete left/right pedal pair including toe clips | 47 / 44 |
| CS-HG90, E group | 325 g | Seven-speed 12–28T sprockets and spacers | 41 / 38 |
| ST-M060 | 326 g | Complete four-finger Rapidfire combined shift/brake pair, 22.2 mm clamps | 51 / 48 |

Each new primary technical-document URL points directly to the relevant **manufacturer-hosted specification table**, which identifies the model, group and reference configuration. These are complete technical tables, not retailer descriptions or generic manufacturer homepages. No source images or PDF bytes are committed.

## Configuration distinctions

### Normal bands resolve three front-derailleur gaps

These tables explicitly associate the normal-band weights with a **28.0–28.6 mm fitting range**, separately from the 31.8/34.9 mm EC clamp options. The records use `mount: "Clamp"`, `clamp_diameter_range_mm: [28, 28.6]` and the normal-band reference. This identifies the actual band rather than arbitrarily choosing a diameter from a list of different available clamps. The later 1991 pages alone had not resolved that weighed configuration.

### Cranks and bottom brackets remain separate

The DX table explicitly names **FC-MT60-SG**, gives 740 g for **170 mm / 48/38/28T**, and separately lists the 320 g BB-MT60 set. No BB mass is subtracted. The SG reference gets its own record; the existing unsuffixed FC-MT60 record and its unknown weight are preserved. The table offers both Biopace and round gearing without specifying which profile the 740 g reference uses; that limitation remains explicit.

BB-M730 and BB-MT60 have explicit `68-T-122.5` reference entries and 122.5 mm axle lengths. Their weighed thread variants are unspecified. The LX table names **BB-M500**, not BB-M550, and specifies a **121.1 mm** axle. Its identity and dimension are retained exactly rather than derived from the paired FC-M550 model number or rounded to a different spindle length. The weighed thread/shell variant is not identified.

### Headsets, pedals and controls

HP-M650 and HP-M651 have distinct model entries and weights; no common mass is inferred. Their weighed thread/race variants are unspecified. Both pedal figures explicitly say Pair; PD-M650 also explicitly includes toe clips but does not identify the weighed clip size. PD-MT60 accessory inclusion is unspecified.

The ST-M060 row explicitly says **326 g (4-Finger Type Pair)**. It is not a weight inferred from the nearby ST-M070/M071 or ST-M090/M091 references, and it is not transferred to a separate SL thumb shifter. The catalogue identifies seven-speed SIS compatibility.

### Cassette groups and rear-derailleur limits

The new CS-HG90 record is the **E-group 12–28T** combination: 12/14/16/18/21/24/28T. The weight includes spacers; lockring inclusion is assumed under the weight guidelines. The existing I-group 13–23T record remains distinct and retains its unknown weight while conflicting references are unresolved.

On PDF page 47, **RD-M650-SS explicitly has a 13T front difference**, while SGS has 20T. This fills the SS field from the manufacturer's own row rather than calculating it from total capacity or borrowing the SGS limit. Existing weights and other limits are unchanged. The XT short-cage front difference remains unknown because that value is not established by these selected tables.

Hub rows do not override the skewer rule: the rear hub references explicitly include quick release, and the front entries either include quick release or fail to establish its exclusion. No canonical hub mass is added or derived by subtraction. This review covers the selected XT/DX/LX tables, not every page or model in the manual.

## Follow-up source review

The subsequent [1989 catalogue review](shimano-mtb-1989.md) finds a conflicting 495 g PD-MT60 pair figure. Its canonical weight is now unknown pending configuration evidence; the 1990 manual’s 412 g citation is retained. The figures above describe the original review outcome.
