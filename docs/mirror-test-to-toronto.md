# Test to Toronto Mirror

This project includes a daily mirror job that syncs selected collections from
`test` (source) into `toronto` (target).

## Scheduled job

- Vercel cron path: `/api/cron/mirror-test-to-toronto`
- Schedule: `0 10 * * *` (daily at 10:00 UTC)

## Security

The route requires:

- `Authorization: Bearer <CRON_SECRET>`

If `CRON_SECRET` is missing or invalid, the route returns `401`.

## Data sync behavior

- Source DB: `test`
- Target DB: `toronto`
- Collections: `accessories`, `heaters`, `orders`, `products`, `users`
- Conflict strategy: upsert selected fields
  - If no matching target document exists: insert source document.
  - If a match exists: update only collection-specific allowlisted fields.
  - Documents not in source are not deleted from target.

For user safety, user privilege/auth fields are intentionally not mirrored on
updates (`isAdmin`, `role`, `password` are not in the update allowlist).

## Manual trigger

Example (PowerShell):

```powershell
$headers = @{ Authorization = "Bearer $env:CRON_SECRET" }
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/cron/mirror-test-to-toronto?dryRun=1" -Headers $headers
```

Useful query params:

- `dryRun=1` (preview only, no writes)
- `backupBeforeUpdate=1` (store pre-update snapshots in `toronto._mirror_backups`)
- `collections=products,heaters` (override default collection set)

