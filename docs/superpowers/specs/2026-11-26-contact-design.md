# Contact page (`rd/2-contact`)

Phase 2, third slice in `docs/redesign.md`. Status: approved in conversation 2026-11-26, written up for the record.

## Why

`/contact` is where every "Request a Quote" and "Book a visit" button on the new site leads. It's the site's main lead
form, so it has to send reliably, keep marketing attribution working, and never reach the sales team before cutover.

## Goals

- Serve `/contact` from `app/(site)/`, matching `Contact.dc.html` at 1440px and 390px, copy from
  `content/redesign/Contact.json`, SEO from `pageSeo()`.
- The design's form: three modes (quote, showroom visit, question) chosen by "How can we help?"; `#visit` / `?visit`
  (and `question`) preselect the mode, as the design's `lfDefaultReason` does.
- Send through a new route used only by the new site, to the design's recipients, `sales@thetorontosaunaco.com` and
  `tjallen@thetorontosaunaco.com` (owner, 2026-11-26).
- **Nothing reaches those addresses before cutover** (owner, 2026-11-26).

## Non-goals

- The live `/api/emails` route and the live forms (`components/Contact.jsx` and others) are not changed. The unescaped
  HTML in that route is a live-site issue for `development`, reported to the owner, not fixed here.
- Cart quote emails and the proposal PDF: Phase 4.
- CAPTCHA or rate limiting beyond the design's honeypot.

## Approaches considered

- **A: a new route `app/api/site/contact/route.js` (chosen by the owner).** The live route stays untouched until
  cutover, which keeps the weekly `main` → `redesign` merges clean. Reuses the existing transport, `applyEmailSafety()`,
  HubSpot sync and attribution saving.
- B: a new branch inside `/api/emails`. Less code, but edits a file the live site depends on.

## Design

**Recipient safety (the hard rule).**
1. Server: the route sends to `["sales@thetorontosaunaco.com", "tjallen@thetorontosaunaco.com"]` only via
   `transporter.sendMail(applyEmailSafety(mail))`. Outside production (`VERCEL_ENV !== "production"`, i.e. staging,
   previews, local) `applyEmailSafety` replaces every recipient with `STAGING_EMAIL_TO`, adds `[STAGING]`, and throws if
   it's unset (nothing sent; the route answers 500). Production is only reachable from `main`, i.e. after cutover.
   A route test asserts the mail handed to the transport has no real recipient when `VERCEL_ENV` is `preview`.
2. Client fallback: the design opens the visitor's email app if sending fails. The page passes
   `fallbackEmail = isProduction() ? "sales@thetorontosaunaco.com" : null` from the server. With `null` (staging,
   previews, local) there is no mailto; the form shows an error asking the visitor to call (437) 429-6623. In production
   the fallback addresses `sales@` only, so `tjallen@` never appears in page source.
3. HubSpot: synced only when `isProduction()` (as the live route does).

**Route `app/api/site/contact/route.js` (`POST`, JSON).**
- Input: `reason` (one of the design's three), `name`, `phone`, `email`, `city`, `type`, `time`, `when`, `msg`, `hp`,
  `ref`, `submissionId`, `attribution`, `sourcePath`.
- Validation (`lib/site/contactForm.js`, shared with the client): reason in the list; name required; email matching
  `^\S+@\S+\.\S+$` or phone with ≥ 10 digits (the design's rules and messages); `type`/`time` from the design lists when
  given; every field trimmed and capped (name/email/phone/city/type/time/when 200 chars, msg 5000). Invalid → 400 with
  the field errors. `hp` filled → 200 `{ ok: true }` and nothing sent (the design treats bots as done).
- Email: subject `"<reason> from <name> (<ref>)"` (design); the body is the design's rows (Request, Reference, Name,
  Phone, Email, City or postal code, then Interested in / Install timeline for quotes, Preferred days and times /
  Interested in for visits, then the message under "About the space" / "Notes" / "Question", "Sent from: Contact page"),
  empty rows dropped, every value HTML-escaped, sent as HTML plus a plain-text version. `replyTo` is the visitor's email
  when given.
- After a successful send: HubSpot (production only) and `createQuoteAttributionSubmission` with
  `formType: "site_contact"` (staging DB outside production), each in its own try/catch so they never fail the request.
- Response: 200 `{ ok: true, ref }`, 400 `{ errors }`, 500 `{ error: "send_failed" }`.

**Page.** `app/(site)/contact/page.jsx` (`pageSeo("/contact")`, `<JsonLd>`, `fallbackEmail` prop) renders
`components/site/ContactPage.jsx` (server: linen band, left column breadcrumb, eyebrow, H1, lead, contact lines, service
note; right column the form) and `components/site/ContactForm.jsx` (`"use client"`).
- Mode labels, field labels, select options, button text, error messages and thank-you copy come from
  `Contact.json` and its `data` lists (`lfReasons`, `lfTypes`, `lfTimes`); the copy the extractor only holds inside
  the design script (per-mode titles, message labels, button labels) is read from the JSON's blocks where present and
  otherwise lives in one constants object in `lib/site/contactForm.js`, copied verbatim from `Contact.dc.html`.
- Preselect from `location.hash`/`search` on mount (client only).
- Submit: client validation first (errors shown under the fields as in the design, inputs get the rust error border);
  then `POST`; button shows a sending state; success shows "Thanks, {first name}." with the reference; failure shows
  the call-us message, plus the mailto fallback only when `fallbackEmail` is set.
- Analytics on success, as the live form: `posthog.capture(quote_form_submitted, …)` and
  `pushDataLayerEvent("quote_submitted", …)` with `submissionId` from `buildQuoteSubmissionId()` and
  `getAttributionForSubmission()`; `form_type: "site_contact"`.
- "Send another request" resets the form, keeping the mode.
- Accessible: real `<label for>`, `aria-invalid` and `aria-describedby` on errors, the honeypot hidden from people and
  assistive tech (`aria-hidden`, `tabIndex=-1`, off-screen).

**Routes.** `/contact` joins `SITE_ROUTES`. There is no live `app/contact` to delete.

**Tests.** `contactForm` validation (each rule and message, caps, lists); route: valid quote → mail sent once with
escaped HTML and the design subject; `VERCEL_ENV=preview` → mail goes to `STAGING_EMAIL_TO` only; honeypot → nothing
sent, 200; invalid → 400; transport error → 500; HubSpot not called outside production; attribution saved with
`site_contact`. Form: mode switch changes title/fields/button; `#visit` preselects; errors shown and focused; success
screen with ref; failure without fallback shows the call message and no mailto. Page: H1, contact lines, no "King
Township"/"Leisurecraft".

**Done when** lint/test/build pass (lint is the known unconfigured item), `/contact` returns 200 with
title/meta/canonical matching `page-map.csv`, screenshots at 1440/390 match the design (each mode), a real submission
from the local build (non-production) arrives only at `STAGING_EMAIL_TO` with `[STAGING]`, progress/docs updated, PR
into `redesign`. Also drop the now-fixed `.env` cloud-name warning from `docs/redesign.md`.

## Left to the builder

Token choices per element, form field component split, and test fixtures.
