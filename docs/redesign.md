# Site Redesign

Plan and progress for the redesign, built on the `redesign` branch (deploys to Staging).
Copied from the handoff's `IMPLEMENTATION-PLAN.md` (v2, 2026-11-21) on 2026-11-23. This file is now the source of truth.

## Decisions log

| Date | Decision |
|---|---|
| 2026-11-23 | Staging deploys from `redesign`. Slice branches are `rd/<phase>-<slice>` (git can't hold both `redesign` and `redesign/x`). |
| 2026-11-23 | New components go in `components/site/`. `components/redesign/` is an older set used by the live site. |
| 2026-11-23 | Address string: "Schomberg" (17380 Highway 27, Schomberg), everywhere including LocalBusiness JSON-LD. |
| 2026-11-23 | `staging` Mongo database created from `test`: catalogue + 2 staff accounts; no orders, leads or customer accounts. |
| 2026-11-23 | Staging/preview email goes to `STAGING_EMAIL_TO` (developer's inbox), never to customers or sales. |
| 2026-11-23 | Repo made public for the redesign (GitHub rulesets need it on the free plan); goes back to private after cutover. |

## Setup checklist

- [x] `staging` database seeded (`scripts/staging/copy-test-to-staging.mjs`)
- [x] Guard in `config/db.js`: refuse `test` outside production
- [x] Recipient override in `app/api/emails` and `app/api/cron` outside production; HubSpot sync skipped outside production
- [x] GitHub rulesets on `main` and `redesign`; `guard-redesign-into-main` check
- [x] `MONGO_URI` / `STAGING_EMAIL_TO` set in Vercel and local `.env` (owner, 2026-11-23)
- [ ] ESLint is not configured (`npm run lint` prompts for setup). Needs its own slice.
- [ ] `__tests__/getServerSession.test.js` fails to parse (pre-existing, Jest transform of next-auth deps). Jest's `@/` alias now points at the repo root, matching `jsconfig.json`.
- [ ] Local `MAIL_USER`/`MAIL_PWD` rejected by Gmail; refresh the app password to test email locally
- [x] Staging custom domain `staging.thetorontosaunaco.com`: DNS valid, Staging URL variables set (2026-11-23)
- [ ] Google OAuth: add `https://staging.thetorontosaunaco.com/api/auth/callback/google` as a redirect URI (owner)

---

## 1. How the handoff maps onto the existing app

| Handoff piece | Existing app | Decision |
|---|---|---|
| `.dc.html` pages (design + copy) | `app/**` routes + `components/site/*` | Rebuild as React/Tailwind components. Copy comes verbatim from the `.dc.html` files. |
| Product data hard-coded in each page's JS | MongoDB `Products`, `Heaters`, `Accessories`, edited via `/editor` | **Keep MongoDB as the source of truth** so staff edits keep working. Run a price diff first (section 3, Phase 1). |
| Quote cart (`localStorage` `tsc_cart`) | Redux `cartSlice` (`localStorage` `cart`) + `app/cart` + `ENABLE_CHECKOUT` flag | Keep Redux. Reskin the Cart page into the new Quote Proposal layout with print/PDF styles. Leave Stripe checkout switched off. |
| Cloudflare email worker | `app/api/emails/route.js` (nodemailer) | **Don't deploy the worker.** Port its proposal HTML and customer-copy email into the existing route. |
| `_redirects` (Cloudflare format) | `next.config.mjs` `redirects()` | Move the redirects into `next.config.mjs`, with changes (section 2). |
| `sitemap.xml`, `robots.txt` | `app/sitemap.js`, `app/robots.js` | Update the dynamic versions to the new URLs. Don't drop in the static files. |
| 11 blog posts to migrate | Already in Sanity at `/blog/[slug]` | Nothing to migrate. Just reskin and check the slugs match. |
| `/_blob/<id>` images | Cloudinary + `public/images` | Most photos probably already exist. Match them, and upload only the new ones to Cloudinary. |
| Service-area city pages | `app/service-areas/[id]` + city data | Reskin and add the new cities. Done: 17 design cities (Phase 2). |


---

## 2. Problems to resolve before building

### A. URL change: product pages move from Mongo IDs to slugs
Today: `/saunas/668af06648215c199c406a5f`. New: `/saunas/pure-cube-552`.
- Add a `slug` field to `Products` (and `Accessories`), the same way `Heaters` already does it with `slugify` and a pre-save hook. Backfill the slugs from `page-map.csv` so they match exactly.
- In `app/saunas/[id]/page.jsx`, if the param is a 24-character ObjectId, look up the product and issue a **permanent redirect to its slug**. This covers *every* old product URL, including ones missing from `redirect-map.csv`, with no hand-kept list.
- Do the same for `cold-plunge/[id]` → `/cold-plunges/<slug>` and `showers/[id]` → `/outdoor-showers/<slug>`.

### B. The handoff redirect map has gaps and conflicts with this app
- **Conflicts:**
  - `/signin → /` would break NextAuth login for `/admin`, `/editor` and `/marketing`.
  - `/orders → /` hides authenticated order history.
  - Drop both, or move auth to a path like `/account/signin` first.
- **Wildcards hijack new pages:** `/saunas/* → /saunas` also catches `/saunas/cube` and every new product. Next.js `redirects()` run before page routes, so this would break the site. Remove it, since item A replaces it.
- **Current routes with no redirect target:**
  - `/showers` and `/showers/[id]` (new: `/outdoor-showers/...`)
  - `/hot-tub`, `/hot-tub/[id]`, `/tubs`
  - `/saunas/studio-6`
  - `/videos`, `/register`, `/custom-builds` (that one is covered), `/pacifictide` (still in today's sitemap), `/precheckout`, `/checkout`
  - Decide each with the owner. Hot tubs aren't in the new design at all: are they being discontinued?
- **Heaters:** `/heaters/* → /sauna-heaters` sends every heater to the listing page and loses per-product rankings. Use `/heaters/:slug → /sauna-heaters/:slug` where the slugs match.
- **Before launch:** export the real indexed URLs from Google Search Console and check every one resolves.

### C. Design files: resolved (2026-11-21)
All 108 pages were pulled from the shared Claude design canvas into `Site/`. The 473 photos the pages reference are in the canvas asset store and still need downloading. The one checked was a real manufacturer product photo, not AI-generated.

### D. Prices: the design and the database may disagree
Each design file carries prices, and so does MongoDB (recently updated: commit `3dddc86`). Before building, run a diff script that compares design data against Mongo and give the owner a list of mismatches to approve. Never overwrite DB prices silently.

### E. Owner decisions carried over
- ~~Address string~~: decided 2026-11-23, "Schomberg". It must match the LocalBusiness JSON-LD everywhere.
- Label emailed quotes "estimate, subject to confirmation"? The cart total is computed in the browser.
- Spam protection on `/api/emails`: honeypot + Turnstile or reCAPTCHA + rate limiting. Check what exists today.


---

## 3. Phased plan

Work on the long-lived `redesign` branch (deploys to Staging). Merge `main` into `redesign` weekly so live-site fixes carry over. Each slice is an `rd/<phase>-<slice>` branch with a PR into `redesign`. Vercel previews are already `noindex` (see `next.config.mjs`), so the owner can review safely.

### Phase 0: Inputs (owner, in parallel)
- [x] Remaining design files / canvas link (C)
- [ ] Redirect decisions for unmapped routes (B)
- [ ] Price mismatch approvals (D): owner and client go through `reports/price-diff-<date>.docx` (`npm run price-diff`); quote wording (E)
  - **Revisit when the review is done (owner, 2026-11-25):** how the decided prices reach MongoDB.
    1. The owner edits prices in `/editor` on the live site. Then re-copy staging, run `npm run slugs:backfill:apply`,
       and re-run `npm run price-diff` to confirm only "keep website" rows remain.
    2. Build an apply slice. It reads the ticked boxes and "Other" amounts from the `.docx` (Ref column), uses
       `websiteIds` in the `.json`, dry-runs, applies on `staging`, then on `test` with the owner's go-ahead.
       About a day of work.
  - Either way, the 14 design-only products (Pure Cube 772, the Narvi heaters, …) have no database record yet and need
    creating.

### Phase 1: Foundation (~3 days)
- [x] **Design tokens** (`rd/1-tokens`): values in `lib/site/tokens.js`, spread into `tailwind.config.js`; Cormorant Garamond + Manrope self-hosted via `next/font/local`; `components/site/Button.jsx`; review page `/style-guide` (404 in production). Spec: `docs/superpowers/specs/2026-11-23-design-tokens-design.md`.
- [x] `Header` (dropdown nav, phone menu) and `Footer` in `components/site/` (`rd/1-header-footer`). New pages live in `app/(site)/` and must be listed in `lib/site/routes.js`; live pages keep the old nav. Spec: `docs/superpowers/specs/2026-11-24-header-footer-design.md`.
- [x] Client progress page `/progress` (staging only, noindex). **Update `lib/site/progress.js` (statuses + `UPDATED`) in every redesign PR.**
- [x] **Extraction script** (`rd/1-extract`): `scripts/extract-dc.mjs` turns the 108 `.dc.html` pages into JSON in
  `content/redesign/` (route, page-map row, SEO head, data objects, copy as typed blocks, warnings), plus `index.json`
  (route → file). Re-run with `npm run extract:dc` (folder: argument, `DC_SITE_DIR`, or `~/Downloads/TSC-REVAMP/Site`)
  and commit the diff. Spec: `docs/superpowers/specs/2026-11-24-extract-dc-design.md`. Owner-approved copy changes
  live in `scripts/extract-dc/copy-edits.mjs` and apply to every extracted string (the run fails if a rule stops
  matching). First rule: "Schomberg (King Township)" → "Schomberg". Findings for the next slices:
  - 65 product pages have `og:type "product"` in the design. The SEO helper must always emit `"website"` (`lessons.md`).
  - All titles, descriptions and canonicals match `page-map.csv`; no "Leisurecraft" outside the homepage.
  - Prices: products in `data.D.steps[].groups[].options[].price`, heaters in `data.d.steps[].options[].price`,
    listings in `data.D.items[].p`, finder in `data.fdData[].s[].p`, accessories in `Accessories.json`
    `data.items` / `items_2` / `packages` / `lighting` (strings like `"$82.00"`), heater listing in `Heaters.json`
    `data.electric` / `data.wood`. Data is any constant JS literal in the page script (parsed with acorn, never run).
- [x] **Price/data diff script** (`rd/1-price-diff`): `npm run price-diff` compares `content/redesign` with the
  `staging` catalogue (refuses any other database) and writes `reports/price-diff-<date>.docx` (the owner/client
  meeting document: one table per product, a decision box per line, shared options decided once) and `.json` (same
  rows with stable ids, for the later apply step). `reports/` is git-ignored. If staff changed prices in `/editor`
  since the last staging copy, re-run `scripts/staging/copy-test-to-staging.mjs` first. Wrong or missing product
  matches go in `scripts/price-diff/matches.json`. Spec: `docs/superpowers/specs/2026-11-24-price-diff-design.md`.
  First run (24 Nov): 52 products compared, 14 new in the design, 3 hot tubs only on the website, 287 lines to decide
  (75 shared options, 212 product-specific). Each row's `websiteIds` names the database points a decision changes.
- [x] **Slugs** (`rd/1-slugs`, item A): `slug` on Products and Accessories (`models/plugins/slugFromName.js`, filled
  from the name on save). A slug is the route below its root, so indoor ones keep their folder
  (`indoor/pure-cube-552`); `productPath()` in `lib/products/slugs.js` is the one place that rule lives. Hot tubs have
  no new URL. `npm run slugs:backfill` plans slugs from the price diff's design ↔ product matching (`primary.json`
  picks Knotty Red Cedar for the two Arctic records), dry run by default; `npm run slugs:backfill:apply` writes
  missing slugs only (not `npm run slugs:backfill -- --apply`: Windows PowerShell drops the `--`, so it only
  dry-runs). Staging only (`test` needs `--production`). Applied on staging 25 Nov: 42 design slugs, 4 from names
  (3 hot tubs, the Arctic "test" record), 51 accessories. The Arctic "Clear Red Cedar test" record
  (`668af06648215c199c420a66`) stays until after cutover (owner, 2026-11-25; see Phase 6). It was briefly deleted from
  staging and came back with the next copy. **Re-run `npm run slugs:backfill:apply` after
  `copy-test-to-staging.mjs --write --drop`**, which wipes the slugs.
  Today's pages now serve at `/saunas/<slug>`, `/saunas/indoor/<slug>`, `/cold-plunges/<slug>`,
  `/outdoor-showers/<slug>`; old ID URLs (`/saunas/<id>`, `/cold-plunge/<id>`, `/showers/<id>`) 308 to them, and
  render as before when a product has no slug. The sitemap lists slug URLs. Spec:
  `docs/superpowers/specs/2026-11-25-slugs-design.md`. Finding for the heater pages: `HeaterApex208` and
  `HeaterApex240` both match one "Homecraft Apex" record, and `HeaterRevive` matches two.
- [x] **Shared SEO helper** (`rd/1-seo`): `pageSeo(route, { price })` in `lib/site/seo.js` returns Next `metadata`
  and JSON-LD from the design head (`content/seo.json`, written by `npm run extract:dc`; it sits outside
  `content/redesign/` because the price diff and slug backfill read every file there). Rules applied every time:
  og:type `"website"`, domain `www.thetorontosaunaco.com`, one business `@id` (`/#business`, was `#store` on 20
  pages) with Schomberg, `noindex` from the page-map Index column (`/cart`). Catalogue prices come only from
  MongoDB: `price` for the page's own product, `prices: { "<route>": number }` for products listed on the page
  (`/accessories` lists 70, `/sauna-heaters` 14); each sets `Offer.price` / `AggregateOffer.lowPrice` plus
  `availability` and `priceValidUntil`. A Product with no price is removed (inside a list it becomes a plain link),
  since a Product without offers is an invalid rich result. The city pages' Service offer ($1,750 delivery +
  installation) stays as designed. Design images (`/_blob/<id>`) map through `content/image-map.json`; unmapped
  ones are dropped and og:image falls back to `/og/Redesign_BG_Image.png`. The map is filled (`rd/2-about-wellness`):
  all 439 design photos are in Cloudinary under `redesign/<hash>`, with url, width and height per hash
  (`npm run images:upload`; dry run by default, `--write` uploads what's missing). Pages render them with
  `components/site/SiteImage.jsx` (Cloudinary resizes; Vercel doesn't). The 34 design PDFs aren't uploaded yet.
  Use: `export const metadata = pageSeo("/about").metadata` and `<JsonLd data={pageSeo("/about").jsonLd} />`
  (`components/site/JsonLd.jsx`). Spec: `docs/superpowers/specs/2026-11-25-seo-helper-design.md`.
  **Owner decision pending:** two design prices sit in copy, not in `offers`: "sauna kits from $8,070" (`/saunas/indoor`
  description) and "Pure Cube 552 is $11,884" (homepage FAQ). Keep, update to the MongoDB price, or remove? Until
  then they're allow-listed in `lib/site/seo.routes.test.js`, which fails on any other dollar amount.

### Phase 2: Content pages (~4 days)
Using the 36 files we have:
- [x] Policy pages (5): `/privacy`, `/refund-policy`, `/shipping`, `/terms`, `/warranty` (`rd/2-policies`). One
  template, `components/site/PolicyPage.jsx`, fed by `lib/site/policy.js`; `components/site/Blocks.jsx` renders extracted
  blocks and is meant for the rest of Phase 2. The live `app/{shipping,terms,warranty}` pages were removed on `redesign`.
  Spec: `docs/superpowers/specs/2026-11-26-policies-design.md`.
- [x] `/about`, `/wellness`, `/contact` (with `#visit` preselect), `/blog` index (and reskin `/blog/[slug]`)
  - [x] `/about` and `/wellness` (`rd/2-about-wellness`), built from section components in `components/site/`
    (`SectionHeader`, `Split`, `NumberedPoints`, `StatGrid`, `PhotoGrid`, `Steps`, `CtaBand`) with copy looked up by
    section name (`lib/site/content.js`). The live `app/about` page is removed on `redesign`.
    Spec: `docs/superpowers/specs/2026-11-26-about-wellness-design.md`.
  - [x] `/contact` (`rd/2-contact`): the design's three-mode form (`#visit` / `#question` preselect) posts to
    `app/api/site/contact/route.js`, a route only the new site uses. Production mail goes to sales@ and tjallen@
    (design); everything else goes through `applyEmailSafety()` to `STAGING_EMAIL_TO` only, and the "open your email
    app" fallback exists only in production (sales@ only). HubSpot only in production; attribution saved as
    `site_contact`. Spec: `docs/superpowers/specs/2026-11-26-contact-design.md`.
    **For `development` (live site):** `app/api/emails/route.js` puts visitor input into the email HTML unescaped,
    so anyone can inject links or markup into staff emails. The new route escapes everything.
  - [x] `/blog` and `/blog/[slug]` (`rd/2-blog`): every published Sanity post, newest first (the newest is featured),
    refreshed every 2 hours (ISR). The design's 11 posts keep the design's category, summary and photo; other posts use
    their Sanity photo and description. If Sanity is down or empty, `/blog` shows the design's 11 cards. Article pages
    have no design: built from site pieces, OpenGraph `website` plus `BlogPosting` JSON-LD. Sanity photos are resized by
    Sanity's CDN. No pagination: revisit past ~60 posts. The live homepage's "BLOGS" strip moved to
    `components/LatestBlogPosts.jsx` until the Phase 3 homepage. Spec: `docs/superpowers/specs/2026-11-26-blog-design.md`.
- [x] **Service areas** (`rd/2-service-areas`): `/service-areas` hub and `/service-areas/[id]` for all 17 design cities
  (Toronto and Muskoka arrived), from `ServiceAreas.json` and `City*.json` via `lib/site/cities.js` (one entry per file,
  in the hub's card order; feeds `generateStaticParams` and the sitemap). Unknown slugs → `notFound()`. The live
  `app/service-areas/` and `lib/cities.js` are gone from `redesign` only; the dropped live cities (Ottawa, Barrie,
  Kawarthas, Vancouver, Calgary, Newmarket) redirect to the hub at cutover (`redirect-map.csv`). Owner, 2026-11-26: the
  recommended-sauna cards show the **design's prices** (not MongoDB; no product prices in the city JSON-LD), and
  "King Township showroom" stays as designed. FAQ is native `<details>`. Spec:
  `docs/superpowers/specs/2026-11-26-service-areas-design.md`.
- [x] **Sauna Finder** (`rd/2-sauna-finder`): `/sauna-finder`. The design's `fdVals()` rules are ported to
  `findSaunas()` in `lib/site/saunaFinder.js`, a pure function checked against the design's own logic over 1,470
  inputs (`saunaFinder.reference.js`, test-only). `components/site/SaunaFinder.jsx` holds the inputs.
  - **Catalogue:** the design's `fdData` as is: sizes, seats, prices and flags (owner, 2026-11-27, option A).
    MongoDB has no seats, incomplete dimensions, and four finder saunas are missing on staging (Pure Cube 772,
    Studio Six Max with Changeroom, Palmer, MiniPOD).
  - **Phase 3:** add the fields (seats, full dimensions per size, best-seller/range flags) with `/editor` inputs,
    then build the catalogue from MongoDB in the same shape.
  - **Quote button:** the design's `mailto:` to sales@/tjallen@ became `/contact?msg=…`. The contact form fills the
    message box from `?msg=`, and its mode ignores the message text.
  - Spec: `docs/superpowers/specs/2026-11-27-sauna-finder-design.md`.

### Phase 3: Catalogue (~5–6 days, needs C)
- [ ] Category listing template with filter chips + sort → `/saunas/{cube,barrel,luna,canadian-timber,indoor,indoor/kits,indoor/custom,best-sellers}`, `/cold-plunges`, `/outdoor-showers`, `/sauna-heaters`, `/saunas`
- [ ] Product detail reskin on the existing `components/sauna/*` (`ProductConfigurator`, `PriceSummary`, gallery), with slug routing (A).
- [ ] Pricing rules into one tested module:
  - prices shown before tax, HST 13% on its own line
  - $1,750 Ontario install, $450 depot delivery
  - plunges, showers, heaters and accessories: delivery to the door, quoted
  - Jest tests, extending `__tests__`
- [ ] `/accessories`, homepage (keep the Leisurecraft dealer badge; no Leisurecraft in other customer-facing text)

### Phase 4: Quote cart + email (~2 days)
- [ ] Cart → Quote Proposal view (same layout as the worker's `proposalHtml`), print stylesheet, Download PDF, `noindex`.
- [ ] `/api/emails`: send the customer their proposal copy, and the team (sales@ + tjallen@) the proposal + timeline/contact/notes. Today it only goes to tjallen@. Reuse the worker's HTML templates.
- [ ] Spam hardening (E). Keep PostHog quote-attribution tracking (`QuoteAttributionSubmission`) working.

### Phase 5: SEO, redirects, QA (~3 days)
- [ ] `next.config.mjs` redirects from the cleaned map (B). Update `app/sitemap.js` to the new routes (107 URLs; `/cart` excluded, admin routes excluded). Keep `robots.js` disallowing `/cart`, `/admin`, `/editor`, `/marketing`.
- [ ] Automated checks (a script run against the preview URL):
  - every `page-map.csv` route returns 200
  - title, meta and canonical match the CSV
  - every old URL from GSC returns a 301 to the right target
  - no new page gets redirected
  - JSON-LD validates
- [ ] Visual QA against the canvas, mobile + desktop. Lighthouse ≥ 90.
- [ ] Regression: `/editor` edits show up on the new pages (ISR revalidate). Admin login still works.

### Phase 6: Launch
- [ ] Owner, before the merge, with `MONGO_URI` pointing at `test`:
  `node --env-file=.env scripts/slugs/backfill-slugs.mjs --production` (dry run), then add `--apply`.
  Without it old product URLs still render but don't redirect, and the new slug URLs 404.
- [ ] Merge to `main` → Vercel production. Submit the new sitemap in GSC.
- [ ] Monitor GSC 404s/coverage and quote emails for 2–4 weeks.
- [ ] Owner, after the post-cutover walkthrough: delete the Arctic "Clear Red Cedar test" product
  (`668af06648215c199c420a66`) from `test` in Atlas (decided 2026-11-25). Until then it keeps its page at
  `/cold-plunges/the-arctic-plunge-tub-clear-red-cedar-test`.

**Estimate:** about 3–3.5 weeks of development once Phase 0 inputs arrive. Phases 1–2 can start now.
