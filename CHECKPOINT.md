# Checkpoint (2026-02-20)

## What is done
- Recipient favorites feature implemented end-to-end.
- Backend:
  - Added migration: `backend/sql/005_recipient_favorites.sql`
  - Added routes: `GET/POST/DELETE /api/recipients/favorites`
  - Added validation and service layer for favorites.
  - Wired new route in `backend/src/app.js`.
- Frontend:
  - `send-payment` now loads favorite recipients from API.
  - "Save as Favorite" now calls backend API (no longer demo message).
  - Recipient selector UI now uses real favorites and manual entry.
  - Favorite recipient delete action added in UI (`DELETE /api/recipients/favorites/:id`).
- Transactions:
  - Backend `/api/transactions` now supports secure query filters:
    `limit`, `offset`, `status`, `sourceCurrency`, `search`, `from`, `to`.
  - Added server-side pagination metadata: `total`, `limit`, `offset`, `hasMore`.
  - Merchant dashboard table now uses server-side filter/search/pagination.
- Added backend security validation tests (`node:test`) for:
  - auth validators
  - recipient validators
  - transaction validators
- Added release preflight automation:
  - `npm run release:verify`
  - `npm run release:verify:prod`
  - `npm run release:android`
  - Env checks now run before build/release flow.

## Verification done
- DB migrations run successfully through `005`.
- Frontend build passes.
- API smoke test passed:
  - register test user
  - save favorite recipient
  - list favorite recipients (`count=1`)

## Next step when continuing
1. Prepare production deploy execution (backend hosting + Vercel env + Android sync/rebuild).
2. Add automated API tests for auth/transactions/recipients flows.
