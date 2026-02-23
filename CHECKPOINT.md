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
- Added automated backend flow tests (`node:test`) for:
  - auth middleware token handling
  - recipient service upsert/list/delete behavior
  - transaction service idempotency, rollback, query meta mapping
- Added release preflight automation:
  - `npm run release:verify`
  - `npm run release:verify:prod`
  - `npm run release:android`
  - Env checks now run before build/release flow.
- Backend runtime env hardening:
  - production cannot start with missing/unsafe `CORS_ORIGINS`
  - production rejects placeholder `JWT_SECRET`
  - strict PostgreSQL `DATABASE_URL` format check
- Added production env bootstrap flow:
  - `npm run release:bootstrap:prod-env`
  - `.env.production.example` and `backend/.env.production.example`
  - production preflight now reads dedicated production env files
- Fixed production CORS localhost policy mismatch:
  - `capacitor://localhost` and `ionic://localhost` are allowed for mobile WebView
  - `http://localhost` / `https://localhost` remain blocked in production
- Added deployment runbook:
  - `DEPLOY_CHECKLIST.md`
- Added Android release signing setup:
  - `android/key.properties.example`
  - release signing wiring in `android/app/build.gradle`
  - `npm run mobile:bundle:release`
- Dependency security hardening:
  - removed `@dhiwise/component-tagger` from build chain
  - upgraded Vite toolchain to `vite@7` + latest React plugin
  - committed lockfiles for deterministic installs

## Verification done
- DB migrations run successfully through `005`.
- Frontend build passes.
- Backend automated tests pass (`26/26`) after added flow + env policy coverage.
- `npm run release:preflight:prod` passes.
- `npm audit` and `npm --prefix backend audit --omit=dev` return 0 vulnerabilities.
- API smoke test passed:
  - register test user
  - save favorite recipient
  - list favorite recipients (`count=1`)

## Next step when continuing
1. Execute production deploy using `DEPLOY_CHECKLIST.md` (backend first, then Vercel).
2. Rebuild Android release (`npm run mobile:sync`) and generate signed AAB.
