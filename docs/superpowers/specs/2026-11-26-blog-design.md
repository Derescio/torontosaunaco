# Blog index and article pages (`rd/2-blog`)

Phase 2, last part of the About/Wellness/Contact/Blog item in `docs/redesign.md`. Status: approved in conversation
2026-11-26, written up for the record.

## Why

The team keeps publishing in Sanity after launch, and new posts must appear on `/blog` without a code change (owner,
2026-11-26). Article pages move to the new site in the same slice so visitors don't switch between two designs on
every click (owner chose A).

## Goals

- `/blog` matches `Blog.dc.html` at 1440px and 390px: header, featured post, card grid, CTA band. Title/meta/canonical
  and JSON-LD from `pageSeo("/blog")`.
- The list is **every published Sanity `blogPost`, newest first**. The newest is the featured card.
- For the 11 posts the design shows, the design's category, summary and photo override Sanity's. Every other post uses
  its Sanity photo and description (summary omitted when Sanity has none) and has no category.
- `/blog/[slug]` restyled with the new site's pieces (no design exists): breadcrumb, linen title band with date, hero
  photo, article body in the site's typography, three related posts, CTA band.
- Static with ISR, as the live pages (`revalidate = 7200`, `generateStaticParams` for posts).

## Non-goals

- Categories in Sanity, filters, search, pagination (flag when the list passes ~60 posts).
- Editing posts or the Sanity schema. Reads only, from the public `production` dataset via `lib/sanity.js`.
- Fixing soft 404s for unknown slugs (Phase 5).
- Blog entries in the sitemap (Phase 5).

## Approaches considered

Which posts (owner chose the first):
- **All Sanity posts, design overrides for its 11 (chosen).** New posts appear automatically.
- Exactly the design's 11 posts. Pixel match, but every new post needs a code change.

Article pages (owner chose A):
- **A: restyle in this slice with the site's pieces (chosen).**
- B: leave on the old design until a design exists. Visitors switch looks per click, and it needs extra routing.

## Design

**Data (`lib/site/blog.js`).**
- `getPosts()` → GROQ `*[_type == "blogPost" && defined(slug.current)] | order(publishedAt desc) { title,
  "slug": slug.current, publishedAt, description, titleimage }` via `client.fetch`, guarded (`Array.isArray`).
- `getPost(slug)` → the same fields plus `content`; `getRelated(slug, 3)` → three newest others.
- `DESIGN_CARDS` built at module load from `content/redesign/Blog.json` cards: slug (from the card `href`),
  category (the card's date line minus "Latest" and the date), summary, design image `src` + alt.
- `toCard(post)` → `{ slug, href: "/blog/<slug>", title, date, category?, summary?, image }`. `date` is formatted from
  Sanity's `publishedAt` as "November 18, 2026" (en-CA, America/Toronto), so dates always follow Sanity. `image` is
  `{ kind: "design", src, alt }` when the design covers the post, else `{ kind: "sanity", source, alt: title }`, else none.
  Title always from Sanity.

**Images.** Design photos use `SiteImage` (Cloudinary). Sanity photos use a new `components/site/SanityImage.jsx`:
`next/image` with a loader that sets `w`, `q`, `auto=format` on the `urlFor()` URL (Sanity's image CDN resizes; Vercel
doesn't). Width/height from the asset's dimensions in the `_ref` (`image-<id>-<w>x<h>-<ext>`); `sizes` required.

**Index (`app/(site)/blog/page.jsx`, `components/site/BlogIndex.jsx`).** `revalidate = 7200`. Linen header from the
"Blog hero" section (breadcrumb, eyebrow, H1, lead). Featured: `Split` with the card's photo, eyebrow line
"Latest · {category ·} {date}" as the design, H2 title, summary, "Read the article" link. Grid: the rest as `PostCard`s,
`grid gap-x-6 gap-y-12 desktop:grid-cols-4` (two columns on phones from 520px, as the design shrinks). Card: 3:2 photo,
caps line "{category · }{date}", title (`font-display text-title`), summary (`text-small`), "Read the article". CTA band
from "Section 1". If Sanity returns nothing or fails, the page renders the header, the design's 11 cards from
`Blog.json` (their own dates) and the CTA band, rather than an empty page.

**Article (`app/(site)/blog/[slug]/page.jsx`, `components/site/BlogPost.jsx`).** `revalidate = 7200`,
`generateStaticParams` from `getPosts()`. Metadata from Sanity: title "{title} | The Toronto Sauna Co.", description
(Sanity's, else the design summary, else the blog's meta description), canonical
`https://www.thetorontosaunaco.com/blog/<slug>`, OpenGraph **type "website"** (CLAUDE.md; the live page's "article"
is dropped), image = the card photo. JSON-LD: `BlogPosting` (headline, datePublished, image, url, publisher The Toronto
Sauna Co.) and `BreadcrumbList` (Home › Blog › title). Layout: breadcrumb "Home / Blog / {title}", eyebrow
"{category · }{date}", H1 `text-display-md`, hero photo (16:9, `priority`), body in a `max-w-prose` column rendered by
`@portabletext/react` with site components for h2/h3/h4 (`font-display`), paragraphs, lists, links (internal via
`next/link`, external `rel="noopener"`), blockquote and inline images (`SanityImage`). Then "More guides" with three
`PostCard`s and the blog's CTA band. Unknown slug → `notFound()` (soft 404 is a known Phase 5 item).

**Routes.** `/blog` joins `SITE_ROUTES` (prefix match covers `/blog/<slug>`). Delete the live `app/blog/page.jsx`,
`app/blog/[slug]/page.jsx` and the stray `app/blog/data.txt` on `redesign` (same URLs).

**Tests.** `blog.js`: design overrides for a covered slug, Sanity fields for another, date formatting, no category when
uncovered, empty/failed fetch handled; `SanityImage` loader and size from `_ref`; `BlogIndex` featured = newest, card
count = posts, design category/photo on a covered card, Sanity photo on another, fallback to the design cards when the
list is empty; `BlogPost` H1, breadcrumb, Portable Text headings/lists/links, related posts, metadata (`type: "website"`,
canonical) and JSON-LD shape. Sanity is mocked in tests.

**Done when** lint/test/build pass, `/blog` and three article URLs return 200 with correct title/canonical (`/blog`
matching `page-map.csv`), screenshots at 1440/390 vs the design (index) and checked by eye (article), all images
load (Cloudinary or `cdn.sanity.io`, no `/_next/image`), progress page marks "About, Wellness, Contact and the Blog"
done, docs updated, PR into `redesign`.

## Left to the builder

Portable Text styling details, related-post selection beyond "newest three others", and test fixtures.
