# Policy pages (`rd/2-policies`)

Phase 2, first slice in `docs/redesign.md`. Status: draft for owner approval.

## Why

The five policy pages are the first content pages on the new site. They share one simple layout, so this slice also
builds the block renderer the rest of Phase 2 (About, Wellness, Contact, city pages) will reuse.

## Goals

- Serve `/privacy`, `/refund-policy`, `/shipping`, `/terms` and `/warranty` from `app/(site)/` with the new Header and
  Footer. Copy comes verbatim from `content/redesign/Policy*.json`, title/meta/canonical/JSON-LD from `pageSeo()`.
- Match `Policy*.dc.html` at 1440px and 390px.
- Replace "Schomberg (King Township)" with "Schomberg" in all extracted design content, site-wide (owner, 2026-11-26),
  in a way that survives re-running `npm run extract:dc`.

## Non-goals

- No `/policies` index page. The "Policies" breadcrumb item stays plain text (owner agreed).
- No copy changes beyond the Schomberg rule. The BC wording on `/shipping` ships as designed.
- No sitemap changes (Phase 5 SEO), no soft-404 fix, no ESLint setup.
- The live site's footers keep linking to these URLs; nothing else on the live site changes.

## Approaches considered

- **A: one `PolicyPage` template plus a generic `Blocks` renderer fed by the extracted JSON (chosen).** Copy is never
  retyped, one fix applies to all five pages, and `Blocks` carries over to the rest of Phase 2.
- B: five hand-written JSX pages. Faster to start, but copy drifts from the design and every layout fix is made five times.
- C: render the `.dc.html` markup directly. Imports the design's inconsistent inline styles, which CLAUDE.md rules out.

For the Schomberg rule:
- **A: an approved copy-edit list applied by the extractor to every extracted string before writing (chosen).** It runs
  on every page and on `content/seo.json`, and survives re-extraction.
- B: hand-edit the JSON files. A re-extract silently reverts it.
- C: replace at render time. Misses the JSON-LD built from `seo.json`, and hides the change from the content diff.

## Design

**Copy edits.** `scripts/extract-dc/copy-edits.mjs` exports `COPY_EDITS` (`{ find, replace, why }`, exact strings) and
`applyCopyEdits(value)`, which walks a page object and replaces in every string (both `html` and `text`). `extract-dc.mjs`
applies it to each page right after `extractPage`, so `seo.json` (built from the pages) gets it too. The summary prints
how many replacements each edit made, and the run fails if an edit matches nothing (a stale rule). First entry:
`"Schomberg (King Township)"` → `"Schomberg"`. Re-extract and commit only files whose content changed (restore CRLF-only churn).

**Routes.** Five thin pages, `app/(site)/<route>/page.jsx`:
`export const metadata = pageSeo(route).metadata;` and render `<JsonLd data={pageSeo(route).jsonLd} />` plus
`<PolicyPage page={json} />`. Content is imported statically, so the pages are static (no DB, no ISR needed). All five
routes are added to `SITE_ROUTES`. The live pages `app/shipping/`, `app/terms/` and `app/warranty/` are deleted (they would
clash with the new routes); components only they use are left in place for the live site's `main` branch.

**`components/site/PolicyPage.jsx`** maps the JSON's three sections, by position, to:
1. **Header band** (beige): breadcrumb (items with `href` are links, the rest plain text, current page last), eyebrow
   ("Our policies"), H1, the contact paragraph, then the policy tabs as pill buttons in the design's order. The current
   page is the `text` block among the links and renders as the filled pill with `aria-current="page"`. "Last updated" line.
2. **Body**: two columns on `desktop:` (≥998px), one column below. Left: intro paragraph and the dark "At a glance" box
   (`definitions` block as a `<dl>`, eyebrow from the preceding `text` block). Right: the remaining blocks, each H3 starting
   a group separated by a rule. Not sticky (the design isn't).
3. **Question band** (dark): H2, paragraph, Call button (accent) and Email button (outline).

**`components/site/Blocks.jsx`** renders one block by type: `paragraph`, `heading` (levels 1–3), `text`, `list`,
`definitions`, `link` (button variants use `Button`). It inserts the extractor's already-sanitized inline HTML
(`<a>`, `<strong>`, `<em>`, `<br>`) with `dangerouslySetInnerHTML`; content is our own repo JSON. Unknown block types
render nothing in production and are caught by tests.

**Styling.** Tailwind tokens from `tailwind.config.js` and existing `components/site/` pieces (`Button`, site width
`max-w-site`). Where the design's values don't match the scale, use the nearest token; add a token only if a value is
needed by more than one component.

**Tests (Jest, beside the code).** `copy-edits` (replacement, nested objects, zero-match failure); `Blocks` (each type,
links and `aria-current`); `PolicyPage` (all five JSON files render: H1, tabs in order with one current, at-a-glance rows,
question band); route list includes the five routes. `seo.routes.test.js` already covers their metadata.

**Done when** lint/test/build pass (lint is the known unconfigured item; reported, not fixed), each route returns 200 with
title/meta/canonical matching `page-map.csv`, screenshots at 1440/390 compared against the design in a real browser,
`lib/site/progress.js` (policy item → done, `href` to `/warranty`, `UPDATED`) and the `docs/redesign.md` checklist updated,
PR into `redesign`.

## Left to the builder

Exact token choices per element, component file split inside `components/site/`, and test fixtures.
