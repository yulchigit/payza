# 📋 PayZa Quick Reference Card

**Session Completed:** February 24, 2026 | **All 5 Directions ✅**

---

## 🔗 Key Resources

### Documentation (Read These First)
1. **[LAUNCH_SUMMARY.md](./LAUNCH_SUMMARY.md)** — What was done & why
2. **[RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)** — Production readiness checklist
3. **[SECURITY.md](./SECURITY.md)** — Security implementation details
4. **[MONITORING.md](./MONITORING.md)** — Observability & logging
5. **[PERFORMANCE.md](./PERFORMANCE.md)** — Bundle analysis & optimization
6. **[ANDROID_BUILD.md](./ANDROID_BUILD.md)** — APK/AAB build & distribution

---

## 🚀 Live Endpoints

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://payza-gray.vercel.app | ✅ Live |
| **Backend API** | https://payza-backend.onrender.com/api | ✅ Live |
| **Health Check** | https://payza-backend.onrender.com/api/health | ✅ Live |
| **Database** | Render PostgreSQL | ✅ Live |

---

## 📱 Android Builds

| Type | Location | Size | Purpose |
|------|----------|------|---------|
| **APK** | `android/app/build/outputs/apk/release/app-release.apk` | 4.51 MB | Install directly |
| **AAB** | `android/app/build/outputs/bundle/release/app-release.aab` | 4.37 MB | Google Play Store |

**Install:** `adb install -r app-release.apk`

---

## 🔐 Security Features

- ✅ CORS whitelist (production domains)
- ✅ Rate limiting (10/15min auth, 3/60min password reset)
- ✅ Account lockout (5 attempts → 15 min)
- ✅ HTTP security headers (CSP, HSTS, X-Frame-Options)
- ✅ Bcrypt password hashing (10-14 rounds)
- ✅ JWT validation (HS256, issuer/audience)
- ✅ Structured audit logging
- ✅ Input validation (Zod schemas)
- ✅ SQL injection prevention (parameterized queries)

---

## 📊 Monitoring

### View Logs
Open the Render Dashboard → Services → payza-backend → Logs and use the search/filter to find errors:
```text
Search: "level":"error"
Search: status: 500
Search: user@example.com
```

### Health Check
```bash
curl https://payza-backend.onrender.com/api/health
# {"status": "healthy", "database": "connected", ...}
```

### Log Format
```json
{
  "level": "error",
  "timestamp": "2026-02-24T10:30:45Z",
  "requestId": "1708844445123-42",
  "userId": "550e...",
  "statusCode": 401,
  "error": "Invalid credentials"
}
```

---

## ⚡ Performance Metrics

| Metric | Value |
|--------|-------|
| Frontend Bundle (gzip) | ~390 kB |
| Initial Load | ~2-3 seconds |
| Lazy-Loaded Charts | Deferred 112 kB |
| Health Check Response | <50ms |
| Auth Response | 200-500ms |
| Android APK Size | 4.51 MB |

---

## 🛠 Common Commands

### Build & Deploy
```bash
npm run build                      # Build React app
npx cap sync android               # Sync to Capacitor
npm run release:android            # Full pipeline
```

### Android
```bash
cd android
./gradlew assembleRelease          # Build APK
./gradlew bundleRelease            # Build AAB
./gradlew clean                    # Clean build
adb install -r app-release.apk     # Install to device
adb logcat | grep payza            # View logs
```

### Testing
```bash
curl -X POST https://payza-gray.vercel.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@ex.com","password":"Pass123!"}'
```

---

## 📲 Installation Instructions (Android)

### From APK (Direct)
1. Download `app-release.apk` from build outputs
2. Enable Unknown Sources on Android device
3. Transfer APK to device
4. Open & tap to install
5. Launch app

### From ADB (Developer)
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell am start -n com.payza.app/.MainActivity
```

### From Google Play (Future)
1. Create Play Developer account ($25)
2. Upload `app-release.aab`
3. Configure store listing
4. Submit for review
5. Go live

---

## 🔑 Important Files

| File | Purpose |
|------|---------|
| `backend/src/app.js` | Express app (middleware chain) |
| `backend/src/config/env.js` | Environment variables |
| `backend/src/middleware/rateLimiters.js` | Rate limiting tiers |
| `backend/src/middleware/errorHandler.js` | Error logging |
| `src/lib/apiClient.js` | Axios client (with fallback) |
| `src/Routes.jsx` | Lazy-loaded route components |
| `android/key.properties` | Signing configuration ⚠️ SECURE |
| `capacitor.config.json` | Capacitor bridge config |

---

## 🚨 Critical Reminders

⚠️ **NEVER:**
- Commit `android/key.properties` to Git (keep secure)
- Commit `.env` files with secrets
- Use hardcoded API keys in code
- Cache sensitive data in browser
- Allow unauthenticated API access

✅ **ALWAYS:**
- Test on production before launching
- Monitor logs after deployment
- Keep signing key backed up
- Update `versionCode` for new releases
- Run security audit before major releases

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| 405 CORS errors | Check backend CORS middleware order |
| Blank white screen | Check browser console (`adb logcat` for APK) |
| Build fails | Run `cd android && ./gradlew clean` |
| APK won't install | Enable Unknown Sources, check version code |
| API timeout | Verify backend on Render is running |
| Charts not loading | Check network tab, lazy-loading may be slow |

---

## 📞 Support Contacts

| Issue | Contact | Response Time |
|-------|---------|----------------|
| Bug Report | GitHub Issues | 24 hours |
| Security Issue | ⚠️ Don't post publicly | 24 hours |
| Feature Request | GitHub Discussions | 1 week |
| Production Issue | (email - TBD) | 1 hour |

---

## ✅ Deployment Checklist

Before going live:
- [ ] Test registration on production
- [ ] Test login on production
- [ ] Verify API connectivity
- [ ] Check monitoring/logging active
- [ ] Review error rates in dashboard
- [ ] Confirm CORS headers present
- [ ] Test password reset flow
- [ ] Verify rate limiting working
- [ ] Check APK installs correctly
- [ ] Review security headers (CSP, HSTS)
- [ ] Backup database (Render PostgreSQL)
- [ ] Set up Firebase Analytics
- [ ] Create support email

---

## 📚 Version Info

| Component | Version |
|-----------|---------|
| React | 18.2.0 |
| Vite | 7.3.1 |
| Node.js | 18+ (recommended) |
| Capacitor | 6.x |
| Android SDK | 12+ (API 31+) |
| Gradle | 9.2.1 |
| PostgreSQL | 14+ |
| Render | Managed |
| Vercel | Managed |

---

## 🎯 Next Release Checklist

When ready for version 1.1.0:

1. [ ] Create release branch: `git checkout -b release/1.1.0`
2. [ ] Update version: `versionCode = 2, versionName = "1.1.0"`
3. [ ] Build: `npm run release:android`
4. [ ] Test APK thoroughly
5. [ ] Tag release: `git tag v1.1.0`
6. [ ] Push: `git push origin release/1.1.0 --tags`
7. [ ] Create GitHub Release
8. [ ] Distribute APK or submit to Play Store

---

## 📊 Metrics Dashboard

- See **[MONITORING.md](./MONITORING.md)** for:
- How to access Render logs
- How to track request performance
- How to monitor error rates
- How to set up alerts

---

## 🔄 Rollback Procedure

If production issue found:

```bash
# Find previous good commit
git log --oneline | head -5

# Rollback
git revert <commit-hash>
git push origin main

# Wait for auto-deploy on Vercel/Render
# Verify: https://payza-gray.vercel.app
```

---

**Last Updated:** February 24, 2026  
**Status:** ✅ Production Ready  
**Maintainer:** PayZa Development Team

---

*For detailed information on any topic, see the comprehensive guides linked at the top of this document.*
