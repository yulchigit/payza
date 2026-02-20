# PayZa

PayZa - React/Vite frontend + Node.js/Express backend asosidagi fintech platforma.

## Stack
- Frontend: React 18, Vite 5, Redux Toolkit, Tailwind
- Mobile wrapper: Capacitor (Android/iOS)
- Backend: Express, PostgreSQL, JWT, Zod

## 1) Local ishga tushirish

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

Backend `backend/.env` ichida ishlaydi. Minimal qiymatlar:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_ISSUER`
- `JWT_AUDIENCE`

## 2) Frontend API sozlamasi

Frontend API URL aniqlash tartibi:
1. `VITE_API_BASE_URL` berilgan bo‘lsa shu ishlatiladi.
2. Localhost bo‘lsa: `http://localhost:5000/api`
3. Aks holda fallback: `/api`

Root `.env` faylni repoga qo‘shmang. Namuna uchun `.env.example` bor.

## 3) Production deploy ketma-ketligi

1. PostgreSQL production bazani tayyorlang.
2. Backendni deploy qiling (Railway/Render/Fly/VM yoki Docker).
3. Backend envlarni kiriting:
   - `NODE_ENV=production`
   - `DATABASE_URL=...`
   - `JWT_SECRET=...` (kamida 32 belgi)
   - `JWT_ISSUER=...`
   - `JWT_AUDIENCE=...`
   - `CORS_ORIGINS=https://your-web-domain.com,capacitor://localhost`
4. Backendda migratsiya ishlating: `npm run api:migrate`.
5. Vercel project envga kiriting:
   - `VITE_API_BASE_URL=https://your-backend-domain/api`
6. Frontendni deploy qiling.

### Docker orqali backend deploy (ixtiyoriy)
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

## 4) Android/iOS yangilanish oqimi

Kodga o‘zgarish kiritilganda:
1. Web: `git push` -> Vercel auto deploy.
2. Mobile (Capacitor): alohida sync/build kerak:
```bash
npm run mobile:sync
```
3. Android Studio/Xcode ichida yangi build (`.aab`/`.apk` yoki iOS archive) chiqariladi.

`git push`ning o‘zi Android/iOS ilovani avtomatik update qilmaydi.

## 5) Muhim xavfsizlik eslatmalari

- `.env` va boshqa maxfiy fayllar repoga kiritilmaydi.
- `CORS_ORIGINS` productionda aniq domenlar bilan to‘ldiriladi.
- JWT secret kuchli bo‘lishi shart.
- Auth endpointlar rate limit bilan himoyalangan.
