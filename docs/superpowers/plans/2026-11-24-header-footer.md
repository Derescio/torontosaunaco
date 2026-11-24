# Site Header and Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the redesign's `Header` (with dropdowns and a phone menu) and `Footer` in `components/site/`, and serve
them on new pages through an `app/(site)/` route group, leaving the live pages' nav untouched.

**Architecture:** One data module (`components/site/nav.js`) holds every link. `Header` is a client component (it needs
`usePathname` for `aria-current`) with CSS-only desktop dropdowns and a `MobileMenu` child. `Footer` is a server
component. `ConditionalNavAndFooter` skips the old nav for paths listed in `lib/site/routes.js`, and the `(site)`
layout renders the new ones.

**Tech Stack:** Next.js 15.2 App Router (JSX), Tailwind 3.4 with the `lib/site/tokens.js` tokens, `next/image`,
`next/link`, Jest 29 + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-24-header-footer-design.md`

## Global Constraints

- Copy and links exactly as in the spec's "What the design says" section. Routes from `page-map.csv`; Custom Saunas → `/custom-builds`.
- Tokens only (`text-small`, `bg-ink`, `rounded-card`, `shadow-menu`, `max-w-site` …); no arbitrary values except
  widths the design fixes (dropdown `w-[300px]`, `w-[340px]`) and the footer grid
  `grid-cols-[repeat(auto-fit,minmax(200px,1fr))]`.
- Phone `(437) 429-6623` / `tel:+14374296623`. "Schomberg". No "Leisurecraft".
- Mobile/desktop switch at `md` (768px).
- Components in `components/site/`; import `cn` and `Button` by relative path (Jest's `@/` maps to `src/`).
- Live pages keep `components/redesign/Header` and `RedesignFooter`; don't edit `components/redesign/`.
- Branch `rd/1-header-footer`, PR into `redesign`.

## Review Focus

1. **Touch on desktop-width tablets:** at ≥768px, dropdowns open on hover/focus only. Tapping a top-level item should
   navigate to its page (it's a real link), never trap the user. Test in Task 2: top-level items are links with hrefs.
2. **Phone menu left open across navigation:** following a link inside the panel must close it and unlock scroll.
   Test in Task 3.
3. **Keyboard users in the phone menu:** Escape closes it and focus returns to the Menu button. Test in Task 3.
4. **Double landmarks:** a site page must have exactly one `<main>`, one `banner` header and one `contentinfo` footer.
   Test in Task 5 via the `(site)` layout render.
5. **Prefix matching too loose:** `/saunas-guide` or `/saunas/indoor/kits` must not light up Outdoor Saunas. Test in Task 1.

---

## File Structure

| File | Responsibility |
|---|---|
| `components/site/nav.js` | `MAIN_NAV`, `FOOTER_COLUMNS`, `CONTACT`, `isActive()` |
| `components/site/nav.test.js` | Data rules and `isActive` |
| `public/images/site/*` | Two logos, four dropdown thumbnails (copied from the design's `assets/`) |
| `components/site/Header.jsx` (client) | Utility bar, main row, desktop nav + dropdowns, buttons, mounts `MobileMenu` |
| `components/site/MobileMenu.jsx` (client) | Menu button + full-screen panel |
| `components/site/Footer.jsx` | Footer |
| `components/site/*.test.jsx` | One per component |
| `lib/site/routes.js` | `SITE_ROUTES`, `isSiteRoute()` |
| `app/(site)/layout.jsx` | `Header` + `<main>` + `Footer` |
| `app/(site)/style-guide/*` | Moved from `app/style-guide/` |
| `components/pacifictide/ConditionalNavAndFooter.jsx`, `app/layout.js` | Skip old nav on site routes; `<main>` moves into the conditional |

---

### Task 1: Nav data and `isActive`

**Files:** Create `components/site/nav.js`, `components/site/nav.test.js`.

**Interfaces — Produces:**
- `CONTACT = { phone: "(437) 429-6623", tel: "tel:+14374296623", note: "Showroom in Schomberg, by appointment · Delivery and installation across Ontario" }`
- `MAIN_NAV`: array of `{ label, href, match: string[], exclude?: string[], children?: { label, href, description, image? }[] }`
  in spec order. `image` is `{ src: "/images/site/<file>", alt: "" }` for the four thumbnails. `match` for Outdoor
  Saunas `["/saunas"]` with `exclude: ["/saunas/indoor"]`; Plunge & Shower `["/cold-plunges", "/outdoor-showers"]`;
  Indoor `["/saunas/indoor"]`; the rest their own href.
- `HEADER_ACTIONS = { finder: { label: "Find your fit", href: "/sauna-finder" }, quote: { label: "Request a Quote", href: "/contact" }, cart: { label: "Cart", href: "/cart" } }`
- `FOOTER_COLUMNS`: `[{ title: "Shop", links }, { title: "Company", links }, { title: "Policies", links }]` with the spec's
  labels; Instagram `https://instagram.com/thetorontosaunaco`.
- `FOOTER_BRAND = ["Premium Canadian cedar saunas, delivered across Ontario.", "Showroom visits by appointment only."]`,
  `COPYRIGHT = "© 2026 Toronto Sauna Co. All rights reserved."`
- `isActive(item, pathname): boolean`: true when `pathname` equals a `match` entry or starts with it followed by `/`,
  and doesn't equal or start with (`+ "/"`) any `exclude` entry. `pathname` may be `null` → false.

- [ ] **Step 1: Write failing tests**: `every href is root-relative, tel: or https:`; `no label or description mentions Leisurecraft`;
  `main nav has the 7 labels in order` (`["Outdoor Saunas","Plunge & Shower","Indoor Saunas","Heaters","Accessories","Wellness","Contact"]`);
  `footer columns are Shop (8), Company (5), Policies (6)`; `isActive` table:
  `/saunas/cube`→Outdoor; `/saunas`→Outdoor; `/saunas/indoor/kits`→Indoor only; `/saunas-guide`→none;
  `/outdoor-showers`→Plunge & Shower; `/sauna-heaters`→Heaters; `null`→none.
- [ ] **Step 2:** `npx jest components/site/nav --coverage=false` → FAIL (module not found).
- [ ] **Step 3:** Implement `nav.js`.
- [ ] **Step 4:** Same command → PASS.
- [ ] **Step 5:** Commit `feat(redesign): site nav data`.

---

### Task 2: Header (desktop) and images

**Files:** Create `components/site/Header.jsx`, `components/site/Header.test.jsx`, `public/images/site/` (copy:
`a450a2a1d29722870d5d30594e037eaa.png` → `logo.png`, `4b22fbf814a3e06e8c6c6a589b975219.png` → `logo-footer.png`,
`f20866f0…jpg` → `nav-cold-plunges.jpg`, `2ba29c5f…jpg` → `nav-outdoor-showers.jpg`, `8754f996…jpg` → `nav-indoor-kits.jpg`,
`9bd7db10…jpg` → `nav-indoor-custom.jpg`, from `%USERPROFILE%\Downloads\TSC-REVAMP\Site\assets\`).

**Interfaces:**
- Consumes: Task 1 exports; `Button`/`buttonVariants` from `components/site/Button.jsx`; `usePathname` from `next/navigation`.
- Produces: `export default function Header()` (`"use client"`). Renders `<header>` containing the utility bar and main
  row; mounts `<MobileMenu pathname={pathname} />` (Task 3) in the main row, visible below `md`.

Layout: utility bar `bg-ink text-sand-200 text-caption md:text-small` with the note hidden below `md`; main row
`max-w-site mx-auto px-5 md:px-8 py-3.5 flex items-center justify-between gap-7`; logo `next/image` 132×48, `href="/"`,
`aria-label="The Toronto Sauna Co. home"`; desktop nav `hidden md:flex` (15px → `text-body` per the token rounding, weight 500); each dropdown item is a
`group relative` wrapper with the top link (+ `▾` caret, `aria-hidden`) and a panel `absolute top-full -left-4 pt-3.5 z-50 hidden group-hover:block group-focus-within:block`;
buttons `hidden md:flex` (Find your fit `outline-walnut`, pencil SVG; Request a Quote `dark`), and Request a Quote `sm` stays visible below `md`.
Active item: `aria-current="page"` and `underline underline-offset-4`.

- [ ] **Step 1: Write failing tests** (mock `next/navigation` `usePathname`, `next/image` → `<img>`, `next/link` → `<a>`, `./MobileMenu` → `() => null`):
  `renders every main nav label as a link to its href`; `renders every dropdown child link`;
  `marks Outdoor Saunas current on /saunas/cube` (and no other item); `marks Heaters current on /sauna-heaters`;
  `marks nothing current on /`; `phone link is tel:+14374296623`; `cart links to /cart`;
  `logo links home with an accessible name`; `has one banner landmark`.
- [ ] **Step 2:** `npx jest components/site/Header --coverage=false` → FAIL.
- [ ] **Step 3:** Copy images; implement `Header.jsx` (create a stub `MobileMenu.jsx` returning `null` so the import resolves).
- [ ] **Step 4:** Same command → PASS.
- [ ] **Step 5:** Commit `feat(redesign): site header with dropdown nav`.

---

### Task 3: Phone menu

**Files:** Replace stub `components/site/MobileMenu.jsx`; create `components/site/MobileMenu.test.jsx`.

**Interfaces:**
- Consumes: Task 1 exports, `Button`.
- Produces: `export default function MobileMenu({ pathname })` (`"use client"`), root element `md:hidden`.
  - Menu button: `aria-expanded`, `aria-controls="site-mobile-menu"`, label "Menu" (visible text) / "Close menu" on the panel's close button.
  - Panel `id="site-mobile-menu"`, `role="dialog"`, `aria-modal="true"`, `aria-label="Menu"`, `fixed inset-0 z-50 bg-white overflow-y-auto`, rendered only when open.
  - Groups: a top-level item with children renders a `<button aria-expanded>` that toggles its list (the list includes the parent page as its first link, label "All <label>" only when the parent href isn't already a child); items without children are links.
  - Footer of panel: Find your fit (`outline-walnut`, `w-full`), Request a Quote (`dark`, `w-full`), phone link.
  - Open: focus the close button; set `document.body.style.overflow = "hidden"`. Close (button, Escape keydown on document, any link click): restore overflow, focus the Menu button.

- [ ] **Step 1: Write failing tests**: `is closed by default` (no dialog, `aria-expanded="false"`);
  `opens the panel and moves focus to the close button`; `locks page scroll while open and restores it on close`;
  `closes on Escape and returns focus to the Menu button`; `expands a group to show its links` (Outdoor Saunas → "Cube Saunas" visible);
  `closes when a link is followed`; `marks the current page with aria-current` (pathname `/accessories`).
- [ ] **Step 2:** `npx jest components/site/MobileMenu --coverage=false` → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** `npx jest components/site --coverage=false` → PASS.
- [ ] **Step 5:** Commit `feat(redesign): phone menu for the site header`.

---

### Task 4: Footer

**Files:** Create `components/site/Footer.jsx`, `components/site/Footer.test.jsx`.

**Interfaces:** Consumes Task 1 exports. Produces `export default function Footer()` (server component): `<footer>`
`bg-ink text-sand-100 text-body`; inner `max-w-site mx-auto px-5 md:px-8 pt-16 pb-10 grid gap-10 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]`;
brand column (logo 154×56 linking home, two lines); one `<nav aria-label={title}>` per column with a `font-bold text-white`
title; links `hover:underline underline-offset-4`; copyright row below a `border-t border-line-dark`, `text-small text-sand-400`.

- [ ] **Step 1: Write failing tests**: `renders the brand lines`; `has a nav landmark for Shop, Company and Policies`;
  `every footer link points to its href` (iterate `FOOTER_COLUMNS`); `shows the copyright line`; `has one contentinfo landmark`.
- [ ] **Step 2:** `npx jest components/site/Footer --coverage=false` → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Same command → PASS.
- [ ] **Step 5:** Commit `feat(redesign): site footer`.

---

### Task 5: Route group, old-nav switch, verification and PR

**Files:**
- Create `lib/site/routes.js`, `lib/site/routes.test.js`, `app/(site)/layout.jsx`, `app/(site)/layout.test.jsx`,
  `components/pacifictide/ConditionalNavAndFooter.test.jsx`.
- Move `app/style-guide/page.jsx` and `page.test.jsx` → `app/(site)/style-guide/` (fix relative imports: one more `../`).
- Modify `components/pacifictide/ConditionalNavAndFooter.jsx`, `app/layout.js` (`<main>{children}</main>` → `{children}`),
  `docs/redesign.md` (tick Header/Footer).

**Interfaces:**
- Produces `SITE_ROUTES = ["/style-guide"]` and `isSiteRoute(pathname): boolean` (exact match or prefix + `/`; `null` → false).
- `ConditionalNavAndFooter`: PacificTide branch unchanged but wraps children in `<main>`; site routes → `{children}` only;
  otherwise old `Header`, `<main>{children}</main>`, `RedesignFooter`.
- `app/(site)/layout.jsx`: `<div className="bg-white font-body text-ink"><Header /><main id="main">{children}</main><Footer /></div>`.

- [ ] **Step 1: Write failing tests**: routes — `/style-guide` and `/style-guide/x` are site routes, `/style-guidex`, `/`, `null` are not.
  Conditional (mock the three old components as `<div data-testid="old-header">` etc., mock `usePathname`):
  `renders the old header, main and footer on /`; `renders only children on /style-guide` (no old header, no `main`).
  Layout (mock `Header`/`Footer` as `<header>`/`<footer>`): `renders exactly one main between header and footer`.
- [ ] **Step 2:** `npx jest lib/site/routes components/pacifictide app/(site) --coverage=false` → FAIL.
- [ ] **Step 3:** Implement routes, the conditional change, the root layout change, the `(site)` layout; move the style guide (remove its own outer `bg-white font-body text-ink` wrapper only if the layout now provides it).
- [ ] **Step 4:** `npx jest --coverage=false` → all pass except the known `__tests__/getServerSession.test.js` parse failure.
- [ ] **Step 5:** `npm run build` → succeeds; `/style-guide` still listed.
- [ ] **Step 6:** Tick Header/Footer in `docs/redesign.md`; commit `feat(redesign): serve site header and footer on new routes`.
- [ ] **Step 7:** Final review, push, PR into `redesign`; on the preview check `/style-guide` (new header/footer) and `/`,
  `/saunas` (old nav, unchanged) return 200; screenshots at 1440px and 390px if browser tooling is permitted,
  otherwise ask the owner to check them.
