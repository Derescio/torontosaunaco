# Sauna Finder (`rd/2-sauna-finder`)

Phase 2, last slice in `docs/redesign.md`. Status: approved in conversation 2026-11-27, written up for the record.

## Why

"Find your fit" sits in the header of every new page. The finder answers the question visitors ask before anything
else: which sauna fits my space? It turns a width and depth into a short list with prices, and leads to a quote.

## Goals

- Serve `/sauna-finder` from `app/(site)/`, matching `SaunaFinder.dc.html` at 1440px and 390px. Copy comes from
  `content/redesign/SaunaFinder.json`, and SEO from `pageSeo("/sauna-finder")`.
- Port the design's `fdVals()` behaviour exactly: the same saunas, badges, order, wording and numbers for the same
  inputs.
- Keep the fit logic independent of where the catalogue comes from, so a MongoDB-built catalogue can replace the design
  one later without touching the rules or their tests.

## Non-goals

- MongoDB prices, sizes or seats. The database lacks seats and reliable dimensions, and four finder saunas aren't on
  staging. New product fields, `/editor` inputs and the switch to MongoDB come in Phase 3, with the price
  reconciliation (owner, 2026-11-27).
- Saving or sharing a search, units other than feet, and analytics events.

## Owner decisions (2026-11-27)

- **Option A: the design's catalogue as is.** `fdData` from `SaunaFinder.json` supplies names, links, photos, sizes,
  seats, prices and flags. This is an approved exception to "MongoDB wins" for the finder, until the Phase 3
  reconciliation.
- **No email before cutover.** The design's "Get a quote for my space" `mailto:` to sales@ and tjallen@ breaks the
  hard rule, so it goes to `/contact` instead, with the space details filled into the message.

## Approaches considered

- **A pure function plus a thin client component (chosen).** `findSaunas()` holds every rule and is tested directly.
  The component only holds the inputs and renders.
- Port the design's class component as is. It mixes inline styles with logic, and the styles would have to be undone
  for Tailwind tokens anyway.
- Compute on the server per request. It needs a round trip per keystroke for logic that is light and needs no secrets.

## Design

**`lib/site/saunaFinder.js`** (pure, no React):
- `findSaunas(catalogue, { mode, width, depth, ceiling, people })` returns `{ ready, results, summary, quoteLines }`.
  Inputs are strings or numbers in feet. `ready` is true when width > 0 and depth > 0.
- Rules, as in `fdVals()`:
  - Only items of the chosen kind (`k`: `out`/`in`).
  - Each size `z` (inches) fits when the space covers it in either orientation. It is a close fit within 15 inches
    (`NEAR = 15`).
  - Ceiling is checked only indoors with a ceiling given: a fit needs ceiling ≥ `z.h`, a close fit ≥ `z.h − 2`.
  - The people filter drops sizes with `seats` below the choice.
  - An item uses its fitting sizes, or else its close ones.
- Each result:
  - `name`, `href`, `img`, `alt` (`"<name>, The Toronto Sauna Co."`), `good`, `badge`.
  - `detail`: for a multi-size item, "Fits: " or "Close: " plus the size labels. For a single size, "Footprint about W × D",
    plus " · <note>" when there is one. A close fit adds " · within a foot of your space".
  - `seats`: "Seats up to N", the largest among the sizes used.
  - `price`: the lowest among the sizes used, as `$12,345`, with "From " for multi-size items.
- Feet and inches as in the design's `ft()`: `5′ 11″`, `8′` when there are no inches, and 12 inches rounds up to the
  next foot.
- Order and badges:
  - Core items (all indoor, outdoor with `c`): fits first, then best sellers (`b`), then price.
  - Other outdoor items are "value picks": fits first, then price. There are at most 2, or 4 when no core item matches.
    They are badged "Value pick" or "Value pick · close fit".
  - Core badges are "Fits", "Close fit", or "Best seller · fits" when a best seller fits.
- `summary`: "N outdoor saunas fit or come close to your 10′ × 8′ space (1 close)." with the design's singular and
  plural forms. It is empty when there are no results.
- `quoteLines`: the design's lines ("Hi, I'd like a quote for a sauna.", "Where: outdoor", "Space: …", "Ceiling: …",
  "People: N+").

**`components/site/SaunaFinder.jsx`** (`"use client"`):
- Outdoor/Indoor and people (Any, 2+, 4+, 6+, 8+) are chip `<button>`s with `aria-pressed`.
- Width and depth are labelled number inputs. Ceiling (optional) shows only for indoor.
- The design's idle hint appears before width and depth are entered. The summary sits in an `aria-live="polite"`
  region, and the design's "none" message shows when nothing matches.
- A grid of `FinderCard`s: 4 columns at `desktop:`, 1 below (as the design shows at 390px). Each card has the photo on
  white (`object-contain`), a badge, name, detail, seats and price, and the whole card links to `href`.
- Buttons:
  - "Get a quote for my space" goes to `/contact?msg=<encoded quoteLines>`.
  - The custom link is "Explore custom indoor saunas" → `/saunas/indoor/custom` indoors, or "Talk to us about a custom
    build" → `/contact` outdoors.
- Then the footnote.

**`components/site/ContactForm.jsx`** (small addition): on load, `?msg=` fills an empty message box (capped at
5000). The mode is still chosen by `#visit`, `?visit` or `question` in the hash or the other parameters, never by the
message text.

**Page `app/(site)/sauna-finder/page.jsx`:** the breadcrumb, eyebrow, heading and intro are server-rendered from the
design copy. The finder takes the catalogue and its copy as props. `<JsonLd>` is added. Add `/sauna-finder` to
`SITE_ROUTES`; update `lib/site/progress.js` and `docs/redesign.md`.

## Testing

TDD with Jest:
- `findSaunas`: the 10 × 8 ft outdoor case equals the design (15 results, 1 close, the first four best sellers, the
  value picks, the summary text).
- Rotation, close fits, the ceiling rule, the people filter, multi-size wording and "From", `ft()` rounding, and empty
  or zero or negative inputs.
- The component: chips toggle, indoor shows ceiling, live summary, and the quote link carries the lines.
- ContactForm: `?msg=` fills the box, and a message containing "visit" doesn't switch the mode.

The definition of done adds a browser check of the same 10 × 8 case against the design at 1440px and 390px.

## Left to the builder

Card markup details. The idle and none wording comes verbatim from the design JSON's `if` blocks.
