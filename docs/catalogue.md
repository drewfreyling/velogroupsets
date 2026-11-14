# Catalogue and UI foundation

The browsing hierarchy is **manufacturer → groupset → component**. Catalogue records live in Git and feed generated static pages and search. User photos/comments remain in R2/D1 and reference stable component IDs.

Before contributing weights, read the [component weight guidelines](weights-guidelines.md) for the required configurations, inclusions and exclusions. Existing source notes below describe historical records, including entries awaiting correction to meet those standards.

Tailwind CSS is the chosen UI styling system. Astro generates the frontend and compiles pinned Tailwind into static CSS served by Cloudflare; npm dependencies are locked. Use semantic HTML, keyboard-visible focus, responsive layouts, and accessible labels. Keep Tailwind class names in source code or explicit mappings so the build can discover them; do not construct utility class names from arbitrary catalogue values. No runtime CSS CDN is required.

See the [colour and theme guide](design.md) for semantic colour tokens, the dark-mode toggle and contrast requirements.

## Hierarchy and storage

```mermaid
erDiagram
    MANUFACTURER ||--o{ GROUPSET : offers
    MANUFACTURER ||--o{ COMPONENT : brands
    GROUPSET }o--o{ COMPONENT : includes
```

The hierarchy describes navigation. Records are stored once and linked by ID so a component shared by multiple groupsets retains one identity, photo collection, and comment history.

```text
data/
├── manufacturers/<manufacturer-id>.json
├── groupsets/<groupset-id>.json
├── components/<component-id>.json
└── schemas/
    ├── catalogue.schema.json
    └── component-type.schema.json
```

- A manufacturer record represents the catalogue brand, not necessarily the physical factory that produced the part.
- A groupset references its manufacturer through `manufacturer_id`. Use a separate groupset record for a distinct generation where appropriate.
- A component references its manufacturer and one or more `groupset_ids`. Associated groupsets must have the same catalogue manufacturer. Compatibility with another manufacturer's products is a separate claim, not groupset membership.
- `groupset_ids` is the sole source of membership; do not maintain a second mirrored list on groupset records.
- IDs are globally unique, stable lowercase identifiers. Filenames match IDs. Slugs and display names can change independently; renaming them must not change community references. Manufacturer slugs are unique; groupset/component slugs are unique within their manufacturer.
- Components can have multiple variants of the same type within one groupset. Distinct identifiable variants can have distinct IDs; do not assume one record per category.

Component hyperlinks use the model number as their entire link text in catalogue results and groupset lists; the manufacturer and descriptive name remain adjacent, unlinked supporting text. Descriptions remain searchable. Component pages use the model number as the primary heading, with the component name below it, readable Sources/Component details headings, and a compact definition list for specifications. Breadcrumbs, group headings, cards and memberships use the same groupset name and model number (for example, “105 R7000”). Internal reference IDs are kept in the data rather than displayed as micro-labels. Only external links show an arrow; they open in a new tab and include “(opens in new tab)” in their accessible name. Internal links stay in the same tab. Pages offer manufacturer/group breadcrumbs, component-type filtering, and component details. Resolve navigation through the references. Shared components need a consistent canonical URL and stable identity across groupset browsing contexts. Canonical component URLs are `/components/<manufacturer-slug>/<component-slug>/`, independent of groupset context. Groupsets use `/groupsets/<manufacturer-slug>/<groupset-slug>/`; manufacturers use `/manufacturers/<slug>/`. Slug changes still need explicit redirects.

## Required component and groupset details

Every component must have a non-empty `model_number`, a `weight_g` field, a non-empty `weight_description`, and a `technical_document` citation (`url`, `title`, optional `retrieved_on`). Known weights are positive numbers in grams. Any component without a sourced weight for a configuration that meets the [weight guidelines](weights-guidelines.md) must use explicit `weight_g: null`; the page displays “Not yet sourced” and the search index preserves null. `weight_description` explains why the weight is unavailable. Never substitute zero, omit the field or invent a value. The previous optional `model_code` is replaced by `model_number`; existing stable IDs and canonical URLs are unchanged.

The weight description identifies the weighed configuration: crank length and chainring teeth, cassette sprocket range, derailleur cage length, pedal pair versus single pedal, or hub dimensions/variant as relevant. Distinguish manufacturer average weights from measurements and record exclusions. The starter Shimano weights are manufacturer averages, with a linked handbook and PDF page for each component. A model-wide record may cite one explicitly identified reference configuration; do not imply the same weight applies to every option or silently change the record's identity into a different variant.

**All front and rear hub weights exclude skewers.** Hub records additionally require `weight_excludes_skewers: true`; false/missing values fail validation. Include the hub's identifying configuration in `weight_description` and ensure the source supports the weight without skewers. Do not copy a skewer-inclusive weight or estimate an undocumented skewer deduction. The UI states the exclusion beside a known hub weight. For a rear hub with unknown weight, the flag expresses the requirement for a future weight, and the UI says “Any weight added must exclude skewers.”

Each manufacturer declares an official `website_url`. Technical documents normally use HTTPS on that hostname (ignoring a leading `www.`) or one of its subdomains. The approved historical exception is reviewed original Campagnolo 1985/1987/1989 brochures and 1994/1997 spare-parts pages preserved by Disraeli Gears, plus the exact 1982 Olympic catalogue PDF hosted by Campy Only; see the [Record source policy](campagnolo-record.md#approved-archived-manufacturer-documents). The validator limits that exception to Campagnolo and those exact publication page/scan paths. Retailer/mirror domains, lookalike suffixes and credential-bearing URLs are rejected. Contributor review must verify domain ownership, that the document covers the exact component, and that the cited page supports the weight/description; offline validation cannot establish these facts. Manufacturer-owned specification pages or PDFs are valid; a generic homepage is not a technical specification. External CDNs need an explicit future ownership/validation design rather than weakening this rule.

Every groupset requires a non-empty `model_number`, integer `start_year` and primary riding `category`: `road`, `mtb`, `gravel` or `track`. Track preserves the existing Dura-Ace track range. Category IDs and display labels come from the canonical schema; they are separate from component types. Components inherit every category represented by their groupset memberships rather than storing a duplicate category field. Classify the documented offering, not every possible use of its parts.

The component catalogue filters by category, type, groupset and search text. Selecting a category restricts groupset options and clears an incompatible selection. Manufacturer pages filter by category while retaining ascending start-year order. Both filters support bookmarked query strings; without JavaScript all records remain available. The static v1 API adds `category` to groupsets; API filtering remains client-side.

The start year is the documented introduction/availability year, not an inferred marketing model year. End years are not collected or displayed. Existing starts and stable IDs are preserved when migrating from the former range field. Optional `generation` remains a descriptive label, separate from the manufacturer’s model number. Manufacturer pages list groupsets by ascending start year, then by name for ties.

## Component types

The ordered [component-type schema](../data/schemas/component-type.schema.json) is the single source for valid IDs and UI labels. Its `oneOf` entries provide `const` and `title`; the catalogue schema references it directly.

| Stable type ID | UI label |
| --- | --- |
| `crankset` | Crankset |
| `bottom-bracket` | Bottom Bracket |
| `front-derailleur` | Front Derailleur |
| `rear-derailleur` | Rear Derailleur |
| `shifters` | Shifters |
| `brake-levers` | Brake Levers |
| `brake-calipers` | Brake Calipers |
| `cassette` | Cassettes |
| `headset` | Headset |
| `seatpost` | Seatpost |
| `pedals` | Pedals |
| `front-hub` | Front Hub |
| `rear-hub` | Rear Hub |

These are the supported categories. A groupset need not contain every category, and membership must be sourced rather than inferred. In the UI, a missing category means **not yet catalogued**, not proof that the manufacturer never offered it. Additional categories can be added through a schema/documentation change without renaming existing IDs.

Standalone brake levers use `brake-levers` and a left/right pair weight with `specifications.weight_basis: "Pair"`. Integrated shift/brake controls remain `shifters`. Brake calipers use `brake-calipers`; see the [caliper contract and source review](brake-calipers.md). Each record identifies `specifications.weight_basis` as `Pair`, `Front` or `Rear`, including unknown weights. A pair has one total; separately sourced front/rear weights have distinct stable records while retaining the actual manufacturer model number. Known weights require `includes_brake_pads: true` and `includes_mounting_bolts: true`. Do not divide pair totals or double individual weights. See the [standalone brake-lever source notes](brake-levers.md) for documented group membership, variants and remaining gaps. BL-A500’s source specifies pairing with BR-A500 brakes and Shimano outer cable.

## Record examples

These examples are deliberately fictional and show the contract, not bicycle specifications to publish.

Manufacturer, saved as `data/manufacturers/example-maker.json`:

```json
{
  "id": "example-maker",
  "slug": "example-maker",
  "name": "Example Manufacturer",
  "website_url": "https://example.com/",
  "sources": [{"url": "https://example.com/catalogue", "title": "Example catalogue"}]
}
```

Groupset, saved as `data/groupsets/example-group.json`:

```json
{
  "id": "example-group",
  "slug": "example-road-first-generation",
  "name": "Example Road",
  "manufacturer_id": "example-maker",
  "generation": "First generation",
  "model_number": "ER-100",
  "start_year": 2000,
  "category": "road",
  "sources": [{"url": "https://example.com/catalogue", "title": "Example catalogue"}]
}
```

Component, saved as `data/components/example-crankset.json`:

```json
{
  "id": "example-crankset",
  "slug": "example-crankset",
  "name": "Example Crankset",
  "manufacturer_id": "example-maker",
  "groupset_ids": ["example-group"],
  "type": "crankset",
  "model_number": "EC-100",
  "weight_g": 500,
  "weight_description": "170 mm crank arms, 50/34T chainrings; excludes bottom bracket",
  "technical_document": {"url": "https://docs.example.com/specification.pdf", "title": "Example manufacturer technical specification"},
  "specifications": {"crank_length_mm": 170, "chainrings_teeth": [50, 34], "includes_bottom_bracket": false},
  "sources": [{"url": "https://example.com/catalogue", "title": "Example catalogue"}]
}
```

Every record needs a non-empty source list. Use HTTP(S) URLs and descriptive titles; `retrieved_on` is an optional ISO date. Schema checks validate citation structure/URL syntax offline, not page availability or the truth of a specification. Reviewers must assess evidence, attribution, and permission to contribute it.

Unknown optional information should be omitted or `null`, never invented. Specification keys use lowercase underscores and explicit units where applicable, such as `crank_length_mm` or `chainline_mm`. Values can be scalars or lists of scalars. Known weights additionally require the type-specific reference fields listed in the [weight guide](weights-guidelines.md#validation-fields). These identify the weighed configuration, rather than every option sold under a model number. Do not treat flexible specification fields as a substitute for sourced facts.

## Validation and current status

From the repository root:

```sh
python3 -m pip install -r scripts/requirements-catalogue.txt
python3 scripts/check_catalogue.py
```

CI validates JSON Schema 2020-12 contracts, known component types, required fields/sources, duplicate JSON keys, globally unique IDs, filename/ID agreement, scoped slugs, and manufacturer/groupset references. Record directories are flat JSON directories; other formats and nested record directories are rejected. Empty directories are valid during initial setup. The catalogue contains 227 groupsets from Shimano, Campagnolo and SRAM and 890 unique components. Alongside [all nine Shimano 105 generations](shimano-105.md), [five Exage road groupsets](exage.md) and RX100 A550, it includes [all five Ultegra series offered in 1990–2009](ultegra.md): 600 Ultegra 6400, 6500, 6600, Ultegra SL and 6700, plus mechanical 6800 and R8000. Shared parts have multiple memberships and one identity. Series coverage does not imply every component variant is catalogued; the Ultegra guide documents dates, weights and remaining gaps.

The [catalogue schema](../data/schemas/catalogue.schema.json) validates an aggregate containing `manufacturers`, `groupsets`, and `components` arrays. The loader assembles it from individual files. The Astro static build consumes these records and the same taxonomy. It generates detail pages, a static search index, and a catalogue page with browser-side search/type/riding-category/groupset filters. Search uses the generated page records without database calls. Unknown specifications remain omitted/null; community features are visibly marked as planned.

## Historical Shimano Exage 500EX

The road groupset is **Exage 500EX, A500 series**, distinct from the Exage 500LX mountain-bike group. Its record starts in **1989**, the first documented appearance in the evidence cited here: Shimano's *Dealers’ 1990 Product Manual*, published in August 1989. The cover's 1990 model year is not used as an inferred release date. This establishes a documented listing, not an exact retail launch date.

Original Shimano material is preserved by Disraeli Gears: [page 30 introduces the group](https://www.disraeligears.co.uk/site/shimano_-_dealers_1990_product_manual_-_page_30.html), [page 31 shows the group](https://www.disraeligears.co.uk/site/shimano_-_dealers_1990_product_manual_-_page_31.html), and [page 32 lists its components, configurations and weights](https://www.disraeligears.co.uk/site/shimano_-_dealers_1990_product_manual_-_page_32.html). These are manufacturer documents hosted by an independent archive. Component `sources` cite that specification page; each `technical_document` separately links to the relevant original exploded drawing on Shimano's own service site. Exploded drawings identify parts and variants; the dealer manual supplies the manufacturer-listed weights. The front hub instead uses a contributor-reported weight, cited in its component record.

| Component | Model | Weight and basis |
| --- | --- | --- |
| Crankset | FC-A500 | 720 g; 170 mm, 52/42T Biopace; bottom bracket separate |
| Bottom bracket | BB-A450 | 333 g; set with 113 mm spindle; weight's thread variant unspecified |
| Front derailleur | FD-A500-B | 115 g; band-on, 28.0–28.6 mm |
| Rear derailleur | RD-A500 | 279 g; double-chainset version, 28T total capacity |
| Shifters | SL-A500-FCAI | 76 g; seven-speed braze-on downtube lever set, M5 Italian-type bosses |
| Brake calipers | BR-A500-49 / BR-A500-57 | 326 g per complete 49-type front/rear pair; 57-type weight unknown |
| Brake levers | BL-A500 | 258 g; pair of aero levers for 23.8–24.2 mm handlebars |
| Cassette | CS-HG50 | 268 g; seven-speed I group, 13–23T sprockets and spacers |
| Headset | HP-R500 | 121 g; 22/11.5 mm upper/lower cones; weight's thread variant unspecified |
| Pedals | PD-A550 | 407 g; pair including size L toe clips |
| Front hub | HB-RM50-F | 139 g; contributor measurement, 36-hole hub without skewer |
| Rear hub | FH-HG50 | Not yet sourced; weight without skewer required |

Known weights other than the contributor-measured front hub are manufacturer-listed references, not new measurements or claims about every available option. The rear hub and 57-type brake pair retain unknown weights. BB-A450, CS-HG50, HP-R500 and PD-A550 retain their own component identities; membership is documented by the group specification table, even where a service drawing labels a shared part as another series.

The manual lists FH-HG50 at 436 g **with quick release**; this number is not used. The rear hub is included with `weight_g: null`, pending a sourced weight without its skewer. Its Shimano drawing covers the seven-speed quick-release and nutted variants; the catalogue record describes the quick-release version listed in the group manual, without inferring axle dimensions from a later drawing. The HB-RM50-F front hub uses a contributor-reported weight because the manual's weight does not explicitly establish skewer exclusion. No seatpost is listed on that page. The chain is outside the current component taxonomy. BR-A500-49 and BR-A500-57 have separate front/rear pair records; only the 49-type weight is published in this table.

## Historical Shimano RX100

The **RX100 A550** record covers the original seven-speed road group with downtube shifters. [Shimano's RX100 history](https://www.shimano.com/en/100th/history/products/result.html?id=50) dates its introduction to **1989** and describes later dual-control levers. Later STI, triple-chainset and other revisions are not implied by the initial component list.

The original *Dealers’ 1990 Product Manual*, published in August 1989, provides the evidence: [page 26 introduces RX100](https://www.disraeligears.co.uk/site/shimano_-_dealers_1990_product_manual_-_page_26.html), [page 27 shows the group](https://www.disraeligears.co.uk/site/shimano_-_dealers_1990_product_manual_-_page_27.html), and [page 28 lists its components and weights](https://www.disraeligears.co.uk/site/shimano_-_dealers_1990_product_manual_-_page_28.html). These original Shimano scans are hosted by Disraeli Gears. Each component also links to its relevant technical drawing on Shimano's service site.

| Component | Model | Weight and basis |
| --- | --- | --- |
| Crankset | FC-A550 | 700 g; 170 mm, 52/42T double; bottom bracket separate |
| Bottom bracket | BB-A550 | 327 g; set with 113 mm spindle; weight's thread variant unspecified |
| Front derailleur | FD-A550-B | 100 g; band-on, 28.0–28.6 mm |
| Rear derailleur | RD-A550 | 280 g; double-chainset version, 28T total capacity |
| Shifters | SL-A550-FCAI | 72 g; seven-speed braze-on downtube lever set, M5 Italian-type bosses |
| Brake levers | BL-A550 | 252 g; pair of aero levers for 23.8–24.2 mm handlebars |
| Cassette | CS-HG70 | Weight withheld: seven-speed I group, 13–23T; conflicting 286/325 g references in the 1991 catalogue |
| Headset | HP-R500 | 121 g; shared with Exage 500EX |
| Pedals | PD-A550 | Shared record retains the Exage table's 407 g; RX100 table lists 400 g, both including size L toe clips |
| Rear hub | FH-A550 | Not yet sourced without skewer; seven-speed quick release, 126 mm over locknuts, 137 mm axle |

The two pedal weights conflict for the same nominal model/configuration. Preserve one component identity and the existing 407 g reference value, cite both tables and disclose the 400 g listing in the weight description. Do not average the values or invent a variant to explain the difference.

The FH-A550's published 420 g includes its quick release, so the catalogue uses an explicit unknown weight. The HB-A550-F front hub is not yet added: its 202 g listing does not explicitly establish skewer exclusion. The HB-RM50 measurement belongs to a different model and is not reused. The manual's cassette row names CS-HG70; its sidebar heading says CS-HG50. Membership follows the component row, with the seven-speed I-group tooth sequence confirmed by Shimano's shared CS-HG90/HG70/HG50 drawing. No seatpost is listed; the chain remains outside the current taxonomy and BR-A550-49 / BR-A550-57 calipers now have separate pair records (348 g for the 49 type; a later 2005 reference supplies 397 g for the 57 type with R50T pads).

The later eight-speed RD-A551-SS is listed separately with a [273 g contributor measurement](contributor-weights.md#rear-derailleur-weights-reported-on-9-november-2026). It does not replace the earlier RD-A550 or date the eight-speed revision to the family’s 1989 introduction.

## Rear derailleur limits and cage codes

Every `rear-derailleur` requires these keys inside `specifications`:

| Key | Display label | Known value |
| --- | --- | --- |
| `total_capacity_teeth` | Total capacity | Positive integer |
| `maximum_sprocket_teeth` | Largest sprocket | Positive integer |
| `minimum_sprocket_teeth` | Smallest sprocket | Positive integer |
| `maximum_front_difference_teeth` | Front chainring tooth difference | Non-negative integer |

Use explicit `null` when a limit has not been sourced; the page displays “Not yet sourced”. Known values display a `T` suffix. Smallest sprocket cannot exceed largest sprocket. Zero front difference is valid for a single-chainring configuration. Individual maxima need not be usable together: chain take-up is the front chainring difference plus the rear sprocket difference, and must remain within total capacity. Cite the exact model, cage variant and specification edition. See [Ultegra source notes](ultegra.md#rear-derailleur-limits) for the older Shimano records. Cassette sprocket limits do not apply to front derailleurs.

An optional `specifications.cage` records the manufacturer's sourced cage code. Do not infer a code from capacity alone. The shared [cage-help component](../apps/web/src/components/DerailleurCageHelp.astro) defines SS (short), GS (medium, sometimes called long), and LS/SGS (long) once for all rear derailleur pages. These names vary by manufacturer and do not replace model-specific limits. The explanation opens on hover, keyboard focus or tap, stays available while hovered/focused, and closes with Escape or an outside press. Without JavaScript it appears as ordinary text. Keep this explanation out of individual JSON records.

## Shimano 105 generation coverage

The catalogue includes all nine [Shimano 105 generations](shimano-105.md), represented by ten groupset records because R7100 mechanical and Di2 are distinct offerings. There are 102 105 component identities across 107 memberships, including the original R7000 records and documented standalone brake-lever options. The whole catalogue now contains three manufacturers, 227 groupsets and 890 components. Shared current parts retain one canonical identity. See the source guide for dates, variants, weight configurations, exclusions and explicit unknowns. Generation coverage does not imply every component option is already catalogued.

## Shimano Dura-Ace coverage

The [Dura-Ace source guide](dura-ace.md) documents 15 road/track offerings and 142 component identities, from the original 1973 family through R9200. Mechanical/Di2 parts share canonical identities where listed by Shimano. The original family has no component records until suitable manufacturer-hosted technical documents are found. See the guide for dates, source editions, weight configurations and remaining variant gaps.

## Exage road range coverage

The [Exage road source guide](exage.md) covers Sport A450/A451, Motion A250, 300EX A300 and 400EX A400 alongside the existing 500EX A500. The five Exage road groupsets now cover 44 unique component identities across 64 memberships, including the shared BL-A251 brake lever pair in 300EX and Motion. It distinguishes the earlier six-speed Uniglide equipment from seven-speed Hyperglide, records only compliant weights and documents the original/revised Sport controls and Motion shifter options.

## RSX, Light Action and Campagnolo Record

The [RSX and Light Action guide](rsx-light-action.md) documents 26 RSX components across seven- and eight-speed revisions and ten Light Action rear-derailleur variants. The [Campagnolo Record guide](campagnolo-record.md) records separate eight- and nine-speed family starts and 17 component identities, using the approved archived manufacturer documents.


## Shifter pair identities and aliases

Every shifter record describes a complete left/right pair, including those with null weights. The schema requires `specifications.weight_basis: "Pair"` for all shifters. Separate manufacturer codes belong in `left_model` and `right_model` and remain searchable alongside the pair’s model number; an individual-side weight is never doubled or added to another side’s figure to create an unpublished pair weight.

ST-R7000 replaces the separate ST-R7000-L/R catalogue entries with one pair. Its `aliases` array reserves their former IDs and slugs (`shimano-st-r7000-l` / `st-r7000-l` and `shimano-st-r7000-r` / `st-r7000-r`). Aliases are historical identity mappings, not additional searchable components or sitemap entries. Validation rejects collisions between aliases and live catalogue IDs or manufacturer-scoped component slugs. The corresponding old component URLs issue permanent redirects through [the static-asset redirect rules](../apps/web/public/_redirects).

Prefer 170 mm crank arms when selecting a weight reference; other explicitly identified lengths remain valid. See the [weight guidelines](weights-guidelines.md#cranksets).

The [1991 dealer catalogue review](shimano-1991.md) records newly recovered weights, 105 SC seven-speed membership, nut-fastened track hub references and the unresolved CS-HG70 cassette discrepancy.

## Additional Campagnolo road ranges

The [Campagnolo expansion guide](campagnolo-groupsets.md) documents early C-Record, Victory, Triomphe, Chorus, Croce d’Aune and Athena, plus Chorus 8- and 9-speed, Athena 8-speed, Veloce, Mirage, Avanti and Racing Triple, with component identities from the reviewed original brochures and the approved 1997 spare-parts pages.

## SRAM road and gravel

The [SRAM guide](sram.md) documents 28 road/cyclocross/gravel offerings and 103 component identities, including mechanical ten/eleven-speed, original RED eTap, road AXS and both XPLR systems. Shared controls and cassettes have one identity. It also explains pair weights, the distinction between SRAM’s minimum-largest-sprocket field and the smallest sprocket, manufacturer reference editions and remaining coverage gaps.

## Additional road coverage

The [road groupset review](road-groupsets.md) adds 29 Shimano and 46 Campagnolo ranges, plus SRAM Wide options within existing families. It documents dated sources, shared parts, reference-year limits, unknown weights and 33 groups awaiting verified component lists.

The [2005 Trade Sales Support Manual review](shimano-2005.md) recovers 17 road component weights, including the new BR-5501 pair, with explicit hub/skewer and pair-weight references.

The [1980s Campagnolo source review](campagnolo-1980s-weights.md) adds three 1982-reference rear derailleurs: Super Record 0102018, Nuovo Record 1020/A and Nuovo Gran Sport 3500, with manufacturer-listed weights and explicit unknown limits.

The [dealer-manual source index and review](shimano-dealer-manuals.md) preserves the forum’s 31 trade-catalogue links and additional compatibility/parts/magazine references. Selected 2006–2008 and 2021 tables, with the 2014/2017 specification handbooks, add 19 sourced weights and recover Di2 derailleur limits.

## MTB and gravel coverage

The [Shimano MTB and GRX source guide](shimano-mtb.md) documents 65 MTB series and four GRX offerings, conservative reference dates, the first 32 component records, and remaining gaps. Series records do not imply complete component coverage.

The [rear-derailleur weight review](shimano-rear-derailleur-weights.md) checks 52 requested model/cage records, adds 11 manufacturer-listed weights and documents why 41 remain unknown. Existing contributor measurements are retained.

The [front-derailleur weight review](shimano-front-derailleur-weights.md) checks 33 requested models, fills eight mount-qualified weights and documents the 25 remaining unknowns, including unqualified clamp sizes and shared mounting figures.

The [146-record component weight review](shimano-component-weights.md) adds 19 manufacturer-listed weights across cranks, bottom brackets, cassettes, hubs, brake levers, headsets, pedals and seatposts. It documents selected configurations, edition conflicts and 127 remaining unknowns; all 14 requested caliper records remain unresolved.
