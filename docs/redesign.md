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
- [ ] `__tests__/getServerSession.test.js` fails to parse (pre-existing, Jest transform of next-auth deps)
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
| Service-area city pages | `app/service-areas/[id]` + city data | Reskin and add the new cities. |


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
- [ ] Price mismatch approvals (D), address string, quote wording (E)

### Phase 1: Foundation (~3 days)
- [x] **Design tokens** (`rd/1-tokens`): values in `lib/site/tokens.js`, spread into `tailwind.config.js`; Cormorant Garamond + Manrope self-hosted via `next/font/local`; `components/site/Button.jsx`; review page `/style-guide` (404 in production). Spec: `docs/superpowers/specs/2026-11-23-design-tokens-design.md`.
- [ ] Rebuild `Header` (dropdown nav as designed) and `Footer` in `components/site/`. Update the root layout.
- [ ] **Extraction script** (`scripts/extract-dc.mjs`): `.dc.html` → JSON per page (route, title, meta, canonical, OG, JSON-LD, data object, copy blocks). Output goes in `content/redesign/`.
- [ ] **Price/data diff script**: extracted design data vs MongoDB → a report for the owner.
- [ ] `slug` on Products/Accessories + backfill migration (A).
- [ ] Shared SEO helper: build Next `metadata` + JSON-LD from the extracted head and the `page-map.csv` row.

### Phase 2: Content pages (~4 days)
Using the 36 files we have:
- [ ] Policy pages (5): `/privacy`, `/refund-policy`, `/shipping`, `/terms`, `/warranty`
- [ ] `/about`, `/wellness`, `/contact` (with `#visit` preselect), `/blog` index (and reskin `/blog/[slug]`)
- [ ] `/service-areas` hub + `[id]` city template (15 cities from files; Toronto and Muskoka once their files arrive)
- [ ] `/sauna-finder` (port the `fdData/fdState/fdVals` logic as a client component, fed from MongoDB)

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
- [ ] Merge to `main` → Vercel production. Submit the new sitemap in GSC.
- [ ] Monitor GSC 404s/coverage and quote emails for 2–4 weeks.

**Estimate:** about 3–3.5 weeks of development once Phase 0 inputs arrive. Phases 1–2 can start now.
