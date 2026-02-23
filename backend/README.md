# PayZa Backend

## Setup
1. `backend/.env.example` dan `backend/.env` yarating.
2. Quyidagilarni toldiring:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_ISSUER`
   - `JWT_AUDIENCE`
3. Dependency ornating:
   - `npm --prefix backend install`
4. Migratsiya ishlating:
   - `npm --prefix backend run migrate`
   - Bu skript `backend/sql` ichidagi barcha migratsiyalarni (`001...005...`) ketma-ket ishlatadi.
5. API ishga tushiring:
   - `npm --prefix backend run dev`
6. Test ishga tushiring:
   - `npm --prefix backend test`

## Endpoints
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `GET /api/wallet/overview` (Bearer token)
- `GET /api/transactions` (Bearer token)
  - Query: `limit`, `offset`, `status`, `sourceCurrency`, `search`, `from`, `to`
- `POST /api/transactions` (Bearer token)
- `GET /api/transactions/:id` (Bearer token)
- `GET /api/payment-methods` (Bearer token)
- `PATCH /api/payment-methods/:id/status` (Bearer token)
- `GET /api/recipients/favorites` (Bearer token)
- `POST /api/recipients/favorites` (Bearer token)
- `DELETE /api/recipients/favorites/:id` (Bearer token)

## Security baseline
- Helmet security headers
- API/Auth rate limiting
- Strong password policy
- JWT issuer/audience validation
- Failed login lockout
- Auth audit logs
- Configurable CORS allowlist (`CORS_ORIGINS`)

## Docker run
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
