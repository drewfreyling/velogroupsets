# Shimano 1993: Altus A10, A20, C10 and C20

Reviewed on **27 November 2026** from the [1993 Shimano STI manual](https://na.s-tec.shimano.com/s3_assets/filelibrary/STI/1993-2012_STI/1993_Shimano_STI.pdf), cross-checked against the [1993 dealer product manual](https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/1990-2000_TSS_Manuals/1993_Shimano_Bicycle_System_Component_Dealer_Product_Manuall.pdf). Both are original manufacturer publications on Shimano's site. This follows the earlier [Exage ES/LT review](shimano-1993-sti.md).

This pass adds **four MTB groupsets, 34 component identities and eight qualified weights**, and backfills FC-M560's **110/74 mm BCDs**. The catalogue at this point contains four manufacturers, **281 groupsets and 2,243 components**. Existing IDs, model numbers, primary documents and all existing weights are preserved.

## Named ranges

STI PDF page **5 / printed 4** lists all four ranges under MTB. Front-drive PDF **10 / printed 9** explicitly names A10/A20/C10; PDF **25 / printed 24** separately names C20. Dealer pages **34–37** independently identify the inventories. Each start year is **1993 dated availability**, not a claimed introduction year.

| Range | Catalogue inventory after this pass | Dealer page |
| --- | --- | --- |
| Altus A10 | 15 components | 34 |
| Altus A20 | 13 components | 35 |
| Altus C10 | 15 components | 36 |
| Altus C20 | 9 components | 37 |

A10/A20/C10 are seven-speed; C20 is six-speed. Membership follows the named manufacturer combinations and dealer spreads. No pedal, hub, freewheel or other category is presumed to exist solely because another range uses it.

## Eight qualified weights

| Exact reference | Weight | Configuration / source |
| --- | --- | --- |
| RD-AT10-SGS | 307 g | Explicit SGS reference, dealer 34 |
| RD-AT20-SGS | 307 g | Explicit SGS reference, dealer 35 |
| RD-CT10-SGS | 307 g | Explicit SGS reference, dealer 36 |
| FD-AT20, 1993 A20 assembly | 158 g | One documented 28.0–28.6 mm clamp band range, dealer 35 |
| FD-CT10 | 160 g | One documented 28.0–28.6 mm clamp band range, dealer 36 |
| FC-AT10 | 875 g | 170 mm, 46/36/26T, bottom bracket separate, dealer 34 |
| FC-AT20 | 964 g | 170 mm, 48/38/28T, bottom bracket separate, dealer 35 |
| FC-CT10 | 930 g | 170 mm, 48/38/28T, bottom bracket separate, dealer 36 |

GS rear masses are not copied from SGS. The A20 and C10 front weights identify the only band range printed for those weighed models; this is a documented single band range, not a list of separate available clamps. FD-AT10's 138 g band figure does not choose between its 28.0–28.6 and 31.8 mm options, so its mass remains null. Top-route/C variants do not inherit normal-model figures.

FC-CT10's page separately prints **27 g for clamp bolts**. The selected mass remains the directly printed **930 g**, with that separate hardware figure disclosed in the description. No addition/subtraction is used to manufacture a different mass. FC-CT20 has documented 170 mm 48/38/28T geometry but no selected mass.

## BCDs and integrated designs

STI PDF **10 / printed 9** explicitly gives **110 mm outer/middle and 74 mm inner** for FC-M560, FC-M520, FC-M320 and FC-AT10. The Exage records already had these values; FC-M560 is backfilled without changing its existing 701 g weight. FC-AT10 records the same directly printed BCDs.

The source instead labels FC-AT20 and FC-CT10 **Integrated**. Their `chainring_mount` preserves that word; the numerical BCD stays unknown. This is not silently reinterpreted as a bolted pattern or as a riveted/direct-mount interface. FC-CT20's reviewed service sheet does not state a BCD or integrated label, so that value remains unknown.

## Reused model codes

The later **FD-AT11** top-route triple MTB assembly has the distinct ID/slug `shimano-fd-at11-1993` / `fd-at11-1993`. It does not replace the original 1981 road Altus ST FD-AT11 or inherit its 122 g / 1⅛-inch reference.

Likewise, the 1993 Altus A20 **FD-AT20** uses `shimano-fd-at20-1993` / `fd-at20-1993`, retaining the actual manufacturer model number. It is separate from the original road Altus AX drawing/identity. Its new 158 g band weight is not attached to that older part.

No alias or shared identity is inferred merely from a reused code.

## Direct rear limits and assembly distinctions

| Assembly | Total capacity | Largest sprocket | Smallest sprocket | Maximum front difference |
| --- | --- | --- | --- | --- |
| RD-AT10 / AT20 / CT10, GS | 36T | 30T | 12T | 20T |
| RD-AT10 / AT20 / CT10, SGS | 38T | 32T | 12T | 20T |
| RD-CT20-GS | 34T | 28T | 14T | 20T |

These limits are printed directly in the STI rear sheet, PDF **13 / printed 12**, and the matching dealer columns. The dealer pages supply the front-difference values. No limit is inferred from cage length or cassette arithmetic.

All new shifter records represent complete left/right pairs, including the alternative ST-CT10/ST-CT15 and ST-CT20/SL-CT20 controls. Unqualified dealer figures without a securely identified pair basis remain withheld. No side is doubled. The standalone BL-CT20 pair remains separate from shifters; existing BL-CT10 gains C10 membership.

BR-AT10/11, BR-AT20/21, BR-CT10/11 and BR-CT20/21 retain the actual M/L arm variants. They are front/rear cantilever-pair references with unknown masses pending a qualified pad/bolt-inclusive reference. A one-wheel arm pair or one-piece figure is not doubled or misrepresented as a complete front/rear set.

## Shared parts and remaining gaps

FH-HG50, unsuffixed HB-RM50, the CS-HG50 seven-speed M 13–28T configuration, BB-UN51, BB-LP20, BB-LP30, BB-CS11 and BL-CT10 gain only documented memberships. Shared hub names become neutral. Existing positive masses and reference configurations remain unchanged; the unsuffixed HB-RM50 stays separate from the contributor-weighed HB-RM50-F.

The A10 dealer spread explicitly labels **BB-LP10**. That identity is added with an unknown weight; it is not renamed to LP20 or LP30 because the STI sheet lists those alternative combinations. BB-CS21 is also added with an unknown weight: the shared CS21/CS11 weight row does not establish a separately qualified assembly to transfer its figure to. Available spindle lengths do not choose a weighed reference.

The C20 spread lists **MF-HG20**, a threaded freewheel. It is not forced into the cassette type. Freewheel modelling, additional positions/mounts, qualified control-pair and brake weights, and other 1993 sections remain further source work. This is an Altus follow-up, not a complete import of the STI or dealer manual.
