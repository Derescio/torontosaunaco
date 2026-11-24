# Design tokens for the redesign (`rd/1-tokens`)

Short design. Approved approach: **option 1, additive tokens**.

## Why

The redesign's 108 `.dc.html` pages hard-code their styles: 48 colours, 55 font sizes, 47 spacing values and 15 button
paddings. New components need one consistent scale to build from. The live site's pages share `tailwind.config.js` and stay
on `redesign` until they're replaced, so the new scale must not change how they look.

## Approaches considered

1. **Additive tokens with new names** (chosen). New keys only; nothing existing is renamed or overwritten. Old pages are
   unchanged. Legacy tokens and fonts are deleted at cutover.
2. Separate Tailwind config for new pages. Rejected: Next.js loads CSS globally, so isolation is leaky and the build gets
   more complex.
3. Replace the theme now. Rejected: every current page on staging would break until rebuilt.

## Rules

- No new key may collide with an existing or built-in Tailwind key that the live pages use (`primary`, `accent`, `sans`,
  `stone`, `container`, `xs`…`9xl` font sizes, etc.). A Jest test enforces this.
- New components (`components/site/`) use only the new tokens. Old components keep the old ones.

## The scale

### Colours (20, from 48)

| Token | Value | Use | Absorbs |
|---|---|---|---|
| `ink` | `#1E1C1A` | main text, dark buttons, dark sections | |
| `ink-soft` | `#3A3531` | dark button hover | |
| `ink-deep` | `#141211` | deepest dark background | |
| `charcoal` | `#2B2724` | dark panels (hero, footer cards) | `#2E2824 #2A231E #262220 #211B17 #1B1816` |
| `taupe-700` | `#4A443E` | secondary body text | |
| `taupe-500` | `#6B635B` | muted text, labels | `#8A7C70` (fails contrast, see below) |
| `sand-100` | `#E3D9CC` | text on dark | |
| `sand-200` | `#CFC6BA` | secondary text on dark | |
| `sand-300` | `#BDB2A6` | muted text on dark | `#BDB4A8` |
| `sand-400` | `#A89C90` | faint text on dark | |
| `line` | `#E6E0D8` | borders, dividers | |
| `line-strong` | `#CFC5B7` | stronger borders, image placeholders | |
| `line-dark` | `#3A322C` | borders on dark | `#5A5048` |
| `linen` | `#F4F1EC` | light section background, light button hover | |
| `cream` | `#F4EDE3` | warm panel background | |
| `putty` | `#D9D1C5` | image placeholder tiles | |
| `walnut` | `#7A4E31` | brand: primary action, link hover | |
| `tan` | `#D4A373` | accent: dots, rules, highlights. **Never as text on light** (2.3:1) | |
| `tan-light` | `#E2B583` | accent text on dark | `#D4B89C` |
| `gold` | `#B8862E` | star ratings only | |
| `rust` | `#8A3B12` | form errors | |

Contrast checked (WCAG AA 4.5:1 for text): every text pairing above passes. `#8A7C70` measured 4.0:1 on white and
4.2:1 on ink, so it is replaced by `taupe-500` on light and `sand-400` on dark. *(My call: a small departure from the design
for accessibility.)*

### Fonts

Loaded with `next/font/google` (self-hosted, no layout shift) as CSS variables on `<html>`. Variables alone don't change
old pages.

| Token | Font | Weights |
|---|---|---|
| `font-display` | Cormorant Garamond | 500, 600; italic 500, 600, 700 |
| `font-body` | Manrope | 400, 500, 600, 700 |

### Type scale (11 steps, from 55)

| Token | Size | Line height | Font | Absorbs |
|---|---|---|---|---|
| `text-display-xl` | clamp(46px, 6vw, 84px) | 1.0 | display | homepage hero h1 |
| `text-display-lg` | clamp(40px, 4.8vw, 64px) | 1.05 | display | page h1 (44–76 clamps) |
| `text-display-md` | clamp(36px, 4.4vw, 56px) | 1.05 | display | section h2 (34–60 clamps) |
| `text-display-sm` | clamp(28px, 3vw, 40px) | 1.1 | display | sub-sections (26–46 clamps) |
| `text-heading` | 26px | 1.2 | display | card and block titles (24–30) |
| `text-title` | 22px | 1.3 | either | small titles (19–22) |
| `text-lead` | 18px | 1.6 | body | intro paragraphs (17–18) |
| `text-body` | 16px | 1.6 | body | body copy (15–16) |
| `text-nav` | 15px | 1.5 | body | header nav only (added in `rd/1-header-footer`: at 16px the nav wrapped to two rows) |
| `text-small` | 14px | 1.5 | body | UI text, nav, buttons (13–14) |
| `text-caption` | 12px | 1.4 | body | fine print, tags (9–12) |
| `text-eyebrow` | 13px, 600, uppercase, tracking 0.2em | 1.2 | body | the design's small-caps labels |

The design's most common size is 15px; it rounds up to 16px. Text becomes slightly larger and easier to read. *(My call.)*
Sizes under 12px (used for 400+ tiny labels) round up to 12px.

Letter spacing: `tracking-eyebrow` 0.2em, `tracking-caps` 0.1em (absorbs 0.06–0.16em).

### Spacing and layout

- Spacing uses Tailwind's built-in 4px scale. Odd design values snap to the nearest step: 7→8, 13→12, 18→16 or 20,
  22→24, 27→28, 90→96, 110→112.
- Page width: `max-w-site` = 1384px outer, so content is 1320px wide with 32px side padding on desktop (20px on
  mobile). The design sets `max-width: 1320px` in content-box; Tailwind is border-box. *(Corrected in
  `rd/1-header-footer`: at 1320px outer, content was 64px narrower than the design and the header nav wrapped.)*
- One mobile/desktop switch, as in the design: Tailwind's `md` (768px) stands in for the design's 720px. *(My call: avoids a
  custom breakpoint.)*

### Corners and shadows

- `rounded` 4px (absorbs 3–4), `rounded-lg` 8px (absorbs 6–10), `rounded-card` 14px (absorbs 12–16), `rounded-full` pills.
  `rounded` and `rounded-lg` already resolve to these sizes, so only `rounded-card` is new.
- `shadow-menu`: 0 18px 40px rgba(30,28,26,0.14) (dropdowns, popovers). `shadow-chip`: 0 1px 6px rgba(0,0,0,0.18) (gallery
  controls).

### Buttons (5 variants × 3 sizes, from 15 paddings)

One `components/site/Button.jsx` (built with `class-variance-authority`, already installed). Pill-shaped, weight 600,
visible tan focus ring. Renders a link when given `href`.

| Variant | Look | Design use |
|---|---|---|
| `dark` | ink fill, white text, hover `ink-soft` | main CTA on light |
| `walnut` | walnut fill, white text | "Find your fit", Add to Quote |
| `light` | white fill, ink text, hover `linen` | CTA on dark/photo |
| `outline-light` | white border and text | secondary on dark/photo |
| `outline-walnut` | walnut border and text | header Sauna Finder |

| Size | Height | Padding | Text |
|---|---|---|---|
| `sm` | 36px | 16px | `text-small` (filter chips) |
| `md` | 44px | 20px | `text-small` |
| `lg` | 52px | 28px | `text-body` (hero) |

## Deliverables

- `tailwind.config.js`: the new keys above, additive only.
- `app/layout.js`: Cormorant Garamond and Manrope via `next/font`, exposed as CSS variables.
- `components/site/Button.jsx`.
- A style-guide page at `/style-guide` showing every token and button, for the owner to review on staging. It returns
  404 in production.
- Jest tests: no token collides with an existing key; every colour pairing used for text meets 4.5:1; Button renders each
  variant and size.

## Not in this slice

Header, Footer, other components, and removing legacy fonts and tokens (at cutover).
