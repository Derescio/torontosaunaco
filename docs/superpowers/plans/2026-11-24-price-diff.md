# Price diff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `npm run price-diff` writes a Word document (and matching JSON) listing every price where the redesign and the `staging` catalogue disagree, for the owner and client to decide line by line.

**Architecture:** Pure ESM modules in `scripts/price-diff/` (text matching, design points, DB points, report building, document rendering), each tested with small fixtures, plus a thin CLI `scripts/price-diff.mjs` for I/O. Same pattern as `scripts/extract-dc/`.

**Tech Stack:** Node 22 ESM, `mongodb` driver (already a dependency), `docx` (new devDependency), Jest 29.

**Spec:** `docs/superpowers/specs/2026-11-24-price-diff-design.md`

## Global Constraints

- Reads `staging` only: the CLI exits 1 unless the connected database name is exactly `staging`. `MONGO_URI` is never printed. No writes to any database.
- Output goes to `reports/` (git-ignored): `price-diff-<YYYY-MM-DD>.docx` and `.json`.
- Prices are compared to the cent: equal when `Math.abs(a - b) < 0.005`.
- Row outcomes: `same`, `differs`, `on-request`, `design-only`, `website-only`.
- Row ids are stable: `<DesignStem>:<groupId>:<optionId>` for design rows, `db:<_id>:<path>` for website-only rows.
- Add-on points priced 0 are skipped on both sides (defaults like "Knotty Cedar: 0", "DIY: 0", "No Windows: 0"), as are design options with `none: true`.
- Match overrides live in `scripts/price-diff/matches.json`, never in code.
- Test files start with `/** @jest-environment node */`.

## Review Focus

1. **Size labels** (`7' × 6'` vs `7’ x 6’`) must pair with the same size, never a neighbouring size that shares the "7". Pinned in Task 1.
2. **kW labels** (`Apex 12 kW (208V 3-phase)` vs `Homecraft Apex` + power 12) must pair by kW. Pinned in Tasks 1 and 3.
3. **One MongoDB point claimed twice:** two design options must never pair with the same DB point. Pairing is one-to-one. Pinned in Task 4.
4. **Price strings and nulls** (`"$1,082.50"`, `null`, `undefined`, `"Call"`): parse to a number or `null` ("on request"), never `NaN`. Pinned in Task 2.
5. **A non-staging database:** must exit before reading any collection. Pinned in Task 6.

---

### Task 1: Text matching primitives

**Files:**
- Modify: `.gitignore` (add `reports/`)
- Create: `scripts/price-diff/text.mjs`
- Test: `scripts/price-diff/text.test.js`

**Interfaces:**
- Produces: `tokens(label: string) => string[]`. Lower case. `’`/`′` → `'`, `×` → `x`, `w/` → `with`. Dimension patterns `7' x 6'` / `7x6` → one token `7x6`. Power `12 kW` / `12kw` / `7.5 kW` → one token `12kw` / `7.5kw`. Punctuation removed. Stop words dropped: `the, a, and, sauna, saunas, with, package, upgrade, standard`. Simple stem: trailing `ation`→`` (installation→install), trailing `s` dropped when the word is longer than 3 letters.
- Produces: `similarity(a: string, b: string) => number` (Dice coefficient on token sets, 0–1).
- Produces: `parseMoney(v: unknown) => number | null` (numbers pass through; strings like `"$1,082.50"` → 1082.5; anything else → `null`).
- Produces: `samePrice(a: number, b: number) => boolean`.

- [ ] **Step 1: Write failing tests**

```js
test("sizes become one token", () => {
  expect(tokens("7' × 6'")).toEqual(["7x6"]);
  expect(tokens("7’ x 6’ Knotty Cedar")).toEqual(["7x6", "knotty", "cedar"]);
  expect(similarity("7' × 4'", "7’ x 6’ Knotty Cedar")).toBe(0);
});
test("power becomes one token", () => {
  expect(tokens("Apex 12 kW (208V 3-phase)")).toEqual(["apex", "12kw", "208v", "3phase"]);
  expect(tokens("Homecraft Apex Mini 7.5kW")).toEqual(["homecraft", "apex", "mini", "7.5kw"]);
});
test("stop words, w/ and stems", () => {
  expect(tokens("The Luna Sauna w/Porch")).toEqual(["luna", "porch"]);
  expect(tokens("Delivery + Installation")).toEqual(["delivery", "install"]);
});
test("similarity", () => {
  expect(similarity("Clear Western Red Cedar", "Clear Cedar (Upgrade)")).toBeCloseTo(0.667, 2);
  expect(similarity("Mirrored Glass", "Mirrored Front Glass")).toBeCloseTo(0.8, 2);
  expect(similarity("", "x")).toBe(0);
});
test.each([[82, 82], ["$82.00", 82], ["$1,082.50", 1082.5], [null, null], [undefined, null], ["Call", null], [NaN, null]])(
  "parseMoney(%p)", (v, out) => expect(parseMoney(v)).toBe(out));
test("samePrice is to the cent", () => {
  expect(samePrice(111.6, 111.6000001)).toBe(true);
  expect(samePrice(111.6, 111.61)).toBe(false);
});
```

- [ ] **Step 2: Run** `npx jest scripts/price-diff --coverage=false`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement** `text.mjs` and add `reports/` to `.gitignore`.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat(redesign): text matching for the price diff`

### Task 2: Design price points

**Files:**
- Create: `scripts/price-diff/design.mjs`
- Test: `scripts/price-diff/design.test.js`

**Interfaces:**
- Consumes: `parseMoney` (Task 1).
- Point type (used by Tasks 2–5): `{ id, product, group, label, price: number|null, kind: "base"|"addon" }`.
- Produces: `designProducts(pages: Page[]) => DesignProduct[]`. `Page` is an extracted JSON (`content/redesign/*.json`). `DesignProduct = { file, stem, name, category, route, points: Point[] }`. Product pages only: `data.D.steps` (saunas, plunges, showers), `data.d.steps` (heaters), and `Accessories.json`. Everything else is ignored.
- `category` comes from the route: `/cold-plunges/…` → "Cold plunges"; `/outdoor-showers/…` → "Outdoor showers"; `/sauna-heaters/…` → "Heaters"; `/accessories` → "Accessories"; `/saunas/indoor…` → "Indoor saunas"; other `/saunas/…` → "Outdoor saunas".
- D pages: one point per `steps[].groups[].options[]`. `kind` is `base` when the group has `base: true`. `group` is the group `title`. `id` is `<stem>:<group.id>:<option.id>`.
- d pages (heaters): one point per `steps[].options[]`. `kind` is `base` for `steps[0]`, `addon` otherwise. `group` is the step `title`. `id` is `<stem>:<step.id>:<option.id>`.
- Accessories: `data.items`, `items_2`, `packages`, `lighting`, `finishes`. Each element with a `name` and a price (`price` field, parsed) becomes a `base` point. `group` is "Accessories", "Packages", "Lighting" or "Finishes". `id` is `Accessories:<list>:<sku || slug(name)>`. `name` is "Accessories catalogue".
- Skip options with `none: true`, and add-on options priced exactly 0.

- [ ] **Step 1: Write failing tests**: fixtures for one D page (base group + addon group with a `none` option and a 0 option), one d page (two steps), and an Accessories page (`"$82.00"`, `"$1,082.50"`, missing price → `null`). Assert exact `points` arrays and `category` for each route kind, plus a non-product page (About) yielding nothing.
- [ ] **Step 2: Run** `npx jest scripts/price-diff/design --coverage=false`. Expected: FAIL.
- [ ] **Step 3: Implement** `design.mjs`.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat(redesign): design price points`

### Task 3: Website (MongoDB) price points

**Files:**
- Create: `scripts/price-diff/website.mjs`
- Test: `scripts/price-diff/website.test.js`

**Interfaces:**
- Consumes: `parseMoney` (Task 1).
- Produces: `productPoints(doc) => Point[]`, `heaterPoints(doc) => Point[]`, `accessoryPoints(doc) => Point[]`. A website point's `id` is `db:<_id>:<path>`, and `product` is the doc `name`.
- Products:
  - `price` → base, label = doc name. If `price` is missing, use `baseCost`. If neither, there is no base point.
  - `sizes[].priceByWood` → base, label `<size.label> <wood>`, one per entry.
  - `wood_type`, `stove_type`, `installation` → addon, label = key (trimmed), whether object form (`{ key: { price } }`) or array form (`[{ name|type, price }]`).
  - `additional_upgrades[]` → addon (`name`).
  - `wifi_controller.price` → addon, label "Wi-Fi controller".
  - `delivery.cost` → addon, label "Delivery".
- Heaters: `basePrice` → base, label `<name> <power> kW`, plus `options.*[]` entries with a `price` → addon, label = `type`/`name`.
- Accessories: `price` → base, label = name.
- Skip addon points priced 0. Skip entries whose price doesn't parse.
- Produces: `newestUpdate(docs: object[]) => string | null` (ISO date of the largest `updatedAt`).

- [ ] **Step 1: Write failing tests**: fixtures modelled on the staging probe:
  - Pure Cube 552: base, wood object, stove object, upgrades array, wifi, delivery, installation with DIY 0.
  - Barrel: no `price`, has `baseCost` and `sizes`.
  - Plunge: empty `wood_type: {}`, `Supply_Install`.
  - Harmony: stove keys with leading spaces.
  - Heater: `power: 7.5`.
  - Accessory.

  Assert the exact points, including that `"7’ x 6’ Knotty Cedar"` is a base point priced 9100. Then test `newestUpdate`.
- [ ] **Step 2: Run** `npx jest scripts/price-diff/website --coverage=false`. Expected: FAIL.
- [ ] **Step 3: Implement** `website.mjs`.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat(redesign): website price points from MongoDB documents`

### Task 4: Matching and the report

**Files:**
- Create: `scripts/price-diff/report.mjs`, `scripts/price-diff/matches.json` (starts as `{ "products": {}, "options": {} }`)
- Test: `scripts/price-diff/report.test.js`

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces: `buildReport({ designProducts, catalogue: { products, heaters, accessories }, overrides, now }) => Report`:
  - `Report = { generatedAt, websiteAsOf, totals: Record<Outcome, number>, sections: [{ category, products: [ReportProduct] }], designOnly: [{ name, file, basePrice }], websiteOnly: [{ name, collection, basePrice }] }`
  - `ReportProduct = { name, file, matchedTo: string[], sameCount, rows: Row[] }`
  - `Row = { id, label, group, website: number|null, design: number|null, outcome }`. Rows are kept in design option order, then website-only rows. `same` rows are counted, not listed.
- **Product matching:**
  - `overrides.products[file]` is an array of doc `_id`s, or `null` for "new in the design". It wins when present.
  - Otherwise, score every candidate doc by `similarity(designName, docName)`. Accessories match all accessory docs; heater pages match heater docs; other pages match product docs. Take every doc with the top score, provided that score is ≥ 0.6.
  - No match → `designOnly`.
- **Point pairing** within a product:
  - Candidates are the points of the matched docs, of the same `kind`.
  - Build all (design, website) pairs scoring ≥ 0.5. Sort by score descending, then by design order. Accept pairs greedily, so each point is used at most once.
  - `overrides.options[designPointId]` = a website point id forces a pair.
  - An unpaired design addon is retried against base points of the heater and accessory catalogues, with the same one-to-one rule per product.
- **Outcomes:**
  - Paired, both prices present: `same` or `differs`.
  - Paired, design `null`: `on-request`.
  - Unpaired design point: `design-only`. Its price may be `null`.
  - Unpaired website point on a matched product: `website-only`.
- **Leftovers:** product and heater docs matched by no design page → `websiteOnly`. Unpaired accessory docs are `website-only` rows on the Accessories catalogue.
- Sections are ordered: Outdoor saunas, Indoor saunas, Cold plunges, Outdoor showers, Heaters, Accessories. Products within a section are in name order.

- [ ] **Step 1: Write failing tests**
  - Pure Cube design vs doc: base same, wood same, mirrored glass differs (750 vs 800), "Semi-privacy" `design-only`, website "Narvi 16" `website-only`. Assert `sameCount` and rows.
  - One-to-one: two design options both closest to one website point → only the better one pairs, and the other is `design-only`.
  - Size pairing: design `7' × 6'` 9100 pairs with website `7’ x 6’ Knotty Cedar` 9100 → `same`, not with `7x4`.
  - Heater page "Homecraft Apex (208V / 3 Phase)" matches all three Apex docs. Option `Apex 12 kW (208V 3-phase)` 3010 pairs with `Homecraft Apex 12 kW` 4782 → `differs`.
  - `on-request`: design `null` paired with a website price.
  - Overrides: the product override maps one page to two docs, and an option override forces a pair.
  - Unmatched website doc lands in `websiteOnly`. `totals` adds up to all rows plus `same` counts.
- [ ] **Step 2: Run** `npx jest scripts/price-diff/report --coverage=false`. Expected: FAIL.
- [ ] **Step 3: Implement** `report.mjs` and the empty `matches.json`.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat(redesign): match design and website prices into a report`

### Task 5: Word document

**Files:**
- Modify: `package.json` (devDependency `docx` `^9`)
- Create: `scripts/price-diff/document.mjs`
- Test: `scripts/price-diff/document.test.js`

**Interfaces:**
- Consumes: `Report` (Task 4).
- Produces: `renderDocument(report: Report) => Promise<Buffer>`. The document is landscape with 0.6" margins and these parts:
  - **Cover:** title "Price check: new design vs website", the run date, "Website prices as of <websiteAsOf>", a "How to use this document" paragraph, and a totals table.
  - **Sections:** one heading per section, one sub-heading per product, then a line "Matched to: …" and a line "N prices already match". Each product gets a table with the columns Option (group in small grey type above the label) · Website now · New design · Decision · Ref.
  - **Formatting:**
    - Money is formatted `$11,884`, or `$111.60` when there are cents.
    - `null` shows as "On request" in the design column and "—" in the website column.
    - `design-only` and `website-only` rows show "Not offered" on the missing side.
    - The Decision cell reads `☐ Keep website   ☐ Use design   ☐ Other: ______`.
  - **Appendix:** "New in the design (not on the website)" and "On the website but not in the new design", as tables of name and price.
- The exact copy for the "How to use" paragraph: "Each table lists the prices that differ between the website today and the new design. Tick one box per row: keep the website price, use the design price, or write another. Prices that already match are not listed. Prices are before tax. The Ref column lets us apply your decisions exactly."

- [ ] **Step 1: Write failing test**: render a small report. Assert the buffer starts with `PK`. Unzip `word/document.xml` with JSZip (a dependency of `docx`), then assert it contains the product name, `$11,884`, `$111.60`, "On request", "Not offered", the row id, and `☐ Keep website`.
- [ ] **Step 2: Run** `npx jest scripts/price-diff/document --coverage=false`. Expected: FAIL.
- [ ] **Step 3: Install** `npm i -D docx@^9`. **Implement** `document.mjs`.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat(redesign): price diff Word document`

### Task 6: CLI, real run, tuning, docs

**Files:**
- Create: `scripts/price-diff.mjs`
- Modify: `package.json` (script `"price-diff": "node --env-file=.env scripts/price-diff.mjs"`), `scripts/price-diff/matches.json`, `docs/redesign.md`, `lib/site/progress.js`
- Test: `scripts/price-diff/guard.test.js`, plus `scripts/price-diff/guard.mjs`

**Interfaces:**
- Produces: `assertStaging(dbName: string) => void`. It throws `refusing to read "<name>": the price diff only reads the staging database` unless `dbName === "staging"`.
- CLI:
  - Loads `content/redesign/*.json` (excluding `index.json`) and calls `designProducts`.
  - Connects with `MONGO_URI` and runs `assertStaging(db.databaseName)` **before any query**.
  - Reads `products`, `heaters`, `accessories`, then calls `buildReport` with `scripts/price-diff/matches.json`.
  - Writes `reports/price-diff-<date>.json` (`JSON.stringify(report, null, 2)`) and `.docx`.
  - Prints totals plus the two file paths.
  - Exits 1 on a missing `MONGO_URI`, a failed guard, or a missing `content/redesign`.

- [ ] **Step 1: Write failing test**: `assertStaging("staging")` doesn't throw; `"test"`, `"toronto"` and `""` throw with the message.
- [ ] **Step 2: Run** `npx jest scripts/price-diff/guard --coverage=false`. Expected: FAIL. **Implement** `guard.mjs`. Run again. Expected: PASS.
- [ ] **Step 3: Implement** the CLI. Run `npm run price-diff`. Expected: two files in `reports/`, exit 0.
- [ ] **Step 4: Tune.**
  - Read the JSON. For each product in `designOnly`, and for each section with many `design-only`/`website-only` rows that a person would obviously pair, add entries to `matches.json`. Product overrides cover cases like the plunge tubs (knotty and clear docs) and showers. Option overrides cover obvious pairs that fall below the threshold.
  - Adjust the stop words or threshold in `text.mjs` only with a new test in `text.test.js`.
  - Re-run until every remaining unmatched row is a genuine one-sided item.
  - Open the `.docx` and check that it reads cleanly. Convert it to PDF or images with LibreOffice if available, otherwise check the XML text.
- [ ] **Step 5: Commit** `feat(redesign): price-diff CLI and match overrides`
- [ ] **Step 6: Docs.**
  - In `docs/redesign.md`, tick the price-diff item and add how to run it, including re-seeding `staging` first if `/editor` prices changed.
  - Set Phase 0 "Price mismatch approvals" to point at the report.
  - In `lib/site/progress.js`, keep "Behind-the-scenes setup" `in-progress` and set `UPDATED`.
  - Commit `docs(redesign): price diff done`.
- [ ] **Step 7: Verify.**
  - Run `npm test`. The only allowed failure is the pre-existing `getServerSession` suite.
  - Run `npm run build`. It must pass.
  - `git status` must show no `reports/` files.
- [ ] **Step 8: Hand the `.docx` to the owner.** Push, open the PR into `redesign` with the run totals, and wait for the merge.
