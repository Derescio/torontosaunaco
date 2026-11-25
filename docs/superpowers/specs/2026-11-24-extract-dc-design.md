# Design-file extraction (`rd/1-extract`)

Short design. First of the four Phase 1 data items in `docs/redesign.md`.

## Why

The 107 `.dc.html` design pages are the spec for copy, prices and SEO head, but they are browser-rendered prototypes,
not data. One script turns each page into JSON so that:

- the **price diff** compares design data with MongoDB without re-parsing HTML,
- the **slug backfill** and the **SEO helper** read routes, titles, canonicals and JSON-LD from one place,
- page builds read **copy verbatim** from structured blocks instead of retyping it (owner chose structured blocks,
  option A, 2026-11-24).

## Goals

- `scripts/extract-dc.mjs` reads every `*.dc.html` in the design folder (except `Piece-zsi1.dc.html`) plus
  `Launch File/page-map.csv`, and writes one JSON file per page to `content/redesign/`.
- Output is deterministic (same input, byte-identical output) and committed, so re-runs show up as reviewable diffs.
- Problems are reported, not hidden: anything the extractor can't classify or map goes in the page's `warnings`.

## Non-goals

- The price diff, slugs, SEO helper (next slices).
- Downloading or mapping images (`./assets/<hash>.jpg`, `_blob/<id>` are kept as-is).
- The header and footer (already built in `rd/1-header-footer`); they are left out of `sections`.
- Running the design's page logic. `{{…}}` template holes stay as literal text.

## Anti-goals

- Rewording, trimming or "fixing" copy. Text comes out exactly as written, including inline italics/bold.
- Silently dropping content. Unknown markup becomes a `warning`, never nothing.

## What the design files contain (surveyed 2026-11-24)

- **Head:** `<title>`, meta description, canonical, `og:*`, `twitter:card` on every page. JSON-LD: one block on most
  pages, two on Blog, none on Cart and the 9 `Saunas*` listing pages.
- **Data:** JSON literals inside `<script type="text/x-dc">`, under different names: `var D = {…}` (products),
  `D = {…}` inside `renderVals` (listings), `var d = {…}` (heaters), `fdData() { return […] }` (homepage finder), plus
  `var data`, `var p`, etc. Heater prices are **not** in `d`; they appear only in the markup.
- **Body:** sections marked by comments (`<!-- About hero -->`), inline styles throughout, `<a href="X.dc.html">` links.

## Approaches

- **A. Structured blocks per section (chosen).** Each section becomes typed blocks (heading, paragraph, list, link,
  image, …). Components read from them, so copy stays verbatim by construction. Costs a more involved extractor.
- **B. Plain text per section.** Simpler extractor, but builders retype copy into components and drift creeps in.

## Design

**Input paths:** CLI argument or `DC_SITE_DIR`, defaulting to `%USERPROFILE%\Downloads\TSC-REVAMP\Site`; the CSV is
read from `../Launch File/page-map.csv` relative to it. The script only reads that folder and only writes
`content/redesign/`.

**Output:** `content/redesign/<DesignName>.json` (e.g. `About.json`), plus `content/redesign/index.json` mapping
route → file with a warning count per page. Shape:

```json
{
  "file": "About.dc.html",
  "route": "/about",
  "pageMap": { "title": "…", "description": "…", "index": "", "photos": 12 },
  "head": {
    "title": "…", "description": "…", "canonical": "https://www.thetorontosaunaco.com/about",
    "og": { "site_name": "…", "type": "website", "title": "…", "description": "…", "url": "…", "image": "…" },
    "twitter": { "card": "summary_large_image" },
    "jsonLd": [ { "@context": "https://schema.org", "@type": "AboutPage" } ]
  },
  "data": { "D": { } },
  "sections": [
    { "name": "About hero", "blocks": [
      { "type": "breadcrumb", "items": [ { "text": "Home", "href": "/" }, { "text": "About Us" } ] },
      { "type": "text", "html": "About us" },
      { "type": "heading", "level": 1, "html": "Customer first. <em>Every time.</em>" },
      { "type": "paragraph", "html": "The Toronto Sauna Co. helps homeowners…" },
      { "type": "image", "src": "./assets/aef9….jpg", "alt": "Black glass-front outdoor sauna…" }
    ] }
  ],
  "warnings": []
}
```

**Data:** every JSON literal assigned (`x = {…}` / `x = […]`) or returned from a method in the page script is parsed
with `JSON.parse`, keyed by its variable or method name. Literals that aren't valid JSON are skipped silently (they are
logic, not data); duplicate names get a numeric suffix.

**Blocks:** `heading` (level), `paragraph`, `text` (loose text in a `span`/`div`, e.g. eyebrows and prices), `list`
(ordered, items), `link` (`variant: "button" | "link"`; button when it has a `btn`/`hbtn` class or a pill radius),
`image` (src, alt), `breadcrumb`, `faq` (from `details`/`summary`, answer as nested blocks), `quote` (blockquote,
cite), `table` (rows of cells), `form` (field labels, types and options, button label). Anything else with text
becomes a warning naming the tag.

**Inline text (`html`):** reduced to `<em>`, `<strong>`, `<a href>` and `<br>`. An italic-styled span becomes `<em>`,
a span with weight ≥ 600 becomes `<strong>`, other spans are unwrapped. Every block also carries plain `text` for
diffing and search. Whitespace is collapsed; characters are otherwise untouched.

**Links:** `X.dc.html#frag` → route from `page-map.csv` + `#frag`; `Main.dc.html` → `/`; `tel:`, `mailto:` and
external URLs unchanged; an unmapped `.dc.html` is kept as-is with a warning. The same mapping applies to `href`
values inside `data`.

**Checks (warnings, not failures):** head title and description vs the CSV row; canonical path vs CSV route; OG type
not `"website"`; "Leisurecraft" outside the homepage dealer badge; a page with no CSV row, or a CSV row with no file.

**Run summary:** pages, sections, blocks and warnings by kind are printed. Exit code 1 only when the folder or CSV is
missing, a page fails to parse, or two pages map to one route.

**Parser:** `node-html-parser` as an explicit devDependency (already in the tree via Next and Sanity; fast and has
no DOM emulation). Pure functions live in a module Jest can test with small HTML fixtures, so `npm test` never
needs the design folder.

**Also in this PR:** `lib/site/progress.js` (statuses + `UPDATED`) and the `docs/redesign.md` checklist.

## Left to the builder

- Exact module layout and how Jest picks up the `.mjs` module.
- Fine-tuning the block rules after a first full run. The aim is zero unexplained warnings across all 107 pages; any
  warnings that remain are listed in the PR.
