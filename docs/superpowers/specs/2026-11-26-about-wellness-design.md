# About and Wellness pages, and design photos (`rd/2-about-wellness`)

Phase 2, second slice in `docs/redesign.md`. Status: approved in conversation 2026-11-26, written up for the record.

## Why

About and Wellness are the next content pages, and the first that need real photos. Nothing serves the design's 439
photos yet (`content/image-map.json` is empty), so this slice also builds the photo pipeline every later page uses.

## Goals

- Upload the design's photos to Cloudinary and record each one's URL and size in `content/image-map.json`.
- One image component for the new site that follows the cost rules (`next/image`, explicit size, `sizes`, Cloudinary
  does the resizing).
- Serve `/about` and `/wellness` from `app/(site)/`, matching `About.dc.html` and `Wellness.dc.html` at 1440px and 390px,
  with copy from `content/redesign/{About,Wellness}.json` and SEO from `pageSeo()`.
- Reusable section components for the rest of Phase 2.

## Non-goals

- PDFs in the design assets (34 spec sheets): product pages, Phase 3.
- Contact, Blog, Sauna Finder, `/saunas/best-sellers`: later slices. Links to `/contact#visit`, `/sauna-finder` and
  `/saunas/best-sellers` are rendered as designed and 404 on staging until those slices land.
- Matching design photos to existing Cloudinary photos (owner chose upload-all, approach A).

## Approaches considered

Photos (owner picked A):
- **A: upload the design photos to Cloudinary under `redesign/<hash>` and fill the image map (chosen).** Simple and
  repeatable; duplicates of existing photos cost little storage.
- B: match each photo to an existing Cloudinary image and upload only new ones. Slow and error-prone across 439 photos.
- C: commit photos to `public/`. 120 MB permanently in a public repo.

Pages:
- **Section components composed per page in JSX, copy looked up by section name (chosen).** Layouts differ per page;
  shared pieces carry over to Contact, city pages and the homepage.
- A generic renderer driven only by the JSON. The two pages share too little layout for one schema.
- Hand-written pages. Breaks the verbatim-copy rule.

## Design

**Upload script.** `scripts/images/upload-design-images.mjs` reads `*.{jpg,png,webp}` from the design `assets/` folder
(`DC_SITE_DIR` or `~/Downloads/TSC-REVAMP/Site`). Dry run by default (prints counts: to upload, already mapped);
`--write` uploads each missing file to Cloudinary's signed upload REST endpoint with `public_id` `redesign/<hash>`,
`overwrite: false`, and merges the response into `content/image-map.json`, sorted by key, after each upload so an
interrupted run resumes. Credentials come from `.env` (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`,
`NEXT_PUBLIC_CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`); the secret is never printed or written anywhere. No new
dependency: SHA-1 signing via `node:crypto`, upload via `fetch` + `FormData`. Pure parts (signing, file listing, map
merge) are unit-tested; the network call is not.

**Image map.** `{ "<hash>": { "url": "https://res.cloudinary.com/…/redesign/<hash>.<ext>", "width": n, "height": n } }`.
`lib/site/seo.js` currently expects a URL string per key; it changes to read `.url` (and still accepts a string), with
a test. After this slice, design images in og:image and JSON-LD resolve instead of being dropped.

**`components/site/SiteImage.jsx`.** `SiteImage({ src, alt, sizes, priority, className, fill? })`. `src` is the design's
`./assets/<hash>.<ext>`; it looks the hash up in the image map and renders `next/image` with the map's width and height
and a Cloudinary loader (`/upload/f_auto,q_auto,w_<width>/redesign/<hash>`), so Vercel does no transformation.
`sizes` is required. An unmapped image throws (the build fails, so no page ships a broken image). `priority` only on
the hero.

**Page content lookup.** `lib/site/content.js`: `section(page, name)` returns that section's blocks or throws
`"<file>: no section \"<name>\""`; small helpers pick blocks by type and order within a section (e.g. `first(blocks,
"heading")`, `all(blocks, "image")`) and throw on a missing required block. Each page imports its JSON statically.

**Section components (`components/site/`).**
- `SectionHeader`: eyebrow + H2 (the design's `<em><strong>` phrase renders italic) + optional lead paragraph.
- `Split`: image and text side by side on `desktop:`, stacked below; image left or right; light or dark.
- `NumberedPoints`: the "01 / title / text" columns (About: 4).
- `StatGrid`: big figure + label (+ text + source) cards (Wellness tradition stats and research cards).
- `PhotoGrid`: responsive grid of `SiteImage`s (About strip: 3; Wellness gallery: 11, laid out as in the design).
- `Steps`: numbered ritual steps (Wellness, 5).
- `CtaBand`: dark band with H2, paragraph and buttons. First button `tan`, the rest `outline-light`. `PolicyPage` switches
  its question band to `CtaBand` (same look, existing tests keep passing).
- Lists, quotes and paragraphs use `Blocks`. The extractor's `quote` type is added to `Blocks` (About's pull quote).

**Pages.** `app/(site)/about/page.jsx` and `app/(site)/wellness/page.jsx`, each with `pageSeo()` metadata and `<JsonLd>`,
composing the sections in design order (About: hero, approach + quote, photo strip, numbered points, dark "After the
install" split, showroom card, CTA band. Wellness: dark photo hero with two anchor buttons, tradition split with 3 stats,
research stat cards + footnote, gallery, dark lifestyle split with 5 items, ritual steps with photo, safety list, CTA
band, sources). The extractor drops section ids, so the page sets `id="research"` and `id="ritual"` for the hero's
`#research` / `#ritual` buttons; a test checks every in-page anchor has a target. Both routes join `SITE_ROUTES`; the
live `app/about/page.jsx` is deleted (it would clash). Static pages, no DB.

**Styling.** Tokens only, `desktop:` breakpoint, container `mx-auto max-w-site px-5 desktop:px-8`. Design values map to
the nearest existing step; a new token only if two components need it.

**Tests.** Upload-script pure functions; `seo.js` reading `{url}`; `SiteImage` (loader URL, size from map, throws when
unmapped); `content.js` lookups and errors; each section component; each page renders its H1, every section heading,
every image with its alt, the CTA links and the anchor targets; no "King Township" or "Leisurecraft".

**Done when** lint/test/build pass (lint is the known unconfigured item), both routes return 200 with title/meta/canonical
matching `page-map.csv`, screenshots at 1440/390 compared with the design in a real browser with no sideways scroll at
390px, images load from `res.cloudinary.com`, `progress.js` (About/Wellness/Contact/Blog item stays in progress until
the Blog slice) and `docs/redesign.md` updated, PR into `redesign`.

## Left to the builder

Token choices per element, gallery grid spans, component props beyond those named, and test fixtures.
