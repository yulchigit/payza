# PayZa

PayZa - React/Vite frontend + Node.js/Express backend fintech platform.

## Stack
- Frontend: React 18, Vite 5, Redux Toolkit, Tailwind
- Mobile wrapper: Capacitor (Android/iOS)
- Backend: Express, PostgreSQL, JWT, Zod

## Local Run

### Frontend
```bash
npm install
npm run start
```

### Backend
```bash
npm run api:install
npm run api:migrate
npm run api:dev
```

Backend minimum env keys (`backend/.env`):
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_ISSUER`
- `JWT_AUDIENCE`

## Frontend API Base URL

Priority:
1. Native mobile (`Capacitor`): `VITE_MOBILE_API_BASE_URL` (or non-local `VITE_API_BASE_URL`)
2. Web local: `http://localhost:5000/api`
3. Production fallback: `https://payza-backend.onrender.com/api`

`.env` must not be committed. Use `.env.example` as template.

## Release Checks

Create production env files once (safe bootstrap):
```bash
npm run release:bootstrap:prod-env
```

This creates:
- `.env.production` from `.env.production.example`
- `backend/.env.production` from `backend/.env.production.example`

Then fill real production values.

Run before deploy:
```bash
npm run release:verify
```

Production strict checks:
```bash
npm run release:verify:prod
```

Generate strong JWT secret:
```bash
npm run release:secret
```

Android release prep:
```bash
npm run release:android
```

Signed Android AAB:
```bash
npm run mobile:bundle:release
```
Before this, configure:
- `android/key.properties` (use `android/key.properties.example`)
- release keystore file in `android/` (example: `payza-release-key.jks`)

`release:verify` runs:
- env preflight checks
- backend tests
- frontend build

Backend tests now cover:
- validators
- auth middleware token checks
- recipient service upsert/list/delete logic
- transaction service idempotency and rollback behavior

`release:verify:prod` additionally enforces production-safe env constraints:
- `CORS_ORIGINS` must be present
- localhost web origins are blocked unless `CORS_ALLOW_MOBILE_LOCALHOST_ORIGIN=true`
- no placeholder JWT secret
- no placeholder `VITE_API_BASE_URL`

`release:verify:prod` reads:
- `.env.production`
- `backend/.env.production`

Render staging env template:
- `backend/.env.render.example`
- Render'da `PORT` ni qo'lda fixed qilmang (platform o'zi beradi).

## Production Deploy Order

1. Prepare PostgreSQL production database.
2. Deploy backend (Render/Fly/VM or Docker).
3. Set backend envs:
   - `NODE_ENV=production`
   - `DATABASE_URL=...`
   - `JWT_SECRET=...` (min 32 chars)
   - `JWT_ISSUER=...`
   - `JWT_AUDIENCE=...`
   - `CORS_ORIGINS=https://your-web-domain.com,http://localhost,https://localhost,capacitor://localhost`
   - `CORS_ALLOW_MOBILE_LOCALHOST_ORIGIN=true` (required for Capacitor Android/iOS webview origin)
4. Run backend migrations: `npm run api:migrate`.
5. Set Vercel env:
   - `VITE_API_BASE_URL=https://your-backend-domain/api`
   - `VITE_MOBILE_API_BASE_URL=https://your-backend-domain/api`
6. Deploy frontend.

Detailed operator checklist:
- `DEPLOY_CHECKLIST.md`

### Optional Docker backend
```bash
docker build -t payza-backend ./backend
docker run --rm -p 5000:5000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=... \
  -e JWT_SECRET=... \
  -e JWT_ISSUER=payza-api \
  -e JWT_AUDIENCE=payza-clients \
  -e CORS_ORIGINS=https://your-web-domain.com,capacitor://localhost \
  -e RUN_MIGRATIONS=true \
  payza-backend
```

## Web vs Mobile Updates

- Web: `git push` triggers Vercel auto deploy (if repo linked).
- Mobile: `git push` alone is not enough.
  - Run `npm run mobile:sync`
  - Build new Android/iOS release in Android Studio/Xcode.

## Security Notes

- Keep `.env` and all secrets out of git.
- Use strict production `CORS_ORIGINS`.
- Use strong JWT secret.
- Keep release checks green before publish.
- Remove unused build plugins/dependencies that widen attack surface.
- Commit lockfiles for reproducible installs (`package-lock.json`, `backend/package-lock.json`).
