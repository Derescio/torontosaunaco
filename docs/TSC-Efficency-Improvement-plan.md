# Toronto Sauna Co. — Vercel efficiency improvement plan

Sequential checklist to reduce **function invocations/duration**, **ISR writes**, and **edge middleware** cost.

## Implementation status (last updated)

| Step | Status | What shipped |
|------|--------|----------------|
| 1 | **Done** | Homepage carousel: [`app/page.js`](c:/TorontoSauna/torontosaunco/app/page.js) is an async Server Component; loads catalog via `fetchProducts`, builds items with [`lib/product-utils.js`](c:/TorontoSauna/torontosaunco/lib/product-utils.js) (`buildPureCubeCarouselItems`), passes `items` to [`components/Carousel2.jsx`](c:/TorontoSauna/torontosaunco/components/Carousel2.jsx). [`components/Carousel1.jsx`](c:/TorontoSauna/torontosaunco/components/Carousel1.jsx) now accepts `items` prop (no `fetch` in client); wire parents when that component is used. [`components/PureCube1.jsx`](c:/TorontoSauna/torontosaunco/components/PureCube1.jsx) → server-fed `cubes` prop; [`components/PureCubeV2.jsx`](c:/TorontoSauna/torontosaunco/components/PureCubeV2.jsx) is async server + shared `normalizeProducts`. |
| 2 | **Already satisfied** | [`app/blog/page.jsx`](c:/TorontoSauna/torontosaunco/app/blog/page.jsx) uses `revalidate = 7200` (no longer 30s). |
| 3 | **Done** | [`assets/utils/request.js`](c:/TorontoSauna/torontosaunco/assets/utils/request.js): accessories fetch uses `next: { revalidate: 3600 }`; products listing fetch remains `revalidate: 7200`. |
| 4 | **Not done** | Shared `unstable_cache` + direct Mongo from Server Components (skip HTTP to `/api/products`) — optional next iteration. |
| 5 | **Done** | [`app/api/products/route.js`](c:/TorontoSauna/torontosaunco/app/api/products/route.js): default `GET` uses `.select('-documents').lean()`; append **`?full=1`** for full documents when needed. |
| 6 | **Done** | [`app/api/accessories/route.js`](c:/TorontoSauna/torontosaunco/app/api/accessories/route.js): removed `force-dynamic`; `export const revalidate = 3600`; `Accessories.find().lean()`. |
| 7 | **Not done** | Client PDPs: [`app/cold-plunge/[id]/page.jsx`](c:/TorontoSauna/torontosaunco/app/cold-plunge/[id]/page.jsx), [`app/hot-tub/[id]/page.jsx`](c:/TorontoSauna/torontosaunco/app/hot-tub/[id]/page.jsx), [`app/showers/[id]/page.jsx`](c:/TorontoSauna/torontosaunco/app/showers/[id]/page.jsx) — still candidates for RSC + `generateStaticParams` like [`app/saunas/[id]/page.jsx`](c:/TorontoSauna/torontosaunco/app/saunas/[id]/page.jsx). |
| 8 | **Done** | [`middleware.jsx`](c:/TorontoSauna/torontosaunco/middleware.jsx): removed `export { default } from 'next-auth/middleware'`; `getToken` only when a cookie name includes `next-auth.session-token`. |
| 9 | **Done** | [`app/api/orders/route.js`](c:/TorontoSauna/torontosaunco/app/api/orders/route.js): `401` if no session; query `$or: [{ email }, { username: email }]`. `fetchOrders` in [`assets/utils/request.js`](c:/TorontoSauna/torontosaunco/assets/utils/request.js) forwards **`cookie`** on server (`next/headers`) so RSC calls to `/api/orders` receive the session. |

### Supporting cleanup

- Removed unused `NextResponse` import from [`assets/utils/request.js`](c:/TorontoSauna/torontosaunco/assets/utils/request.js).

---

## How to read Vercel Functions data

In the Vercel dashboard, **Functions** lists each route with **Invocations** (how often it ran) and **GB-Hours** (memory × time — what drives most compute cost). Sort by **GB-Hours** to see what to optimize first; high GB-Hours with *few* invocations usually means **slow or heavy work per request** (large payloads, full DB scans, cold starts). High invocations with lower GB-Hours is often cheaper per hit.

### Snapshot alignment (example period)

| Route (observed) | Invocations | GB-Hours (approx.) | Plan tie-in |
|------------------|-------------|--------------------|-------------|
| `/accessories` (page) | ~46 | highest tier | Steps 3–4, 6 — listing page + `fetchAccessories`; drop `force-dynamic` on API, raise TTL, avoid double work vs `/api/accessories`. |
| `/saunas/cube` | ~10 | highest tier | Steps 3–4 — same catalog fetch pattern as other sauna listing pages. |
| `/saunas`, `/cold-plunge` | ~47–49 | high | Steps 1, 3–4 — multiple server/client paths hitting product data. |
| `/api/products` | ~12 | high *per invocation* | Steps 4–5 — **`Products.find()` without projection** makes each call expensive; prefer projection + cache/helper. |
| `/saunas/[id]` (specific IDs) | ~7–8 each | notable | ISR/regeneration cost — ensure `generateStaticParams` + sensible `revalidate`; avoid unnecessary dynamic segments. |
| `/api/accessories` | ~46 | lower than accessories *page* | Step 6 — page doing more work than API alone implies **RSC + fetch chain** or duplicate data loads on the page. |
| `/api/auth/[...nextauth]` | ~50 | relatively low | Healthy shape — auth is not the main GB-Hour driver in this sample. |

Re-pull this table monthly after changes to confirm GB-Hours move down for the same routes.

## Original sequential checklist

| Step | Area | Action | Primary files / notes |
|------|------|--------|----------------------|
| 1 | Functions | Remove uncached client storms: fetch catalog once on the server and pass props into carousels / PureCube client UI (or wrap with `unstable_cache`). | `components/Carousel1.jsx`, `Carousel2.jsx`, `PureCube1.jsx`, `PureCubeV2.jsx`; parent usage in `app/page.js` |
| 2 | ISR / cache TTL | Raise blog listing revalidation from 30s to **1800–7200** (or match blog slug cadence). | `app/blog/page.jsx` |
| 3 | ISR / cache TTL | Raise catalog fetch TTL from **10** to **300–3600** for `/products` and `/accessories` server fetches (tune to freshness needs). | `assets/utils/request.js` |
| 4 | Functions | Replace server components that HTTP-loop to your own `/api/*` with a shared server helper: `connectDB` + query + `unstable_cache` + field projection. | New helper under e.g. `lib/` or `assets/utils/`; migrate pages/components currently using `fetchProducts` / `fetchAccessories` from server |
| 5 | Functions | Add Mongo **projection** on `GET /api/products` (card vs detail fields); avoid `Products.find()` with full documents for lists/sitemap. | `app/api/products/route.js`; callers like `app/sitemap.js` |
| 6 | Functions | On read-only `GET /api/accessories`, remove `force-dynamic` if safe so caching aligns with `revalidate`. | `app/api/accessories/route.js` |
| 7 | Functions / CDN | Migrate client-only product detail pages toward **RSC + `generateStaticParams` + ISR**, same idea as saunas. | `app/cold-plunge/[id]/page.jsx`, `app/hot-tub/[id]/page.jsx`, `app/showers/[id]/page.jsx`; mirror `app/saunas/[id]/page.jsx` |
| 8 | Edge middleware | Remove conflicting middleware export; keep a single `middleware` entry. Optionally short-circuit JWT work when no session cookie. | `middleware.jsx` |
| 9 | Functions / security | Re-enable auth on `GET /api/orders` and return **only the signed-in user’s** orders (no full collection scan). | `app/api/orders/route.js` |

## Success checks

- Vercel **Functions** (same view as **Invocations / GB-Hours**): sort by GB-Hours monthly — expect drops on `/accessories`, `/saunas/*` listings, `/api/products`, and ISR sauna IDs after completed steps.
- **ISR writes**: downward trend from blog/caching changes; monitor after PDP migrations (step 7).
- **Edge Middleware**: stable or lower CPU after step 8 (implemented).

## Reference

Internal Next.js/Vercel cost patterns: `.cursor/rules/nextjs-cost-optimization.mdc`.
