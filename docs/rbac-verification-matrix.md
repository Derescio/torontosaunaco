# RBAC Verification Matrix

Use this matrix to validate role behavior after deployments or permission changes.

## Role summary

- `admin`: full access, catalog updates, role assignment, admin/marketing/editor surfaces
- `editor`: catalog create/update access, no role assignment, no admin
- `marketing`: tracking workspace access, no catalog update access, no role assignment
- `user`: standard authenticated access only

## UI visibility matrix

| Area | Admin | Editor | Marketing | User |
| --- | --- | --- | --- | --- |
| Profile menu: `Editor Access` | Yes | Yes | No | No |
| Profile menu: `Admin Dashboard` | Yes | No | No | No |
| Profile menu: `Marketing Workspace` | Yes | No | Yes | No |
| `Editor Access` page content | Yes | Yes | No | No |
| `Admin Dashboard` page content | Yes | No | No | No |
| `Marketing Workspace` page content | Yes | No | Yes | No |

## Route access matrix

| Route | Admin | Editor | Marketing | User |
| --- | --- | --- | --- | --- |
| `/admin` and `/admin/:path*` | Allow | Deny | Deny | Deny |
| `/editor` and `/editor/:path*` | Allow | Allow | Deny | Deny |
| `/marketing` and `/marketing/:path*` | Allow | Deny | Allow | Deny |
| `/quote/thank-you` | Allow | Allow | Allow | Allow |

Expected deny behavior:

- unauthenticated users are redirected to sign-in for protected areas
- unauthorized authenticated users are redirected away from protected areas

## API access matrix (write/privileged)

| Endpoint | Admin | Editor | Marketing | User |
| --- | --- | --- | --- | --- |
| `POST /api/admin/users/role` | Allow | Deny | Deny | Deny |
| `GET /api/admin/users` | Allow | Deny | Deny | Deny |
| `POST /api/heaters` | Allow | Allow | Deny | Deny |
| `PATCH /api/heaters/:slug` | Allow | Allow | Deny | Deny |
| `DELETE /api/heaters` | Allow | Deny | Deny | Deny |
| `POST /api/products` | Allow | Allow | Deny | Deny |
| `PATCH /api/products/:id` | Allow | Allow | Deny | Deny |
| `PATCH /api/accessories/:id` | Allow | Allow | Deny | Deny |
| `POST /api/create-payment-intent` | Allow (signed-in) | Allow (signed-in) | Allow (signed-in) | Deny (unauthenticated) |
| `POST /api/save-payment` | Allow (signed-in) | Allow (signed-in) | Allow (signed-in) | Deny (unauthenticated) |

## Tracking and attribution validation

Run this flow from an ad-like URL containing click IDs (for example, `gclid`, `fbclid`, `msclkid`):

1. open quote page with click IDs in URL
2. submit quote form successfully
3. confirm redirect to `/quote/thank-you?submission=<id>`
4. confirm one submit event and one thank-you event per submission

Expected event behavior:

- PostHog:
  - `quote:form_submitted` fires on successful submit
  - `quote:thank_you_viewed` fires on thank-you render
- dataLayer:
  - `quote_submitted` includes `submission_id` and click IDs
  - `quote_thank_you_viewed` includes `submission_id` and click IDs
- dedupe:
  - thank-you event should not duplicate on refresh for same submission within the same session

## Manual verification checklist

- [ ] Admin can assign `user`, `editor`, `marketing`, `admin` from admin role UI
- [ ] Editor cannot access `/admin` or `/marketing`
- [ ] Marketing cannot access `/editor` or catalog update APIs
- [ ] User cannot access `/admin`, `/editor`, `/marketing`
- [ ] Unauthenticated requests to privileged APIs return `401`
- [ ] Quote flow sends both PostHog and dataLayer events with `submission_id`
- [ ] Thank-you page tracking remains deduplicated on refresh
