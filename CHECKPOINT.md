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

## Verification done
- DB migrations run successfully through `005`.
- Frontend build passes.
- API smoke test passed:
  - register test user
  - save favorite recipient
  - list favorite recipients (`count=1`)

## Next step when continuing
1. Add favorite recipient delete action in UI.
2. Add transaction history filters/search with backend query params.
3. Prepare production deploy execution (backend hosting + Vercel env + Android sync/rebuild).
