# RBAC Roles

This project now supports three roles on users:

- `admin`
- `editor`
- `marketing`
- `user` (default)

## Effective permissions

- `admin`
  - full access
  - can assign/change roles
  - can create/update heaters and run destructive heater delete
  - can access `/admin`
- `editor`
  - can create/update catalog data (currently heater create/update paths)
  - cannot manage roles
  - cannot run destructive delete actions
  - can access `/editor`
- `marketing`
  - can access `/marketing`
  - can support tracking operations and thank-you flow validation
  - cannot edit catalog data
  - cannot manage roles
- `user`
  - standard authenticated access only

## Admin API: assign role

Endpoint:

- `POST /api/admin/users/role`

Auth:

- requires authenticated `admin` session

Payload:

```json
{
  "email": "user@example.com",
  "role": "editor"
}
```

or

```json
{
  "userId": "665f0df1a0d0b6a2e5a6b0aa",
  "role": "admin"
}
```

## Manual fallback script

```bash
node scripts/set-user-role.mjs --email=user@example.com --role=editor
```

or

```bash
node scripts/set-user-role.mjs --userId=665f0df1a0d0b6a2e5a6b0aa --role=admin --database=toronto
```
