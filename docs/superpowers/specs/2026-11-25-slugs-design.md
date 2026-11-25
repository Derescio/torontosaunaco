# Product slugs and ID redirects (`rd/1-slugs`)

Phase 1, item A in `docs/redesign.md`. Status: draft for owner approval.

## Why

Product URLs move from Mongo IDs (`/saunas/668af06648215c199c406a5f`) to the design's routes (`/saunas/pure-cube-552`).
Every old ID URL must permanently redirect to its slug, with no hand-kept list, so search rankings carry over.

## Goals

- Add a `slug` field to `Products` and `Accessories` the way `Heaters` has one: `slugify` plus a pre-save hook that
  fills it from the name when empty. The change is additive only, so the live site keeps working.
- Backfill slugs so each one matches its `page-map.csv` route exactly.
- Serve today's product pages at the new slug URLs now (approach A, chosen by the owner), and 308 every ID URL to them.

## Non-goals

- No reskin. The new slug URLs render the current product pages. Phase 3 reskins those same routes.
- No changes to card/link components (`ProductCard`, `components/redesign/*`, carousels). They keep linking by ID and go
  through one redirect until Phase 3 rebuilds them.
- No `redirect-map.csv` work: no `/saunas/*` or `/accessories/*` wildcards, and nothing for `/signin` or `/orders`.
- Hot tubs (`/hot-tub`, `/tubs`) are untouched. They're not in the design (open owner decision, §B).
- Heater slugs exist already and are out of scope. One finding for later: `HeaterApex208` and `HeaterApex240` both
  match one "Homecraft Apex" record, and `HeaterRevive` matches two.
- Product SEO metadata/JSON-LD beyond pointing the canonical at the slug URL is out of scope: that's the `rd/1-seo` slice.

## Approaches considered

- **A: serve old pages at slug URLs now, redirect IDs now (chosen).** Staging stays fully clickable, and Phase 3 only
  reskins.
- B: slugs now, redirects switched on in Phase 3. This leaves the redirect logic untested on staging for weeks.
- C: redirect now to URLs that 404 until Phase 3. This breaks staging.

## Design

**Slug values.** A slug is the product's route below its category root:

| Product type (`type`) | URL | Example slug |
|---|---|---|
| Saunas (every type except the three below) | `/saunas/<slug>` | `pure-cube-552`, `indoor/pure-cube-552` |
| `Cold Plunge` | `/cold-plunges/<slug>` | `arctic` |
| `Outdoor Shower` | `/outdoor-showers/<slug>` | `sunlight` |
| `Hot Tub` | none yet (keeps its ID URL) | from the name |

Indoor Pure Cubes live at `/saunas/indoor/pure-cube-552` in the design, and "The Pure Cube 552" (outdoor) at
`/saunas/pure-cube-552`. Storing the path below `/saunas` (`indoor/pure-cube-552`) keeps one plain unique index and
makes the URL a straight prefix plus slug. One function, `productPath(product)`, turns a product into its URL (or
`null` for hot tubs) and is the only place that rule lives.

**Schema.** `Products` and `Accessories` get
`slug: { type: String, unique: true, sparse: true, trim: true, lowercase: true }` plus the Heaters-style pre-save hook
(`slugify(name)`, `-1`, `-2`… on a clash). Nothing is renamed or removed. Accessories have no per-item design pages,
so their slugs come from their names. The one duplicate name, "Supreme Sauna Accessory Package", gets a `-1`.

**Backfill script** `scripts/slugs/backfill-slugs.mjs` (`npm run slugs:backfill`):
- It matches design pages to products with the price diff's matcher and `scripts/price-diff/matches.json`, so there is
  one source of truth for "which page is which product". The slug is the route from `content/redesign` minus the
  category root.
- Products with no design page (3 hot tubs, the "Arctic … Clear Red Cedar test" record) get `slugify(name)`. A design
  page matching several products, like `PlungeArctic`, needs a pick in a small `scripts/slugs/primary.json`
  (Arctic → the Knotty Red Cedar record). Otherwise the script stops and names the conflict.
- It's a dry run by default and prints an ID → slug table. `--apply` writes `$set: { slug }` only to documents with no
  slug yet, and never overwrites. Re-running it is safe.
- It refuses every database except `staging`. Running on `test` needs `--production` as well. The owner runs that at
  cutover; it's never run as part of this slice.
- It stops before writing if two documents would share a slug.
- The planning logic is a pure function with Jest tests. The script itself only does the I/O.

**Routes** (each resolves via `lib/products/` helpers with unit tests):
- `app/saunas/[id]`: a 24-hex ID that has a slug and a non-null `productPath` gets a `permanentRedirect` to that path.
  This covers plunges and showers that today are also reachable under `/saunas/<id>`. An ID with no slug, or a hot
  tub, renders exactly as today, so production is safe until the backfill runs on `test`. Any other param is looked
  up as a sauna slug: render, or `notFound()`. `generateStaticParams` returns sauna slugs instead of IDs. ID URLs
  render on demand and are cached by ISR.
- New `app/saunas/indoor/[slug]`: looks up slug `indoor/<slug>` and renders the same page.
- `app/cold-plunge/[id]` and `app/showers/[id]`: the current client page moves unchanged into a colocated client
  component that takes `id` as a prop. The `page.jsx` becomes a server component that redirects the ID to the slug
  URL, or renders the client component (no slug yet).
- New `app/cold-plunges/[slug]` and `app/outdoor-showers/[slug]`: look up by slug and type, then render the same
  client component with the product's ID. Both routes use `generateStaticParams` + `revalidate`.
- `/cold-plunges` and `/outdoor-showers` listing pages aren't added here (Phase 3).
- The canonical in `app/saunas/[id]` metadata points at `productPath`. The sitemap lists `productPath` URLs, falling
  back to today's ID URL when a product has no slug.

**Docs.** Update `docs/redesign.md` (tick A, record the Apex/Revive finding, add "run `npm run slugs:backfill --
--production` on `test`" to the cutover list) and `lib/site/progress.js`.

## Verification

- Jest tests for `productPath`, slug planning (design match, name fallback, primary pick, clash detection, staging
  guard) and route resolution.
- Dry run on `staging`, then `--apply` on `staging`, then re-run to confirm "0 to write".
- A local `next start` on `staging`. Each changed route returns 200, every product's old ID URL returns 308 to the
  right slug, `/saunas/indoor/pure-cube-552` renders the indoor product, and the hot tub ID URLs still render.
- `npm test` and `npm run build` pass (ESLint isn't configured, a known issue).

## Left to the builder

File and helper names inside `lib/products/`, test layout, and the exact console format of the dry-run table.
