# 🌐 PRODUCTION TEST CHECKLIST

## Test Completed ✅

### API Level Testing
- [x] POST /auth/register - ✅ 201 Created
- [x] GET /auth/me - ✅ 200 OK  
- [x] GET /wallet/overview - ✅ 200 OK
- [x] Full E2E flow - ✅ PASSED

### Next: UI Level Testing (Manual)

**Instructions:**
1. Open: https://payza-gray.vercel.app
2. Click "Create one" link to go to register
3. Fill form:
   - Full Name: Test User
   - Email: test_[random]@example.com
   - Password: SecurePass@123 (or stronger)
   - Confirm: SecurePass@123
4. Click "Create Account" button
5. **Expected Result:**
   - Should load dashboard with wallets
   - Should show "Traditional" and "Crypto" wallet sections
   - Should show payment methods

### Troubleshooting (if error)

**If "Failed to load wallet data" appears:**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for network errors
4. Check if CORS error shows

**CORS Check:**
```
Navigation to https://payza.up.railway.app/api blocked by CORS policy
```
If this appears, Railway CORS_ORIGINS variable needs adjustment.

**Solution:**
Railroad dashboard → Backend Service → Variables:
```
CORS_ORIGINS=https://payza-gray.vercel.app,capacitor://localhost
```

---

## Status

✅ **API Testing:** COMPLETE
⏳ **UI Testing:** PENDING (Manual browser test needed)
⏳ **CORS Verification:** PENDING

Once UI test passes, move to next phase: **Android Build**
