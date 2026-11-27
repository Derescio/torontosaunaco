# About, Wellness and Design Photos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upload the design photos to Cloudinary with a filled image map, add a cost-safe image component, and serve `/about` and `/wellness` built from reusable section components.

**Architecture:** A dry-run-by-default script uploads `assets/*.{jpg,png,webp}` to Cloudinary as `redesign/<hash>` and writes `content/image-map.json` (`{ hash: { url, width, height } }`). `SiteImage` (server) resolves a design `src` through the map and renders a tiny client `CloudinaryImage` (next/image + Cloudinary loader). Pages look up copy by section name via `lib/site/content.js` and compose section components.

**Tech Stack:** Next.js 15 App Router (JSX), next/image, Cloudinary upload REST API (`fetch`, `FormData`, `node:crypto`), Tailwind tokens, Jest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-26-about-wellness-design.md`

## Global Constraints

- Copy verbatim from `content/redesign/{About,Wellness}.json`; never retype copy in JSX.
- Metadata/JSON-LD only via `pageSeo(route)` + `<JsonLd>`.
- New components in `components/site/`; `desktop:` (998px) breakpoint, never `md:`; container `mx-auto max-w-site px-5 desktop:px-8`; tokens only.
- Images: `next/image` only, explicit `width`/`height` (or `fill` inside a sized box), `sizes` always, `priority` only on the page hero. Cloudinary resizes (`f_auto,q_auto,w_<w>`); Vercel does not.
- Never print or write `CLOUDINARY_API_SECRET` or any `.env` value. No new npm dependency. No DB access.
- Tests beside the code as `*.test.js(x)`. Windows: write JS with Write/Edit; PowerShell 5.1 drops `--`; rerun a build that dies with 0xC0000409.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. A design image missing from the map: `SiteImage` must throw (build fails) rather than render a broken `<img>`. (Task 3 test)
2. An interrupted upload run: re-running `--write` uploads only what's missing and keeps earlier entries. (Task 2 test on `mergeMap`/`pending`)
3. The `#research` / `#ritual` hero buttons must land on real sections. (Task 7 test)
4. The policy pages must look and test the same after switching to `CtaBand`. (Task 5: existing PolicyPage tests stay green)
5. At 390px the 11-photo gallery and stat cards must not overflow sideways. (Task 8 browser check `scrollWidth <= 390`)

---

### Task 1: Image map format in `seo.js`

**Files:** Modify `lib/site/seo.js` (`fixString`), `lib/site/seo.test.js`.

**Interfaces:**
- Produces: image map entries may be `{ url, width, height }` (new) or a URL string (old); `seo.js` uses `entry.url ?? entry`.

- [ ] **Step 1:** Add test `maps a design image through an { url } entry`: `buildSeo(entryWithOgImage("_blob/abc"), { imageMap: { abc: { url: "https://res.cloudinary.com/x/redesign/abc.jpg", width: 10, height: 10 } } })` → `metadata.openGraph.images` contains that URL (mirror the existing string-map test).
- [ ] **Step 2:** `npx jest lib/site/seo.test --coverage=false` → FAIL (object stringified/ dropped).
- [ ] **Step 3:** In `fixString`, read `const hit = imageMap[blob[1]]; return hit ? hit.url ?? hit : DROP`.
- [ ] **Step 4:** Same command → PASS; `npx jest lib/site --coverage=false` → PASS.
- [ ] **Step 5:** Commit `feat(redesign): image map entries carry url and size`.

### Task 2: Upload script, then upload

**Files:** Create `scripts/images/upload-design-images.mjs`, `scripts/images/cloudinary.mjs`, `scripts/images/cloudinary.test.js`. Modify `package.json` (`"images:upload": "node scripts/images/upload-design-images.mjs"`). Regenerated: `content/image-map.json`.

**Interfaces (`cloudinary.mjs`, pure):**
- `signParams(params: Record<string,string|number|boolean>, secret: string) -> string` — SHA-1 hex of `k=v` pairs sorted by key, joined by `&`, with `secret` appended (Cloudinary signed-upload rule; skip `file`, `api_key`, empty values).
- `listDesignImages(fileNames: string[]) -> Array<{ hash, file }>` — keeps `^[0-9a-f]{32}\.(jpg|png|webp)$`, sorted.
- `pending(images, map) -> images` not yet in `map`.
- `entryFrom(response) -> { url: secure_url, width, height }`; throws if any field is missing.
- `mergeMap(map, hash, entry) -> new map` with keys sorted.

**CLI (`upload-design-images.mjs`):** reads `.env` values into `process.env` without logging them (parse `KEY=value` lines; only the three Cloudinary keys); site dir = argv[2] ?? `DC_SITE_DIR` ?? `~/Downloads/TSC-REVAMP/Site`; prints `images N, mapped M, to upload K`. With `--write`: for each pending image, POST `https://api.cloudinary.com/v1_1/<cloud>/image/upload` with `file` (Blob of the bytes), `api_key`, `timestamp`, `public_id: "redesign/<hash>"`, `overwrite: "false"`, `signature`; on success write the merged map to disk immediately; on failure print `hash: <status> <error.message>` and continue; exit 1 if any failed. Never logs request bodies or headers.

- [ ] **Step 1: Failing tests** in `cloudinary.test.js` (`@jest-environment node`):
  - `signParams({ timestamp: 1315060510, public_id: "sample_image", eager: "w_400,h_300,c_pad|w_260,h_200,c_crop" }, "abcd")` equals `"bfd09f95f331f558cbd1320e67aa8d488770583e"` (Cloudinary's documented example); `api_key`/`file` are ignored.
  - `listDesignImages(["a.pdf", "x.jpg", "<32hex>.webp", "<32hex>.jpg"])` returns the two hashes, sorted.
  - `pending` drops mapped hashes; `mergeMap` returns sorted keys and does not mutate its input.
  - `entryFrom({ secure_url: "u", width: 1, height: 2 })` → `{ url: "u", width: 1, height: 2 }`; missing width throws.
- [ ] **Step 2:** `npx jest scripts/images --coverage=false` → FAIL (module missing).
- [ ] **Step 3:** Implement `cloudinary.mjs` and the CLI.
- [ ] **Step 4:** `npx jest scripts/images --coverage=false` → PASS.
- [ ] **Step 5:** `npm run images:upload` (dry run) → `images 439, mapped 0, to upload 439`.
- [ ] **Step 6:** `npm run images:upload -- --write` (owner approved the upload; PowerShell: `node scripts/images/upload-design-images.mjs --write`). Expected: exit 0; re-run dry → `to upload 0`; `content/image-map.json` has 439 entries, every `url` starts `https://res.cloudinary.com/`. Spot-check one URL returns 200.
- [ ] **Step 7:** `npx jest lib/site --coverage=false` → PASS (seo routes now include images). Commit `feat(redesign): upload design photos to Cloudinary and fill the image map`.

### Task 3: `SiteImage`

**Files:** Create `components/site/CloudinaryImage.jsx` (`"use client"`), `components/site/SiteImage.jsx`, `components/site/SiteImage.test.jsx`.

**Interfaces:**
- `cloudinaryLoader({ src, width, quality }) -> string`: `src` is the map URL; insert `f_auto,q_<quality ?? "auto">,w_<width>` after `/upload/` (exported for tests).
- `CloudinaryImage(props)` = `next/image` with `loader={cloudinaryLoader}` (client component, so the function never crosses the server boundary).
- `export function imageFor(src) -> { url, width, height, hash }`: hash from `./assets/<hash>.<ext>`; throws `"SiteImage: no Cloudinary image for <src>"` if unmapped.
- `SiteImage({ src, alt, sizes, priority = false, fill = false, className })` (server): `sizes` required (throw if missing); passes `width`/`height` from the map unless `fill`.

- [ ] **Step 1: Failing tests:** loader puts `f_auto,q_auto,w_640` after `/upload/`; `imageFor` returns the map entry for a real hash from `About.json`'s hero image; unmapped src throws; `SiteImage` renders an `img` with the alt, `width`/`height` from the map, and a `src` containing `res.cloudinary.com` and `w_`; missing `sizes` throws.
- [ ] **Step 2:** `npx jest components/site/SiteImage --coverage=false` → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Same → PASS. Commit `feat(redesign): SiteImage served and resized by Cloudinary`.

### Task 4: Content lookup

**Files:** Create `lib/site/content.js`, `lib/site/content.test.js`.

**Interfaces:**
- `section(page, name) -> block[]` (throws `"<file>: no section \"<name>\""`).
- `pick(blocks, type, index = 0, { level } = {}) -> block` — the `index`-th block of `type` (and heading `level`, if given); throws `"content: missing <type>[ level <n>] #<index>"`. `section` attaches the page file and section name to the returned array (`blocks.where = "<file> › <name>"`) and `pick` appends it to the error when present.
- `pickAll(blocks, type, { level } = {}) -> block[]`.

- [ ] **Step 1: Failing tests** against `About.json`: `section(About, "Approach")` returns blocks whose `pick(..., "heading").html` contains `the customer.`; `pickAll(section(About, "Photo strip"), "image")` length 3; `section(About, "Nope")` throws `/About\.dc\.html.*Nope/`; `pick(blocks, "quote", 1)` throws.
- [ ] **Step 2:** → FAIL. **Step 3:** implement. **Step 4:** → PASS. **Step 5:** commit `feat(redesign): look up design copy by section name`.

### Task 5: Section components (+ `quote` block, `CtaBand` in policies)

**Files:** Create in `components/site/`: `SectionHeader.jsx`, `Split.jsx`, `NumberedPoints.jsx`, `StatGrid.jsx`, `PhotoGrid.jsx`, `Steps.jsx`, `CtaBand.jsx`, and `Sections.test.jsx`. Modify `Blocks.jsx` (+ test): add `"quote"` to `BLOCK_TYPES` (renders `<blockquote>` with `border-l-2 border-tan pl-6 font-display text-title italic`), and headings style `<em>` as `italic font-bold` (`[&_em]:italic [&_strong]:font-bold`). Modify `PolicyPage.jsx` to render its question band with `CtaBand`.

**Interfaces (all take blocks straight from `content.js`):**
- `SectionHeader({ eyebrow: block?, heading: block, lead?: block, dark?: boolean, as = "h2" })` — eyebrow `text-eyebrow uppercase text-walnut` (`text-tan-light` when dark).
- `Split({ image: block, imageSide = "left"|"right", dark = false, aspect = "4/5"|"3/2"|"4/3", priority = false, children })` — `grid gap-10 desktop:grid-cols-2 items-center`; image `rounded-card overflow-hidden` with `SiteImage fill` in an `aspect-[…]` box, `sizes="(min-width: 998px) 50vw, 100vw"`.
- `NumberedPoints({ items: Array<{ number, title, text }> })` — 1 col → `desktop:grid-cols-4`; each `border-t border-ink pt-5`, number `text-eyebrow text-walnut`, title `font-display text-title`.
- `StatGrid({ items: Array<{ figure, label, text?, source? }>, variant = "inline"|"cards" })` — inline: 3 figures in a row (Wellness tradition); cards: `grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))]`, white `rounded-card` cards on linen.
- `PhotoGrid({ images: block[], layout = "strip"|"gallery" })` — strip: 3 equal `aspect-[4/5]` tiles, `desktop:grid-cols-3`. Gallery: the design's areas, desktop `grid-cols-4 auto-rows-[230px]` with spans a: `row-span-2`, c: `row-span-2`, f: `row-span-2`, g: `row-span-2`, j: `col-span-2` (order a…k as in the JSON); below `desktop:` `grid-cols-2 auto-rows-[200px]` with a, c, f, g `row-span-2` and j `col-span-2`. Tiles `rounded-card overflow-hidden`, `SiteImage fill sizes="(min-width: 998px) 25vw, 50vw"`.
- `Steps({ items: Array<{ number, title, text }> })` — `grid grid-cols-[56px_1fr] gap-x-4`, rows separated by `border-t border-line`.
- `CtaBand({ heading: block, text: block, links: block[] })` — the policies' band generalised: `bg-ink text-cream py-16`, first link `variant="tan"`, the rest `outline-light`.

- [ ] **Step 1: Failing tests** in `Sections.test.jsx` (mock `next/link`; mock `./CloudinaryImage` as a plain `img`): each component renders its copy from real `About.json`/`Wellness.json` blocks; `PhotoGrid layout="gallery"` with Wellness's 11 images renders 11 images, the 1st/3rd/6th/7th tiles have `desktop:row-span-2`, the 10th `col-span-2`; `CtaBand` first link has `bg-tan`, second `border-white`; `Blocks` renders `quote` as `blockquote` and heading `<em>` gets italic. Existing `PolicyPage.test.jsx` unchanged.
- [ ] **Step 2:** `npx jest components/site --coverage=false` → new tests FAIL, PolicyPage still PASS.
- [ ] **Step 3:** Implement; switch `PolicyPage` to `CtaBand`.
- [ ] **Step 4:** Same → all PASS. Commit `feat(redesign): section components for content pages`.

### Task 6: About page

**Files:** Create `app/(site)/about/page.jsx`, `components/site/AboutPage.jsx`, `components/site/AboutPage.test.jsx`. Delete `app/about/page.jsx`. Modify `lib/site/routes.js` + test (`/about`).

Composition (sections by JSON name): **About hero** — linen band, `Split imageSide="right" priority`, breadcrumb (reuse `PolicyPage`'s breadcrumb, extracted to `components/site/Breadcrumb.jsx`), eyebrow, H1 (`as="h1"`, `text-display-xl`), lead. **Approach** — centred narrow column (`max-w-3xl mx-auto`), header, two paragraphs, quote. **Photo strip** — `PhotoGrid strip`. **What you can count on** — header + `NumberedPoints` built from the `text`(number), `text`(title), `paragraph` triples. **Service after install** — dark `Split imageSide="left"`. **Showroom** — header + paragraph left, linen `rounded-card` card right with the three `text` lines and the "Book a visit" button (`variant="dark"`). **Section 1** — `CtaBand`.

- [ ] **Step 1: Failing tests** (`AboutPage.test.jsx`): one `h1` "Customer first. Every time."; h2s equal the JSON's level-2 headings in order; every JSON image's alt is rendered; links "Book a visit" → `/contact#visit`, "Find your fit" → `/sauna-finder`, "Call (437) 429-6623" → `tel:`; text contains "Schomberg" and not "King Township" or "Leisurecraft". `routes.test.js`: `/about` is a site route.
- [ ] **Step 2:** → FAIL. **Step 3:** implement, delete the old page, add the route. **Step 4:** `npx jest components/site lib/site --coverage=false` → PASS. **Step 5:** commit `feat(redesign): About page`.

### Task 7: Wellness page

**Files:** Create `app/(site)/wellness/page.jsx`, `components/site/WellnessPage.jsx`, `components/site/WellnessPage.test.jsx`. Modify `lib/site/routes.js` + test (`/wellness`).

Composition: **Wellness hero** — dark full-bleed: `SiteImage fill priority` at `opacity-55` with a left-to-right `from-ink-deep/90 via-ink-deep/55 to-ink-deep/15` gradient overlay, breadcrumb, eyebrow, H1, lead, two buttons (`tan`, `outline-light`). **Finnish tradition** — `Split imageSide="right" aspect="4/5"` with two paragraphs and `StatGrid inline` (3 figure/label pairs). **Research** (`id="research"`, linen) — header + lead, `StatGrid cards` from 6 groups of `text`(figure), `text`(label), `paragraph`, `text`(source), then the footnote paragraph `text-caption`. **Inspiration gallery** — header with the paragraph on the right (`desktop:flex justify-between items-end`), `PhotoGrid gallery`. **Lifestyle** — dark `Split` (header, paragraph, image `aspect="3/2"`) with the 5 title/text pairs as a list on the other side. **Ritual** (`id="ritual"`) — header, paragraph, image `aspect="4/3"`, `Steps` from the list items' nested blocks. **Safety** — linen, header left, list right. **Section 1** — `CtaBand`. **Sources** — `h2` `text-title`, ordered list `text-caption`, disclaimer paragraph.

- [ ] **Step 1: Failing tests**: one `h1` "Heat. Quiet. Ritual."; h2s match the JSON in order; 15 images with their alts; 6 research cards each show figure, label and source; every link whose href starts with `#` has an element with that id; ritual renders 5 steps; sources list has 6 items; no "King Township"/"Leisurecraft". Route test for `/wellness`.
- [ ] **Step 2:** → FAIL. **Step 3:** implement. **Step 4:** `npx jest components/site lib/site --coverage=false` → PASS. **Step 5:** commit `feat(redesign): Wellness page`.

### Task 8: Progress, docs, definition of done

**Files:** Modify `lib/site/progress.js` (About/Wellness/Contact/Blog item → `"in-progress"`, `UPDATED`), `docs/redesign.md` (Phase 2 item: About + Wellness done; image map filled via `npm run images:upload`; image-map note in Phase 1 SEO section updated).

- [ ] **Step 1:** Update progress/docs; `npm test` → all pass except the known local `__tests__/getServerSession.test.js`.
- [ ] **Step 2:** `npm run lint` (report known prompt); `npm run build` → passes, `/about` and `/wellness` static.
- [ ] **Step 3:** `next start -p 3100`: both routes 200, title/meta/canonical = `page-map.csv`; og:image now a `res.cloudinary.com` URL.
- [ ] **Step 4:** Screenshots 1440/390 vs `About.dc.html` / `Wellness.dc.html`; `scrollWidth <= 390`; every `<img>` on the page loaded (`naturalWidth > 0`) from `res.cloudinary.com`. Fix mismatches with tests, commit.
- [ ] **Step 5:** Stop servers; one final whole-branch review on the most capable model; fix Critical/Important test-first.
- [ ] **Step 6:** Push `rd/2-about-wellness`, PR into `redesign` with summary, calls made, preview URL.
