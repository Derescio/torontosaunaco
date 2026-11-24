# Site Header and Footer (`rd/1-header-footer`)

Short design. Builds on the tokens and `Button` from `rd/1-tokens`.

## Why

Every redesign page sits inside the same header and footer. They come first so that later page slices only build page
content. The live pages keep their current nav and footer until each one is replaced.

## What the design says (from 107 `.dc.html` pages)

- **Header:** the same on every page; only `aria-current` changes with the page.
  - **Utility bar** (`ink`, 13px): "Showroom in Schomberg, by appointment · Delivery and installation across Ontario"
    (hidden on mobile), then `(437) 429-6623` (`tel:+14374296623`) and Cart with a bag icon.
  - **Main row** (white, bottom border `line`): logo (48px tall) → nav (15px, weight 500) → buttons.
  - **Nav:**
    - Outdoor Saunas ▾ `/saunas/best-sellers`. Dropdown, text only, 300px wide:
      - Best Sellers `/saunas/best-sellers`: "Our most popular backyard saunas"
      - Cube Saunas `/saunas/cube`: "Modern glass-front Pure Cube, Studio Six and more"
      - Barrel Saunas `/saunas/barrel`: "Classic cedar barrels, with porch options"
      - Cabin & Canadian Timber `/saunas/canadian-timber`: "Traditional cabins and log saunas"
      - All Outdoor Saunas `/saunas`: "Browse every outdoor model"
      - Luna Saunas `/saunas/luna`: "Modern cedar cabins with rounded corners"
    - Plunge & Shower ▾ `/cold-plunges`. Dropdown with thumbnails, 340px wide:
      - Cold Plunges `/cold-plunges`: "Cedar plunge tubs and chillers"
      - Outdoor Showers `/outdoor-showers`: "Pillar, enclosed and barrel showers"
    - Indoor Saunas ▾ `/saunas/indoor`. Dropdown with thumbnails:
      - Indoor Sauna Kits `/saunas/indoor/kits`: "Ready-made rooms in set sizes, from $8,070"
      - Custom Indoor Saunas `/saunas/indoor/custom`: "Designed and built into your space"
    - Heaters `/sauna-heaters` · Accessories `/accessories` · Wellness `/wellness` · Contact `/contact`
  - **Dropdown panel:** white, `line` border, `rounded-card`, `shadow-menu`, 10px padding. Items have 10px/12px padding,
    a 10px radius and a `linen` hover. Each shows a title and a description, plus a thumbnail where the design has one.
    Panels open on hover and on keyboard focus.
  - **Buttons:** "Find your fit" (`outline-walnut`, pencil icon) `/sauna-finder` and "Request a Quote" (`dark`) `/contact`.
- **Footer** (`ink` background, `sand-100` text, 15px). A grid of columns at least 200px wide, 40px gap, padded
  64px/32px/40px:
  - **Brand:** logo, "Premium Canadian cedar saunas, delivered across Ontario." and "Showroom visits by appointment only."
  - **Shop:** Outdoor Saunas, Cold Plunges, Outdoor Showers, Indoor Saunas, Heaters, Accessories, Custom Saunas,
    Sauna Finder.
  - **Company:** About Us, Wellness, Service Areas, Blog, Contact.
  - **Policies:** Warranty, Shipping, Refund Policy, Terms of Service, Privacy, Instagram.
  - **Bottom line:** "© 2026 Toronto Sauna Co. All rights reserved."

## Decisions

- **Phone menu (owner's choice, option 1).** Below the `desktop` breakpoint (998px; was `md`, 768px, changed by the owner on 2026-11-24) the main row shows the logo, "Request a Quote" (`sm`)
  and a Menu button. The button opens a full-screen panel with the same links. The three dropdowns become expandable
  groups. Below them are "Find your fit" and the phone number. The panel closes on Escape, on its close button and when
  a link is followed. Focus moves into the panel when it opens and returns to the Menu button when it closes. Page
  scroll is locked while it's open. *(The design has no phone menu.)*
- **One footer everywhere.** The 4-column version used on 93 pages, plus the homepage's extra links (Custom Saunas,
  Service Areas, Terms of Service). The 14-page one-line variant isn't built. *(My call.)*
- **Links use the new routes** from `page-map.csv`. Routes that aren't built yet 404 on staging until their slice
  lands. "Custom Saunas" goes to `/custom-builds` (the current live route) until the custom page has a route.
  *(My call.)*
- **Current page:** `aria-current="page"` on the nav item whose route is a prefix of the URL. Outdoor Saunas matches
  `/saunas` but not `/saunas/indoor`.
- **Which pages get it:** new pages go in the route group `app/(site)/`, whose layout renders `Header`, `<main>` and
  `Footer`. `lib/site/routes.js` lists the paths served from that group, and `ConditionalNavAndFooter` leaves out the old
  nav and footer for them. The root layout's `<main>` moves into `ConditionalNavAndFooter` so the new pages don't end
  up with a `<header>` nested inside `<main>`. `/style-guide` moves into the group first.
- **Images:** the two logos and four thumbnails are copied from the design's `assets/` to `public/images/site/` and
  rendered with `next/image`.
- **Code:**
  - All the link data lives in one module, `components/site/nav.js`, which both components read.
  - The desktop dropdowns are server-rendered and work with CSS only (hover and `focus-within`).
  - The phone menu is a small client component.

## Not in this slice

The Cart count badge, search, and the 14-page one-line footer.

## Tests

- **Nav data:** every link is a root-relative path or `tel:`/`https:`, and no label says "Leisurecraft".
- **Header:**
  - renders every nav label;
  - marks the right item `aria-current` for `/saunas/cube`, `/saunas/indoor/kits` and `/sauna-heaters`;
  - the phone link is `tel:+14374296623`.
- **Phone menu:**
  - opens and closes with the button and with Escape;
  - expands a group;
  - closes when a link is followed;
  - `aria-expanded` matches the panel's state.
- **Footer:** all four columns and every link; the copyright line.
- **Root layout:** old nav present on `/`, absent on `/style-guide`.
- **Checks:** build, then screenshots at 1440px and 390px compared against `About.dc.html`.
