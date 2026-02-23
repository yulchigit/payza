# Production Deploy Checklist

## 1. Prepare secrets and env
- Fill `.env.production`:
  - `VITE_API_BASE_URL=https://<your-backend-domain>/api`
- Fill `backend/.env.production`:
  - `NODE_ENV=production`
  - `DATABASE_URL=postgresql://...`
  - `JWT_SECRET=<64+ random chars>`
  - `JWT_ISSUER=payza-api`
  - `JWT_AUDIENCE=payza-clients`
  - `CORS_ORIGINS=https://<your-web-domain>,capacitor://localhost`

## 2. Run local release gate
- `npm run release:verify:prod`
- Must finish without errors before publish.

## 3. Deploy backend
- Deploy backend service (Render/Railway/Fly/VM/Docker).
- Set production env variables in host dashboard.
- Run migrations on production DB:
  - `npm run api:migrate`
- Verify health endpoint:
  - `GET https://<your-backend-domain>/api/health`

## 4. Deploy web (Vercel)
- In Vercel project env, set:
  - `VITE_API_BASE_URL=https://<your-backend-domain>/api`
- Trigger deploy from latest git commit.
- Smoke test:
  - register
  - login
  - wallet load
  - create transaction

## 5. Update Android app
- Sync latest web build into Capacitor:
  - `npm run mobile:sync`
- Prepare signing files (one-time):
  - copy `android/key.properties.example` -> `android/key.properties`
  - set real values in `android/key.properties`
  - place keystore file in `android/` (example: `android/payza-release-key.jks`)
  - keep `storeFile=../payza-release-key.jks` in `android/key.properties`
- Open Android project:
  - `npm run mobile:android`
- Build signed release AAB:
  - CLI: `npm run mobile:bundle:release`
  - output: `android/app/build/outputs/bundle/release/app-release.aab`
- Upload AAB to Play Console release track.

## 6. Post-release safety checks
- Confirm API error rate and auth failures are normal.
- Confirm no secrets are committed (`.env*` excluded from git).
- Keep rollback plan ready:
  - previous backend image/version
  - previous Vercel deployment
