# Vercel Deployment Guide - PayZa Frontend

Bu qo'llanma PayZa frontendini Vercelga joylash uchun ketma-ketlikni tushuntiradi.

## 1. Tayyorgarlik

### Vercel CLI o'rnatish
```bash
npm install -g vercel
```

### Vercel hisobiga kirish
```bash
vercel login
```
- Brauzerda ochilgan sahifada Vercel hisobingizga kiring
- CLI sizning hisobingizga ulanadi

## 2. Loyihani tekshirish

### Build test qilish
```bash
npm run build
```
- Bu `dist` papkasini yaratadi
- Agar xatolik bo'lsa, uni hal qiling

### Local test qilish
```bash
npm run serve
```
- Build bo'lgan fayllarni localda test qilish

## 3. Vercelga joylash

### Birinchi marta joylash
```bash
vercel
```

### Savollarga javob bering:
- **Set up and deploy?** → `Y`
- **Which scope?** → Sizning Vercel hisobingiz
- **Link to existing project?** → `N` (yangi loyiha uchun)
- **Project name?** → `payza` yoki o'zingiz xohlagan nom
- **In which directory is your code located?** → `./` (joriy papka)

### Environment Variables qo'shish
Vercel dashboardda yoki CLI orqali:

```bash
vercel env add VITE_API_BASE_URL
```
- **Value**: `https://payza-backend.onrender.com/api`
- **Environment**: `Production`, `Preview`, `Development`

Agar mobil uchun alohida URL kerak bo'lsa:
```bash
vercel env add VITE_MOBILE_API_BASE_URL
```
- **Value**: `https://payza-backend.onrender.com/api`

## 4. CORS sozlamalari (Muhim!)

### Backendda (Render) CORS_ORIGINS ni sozlash
Vercel domeningizni qo'shing:

```
CORS_ORIGINS=https://payza.vercel.app,https://www.payza.vercel.app
```

**Eslatma**: Vercel domeningizni aniq yozing, masalan:
- Agar Vercel `payza.vercel.app` bo'lsa: `https://payza.vercel.app`
- Agar custom domen bo'lsa: `https://yourdomain.com`

## 5. Deploy qilish

### Yangilanishlarni deploy qilish
```bash
vercel --prod
```

### Preview deploy (test uchun)
```bash
vercel
```

## 6. Tekshirish

### Deploy bo'lgandan keyin:
1. Vercel URLni oching (masalan: `https://payza.vercel.app`)
2. Brauzer konsolini oching (F12)
3. Ro'yxatdan o'tish yoki kirishni sinab ko'ring
4. Agar CORS xatoligi bo'lsa:
   - Vercel URLni tekshiring
   - Renderda `CORS_ORIGINS` ga qo'shganingizni tekshiring

### API test qilish
```bash
curl https://payza-backend.onrender.com/api/health
```

## 7. Custom Domen (Ixtiyoriy)

### Vercelda custom domen qo'shish
```bash
vercel domains add yourdomain.com
```

### DNS sozlamalari
Vercel sizga DNS rekordlarini beradi, ularni domen provideringizda qo'shing.

## 8. Troubleshooting

### CORS xatoligi
- Vercel URLni Render `CORS_ORIGINS` ga qo'shing
- URLda trailing slash yo'q ekanligini tekshiring

### Build xatoligi
```bash
npm run build
```
- Xatoliklarni hal qiling

### Environment variables
```bash
vercel env ls
```
- O'zgaruvchilarni tekshiring

## 9. Production Checklist

- [ ] `npm run build` muvaffaqiyatli
- [ ] Vercel hisobiga kirilgan
- [ ] Environment variables qo'shilgan
- [ ] Renderda CORS_ORIGINS sozlangan
- [ ] Deploy muvaffaqiyatli bo'lgan
- [ ] Frontend backend bilan bog'lanadi
- [ ] Ro'yxatdan o'tish/login ishlaydi

## 10. Tez buyruqlar

```bash
# Deploy production
vercel --prod

# Logs ko'rish
vercel logs

# Environment variables
vercel env ls
vercel env add VARIABLE_NAME

# Project ma'lumotlari
vercel ls
```

## Eslatmalar

- Vercel har git pushda avtomatik deploy qiladi (agar bog'langan bo'lsa)
- Preview deployments har branch uchun yaratiladi
- Environment variables production va development uchun alohida bo'lishi mumkin

Agar muammo bo'lsa, Vercel dashboarddan logs va settingsni tekshiring.