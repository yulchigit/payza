# PayZa Backend (MVP Foundation)

## Setup
1. Copy `backend/.env.example` to `backend/.env`
2. Update values (especially `DATABASE_URL` and `JWT_SECRET`)
3. Install dependencies:
   - `npm --prefix backend install`
4. Run SQL schema:
   - execute `backend/sql/001_init.sql` on your PostgreSQL database
5. Start API:
   - `npm --prefix backend run dev`

## Endpoints
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token required)
