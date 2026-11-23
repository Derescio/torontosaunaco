# The Toronto Sauna Co. — www.thetorontosaunaco.com

Next.js 15 (App Router, JS/JSX) on Vercel. MongoDB via Mongoose (products, heaters, accessories, orders, users),
Sanity (blog), Cloudinary (images/video), Redux cart (`localStorage` key `cart`), NextAuth, nodemailer
(`app/api/emails`), PostHog. Staff edit catalogue data in `/editor`; admin in `/admin`, `/marketing`.

## Commands

- `npm run dev` / `npm run build` / `npm run lint` / `npm test` (Jest, jsdom; tests live beside code as `*.test.js` and in `__tests__/`)
- Node 22.x

## Branches and environments

| Branch | Deploys to | Purpose |
|---|---|---|
| `main` | Production | The live site. Merge only via PR. |
| `development` | Preview | Fixes for the **current** site, then PR → `main`. |
| `redesign` | Staging (Vercel custom environment) | The new site and the source of truth for all redesign work. Long-lived until cutover. |
| `rd/<phase>-<slice>` | Preview per PR | One slice of redesign work, PR → `redesign`. (Not `redesign/…`: git can't have both `redesign` and `redesign/x`.) |

- All redesign changes, including docs and tooling, go to `redesign`. Nothing reaches `main` until the owner approves the cutover.
- **Never** open or merge a PR from `redesign` into `main` before cutover. The `guard-redesign-into-main` check fails any such PR
  unless it carries the `cutover` label, which only the owner adds.
- GitHub rulesets protect `main` and `redesign`: no direct pushes, force pushes or deletion; changes arrive by PR.
- Merge `main` into `redesign` weekly so live-site fixes (prices, images) carry over.
- Non-production deployments send `X-Robots-Tag: noindex` (`next.config.mjs`). Keep it.
- Staging is behind Vercel Deployment Protection. For automated checks against it, send the header
  `x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET`. Read the value from the environment; never print or commit it.

## Data: production safety rules

- The database is picked by the name in `MONGO_URI` (`config/db.js` connects to whatever the URI says).
  - Production: **`test`**. Live customer data.
  - Staging, previews and local redesign work: **`staging`**. Catalogue + staff accounts only, seeded from `test` by
    `scripts/staging/copy-test-to-staging.mjs` (reads `test`, never writes it; no orders, leads or customer accounts).
  - `toronto`: a partial copy of `test` made by `/api/cron/mirror-test-to-toronto` (`docs/mirror-test-to-toronto.md`). That job
    is not in `vercel.json`, so it only runs when triggered by hand. Don't build on `toronto`.
- Never point a redesign build or script at `test`. TODO: guard in `connectDB` that refuses `test` unless `VERCEL_ENV === "production"`.
- Schema changes must be **additive** (e.g. add `slug`, never rename or remove fields), so the current site keeps working
  until cutover. Migrations run on `staging` first, then on `test` only with the owner's go-ahead.
- Never write to `.env` or read secrets into output. Don't run scripts in `scripts/` against production (the read-only staging seed
  script above is the one exception).
- This repo is public during the redesign. Never commit secrets, customer data or personal email addresses.
- Staging email must not reach customers or the sales team: outside production, every recipient is replaced by `STAGING_EMAIL_TO`
  (set in Vercel Staging/Preview and `.env`). TODO: not built yet. `app/api/emails/route.js` always sends to the sales inbox, so
  don't submit forms on staging until the override exists.

## The redesign

- Plan and progress: `docs/redesign.md`. Keep its checklists current as slices land.
- Design source (the spec, not code to copy): `%USERPROFILE%\Downloads\TSC-REVAMP\Site\` (108 `*.dc.html` pages + `assets/`;
  view with `python -m http.server 8765` in that folder). Ignore `Piece-zsi1.dc.html`, a stray copy of `Main.dc.html`.
  Route for each page: `TSC-REVAMP\Launch File\page-map.csv`.
  Redirects: `TSC-REVAMP\Launch File\redirect-map.csv`. Do not use its `/saunas/*` or `/accessories/*` wildcard rules, and
  do not redirect `/signin` or `/orders` (they break admin login and order history).
- Copy, prices, options and SEO head (title, meta, canonical, JSON-LD) come verbatim from the `.dc.html` files.
  Prices in the design vs MongoDB: MongoDB wins unless the owner approves a change.
- Build reusable components and Tailwind tokens, not one-off inline styles. The design's spacing, type sizes and button
  variants are inconsistent. Normalise them to one scale in `tailwind.config.js` instead of copying each value.
- New redesign components go in `components/site/`. `components/redesign/` is an older set used by the **live** site; don't
  add to it or change it for the new design.

## Business rules (change only with the owner)

- Prices shown before tax; HST 13% on its own line.
- Saunas: delivery + installation in Ontario $1,750; delivery to a depot $450. Plunges, showers, heaters and accessories:
  delivered to the door, delivery quoted.
- No online payment: Stripe checkout stays behind `ENABLE_CHECKOUT` (off). Cart = quote request.
- No "Leisurecraft" in headings or customer-facing text, except the dealer badge on the homepage (contractual).
- Contact: (437) 429-6623, sales@thetorontosaunaco.com, showroom 17380 Highway 27, Schomberg, by appointment.
  Use "Schomberg" everywhere, including LocalBusiness JSON-LD (not "King, ON").
- Domain is `www.thetorontosaunaco.com` (with "the"). See `lessons.md`.

## Conventions

- Read `lessons.md` before touching metadata or JSON-LD. OpenGraph `type` must be `"website"`, never `"product"`.
- Dynamic routes serving known content use `generateStaticParams` + ISR (`revalidate`). See `.cursor/rules/nextjs-cost-optimization.mdc`.
- Guard data from MongoDB defensively (`Array.isArray` before `.map`).

## Definition of done for a redesign slice

1. `npm run lint`, `npm test` and `npm run build` pass.
2. Each changed route returns 200 and its title/meta/canonical match `page-map.csv`.
3. Screenshot compared against the matching design page at 1440px and 390px wide.
4. PR into `redesign` with a summary and the preview URL. The owner reviews on staging.
