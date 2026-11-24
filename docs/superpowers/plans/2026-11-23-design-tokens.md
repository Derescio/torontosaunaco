# Design Tokens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the redesign's token scale (colours, fonts, type, radii, shadows, page width), a `Button` component and a
`/style-guide` review page, without changing how any live page looks.

**Architecture:** All token values live in one CommonJS module, `lib/site/tokens.js`, which `tailwind.config.js` spreads into
`theme.extend` and the tests import directly. Fonts load through `next/font/google` as CSS variables on `<html>`. New UI
lives in `components/site/` and merges classes with a site-specific `cn` that knows the new font-size names.

**Tech Stack:** Next.js 15.2 (App Router, JSX), Tailwind 3.4, `next/font/google`, class-variance-authority 0.7,
tailwind-merge 2.3, Jest 29 + Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-11-23-design-tokens-design.md`

## Global Constraints

- Additive only: no existing `tailwind.config.js` key is renamed, removed or overwritten; no built-in Tailwind colour or
  font-size name is reused.
- Branch `rd/1-tokens`, PR into `redesign` (never `main`).
- New components go in `components/site/`; don't touch `components/redesign/`.
- Text colour pairings must meet WCAG AA 4.5:1. `tan` is never text on a light background.
- `/style-guide` returns 404 when `VERCEL_ENV === "production"` (use `isProduction()` from `lib/env/safety.js`).
- Jest's `@/` alias points at `src/` (wrong; logged). Tests use relative imports.
- Definition of done (CLAUDE.md): `npm test` and `npm run build` pass (lint is unconfigured, logged); route returns 200 on the
  preview; screenshots at 1440px and 390px.

## Review Focus

1. **`cn` swallowing sizes.** Stock tailwind-merge reads `text-small` as a colour, so `cn("text-small", "text-white")` drops
   one. Expect both to survive. Test in Task 3.
2. **Callers overriding Button classes.** `<Button className="w-full">` must keep the variant classes, and
   `className="bg-ink"` on a walnut button must win. Test in Task 3.
3. **Button as a link.** `href` renders `<a>` (via `next/link`) with no `type` attribute; without `href` it's a
   `<button type="button">` so it never submits a form by accident. Test in Task 3.
4. **Live pages unchanged.** The legacy `sans` (Poppins) stays the body default; `next/font` variables don't set
   `font-family` on `body`. Check in Task 2 by grepping the built CSS and in Task 4's screenshot of `/`.
5. **Style guide leaking to production or search.** 404 in production and `robots: noindex` everywhere. Test in Task 4.

---

## File Structure

| File | Responsibility |
|---|---|
| `lib/site/tokens.js` (create, CommonJS) | Every token value, plus `TEXT_PAIRS` (the colour pairings used for text) |
| `lib/site/contrast.js` (create) | `contrastRatio(hexA, hexB)` per WCAG 2.x |
| `lib/site/tokens.test.js` (create) | No collisions, contrast of every pair |
| `tailwind.config.js` (modify) | Spread tokens into `theme.extend` |
| `app/fonts.js` (create) | `next/font/google` loaders for Cormorant Garamond and Manrope |
| `app/layout.js` (modify) | Add the two font variable classes to `<html>` |
| `lib/site/cn.js` (create) | `cn()` with tailwind-merge extended for the new font sizes |
| `components/site/Button.jsx` (create) | The button, cva variants and sizes |
| `components/site/Button.test.jsx` (create) | Variants, sizes, link/button, class merging |
| `app/style-guide/page.jsx` (create) | Token and button showcase, 404 in production |
| `app/style-guide/page.test.jsx` (create) | 404 in production, noindex metadata |

---

### Task 1: Tokens module, contrast check and Tailwind wiring

**Files:**
- Create: `lib/site/tokens.js`, `lib/site/contrast.js`, `lib/site/tokens.test.js`
- Modify: `tailwind.config.js` (`theme.extend`)

**Interfaces:**
- Produces (`lib/site/tokens.js`, `module.exports = { colors, fontFamily, fontSize, letterSpacing, borderRadius, boxShadow, maxWidth, TEXT_PAIRS }`):
  - `colors`: the 21 entries from the spec's colour table, flat keys (`ink`, `ink-soft`, `ink-deep`, `charcoal`,
    `taupe-700`, `taupe-500`, `sand-100`…`sand-400`, `line`, `line-strong`, `line-dark`, `linen`, `cream`, `putty`,
    `walnut`, `tan`, `tan-light`, `gold`, `rust`) with the spec's hex values.
  - `fontFamily`: `display: ["var(--font-display)", "Georgia", "serif"]`, `body: ["var(--font-body)", "system-ui", "sans-serif"]`.
  - `fontSize`: the 11 spec steps as Tailwind tuples, e.g. `"display-xl": ["clamp(46px, 6vw, 84px)", { lineHeight: "1" }]`,
    `eyebrow: ["13px", { lineHeight: "1.2", letterSpacing: "0.2em", fontWeight: "600" }]`. (Uppercase is applied by the
    `uppercase` class where used; Tailwind font sizes can't carry text-transform.)
  - `letterSpacing`: `eyebrow: "0.2em"`, `caps: "0.1em"`.
  - `borderRadius`: `card: "14px"`.
  - `boxShadow`: `menu: "0 18px 40px rgba(30,28,26,0.14)"`, `chip: "0 1px 6px rgba(0,0,0,0.18)"`.
  - `maxWidth`: `site: "1320px"`.
  - `TEXT_PAIRS`: array of `[foreground, background]` token names for every text use in the spec, including
    `["ink","white"]`, `["taupe-700","white"]`, `["taupe-500","white"]`, `["taupe-500","linen"]`, `["taupe-500","cream"]`,
    `["walnut","white"]`, `["walnut","linen"]`, `["rust","white"]`, `["white","ink"]`, `["white","walnut"]`,
    `["white","charcoal"]`, `["sand-100","ink"]`, `["sand-200","ink"]`, `["sand-300","ink"]`, `["sand-400","ink"]`,
    `["sand-400","charcoal"]`, `["tan-light","ink"]`, `["tan-light","charcoal"]`, `["ink","linen"]`, `["ink","cream"]`.
    `white` resolves to `#FFFFFF` in the test.
- Produces (`lib/site/contrast.js`): `export function contrastRatio(hexA, hexB): number` (WCAG relative luminance, 6-digit hex).

- [ ] **Step 1: Write the failing tests** in `lib/site/tokens.test.js`:

```js
import { contrastRatio } from "./contrast.js";
const tokens = require("./tokens.js");
const extend = require("../../tailwind.config.js").theme.extend;
const twColors = require("tailwindcss/colors");
const twDefault = require("tailwindcss/defaultTheme");
const hex = (n) => (n === "white" ? "#FFFFFF" : tokens.colors[n]);
// Snapshot of today's theme.extend key names (before this slice), so the check doesn't see the new keys.
const LEGACY = {
  colors: ["border", "input", "ring", "background", "foreground", "primary", "secondary", "destructive", "muted",
    "accent", "popover", "card"],
  fontFamily: ["sans", "playfair", "roboto", "atkinson", "nunito", "rubik", "abeezee", "abyssinica", "akaya", "anton",
    "kavivanar", "libre"],
  borderRadius: ["lg", "md", "sm"],
};

test("contrastRatio matches known values", () => {
  expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
  expect(contrastRatio("#8A7C70", "#FFFFFF")).toBeCloseTo(4.04, 1);
});

test.each(["colors", "fontFamily", "fontSize", "letterSpacing", "borderRadius", "boxShadow", "maxWidth"])(
  "%s keys don't collide with legacy or built-in Tailwind keys", (group) => {
    const taken = new Set([...(LEGACY[group] ?? []), ...Object.keys(twDefault[group] ?? {}),
      ...(group === "colors" ? Object.keys(twColors) : [])]);
    // For colours also check the prefix, so "stone-500" would clash with Tailwind's "stone".
    const clashes = Object.keys(tokens[group]).filter((k) => taken.has(k) || (group === "colors" && taken.has(k.split("-")[0])));
    expect(clashes).toEqual([]);
  });

test.each(tokens.TEXT_PAIRS)("%s on %s meets 4.5:1", (fg, bg) => {
  expect(contrastRatio(hex(fg), hex(bg))).toBeGreaterThanOrEqual(4.5);
});

test("tan is never used as text on a light background", () => {
  expect(tokens.TEXT_PAIRS.filter(([fg, bg]) => fg === "tan" && contrastRatio(hex(bg), "#FFFFFF") < 3)).toEqual([]);
});

test("tailwind config exposes the new tokens and keeps the legacy ones", () => {
  expect(extend.colors.walnut).toBe("#7A4E31");
  expect(extend.colors.primary).toBeDefined();
  expect(extend.fontFamily.sans[0]).toMatch(/Poppins/);
  expect(extend.fontSize["display-xl"]).toEqual(tokens.fontSize["display-xl"]);
  expect(extend.maxWidth.site).toBe("1320px");
});
```

  (The spec's table has 21 colours, not 20: `rust` was counted separately. Implement all 21.)

- [ ] **Step 2: Run** `npx jest lib/site/tokens.test.js` → FAIL ("Cannot find module './contrast.js'").
- [ ] **Step 3: Implement** `contrast.js` and `tokens.js` with the values above.
- [ ] **Step 4: Wire Tailwind**: `const site = require("./lib/site/tokens.js")` at the top of `tailwind.config.js`; in
  `theme.extend` merge each group (`colors: { ...existing, ...site.colors }`, and add `fontSize`, `letterSpacing`,
  `boxShadow`, `maxWidth`, and `borderRadius.card`). Don't export `TEXT_PAIRS` into the config.
- [ ] **Step 5: Run** `npx jest lib/site` → PASS. If a pair fails contrast, stop and report it; don't change a hex value
  without updating the spec.
- [ ] **Step 6: Commit** `feat(redesign): design tokens in tailwind config`.

---

### Task 2: Fonts via next/font

**Files:**
- Create: `app/fonts.js`
- Modify: `app/layout.js` (the `<html>` element only)

**Interfaces:**
- Produces: `export const display` (Cormorant_Garamond, `weight: ["500","600","700"]`, `style: ["normal","italic"]`,
  `variable: "--font-display"`, `display: "swap"`, `subsets: ["latin"]`) and `export const body` (Manrope,
  `weight: ["400","500","600","700"]`, `variable: "--font-body"`, same options).
- Consumes: `fontFamily.display/body` from Task 1, which read these variables.

- [ ] **Step 1: Implement** `app/fonts.js`; in `app/layout.js` set
  `<html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>`. Leave the existing
  `<link>` fonts and Poppins default alone.
- [ ] **Step 2: Verify** `npm run build` passes, then grep `.next/static/css/*.css` for `--font-display` and confirm
  `body`'s `font-family` rule is unchanged (still Poppins via the legacy `sans`).
- [ ] **Step 3: Commit** `feat(redesign): load Cormorant Garamond and Manrope with next/font`.

No unit test: `next/font` doesn't run under Jest. The build and the Task 4 screenshot are the check.

---

### Task 3: `cn` for the site and the Button

**Files:**
- Create: `lib/site/cn.js`, `components/site/Button.jsx`, `components/site/Button.test.jsx`

**Interfaces:**
- Produces: `export function cn(...inputs): string` in `lib/site/cn.js`: `clsx` + `extendTailwindMerge({ extend: { classGroups: { "font-size": [{ text: Object.keys(tokens.fontSize) }] } } })`.
- Produces: `export default function Button({ variant = "dark", size = "md", href, className, children, ...props })` and
  `export const buttonVariants` (the cva function, for links styled as buttons elsewhere).
  - Base: `inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tan focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none`.
  - Variants: `dark` `bg-ink text-white hover:bg-ink-soft`; `walnut` `bg-walnut text-white hover:bg-ink`;
    `light` `bg-white text-ink hover:bg-linen`; `outline-light` `border border-white text-white hover:bg-white/10`;
    `outline-walnut` `border border-walnut text-walnut hover:bg-walnut hover:text-white`.
  - Sizes: `sm` `h-9 px-4 text-small`; `md` `h-11 px-5 text-small`; `lg` `h-13 px-7 text-body` (`h-13` = 52px: add
    `spacing: { 13: "3.25rem" }` to the tokens module and config if Tailwind 3.4 lacks it).
  - With `href`: renders `next/link`. Without: `<button type="button">` unless `type` is passed.

- [ ] **Step 1: Write the failing tests** in `components/site/Button.test.jsx` (mock `next/link` as a plain `<a>`):
  - `renders a button with type="button" by default`
  - `renders a link with the href when href is given` (role `link`, no `type` attribute)
  - `test.each` over the 5 variants: `applies the variant classes` (e.g. `walnut` → has class `bg-walnut`)
  - `test.each` over the 3 sizes: `applies the size classes` (`lg` → `h-13`, `text-body`)
  - `keeps the size class when a colour class is added`: `cn("text-small", "text-white")` contains both
  - `lets the caller override the fill`: `<Button variant="walnut" className="bg-ink">` has `bg-ink`, not `bg-walnut`
  - `keeps variant classes when the caller adds layout classes`: `className="w-full"` → has `w-full` and `bg-ink`
- [ ] **Step 2: Run** `npx jest components/site` → FAIL (module not found).
- [ ] **Step 3: Implement** `lib/site/cn.js` and `components/site/Button.jsx`.
- [ ] **Step 4: Run** `npx jest components/site lib/site` → PASS.
- [ ] **Step 5: Commit** `feat(redesign): site Button with five variants and three sizes`.

---

### Task 4: `/style-guide` page, full verification and PR

**Files:**
- Create: `app/style-guide/page.jsx`, `app/style-guide/page.test.jsx`
- Modify: `docs/redesign.md` (tick the tokens item)

**Interfaces:**
- Consumes: `tokens` (Task 1), `Button` (Task 3), `isProduction` from `lib/env/safety.js`.
- Produces: `export const metadata = { title: "Style guide", robots: { index: false, follow: false } }` and a default
  server component. First line of the component: `if (isProduction()) notFound();`.

- [ ] **Step 1: Write the failing tests** (mock `next/navigation`'s `notFound` to throw):
  - `calls notFound in production` (`process.env.VERCEL_ENV = "production"`)
  - `renders every colour token name outside production`
  - `renders all five button variants`
  - `metadata is noindex`
- [ ] **Step 2: Run** `npx jest app/style-guide` → FAIL.
- [ ] **Step 3: Implement** the page from the tokens module (so it can't drift): colour swatches with name and hex on
  `bg-linen`; one line per type step set in its own size (`font-display` for display/heading steps, `font-body` for the
  rest); radii and shadows samples; a buttons grid of 5 variants × 3 sizes, with the light variants on a `bg-ink` panel.
  Wrap in `max-w-site mx-auto px-5 md:px-8`. Use tokens only, no arbitrary values.
- [ ] **Step 4: Run** `npm test` → all new tests pass. Report any failures elsewhere by name (the known one is
  `__tests__/getServerSession.test.js`, which fails to parse on clean `redesign`).
- [ ] **Step 5: Run** `npm run build` → succeeds.
- [ ] **Step 6: Commit**, push `rd/1-tokens`, open a PR into `redesign` with the summary and the five design calls from
  the spec.
- [ ] **Step 7: Verify the preview** with the bypass header: `/style-guide` 200 with `noindex`; `/` and `/saunas` 200.
  Screenshot `/style-guide` and `/` at 1440px and 390px; confirm `/` looks the same as on staging. Add the preview URL
  to the PR.
