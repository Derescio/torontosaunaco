# Cloudinary hero background video — lightweight delivery

Reusable pattern for a full-width autoplaying loop video: **smaller files**, **one network request per device type**, and **on-the-fly transforms** from a single MP4 (or other) master in Cloudinary.

## Goals

- Cap dimensions so mobile does not download a desktop-sized encode.
- Use automatic format/quality where appropriate (`f_auto`, `q_auto`).
- Avoid upscaling a 720p (or any) source with `c_limit`.
- Let the **browser** pick mobile vs default URL with `<source media="...">` (no JS breakpoint needed for the URL choice).

## URL shape

Base delivery URL (no transforms):

```text
https://res.cloudinary.com/<cloud_name>/video/upload/<version>/<folder>/<public_id>
```

With transformations, insert the transformation **segment** immediately after `/upload/`:

```text
https://res.cloudinary.com/<cloud_name>/video/upload/<transforms>/<version>/<folder>/<public_id>
```

Example transformation segment used in this project:

| Variant | Transforms (comma-separated) | Purpose |
|--------|------------------------------|--------|
| Mobile | `f_auto,q_auto:eco,c_limit,w_800` | Narrower max width, slightly stronger quality tradeoff. |
| Desktop | `f_auto,q_auto,c_limit,w_1280` | Up to 1280px wide (typical 720p width); `c_limit` does not upscale. |

Adjust `w_800` / `w_1280` (or add `h_...`) to match your design and source resolution.

### What each part does (short)

- **`f_auto`** — Picks a sensible *delivered* format for the browser (original upload can still be MP4; Cloudinary may serve another codec when it helps size/quality).
- **`q_auto` / `q_auto:eco`** — Automatic quality; `:eco` favors smaller files over `:good` or default.
- **`c_limit` + `w_*`** — Resizes to fit within width without cropping; with only `w_*` you limit max width and avoid upscaling relative to the source when combined with `c_limit` as in typical hero setups.

> **MP4 source:** A stored MP4 is fine. Transforms are generated on read (cached on Cloudinary’s CDN after first request).

## HTML: responsive `<source>` (one fetch per layout)

The **first** matching `<source>` is used. Put the **narrow** breakpoint first, then the **default**.

```html
<video
  autoplay
  loop
  muted
  playsinline
  preload="metadata"
  aria-hidden="true"
>
  <source src="https://res.cloudinary.com/.../upload/f_auto,q_auto:eco,c_limit,w_800/.../file.mp4" media="(max-width: 768px)" />
  <source src="https://res.cloudinary.com/.../upload/f_auto,q_auto,c_limit,w_1280/.../file.mp4" />
</video>
```

- Omit `type` on `<source>` if you use `f_auto` and the *delivered* format may not always be `video/mp4` (browsers use the response). If you need to **force** MP4 output for every client, add **`f_mp4`** to the transform chain and you can set `type="video/mp4"`.
- Tweak the breakpoint: replace `(max-width: 768px)` to match your layout (e.g. `1024px` for “tablet and below” uses the smaller URL).

## JS / React: build URLs from a base

Avoid duplicating the full string: keep one **canonical** base URL, then insert the transform segment by replacing `/upload/` with `/upload/<transforms>/`.

```js
const HERO_VIDEO_BASE =
  "https://res.cloudinary.com/<cloud_name>/video/upload/<version>/<path>/<public_id>";

const HERO_VIDEO_MOBILE = HERO_VIDEO_BASE.replace(
  "/upload/",
  "/upload/f_auto,q_auto:eco,c_limit,w_800/"
);

const HERO_VIDEO_DESKTOP = HERO_VIDEO_BASE.replace(
  "/upload/",
  "/upload/f_auto,q_auto,c_limit,w_1280/"
);
```

Use `HERO_VIDEO_MOBILE` and `HERO_VIDEO_DESKTOP` in the two `<source>` elements as above.

## Optional: poster + fade-in

To avoid a blank or flashing block while the first frames buffer:

- Show a static **poster** (local image or Cloudinary **image** URL) in a layer behind the `<video>`.
- On the `<video>` element, listen for `canplay` (or check `readyState`) and cross-fade the poster to transparent when the video can play.

This does not change Cloudinary cost much; it improves perceived load.

## Further options (not in the minimal pattern)

- **HLS (`.m3u8`, streaming profile `auto` / `sp_...`)** — Adaptive bitrate; can save bytes on slow links. Worth evaluating vs your plan (streaming/transformation billing).
- **Re-upload a shorter or lower-fps master** — Every derivative gets cheaper if the source is leaner.
- **Stronger quality cap:** e.g. `q_70` or `q_auto:low` in the transform string if the hero is dark or heavily overlaid.
- **Lazy play:** e.g. only start loading or playing when the hero enters the viewport — saves data for long pages; may change hero UX.

## Reference implementation in this repo

- `components/redesign/Hero.jsx` — dual Cloudinary `source` URLs, poster image, `canplay` opacity transition.

## Official docs

- [Transformation URL syntax](https://cloudinary.com/documentation/transformation_basics)
- [Video transformation reference](https://cloudinary.com/documentation/video_transformation_reference)
- [Adaptive bitrate streaming (HLS/DASH)](https://cloudinary.com/documentation/adaptive_bitrate_streaming)
