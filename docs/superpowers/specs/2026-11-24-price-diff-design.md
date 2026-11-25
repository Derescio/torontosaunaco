# Price diff: design vs MongoDB (`rd/1-price-diff`)

Second of the four Phase 1 data steps (`docs/redesign.md`, problem D).

## Why

The redesign carries its own prices; MongoDB holds the prices staff maintain in `/editor`. CLAUDE.md: "MongoDB wins
unless the owner approves a change." Before any catalogue page is built, the owner and the client go through every
difference together and decide, line by line, which price stands. They asked for a **Word document** they can work
through in a meeting (2026-11-24), and chose a **re-runnable script** (option A) so the document can be regenerated
whenever `/editor` prices or the design change.

## Goals

- `npm run price-diff` reads `content/redesign/*.json` (from `rd/1-extract`) and the `staging` catalogue, and writes:
  - `reports/price-diff-<YYYY-MM-DD>.docx`: the meeting document.
  - `reports/price-diff-<YYYY-MM-DD>.json`: the same rows as data, each with a stable `id`, so a later slice can apply
    the approved decisions.
- Every design price point is accounted for: it either matches, differs, is "on request" in the design, or is reported
  as having no counterpart. Nothing is dropped silently.
- Plain language for a non-technical reader (the client): product names, "Website now", "New design", a decision box.

## Non-goals

- Writing to any database, or applying decisions. That is a later slice, run on `staging` first, then on `test` only
  with the owner's go-ahead.
- Reading decisions back out of the `.docx`. The JSON row ids are printed in the document so decisions can be
  transcribed.
- Listing-page "from" prices (`D.items[].p`) and Sauna Finder prices (`fdData`). They're copies of product base prices
  and will be rendered from MongoDB, not the design.
- Hot tubs and other MongoDB-only product lines: listed, not compared (nothing to compare against).

## Anti-goals

- Touching production. The script refuses any database other than `staging` (checks the connected database name,
  not just the URI) and never prints `MONGO_URI`.
- A document so long the meeting can't finish it. Matching prices are counted, not listed.

## Constraints

- `staging` is a copy of `test` made by `scripts/staging/copy-test-to-staging.mjs`. If staff have edited prices in
  `/editor` since the last copy, re-run that copy (read-only on `test`) before the meeting. The document's cover shows
  the newest `updatedAt` in the catalogue so readers can see how fresh the "Website now" column is.
- `reports/` is git-ignored: the repo is public, and generated binaries don't belong in it.
- Prices are compared to the cent (the design has `111.6`, `386.55`).

## Approaches

- **A. Script writes the `.docx` itself (chosen).** Re-runnable in seconds; JSON alongside for the apply step. Costs
  one devDependency (`docx`).
- **B. Script writes data; the document is assembled once by hand.** Less code, but every re-run needs a rebuild.
- (Slides were ruled out: a few hundred price lines don't fit a deck.)

## Design

### Price points

Both sides are flattened into **price points**: `{ product, group, label, price, kind }`, where `kind` is `base`
(the product's own price, or a size/variant that replaces it) or `addon` (added on top). `price: null` means
"on request".

**Design side** (`content/redesign/*.json`):

| Pages | Where | Points |
|---|---|---|
| Saunas, plunges, showers (`data.D`) | `steps[].groups[].options[]` | group title + option label + price; options in a `base: true` group are `base`, the rest `addon` |
| Heaters (`data.d`) | `steps[].options[]` | heater name + option label, `base` |
| Accessories (`Accessories.json`) | `data.items`, `items_2`, `packages`, `lighting`, `finishes` | name + price string (`"$82.00"` → 82) |

The "none"/"no X" options (price 0, `none: true`) are skipped.

**MongoDB side** (`staging`):

| Collection | Points |
|---|---|
| `products` | `price` (base); `sizes[].priceByWood` (base, one per size × wood); `wood_type`, `stove_type`, `additional_upgrades`, `wifi_controller`, `installation`, `delivery.cost` (addons). Object and array forms both handled, as the schema comments describe. |
| `heaters` | `basePrice` (base, labelled name + power); `options.*[].price` (addons) |
| `accessories` | `price` (base) |

### Matching

1. **Products.** Each design page is matched to one or more MongoDB documents by normalised name: lower case, strip
   "the", punctuation, "sauna", and wood suffixes like "- Knotty Red Cedar". An override file,
   `scripts/price-diff/matches.json` (committed), maps a design file to specific document `_id`s, or to `null` for
   "new in the design". The plunge tubs are the known case: one design page ("The Arctic Plunge Tub") to two documents
   (knotty and clear). Every match used is printed under the product heading, so a wrong one is visible in the meeting.
2. **Options.** Within a matched product, each design point is paired with the most similar MongoDB point of the same
   kind (token overlap on labels, e.g. "Clear Western Red Cedar" ↔ "Clear Cedar (Upgrade)"). A design point with no
   pair on its product is looked up in the `heaters` and `accessories` catalogues (sauna configurators offer heaters
   and accessories) before being reported as unmatched. Pairs below a similarity threshold are reported as
   "no match" on both sides rather than guessed.
3. **Accessories page.** Design accessory items are matched to the `accessories` collection the same way.

### Row outcomes

`same` (equal to the cent) · `differs` · `on-request` (design has no price; MongoDB does) · `design-only` ·
`website-only`. Each row gets a stable id: `<design file stem>:<group id>:<option id>`, or `db:<_id>:<path>` for
website-only rows.

### The document

- **Cover:** title, run date, freshness note (newest catalogue `updatedAt`), how to use the decision column, and
  totals per outcome.
- **One section per category** (Outdoor saunas, Indoor saunas, Cold plunges, Outdoor showers, Heaters, Accessories),
  one table per product, listing only rows that aren't `same`, plus a line "N prices already match". Columns:
  Option · Website now · New design · Decision (`☐ Keep website  ☐ Use design  ☐ Other: ____`) · Ref (row id,
  small type).
- **Appendix:** products only in the design; products only on the website.
- Landscape A4/Letter, readable when printed; the project's fonts aren't required.

### Code shape

Pure modules in `scripts/price-diff/` (design points, DB points, matching, comparison, document) with Jest tests on
small fixtures, and a thin CLI `scripts/price-diff.mjs` that does the I/O: reads the JSON, connects to `staging`
read-only, writes the two files. Same pattern as `scripts/extract-dc/`.

**Also in this PR:** `.gitignore` gets `reports/`; `docs/redesign.md` checklist; `lib/site/progress.js` (status stays
"in progress" until the remaining Phase 1 steps land; `UPDATED`).

## Left to the builder

- The exact similarity measure and threshold, tuned on the real data so the meeting sees few "no match" pairs that a
  person would obviously pair. Overrides go in `matches.json`, not in code.
- Table styling within the constraints above.
