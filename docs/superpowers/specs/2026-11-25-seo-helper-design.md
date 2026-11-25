# Shared SEO helper (`rd/1-seo`)

Phase 1, last item in `docs/redesign.md`. Status: design approved by the owner, 2026-11-25.

## Why

Every new page needs the design's head (title, meta, canonical, OpenGraph, JSON-LD) exactly as written in its
`.dc.html` file and `page-map.csv` row, without each page re-implementing it, and with the project's SEO rules
applied in one place.

## Goals

- `pageSeo(route, options)` returns Next `metadata` and the JSON-LD for any of the 108 design routes.
- Rules applied every time:
  - OpenGraph `type` is always `"website"` (65 design pages say `"product"`; see `lessons.md`).
  - Domain `https://www.thetorontosaunaco.com`.
  - LocalBusiness `addressLocality` is "Schomberg".
  - `noindex` comes from the `page-map.csv` Index column (only `/cart` today).
- Design prices never reach the page: product JSON-LD takes its price from MongoDB, passed in by the page.

## Non-goals

- Wiring the helper into pages. Each Phase 2/3 page does that as it's built.
- Sitemap and `next.config.mjs` redirects (Phase 5).
- Matching `/_blob/<id>` design images to real photos (separate asset task, `docs/redesign.md` §1).
- Changing FAQ copy that mentions "King Township". It also says Schomberg, and copy stays verbatim.

## Approaches

- **Chosen:** extraction writes a small `content/seo.json` (route → head + page-map row), which the helper imports
  statically. It's bundled by Next and works on Vercel with no file-system reads at runtime.
- Rejected: the helper reads `content/redesign/<Page>.json` at runtime. Those files are 4.5 MB in total and mostly
  copy blocks, and `fs` reads need output-file tracing on Vercel.
- Rejected: hand-written metadata per page. This duplicates 108 heads and drifts from the design.
- `seo.json` lives in `content/`, not `content/redesign/`: the price diff and the slug backfill read every `.json` in
  that folder as a design page.

## Design

**Data.**
- `npm run extract:dc` also writes `content/seo.json`: `{ routes: { "<route>": { head, pageMap } } }`.
- `content/image-map.json`: `{ "<blob id>": "<real image URL>" }`, empty `{}` for now. The asset task fills it.

**`lib/site/seo.js`.** Exports `pageSeo(route, { price } = {}) → { metadata, jsonLd } | null`. Unknown routes return
`null`.

- **`metadata`:**
  - `title` and `description` from the head.
  - `alternates.canonical`.
  - `robots: { index: false, follow: true }` when the page-map Index is `noindex`.
  - `openGraph`: `type: "website"`, `siteName`, `title`, `description`, `url`, `locale: "en_CA"`, and `images`
    (resolved).
  - `twitter`: card, title, description, images.
- **`jsonLd`:** the head's JSON-LD array, deep-copied and normalised:
  - Any `@id` ending `#store` becomes `#business`, so the business has one ID site-wide and Product
    `seller: {@id: …#business}` resolves on every page.
  - Nodes whose `@type` includes `Store`, `LocalBusiness` or `HomeAndConstructionBusiness` get
    `address.addressLocality = "Schomberg"` when they have an address.
  - `/_blob/<id>` URLs become `image-map.json` values. Unmapped ones are removed from arrays, and a property whose
    value is unmapped is dropped.
  - Product `offers`: with `price` (a number from MongoDB), `offers.price` is set to `price.toFixed(2)`, plus
    `availability: InStock` and `priceValidUntil` (today + 365 days), as on today's product pages. Without it,
    `offers` is removed, because the design price is never published unapproved.
  - Any `thetorontosaunaco.com` / `torontosaunaco.com` origin other than `https://www.thetorontosaunaco.com` is
    rewritten to it (in metadata URLs too).
- **og:image:** the resolved head image, or `https://www.thetorontosaunaco.com/og/Redesign_BG_Image.png` (approved
  fallback).

**`components/site/JsonLd.jsx`.** `<JsonLd data={jsonLd} />` renders one
`<script type="application/ld+json">` per item, with `<` escaped as `<`.

**Usage in a page.**
`export const metadata = pageSeo("/about").metadata`. For dynamic pages, `generateMetadata` calls
`pageSeo(route, { price })`, and the page renders `<JsonLd data={…jsonLd} />`.

## Verification

- Unit tests for each normalisation rule.
- A test over all 108 routes in the real `content/seo.json`:
  - og type is `website`.
  - Canonical equals `https://www.thetorontosaunaco.com` + the page-map route.
  - Title and description equal the page-map row.
  - No `_blob` and no wrong domain anywhere in the output.
  - Every business node says Schomberg.
  - Only `/cart` is noindex.
  - No Product offer carries a price unless one is passed.
- `npm test` and `npm run build` pass.

## Left to the builder

Internal helper names, and the test fixtures' shape.
