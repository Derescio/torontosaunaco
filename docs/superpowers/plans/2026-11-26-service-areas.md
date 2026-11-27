# Service Areas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve the design's `/service-areas` hub and 17 `/service-areas/<city>` pages from `app/(site)/`, replacing the live pages on `redesign` only.

**Architecture:** One page component per page type (`ServiceAreasPage`, `CityPage`) reads its copy from `content/redesign/*.json` through `section()`/`pick()`/`groups()`. A city registry (`lib/site/cities.js`) maps slug → content file and feeds `generateStaticParams` and the sitemap. SEO comes from `pageSeo(route)` unchanged.

**Tech Stack:** Next.js 15 App Router (JSX), Tailwind tokens, Jest + Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-11-26-service-areas-design.md`

## Global Constraints

- Copy verbatim from `content/redesign/ServiceAreas.json` and `City*.json`. No new copy edits; "King Township showroom" stays.
- Recommended-sauna card prices are the design's (`card.blocks[3]`, e.g. Aurora Neptune `$17,896`). No MongoDB lookup on these pages.
- Titles, meta, canonical and JSON-LD only via `pageSeo(route)` + `<JsonLd data={seo.jsonLd} />`. OpenGraph type stays `"website"`.
- New components in `components/site/`. Tailwind tokens only, `desktop:` breakpoint (998px), never `md:`. Container `mx-auto max-w-site px-5 desktop:px-8`.
- Photos through `SiteImage` / `Photo` (throws if a photo isn't in `content/image-map.json`).
- Use relative imports in `components/site/` and `app/(site)/` as the existing files do.
- Live site untouched: no changes on `main`/`development`; deletions happen on this branch only.

## Review Focus

1. **A city file whose shape drifts** (e.g. Toronto has 8 neighbourhoods, Brooklin 4): the template must read lists by length, and `groups()` must throw on a changed count of fixed groups (4 trust pairs, 4 cards, 3 reviews, 5 FAQs). Test: render every one of the 17 cities in Task 4 (`it.each(CITIES)`), not just Aurora.
2. **An unknown or old slug** (`/service-areas/ottawa`, `/service-areas/Toronto`): `notFound()`, never a crash. Test in Task 4.
3. **A photo missing from the image map** for any of the 17 heroes or 68 cards: the build must fail, not render a hole. Covered by Task 4's all-cities render (SiteImage throws).
4. **Phone width (390px)**: the hub grid and the 4-card / 4-step rows must stack to one column with no horizontal scroll. Checked in Task 6's browser pass (scrollWidth = 390, grid measured).
5. **FAQ without JavaScript**: answers must be in the HTML and open with a click on `<summary>`. Test in Task 2 (answer text present, inside `<details>`).

---

### Task 1: City registry

**Files:**
- Create: `lib/site/cities.js`
- Test: `lib/site/cities.test.js`

**Interfaces:**
- Produces: `CITIES: Array<{ slug: string, route: string, page: object }>` in the hub's card order; `getCity(slug: string): { slug, route, page } | undefined`.

- [ ] **Step 1: Write the failing test** (`/** @jest-environment node */`)
  - `it("has one entry per City*.json file")`: `fs.readdirSync("content/redesign")` filtered by `/^City.*\.json$/` has length 17 and equals `CITIES.length`; every file's `route` appears in `CITIES.map(c => c.route)`.
  - `it("derives the slug from the route")`: for every city, `route === "/service-areas/" + slug`; `getCity("aurora").page.file === "CityAurora.dc.html"`; `getCity("niagara-on-the-lake")` defined.
  - `it("follows the hub's card order")`: `CITIES.map(c => c.route)` equals `ServiceAreas.json` Section 2 `card` hrefs, in order.
  - `it("returns undefined for unknown slugs")`: `getCity("ottawa")`, `getCity("Toronto")`, `getCity(undefined)` → `undefined`.
- [ ] **Step 2: Run** `npx jest lib/site/cities.test.js` → FAIL (module not found).
- [ ] **Step 3: Implement** `lib/site/cities.js`: static `import` of the 17 JSON files (the bundler needs literal imports), ordered by the hub's card order; `slug = page.route.replace("/service-areas/", "")`. `getCity` is an exact-match lookup.
- [ ] **Step 4: Run** the test → PASS.
- [ ] **Step 5: Commit** `feat(redesign): city registry for service areas`.

### Task 2: City page building blocks

**Files:**
- Create: `components/site/Chips.jsx`, `TrustStrip.jsx`, `ProductCard.jsx`, `ReviewCard.jsx`, `Faq.jsx`
- Modify: `components/site/Steps.jsx` (add a row layout)
- Test: `components/site/CitySections.test.jsx`

**Interfaces (all take design blocks):**
- `Chips({ items: Array<{ html }>, links?: Array<linkBlock> })`: `items` render as non-link pills (`<ul>`); `links` render as pill links (`<a href>`). One of the two is given.
- `TrustStrip({ pairs: Array<[titleBlock, detailBlock]> })`: 4 columns at `desktop:`, 1 column below; detail HTML keeps its inline links (`INLINE_LINKS`).
- `ProductCard({ card })`: `card.blocks` = `[image, name, size, price]`; whole card is one `<a href={card.href}>`; image via `Photo` (aspect 4/3); price rendered from `card.blocks[3].html` verbatim.
- `ReviewCard({ stars, quote })`: `stars.html` with `aria-label={stars.label}` (`role="img"`), quote `html`, `quote.cite` HTML in a `<footer>`.
- `Faq({ items: Array<faqBlock> })`: each item is `<details>` with `<summary>` = `item.html` and the answer = `item.blocks` via `Blocks`.
- `Steps({ items, layout = "list" })`: `layout="row"` lays the same items out as 4 columns at `desktop:` with a top rule per column, 1 column below. Existing callers unchanged.

- [ ] **Step 1: Write failing tests**, using Aurora's blocks from `content/redesign/CityAurora.json`:
  - Chips: items → 5 `<li>` with "Aurora Estates" first and no links; links → 4 anchors, first `href="/service-areas/king-city"`.
  - TrustStrip: "Showroom in King Township" present; a link named "Directions" with the Google Maps href.
  - ProductCard (first Picks card): link `href="/saunas/neptune"`, text "The Neptune", "5–6 person", "$17,896".
  - ReviewCard: `getByRole("img", { name: "5 out of 5 stars" })`; "Matthew Alexander" inside a `footer`.
  - Faq: 5 `<details>`; `getByText("How far is your showroom from Aurora?")` is inside a `summary`; the answer text starting "Our showroom is at 17380 Highway 27" is in the document (present without clicking).
  - Steps `layout="row"`: 4 `<li>`, the list has class `desktop:grid-cols-4`; default layout has no such class.
  - If the impeccable hook flags `<img>` mocks: `impeccable hooks ignore-value broken-image "*" --file components/site/CitySections.test.jsx`, and mention it in the PR.
- [ ] **Step 2: Run** `npx jest components/site/CitySections.test.jsx` → FAIL.
- [ ] **Step 3: Implement** the five components and the Steps prop. Pills: `rounded-full border border-line px-4 py-1.5 text-small`. FAQ rows: top border `border-line`, `summary` with a `+` marker that rotates when `[open]`, `list-none` + `[&::-webkit-details-marker]:hidden`.
- [ ] **Step 4: Run** the tests, plus `npx jest components/site` (Wellness still uses Steps) → PASS.
- [ ] **Step 5: Commit** `feat(redesign): chips, trust strip, product, review and FAQ blocks`.

### Task 3: Hub page replaces the live one

**Files:**
- Create: `components/site/CityCard.jsx`, `components/site/ServiceAreasPage.jsx`, `app/(site)/service-areas/page.jsx`
- Delete: `app/service-areas/page.jsx`, `app/service-areas/layout.js`, `app/service-areas/[id]/page.jsx`, `lib/cities.js`
- Modify: `lib/site/routes.js` (add `"/service-areas"`), `lib/site/routes.test.js`
- Test: `components/site/ServiceAreasPage.test.jsx`

**Interfaces:**
- Consumes: `section`, `pick`, `pickAll`, `groups` (`lib/site/content.js`); `Breadcrumb`, `SectionHeader`, `Block`.
- Produces: `CityCard({ card })` with `card.blocks` = `[region, name, neighbourhoods, linkText]` (text blocks); the card's link is the last line, `<a href={card.href}>`.

The `[id]` route is deleted here and recreated in Task 4. The app has no city pages between the two commits, which is fine on a feature branch.

- [ ] **Step 1: Write failing tests**
  - ServiceAreasPage: `h1` "Backyard Sauna Service Areas"; 17 links named `/^Backyard saunas in /`, the first `href="/service-areas/toronto"`, the last `/service-areas/collingwood`; region "Peel Region" present; the closing paragraph's "Ask us about your area" links to `/contact`; breadcrumb "Home" links to `/`.
  - routes.test.js: add `"/service-areas"` to the `it.each` list, and add `["/service-areas/aurora", true]`, `["/service-areasx", false]` to the table.
- [ ] **Step 2: Run** both → FAIL.
- [ ] **Step 3: Implement.** `ServiceAreasPage`: Section 1 on `bg-linen` (breadcrumb, `SectionHeader as="h1"` with eyebrow/heading/lead); Section 2 grid `grid gap-5 desktop:grid-cols-4` of `CityCard` for `pickAll(s2, "card")`, then the paragraph. City name `font-display text-heading`; region `text-eyebrow uppercase tracking-[.14em] text-taupe-500` (use the existing eyebrow token SectionHeader uses). Page file follows `app/(site)/about/page.jsx` with `pageSeo("/service-areas")`. Delete the four live files with `git rm`.
- [ ] **Step 4: Run** `npx jest components/site/ServiceAreasPage.test.jsx lib/site/routes.test.js` → PASS. `grep -rn "lib/cities" app components lib` → no hits.
- [ ] **Step 5: Commit** `feat(redesign): service areas hub on the new site`.

### Task 4: City template

**Files:**
- Create: `components/site/CityPage.jsx`, `app/(site)/service-areas/[id]/page.jsx`
- Test: `components/site/CityPage.test.jsx`, `app/(site)/service-areas/[id]/page.test.jsx`

**Interfaces:**
- Consumes: `CITIES`, `getCity` (Task 1); Task 2 components; `Split`, `SectionHeader`, `Breadcrumb`, `Block`, `CtaBand`.
- Produces: `CityPage({ page })` where `page` is a city JSON object.

- [ ] **Step 1: Write failing tests**
  - `CityPage.test.jsx`, `it.each(CITIES)("renders %s")`: renders without throwing; `h1` text equals `pick(section(page,"Hero"),"heading",0,{level:1}).text`; 4 links to `/saunas/...` among the cards; 5 `details`; the neighbourhood list length equals the design list's `items.length`.
  - Aurora specifics: links "Book a Free Site Consult" → `/contact#visit` and "Call (437) 429-6623"; "$17,896", "$18,735", "$22,350", "$15,450" present; "Oak Ridges Moraine and conservation areas" present; "All service areas →" links to `/service-areas`; "Ready for a sauna in Aurora?" heading present.
  - `page.test.jsx` (node env, mock `next/navigation` `notFound` to throw): `generateStaticParams()` returns 17 `{ id }` including `{ id: "toronto" }` and `{ id: "muskoka" }`; `Page({ params: Promise.resolve({ id: "ottawa" }) })` calls `notFound`; `generateMetadata({ params: Promise.resolve({ id: "aurora" }) })` title equals `"Backyard Saunas in Aurora | The Toronto Sauna Co."` and canonical ends `/service-areas/aurora`.
- [ ] **Step 2: Run** both → FAIL.
- [ ] **Step 3: Implement** `CityPage` in the spec's section order:
  - Hero `bg-linen`: `Split image right priority`; breadcrumb, `SectionHeader as="h1"`, paragraph, buttons (first `dark`, second `outline-walnut`).
  - Trust strip: `groups(section(page,"Trust strip"), ["text","text"], 4)`, bordered band.
  - Neighbourhoods: header + paragraph + `Chips items={list.items}`; Local setting: `groups(..., ["heading","paragraph"], 3)` in 3 columns with top rules.
  - Picks `bg-linen`: header row with the "Shop all saunas" button (`outline-walnut`) right-aligned at `desktop:`; `pickAll(picks,"card")` checked to length 4 (throw otherwise) in `grid gap-5 desktop:grid-cols-4`.
  - Process: list items' `blocks` → `{ number, title, text }` → `Steps layout="row"`; three links as `outline-walnut` buttons.
  - Reviews `bg-linen`: `groups(reviews.slice(3), ["text","quote"], 3)` → `ReviewCard`.
  - FAQ: centred `max-w-3xl`, `Faq items={pickAll(faq,"faq")}`.
  - Nearby: label + `Chips links={links without the last}` + the last (`variant: "link"`) as a text link.
  - CTA: `CtaBand` (heading, paragraph, two links).

  Route file: `revalidate = 86400`; `generateStaticParams` from `CITIES`; `generateMetadata` → `pageSeo(city.route).metadata`; the page calls `notFound()` when `getCity(id)` is undefined; it renders `<JsonLd>` + `<CityPage>`.
- [ ] **Step 4: Run** both tests → PASS.
- [ ] **Step 5: Commit** `feat(redesign): city pages for 17 service areas`.

### Task 5: Sitemap lists the design cities

**Files:**
- Modify: `app/sitemap.js` (the hard-coded `serviceAreas` list), `app/sitemap.test.js`

- [ ] **Step 1: Write the failing test** `it("lists the 17 design cities and none of the dropped ones")`: URLs contain `${SITE}/service-areas/toronto`, `/muskoka`, `/king-city`, `/niagara-on-the-lake`; contain none of `/service-areas/ottawa`, `/barrie`, `/kawarthas`, `/vancouver`, `/calgary`, and no URL has a trailing space (the live list has `"collingwood "`).
- [ ] **Step 2: Run** `npx jest app/sitemap.test.js` → FAIL.
- [ ] **Step 3: Implement**: map `CITIES` to `/service-areas/${slug}`; keep the existing priority and frequency.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(redesign): sitemap lists the new city pages`.

### Task 6: Docs, progress and definition of done

**Files:**
- Modify: `lib/site/progress.js` ("Service areas and city pages" → `done`, `href: "/service-areas"`, `UPDATED`), `docs/redesign.md` (line 187: tick it, 17 cities including Toronto and Muskoka; line 44 row), `lib/site/progress.test.js` if it pins statuses.

- [ ] **Step 1:** Update progress and docs; run `npx jest lib/site/progress.test.js` → PASS.
- [ ] **Step 2:** `npm test` → all pass except the known local `__tests__/getServerSession.test.js`; `npm run lint` (report if it prompts for setup); `npm run build` → succeeds with 17 `/service-areas/[id]` pages pre-rendered.
- [ ] **Step 3:** `next start -p 3100`; for all 18 routes check 200 and that title/meta description/canonical match `page-map.csv` (reuse `check-head.js`).
- [ ] **Step 4:** Screenshot `/service-areas`, `/service-areas/aurora`, `/toronto`, `/muskoka` at 1440 and 390 next to the design pages; scrollWidth equals the viewport; measure the hub grid and pick cards at 390 (one column, no gaps). Fix differences, then stop the `next start` process.
- [ ] **Step 5: Commit** `docs(redesign): service areas progress`. Then the final whole-branch review (fresh reviewer, most capable model), fixes test-first, push and open the PR into `redesign` with summary, checks, calls I made and deferred minors.
