# PayZa Backend

## Setup
1. `backend/.env.example` dan `backend/.env` yarating.
2. Quyidagilarni to‘ldiring:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_ISSUER`
   - `JWT_AUDIENCE`
3. Dependency o‘rnating:
   - `npm --prefix backend install`
4. Migratsiya ishlating:
   - `npm --prefix backend run migrate`
5. API ishga tushiring:
   - `npm --prefix backend run dev`

## Endpoints
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `GET /api/wallet/overview` (Bearer token)
- `GET /api/transactions` (Bearer token)
- `POST /api/transactions` (Bearer token)
- `GET /api/transactions/:id` (Bearer token)
- `GET /api/payment-methods` (Bearer token)
- `PATCH /api/payment-methods/:id/status` (Bearer token)

## Security baseline
- Helmet security headers
- API/Auth rate limiting
- Strong password policy
- JWT issuer/audience validation
- Failed login lockout
- Auth audit logs
- Configurable CORS allowlist (`CORS_ORIGINS`)
