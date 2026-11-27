# Service areas (`rd/2-service-areas`)

Phase 2, fifth slice in `docs/redesign.md`. Status: approved in conversation 2026-11-26, written up for the record.

## Why

The city pages are the site's local-search landing pages ("backyard sauna Aurora" and so on). The redesign replaces
the live hub and city pages with the design's 18 pages: one hub and 17 cities, each with its own copy, FAQ and
recommended saunas.

## Goals

- Serve `/service-areas` (hub) and `/service-areas/<city>` for the 17 design cities from `app/(site)/`, matching
  `ServiceAreas.dc.html` and the `City*.dc.html` pages at 1440px and 390px.
- Copy comes verbatim from `content/redesign/ServiceAreas.json` and `content/redesign/City*.json`. SEO (title, meta,
  canonical, JSON-LD) comes from `pageSeo(route)`, which already covers all 18 routes.
- One template for every city, so all 17 pages share one layout and one set of components.

## Non-goals

- New cities that aren't in the design, and editing city copy in `/editor` or Sanity.
- Redirects for the dropped live cities (Ottawa, Barrie, Kawarthas, Vancouver, Calgary, Newmarket). `redirect-map.csv`
  already sends them to `/service-areas`, and redirects land at cutover (Phase 5).
- Soft 404s: `notFound()` returns 200 site-wide because of `app/loading.jsx` (Phase 5).

## Owner decisions (2026-11-26)

- **Recommended-sauna card prices come from the design**, as written in each `City*.json` (e.g. Neptune $17,896),
  not from MongoDB. This is an approved exception to "MongoDB wins" for these cards only. The city JSON-LD lists no
  products, so no design price is published in structured data.
- **"King Township showroom" stays as designed.** No new copy edits. Meta descriptions match `page-map.csv` verbatim.
  (The existing "Schomberg (King Township)" → "Schomberg" edit still applies.)

## Approaches considered

- **A: one data-driven template (chosen).** `app/(site)/service-areas/[id]/page.jsx` reads `City<Name>.json` for the
  slug, reading sections with `section()` / `groups()` so a design change fails the build instead of mismatching copy.
- B: 17 hand-written page files. Repeats one layout 17 times and lets copy drift.
- C: keep the live `lib/cities` data and restyle it. That copy isn't the design's, and it would be kept by hand.

## Design

**Routes.**
- Delete the live `app/service-areas/` (`page.jsx`, `[id]/page.jsx`, `layout.js`) on `redesign` and `lib/cities`,
  which only those pages import (checked: nothing else imports either).
- `app/(site)/service-areas/page.jsx`: the hub.
- `app/(site)/service-areas/[id]/page.jsx`: `generateStaticParams` from the 17 design cities, `dynamicParams = false`
  semantics via `notFound()` for anything else, `revalidate` as the other `(site)` pages do. `generateMetadata` uses
  `pageSeo("/service-areas/<id>")`; the page renders `<JsonLd>` from the same entry.
- A small map from slug to content file (`lib/site/cities.js`), built from the content files' `route` field, not a
  hand-kept list.
- Add `/service-areas` to `SITE_ROUTES` (prefix match covers the cities) and its test.

**Hub sections.** Breadcrumb, eyebrow, heading with italic phrase, intro paragraph (on the tinted band); a grid of 17
city cards (region label, city name, neighbourhoods, underlined "Backyard saunas in <city>" link), 4 columns at
desktop and 1 on phones; the closing "Don't see your town?" paragraph with its links.

**City sections, in design order.**
1. Hero: breadcrumb, region eyebrow, heading, paragraph, two buttons (Book a Free Site Consult, Call), photo.
2. Trust strip: four title + detail pairs, with the detail's inline links.
3. Neighbourhoods: eyebrow, heading, paragraph, neighbourhood chips.
4. Local setting: three heading + paragraph columns with a top rule.
5. Picks: eyebrow, heading, paragraph, "Shop all saunas" button, four sauna cards (photo, name, size, design price),
   each linking to its `/saunas/...` route.
6. Process: `Steps` with the four numbered steps and three outline buttons.
7. Reviews: eyebrow, heading, "Read all reviews on Google" button, three review cards (stars, quote, name, source).
8. FAQ: eyebrow, heading, accordion using native `<details>`/`<summary>` (works without JavaScript).
9. Nearby: "Also serving nearby:" with chip links and "All service areas →".
10. CTA: `CtaBand` with heading, paragraph and two buttons.

**Components.** New ones go in `components/site/`: `CityCard`, `TrustStrip`, `Chips`, `ProductCard`, `ReviewCard`,
`Faq`. Reuse `SectionHeader`, `Split`/`Photo`, `Steps`, `CtaBand`, `Breadcrumb`, `Button`, `Blocks`, `SiteImage`.
Tailwind tokens only, `desktop:` breakpoint, container `mx-auto max-w-site px-5 desktop:px-8`. Group counts and block
types checked by `groups()` (e.g. 4 trust pairs, 4 cards, 3 reviews).

**Elsewhere.**
- `app/sitemap.js`: replace the hard-coded live city list with the 17 design slugs (from `lib/site/cities.js`).
- `docs/redesign.md`: mark Toronto and Muskoka as arrived and tick the slice; `lib/site/progress.js` statuses and
  `UPDATED`.

## Testing

TDD with Jest: the slug map (17 cities, each route matches its file), the hub and city page render (headings, card
counts, design prices, FAQ items, nearby links), each new component, the unknown-slug `notFound()`, `SITE_ROUTES`, and
the sitemap list. Then the definition of done: lint/test/build, every one of the 18 routes returns 200 with
title/meta/canonical matching `page-map.csv`, and 1440px/390px screenshots compared with the design (hub, Aurora,
Toronto, Muskoka, plus the phone grid measured).

## Left to the builder

Exact component props and file split, how the trust-strip inline links are rendered (via `Blocks`), and the review
card's source line.
