# Sauna Finder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve the design's `/sauna-finder` from `app/(site)/`, with the design's fit logic ported as a tested pure function and the design's catalogue as data.

**Architecture:** `lib/site/saunaFinder.js` holds every rule (`findSaunas`, `ft`, `money`). The client component `components/site/SaunaFinder.jsx` holds the inputs and renders the results through `FinderCard`. The page server-renders the header copy and passes the catalogue (`SaunaFinder.json` → `data.fdData`) and copy as props. `ContactForm` gains `?msg=` prefill for the quote button.

**Tech Stack:** Next.js 15 App Router (JSX), React client component, Tailwind tokens, Jest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-27-sauna-finder-design.md`

## Global Constraints

- The catalogue is the design's `fdData` as is: names, hrefs, photos, sizes (inches), seats, prices, flags `k`/`c`/`b`/`note`. No MongoDB on this page.
- Copy verbatim from `content/redesign/SaunaFinder.json`. Wording made by the logic (summary, details, badges) is exactly the design's `fdVals()` strings.
- No `mailto:` and no sales@/tjallen@ address anywhere on the page. The quote button goes to `/contact?msg=…`.
- SEO only via `pageSeo("/sauna-finder")` + `<JsonLd>`.
- Tailwind tokens only, `desktop:` breakpoint (never `md:`), container `mx-auto max-w-site px-5 desktop:px-8`, new components in `components/site/`, photos via `SiteImage`.

## Review Focus

1. **The port drifting from the design's behaviour on inputs the hand-written tests don't pick**: test in Task 1 that compares `findSaunas` with the design's own `fdVals()` logic (kept as a test-only reference) over a grid of inputs.
2. **Odd input** (empty, `0`, negative, `"abc"`, `"8.5"`, huge numbers like `1000`): `ready` false for non-positive or non-numeric values, no crash, no NaN in the text. Test in Task 1.
3. **A message containing "visit" or "question" flipping the contact form's mode** once `?msg=` exists: test in Task 2.
4. **Screen reader users not hearing results change**: the summary is in an `aria-live="polite"` region and the chips expose `aria-pressed`. Test in Task 3.
5. **Indoor → outdoor with a ceiling typed in**: the ceiling must stop counting outdoors (the design only uses it indoors). Test in Task 1 (`mode: "out", ceiling: "5"` gives the same results as with no ceiling).

---

### Task 1: Fit logic

**Files:**
- Create: `lib/site/saunaFinder.js`, `lib/site/saunaFinder.reference.js` (test-only: the design's `fdVals()` result-building with the style code removed, returning `{ res, summary, lines }`)
- Test: `lib/site/saunaFinder.test.js`

**Interfaces:**
- Produces: `findSaunas(catalogue, { mode = "out", width, depth, ceiling, people = 0 }) → { ready: boolean, results: Result[], summary: string, quoteLines: string[] }`. `Result = { name, href, img, alt, detail, seats, price, badge, good }`. Also `ft(feet: number) → string` and `money(n: number) → string`.

- [ ] **Step 1: Write failing tests** (node env), using the real `SaunaFinder.json` catalogue:
  - `ft`: `ft(10) === "10′"`, `ft(5.9166) === "5′ 11″"`, `ft(7.999) === "8′"`. `money(11884) === "$11,884"`.
  - 10 × 8 outdoor: 15 results, in the order Pure Cube 552, Neptune Mini, Pure Cube 672, Hudson, Studio Six Mini, Neptune (all badged "Best seller · fits"), then Trinity, Pure Cube 572, Pure Cube 582 with Shower, Pure Cube 582, Pure Cube 772, Studio Six Max ("Fits"), Orion ("Close fit", detail ends " · within a foot of your space"), then the value picks Harmony Barrel and MiniPOD ("Value pick"). The summary equals "15 outdoor saunas fit or come close to your 10′ × 8′ space (1 close)." Assert the names in order, the badges and the summary exactly.
  - Rotation: a 6 × 8 space gives the same names as 8 × 6.
  - Multi-size: for Barrel Sauna in a 12 × 12 space, `detail` starts "Fits: 7' × 4'", `price` starts "From $".
  - Single size with a note: Trinity's detail contains "· Corner design".
  - People: `people: 6` drops every result whose seats are below 6.
  - Ceiling: indoor 6 × 6 with `ceiling: "6"` (72″) removes saunas taller than 74″ and marks those 72–74″ as close. Outdoor ignores the ceiling (Review Focus 5).
  - Not ready: `width` of `""`, `"0"`, `"-3"`, `"abc"` → `ready` false, `results` [], `summary` "". `"8.5"` works. `width: "1000", depth: "1000"`: every outdoor core item fits, and no NaN appears in any string.
  - `quoteLines` for indoor 6 × 7, ceiling 8, people 4: `["Hi, I'd like a quote for a sauna.", "Where: indoor", "Space: 6′ x 7′", "Ceiling: 8′", "People: 4+"]`.
  - Equivalence (Review Focus 1): for every combination of mode {out, in} × width {3, 5, 6.5, 8, 10, 12, 20} × depth {same set} × ceiling {"", 6, 7.5} × people {0, 2, 4, 6, 8}, `findSaunas` gives the same `name`, `badge`, `detail`, `seats` and `price` sequence and the same `summary` as the reference.
- [ ] **Step 2: Run** `npx jest lib/site/saunaFinder.test.js --coverage=false` → FAIL (module not found).
- [ ] **Step 3: Implement** `lib/site/saunaFinder.js`, following the spec's rules exactly (`NEAR = 15`, ceiling slack 2, core/value split, value picks capped at 2, or 4 with no core). Write the reference from the design's script (`%USERPROFILE%\Downloads\TSC-REVAMP\Site\SaunaFinder.dc.html`, `fdVals`) with the styles removed. Header comment: "Test-only. The design's logic, kept so the port can be checked against it."
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(redesign): sauna finder fit logic`.

### Task 2: Contact form takes a prefilled message

**Files:**
- Modify: `components/site/ContactForm.jsx` (the mount effect), `lib/site/contactForm.js` (`defaultReason`)
- Test: `components/site/ContactForm.test.jsx`, `lib/site/contactForm.test.js`

**Interfaces:**
- Produces: `/contact?msg=<urlencoded text>` fills the message box when it is empty, trimmed to 5000 characters. `defaultReason(hashAndSearch)` ignores the value of `msg`.

- [ ] **Step 1: Write failing tests**
  - `defaultReason("?msg=I%20want%20to%20visit")` → `REASONS[0]` (quote). `defaultReason("#visit?msg=hi")` → `REASONS[1]`.
  - ContactForm: with `window.history.replaceState({}, "", "/contact?msg=Hi%0AWhere%3A%20outdoor")`, the message textarea's value is "Hi\nWhere: outdoor" and the mode is quote. Without `msg`, the box stays empty.
- [ ] **Step 2: Run** `npx jest components/site/ContactForm.test.jsx lib/site/contactForm.test.js --coverage=false` → the new tests FAIL.
- [ ] **Step 3: Implement.** In `defaultReason`, drop the `msg` parameter's value before matching (`URLSearchParams` on the search part). In the mount effect, read `new URLSearchParams(window.location.search).get("msg")` and set `msg` to it, sliced to 5000, when `msg` is empty.
- [ ] **Step 4: Run** → PASS (the existing contact tests still pass).
- [ ] **Step 5: Commit** `feat(redesign): contact form accepts a prefilled message`.

### Task 3: Finder component and page

**Files:**
- Create: `components/site/FinderCard.jsx`, `components/site/SaunaFinder.jsx`, `app/(site)/sauna-finder/page.jsx`
- Modify: `lib/site/routes.js`, `lib/site/routes.test.js`
- Test: `components/site/SaunaFinder.test.jsx`

**Interfaces:**
- Consumes: `findSaunas` (Task 1).
- Produces: `FinderCard({ result })`, and `SaunaFinder({ catalogue, copy })`, where `copy = { widthField, depthField, ceilingField, peopleLabel, idle, none: [title, text], quoteLabel, footnote }` holds the design blocks picked by the page.

- [ ] **Step 1: Write failing tests** (render `SaunaFinder` with the real catalogue and copy, `CloudinaryImage` mocked as in `CityPage.test.jsx`, plus the image-mock hook suppression for this file):
  - Initially "Outdoor" has `aria-pressed="true"`, the idle text "Enter your width and depth to see what fits." shows, and there is no ceiling field.
  - Typing 10 and 8 into "Width of your space (feet)" and "Depth of your space (feet)" (`fireEvent.change`) puts the summary inside an element with `aria-live="polite"`, renders 15 cards, and the first card links to `/saunas/pure-cube-552` and shows "Best seller · fits".
  - Clicking "Indoor" shows "Ceiling height (feet, optional)" and the custom link "Explore custom indoor saunas" → `/saunas/indoor/custom`. Outdoor shows "Talk to us about a custom build" → `/contact`.
  - Clicking "6+" sets its `aria-pressed="true"` and every card's seats are 6 or more.
  - The quote link's href starts with `/contact?msg=` and decodes to the `quoteLines` joined by "\n". There is no `mailto:` anywhere in the container.
  - A 2 × 2 space shows "Nothing off the shelf fits that space."
  - routes.test.js: add `"/sauna-finder"` to the served list.
- [ ] **Step 2: Run** `npx jest components/site/SaunaFinder.test.jsx lib/site/routes.test.js --coverage=false` → FAIL.
- [ ] **Step 3: Implement.**
  - `FinderCard`:
    - The whole card is a `Link`, with a border, `rounded-card` and a white background.
    - The photo box is `aspect-square bg-white p-4`, using `SiteImage` `fill` with `object-contain`.
    - The badge sits top-left, `text-caption uppercase font-semibold`, in a pill: `bg-ink text-white` when `good` and not a value pick, otherwise `bg-sand-100 text-walnut`.
    - Below: name (`font-display text-title`), detail and seats (`text-small text-taupe-500`), price (`text-body font-semibold`).
  - `SaunaFinder`:
    - The panel (`rounded-card border border-line p-6`) holds the mode chips, a two-column width/depth grid at `desktop:` (one column below), the indoor ceiling field, the people label and chips.
    - Then the live region: the idle paragraph, or the summary and the grid `grid gap-5 desktop:grid-cols-4`, or the none block.
    - Then the buttons (`dark` quote, `outline-walnut` custom) and the footnote.
    - Chips are `<button type="button" aria-pressed>` with `min-h-11 rounded-full border border-ink px-4 text-small font-semibold`, filled ink when pressed.
  - Page: `pageSeo("/sauna-finder")`. Breadcrumb from "Section 1". The header (eyebrow, h1 heading, lead) comes from the "Sauna finder" section. The props come from the same section's `field`, `if` and `link` blocks, read by type and position, throwing when missing.
  - Add `/sauna-finder` to `SITE_ROUTES`.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(redesign): sauna finder page`.

### Task 4: Docs, progress and definition of done

**Files:**
- Modify: `lib/site/progress.js` ("Sauna Finder" → `done`, `href: "/sauna-finder"`, `UPDATED` "27 November 2026"), `docs/redesign.md` (tick `/sauna-finder` with a short record: design catalogue per the owner, MongoDB in Phase 3 with the new fields, quote → `/contact?msg=`).

- [ ] **Step 1:** Update them; `npx jest lib/site/progress.test.js --coverage=false` → PASS.
- [ ] **Step 2:** `npm test` → all pass except the known local `__tests__/getServerSession.test.js`; `npm run lint` (report the setup prompt); `npm run build` → succeeds, `/sauna-finder` static.
- [ ] **Step 3:** `next start -p 3100`. `/sauna-finder` returns 200 and title/meta/canonical match `page-map.csv` (`check-head.js`). `/contact?msg=…` opens with the message filled in.
- [ ] **Step 4:** Browser: idle and 10 × 8 outdoor at 1440 and 390 next to the design screenshots (`finder-shot.js`). Same cards in the same order, scrollWidth equals the viewport, one column at 390. Stop the server.
- [ ] **Step 5: Commit** `docs(redesign): sauna finder progress`. Then the final whole-branch review (fresh reviewer, most capable model), fixes test-first, push and open the PR into `redesign` (summary, checks, calls I made, deferred minors).
