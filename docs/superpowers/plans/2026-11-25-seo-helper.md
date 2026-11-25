# Shared SEO Helper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `pageSeo(route, { price })` gives every new page its design head as Next metadata plus normalised JSON-LD.

**Architecture:** extraction writes a slim `content/seo.json`. `lib/site/seo.js` turns one route's entry into
metadata and JSON-LD, with the project rules applied. `components/site/JsonLd.jsx` renders the JSON-LD.

**Tech Stack:** Next.js 15 App Router (JS), Jest.

**Spec:** `docs/superpowers/specs/2026-11-25-seo-helper-design.md`

## Global Constraints

- Domain `https://www.thetorontosaunaco.com`. OpenGraph `type` is always `"website"`.
- The business `addressLocality` is `"Schomberg"`, and the business `@id` is `https://www.thetorontosaunaco.com/#business`.
- Never publish a design price: Product `offers` only appear when `price` is passed.
- og:image fallback: `https://www.thetorontosaunaco.com/og/Redesign_BG_Image.png`.
- `content/seo.json` and `content/image-map.json` live in `content/`, never in `content/redesign/`.

## Review Focus

- Pages with a `@graph` wrapper versus a top-level array: normalisation must reach nested nodes. Task 2 test.
- A Product page with `price: 0` or `NaN`: treat it as no price (offers dropped), never `"0.00"`. Task 2 test.
- A route with or without a trailing slash (`/about/`): look it up without the slash, except `/`. Task 2 test.
- `</script>` inside JSON-LD text breaking out of the tag: `JsonLd` escapes `<`. Task 3 test.
- Mutating the shared imported JSON across calls: the output is a deep copy, so the second call gives the same
  result. Task 2 test.

---

### Task 1: `content/seo.json` from extraction

**Files:**
- Create: `scripts/extract-dc/seo.mjs`, `scripts/extract-dc/seo.test.js`, `content/image-map.json` (`{}`)
- Modify: `scripts/extract-dc.mjs` (also write `content/seo.json`)

**Interfaces:**
- Produces: `buildSeoIndex(pages) → { routes: { [route]: { head, pageMap } } }`. Pages without a route are skipped,
  and routes are sorted.

- [ ] **Step 1: Failing test:** two fake pages (`{ route, head, pageMap, data, sections }`) plus one with
  `route: null`. Expected: `routes` has exactly the two routes, each with `head` and `pageMap` only (no `data`/`sections`),
  and keys are sorted.
- [ ] **Step 2:** `npx jest scripts/extract-dc/seo --coverage=false` → FAIL.
- [ ] **Step 3:** Implement. In `extract-dc.mjs`, write `path.join(ROOT, "content", "seo.json")` with the same
  formatting as `write()`.
- [ ] **Step 4:** Test → PASS. Run `npm run extract:dc`. Expected: `content/seo.json` has 108 routes, and
  `git status content/redesign` is clean (no page changes).
- [ ] **Step 5:** Commit `feat(redesign): extraction writes content/seo.json`.

### Task 2: `pageSeo`

**Files:**
- Create: `lib/site/seo.js`, `lib/site/seo.test.js`, `lib/site/seo.routes.test.js`

**Interfaces:**
- Consumes: `content/seo.json`, `content/image-map.json`.
- Produces: `pageSeo(route, { price } = {}) → { metadata, jsonLd } | null`, plus a pure
  `buildSeo(entry, { price, imageMap }) → { metadata, jsonLd }` for unit tests. `SITE` and `FALLBACK_OG_IMAGE`
  are exported constants.

- [ ] **Step 1: Failing unit tests** (`seo.test.js`, fixtures through `buildSeo`):
  - og `type: "product"` in the head → `metadata.openGraph.type === "website"`.
  - Index `"noindex"` → `metadata.robots` equals `{ index: false, follow: true }`. An empty Index → no `robots` key.
  - Canonical, `openGraph.url` and JSON-LD URLs using `https://thetorontosaunaco.com` or
    `https://www.torontosaunaco.com` → rewritten to `https://www.thetorontosaunaco.com`.
  - `@graph` with a `Store` node `@id …/#store` and `addressLocality: "King"` → `@id …/#business`, locality
    `"Schomberg"`. The same holds for a top-level (non-graph) node.
  - `_blob/abc` mapped in `imageMap` → replaced. Unmapped in `image: [..]` → removed from the array. Unmapped og
    image → `FALLBACK_OG_IMAGE`.
  - Product offers: no price → no `offers`. `price: 2974` → `offers.price === "2974.00"` (the design's `"9999.00"`
    replaced). `price: 0` and `NaN` → no `offers`.
  - Two calls on the same entry return deep-equal results, and the entry object is unchanged.
- [ ] **Step 2: Failing route tests** (`seo.routes.test.js`, the real data, every route in `content/seo.json`):
  og type `website`; canonical = `SITE` + route (the root is `${SITE}/`); title and description equal `pageMap`;
  `JSON.stringify(result)` contains no `_blob` and no `//thetorontosaunaco.com` or `torontosaunaco.com` without
  `www.the`; every business node has locality `"Schomberg"`; only `/cart` has `robots`; no Product has `offers`.
  Also: `pageSeo("/about/")` equals `pageSeo("/about")`, and `pageSeo("/nope")` is `null`.
- [ ] **Step 3:** `npx jest lib/site/seo --coverage=false` → FAIL.
- [ ] **Step 4:** Implement (a deep walk over a `structuredClone`).
- [ ] **Step 5:** Tests → PASS.
- [ ] **Step 6:** Commit `feat(redesign): shared SEO helper from the design heads`.

### Task 3: `<JsonLd>`, docs, progress

**Files:**
- Create: `components/site/JsonLd.jsx`, `components/site/JsonLd.test.jsx`
- Modify: `docs/redesign.md` (tick the SEO item with usage and spec link), `lib/site/progress.js`
  ("Behind-the-scenes setup for the new pages" → `done`; `UPDATED` stays "25 November 2026")

**Interfaces:**
- Produces: `JsonLd({ data })`. `data` is an array (or a single object). It renders one
  `<script type="application/ld+json">` per item, or nothing for empty or invalid input.

- [ ] **Step 1: Failing tests** (React Testing Library):
  - Two items → two script tags whose `JSON.parse(innerHTML)` equals the items.
  - A string containing `</script>` is escaped (the innerHTML has `</script>`).
  - `null` → renders nothing.
- [ ] **Step 2:** FAIL → **Step 3:** implement → **Step 4:** PASS.
- [ ] **Step 5:** Update the docs and progress. `npx jest lib/site components/site --coverage=false` passes.
- [ ] **Step 6:** `npm test` (known `getServerSession` failure only) and `npm run build` pass.
- [ ] **Step 7:** Commit `docs(redesign): SEO helper done`, push, and open a PR into `redesign`.
