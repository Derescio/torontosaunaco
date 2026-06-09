# Marketing Tracking Contract (PostHog + GTM + DB)



This document defines the canonical quote tracking flow to avoid duplicate

conversion counting across PostHog and GTM.



## Canonical events



- `quote_submitted` (dataLayer)

  - fired once on successful quote form submit

  - includes `submission_id` and captured click IDs / UTMs from the quote URL

- `quote_thank_you_viewed` (dataLayer)

  - fired once when thank-you page is rendered

  - includes `submission_id` and attribution loaded from the DB submission record



PostHog events:



- `quote:form_submitted` (on successful submit)

- `quote:thank_you_viewed` (on thank-you page render)



## Shared identifiers



- `submission_id` is generated client-side for each successful submission.

- Attribution uses **first-touch localStorage** (`ts_first_touch_attribution`):

  - Captured on every page load when UTMs / click IDs appear in the URL

  - First value per key is preserved for the browser session lifetime

  - Quote submit merges stored first-touch values with any params still on the current URL

- Supported params:

  - UTMs: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`

  - Click IDs: `gclid`, `fbclid`, `msclkid`, `ttclid`, `wbraid`, `gbraid`

  - Google Ads auto-tagging: `gad_source`, `gad_campaignid`



## Platform detection (server-side)



- `gclid` present → `google`

- `utm_source=instagram` → `instagram` (uses `fbclid` click ID family)

- `fbclid` or `utm_source=facebook` → `facebook`

- `msclkid` or `utm_source=microsoft` → `microsoft`



Facebook and Instagram are shown as separate platforms in the marketing dashboard.



## Database models



### `MarketingPlatformPreset`



Editable test presets per platform (`google`, `facebook`, `instagram`, `microsoft`).

Marketing team saves UTM and click ID values in `/marketing`; **Test Quote** links are built from these DB values.



### `QuoteAttributionSubmission`



One record per quote submission, created on successful `POST /api/emails`.

Thank-you page records `events.thankYouViewedAt` via `POST /api/marketing/submissions/[submissionId]/thank-you`.



## Storage policy



- Marketing QA data is stored in MongoDB (presets, submissions, event timestamps).

- Browser `localStorage` stores **first-touch attribution only** (not marketing QA dashboard state).

- Thank-you page uses `sessionStorage` only for GTM dedupe on refresh.



## API routes



| Route | Access | Purpose |

|---|---|---|

| `GET /api/marketing/dashboard` | marketing/admin | Dashboard data |

| `PUT /api/marketing/platforms/[platform]` | marketing/admin | Save platform test preset |

| `POST /api/marketing/submissions/[submissionId]/thank-you` | public | Record thank-you event |



## Dedupe behavior



- Thank-you page uses session storage guard per `submission_id` to avoid

  duplicate event fires on refresh.

- Conversion tags should use one primary conversion event per platform.



## Form + route behavior



- Contact quote form success:

  - sends email payload with `submissionId`, `attribution`, `sourcePath`, `formId`, `formType`

  - server persists `QuoteAttributionSubmission`

  - emits PostHog + GTM submit event

  - redirects to `/quote/thank-you?submission=<submission_id>`

- Thank-you route:

  - records thank-you event in DB

  - loads attribution from DB response for PostHog + GTM thank-you event



## Seeding platform presets



```bash

node scripts/seed-marketing-platform-presets.mjs

```



Presets are also auto-created on first dashboard load via `ensureMarketingPlatformPresets()`.


