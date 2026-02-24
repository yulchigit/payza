# Security Policy & Implementation

## Overview

PayZa implements multiple layers of security to protect user data, prevent attacks, and maintain compliance with security best practices.

---

## 1. Authentication & Password Management

### Password Hashing
- **Algorithm:** Bcrypt with salt rounds: 10-14 (configurable)
- **Min Length:** 8 characters (enforced by Zod validator)
- **HashTime:** ~250-500ms per hash (intentional for security)

```javascript
await bcrypt.hash(payload.password, env.bcryptRounds);
```

### JWT Tokens
- **Algorithm:** HS256 (HMAC with SHA-256)
- **Secret:** ≥32 characters (enforced)
- **Expiration:** 7 days (configurable)
- **Claims:** `iss` (issuer), `aud` (audience), `sub` (user ID), `exp`, `iat`

**Verification:**
```javascript
jwt.verify(token, jwtSecret, {
  issuer: env.jwtIssuer,
  audience: env.jwtAudience
})
```

### Session Management
- Tokens stored in `sessionStorage` (browser memory, cleared on tab close)
- No persistent login (users must re-auth per session)
- Auto-logout on invalid/expired token

---

## 2. Rate Limiting

### Endpoints Protected

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `/auth/register` | 10 | 15 min | Prevent account enumeration |
| `/auth/login` | 10 | 15 min | Prevent brute-force attacks |
| `/auth/forgot-password` | 3 | 60 min | Prevent password reset abuse |
| All `/api/*` | 300 | 15 min | General DDoS protection |

**Rate Limiting Strategy:**
- Key: IP + email (for auth endpoints)
- Response: 429 Too Many Requests
- Header: `Retry-After` with seconds

```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => `${req.ip}-${req.body?.email || ""}`
});
```

### Account Lockout
- After 5 failed login attempts → 15 min lockout
- Lockout tracked per user via `locked_until` timestamp
- Automatic unlock after lockout expires

---

## 3. Input Validation

### Schema Validation (Zod)

**Register:**
```
- fullName: non-empty string, ≤255 chars
- email: valid email format
- password: ≥8 chars, required
```

**Login:**
```
- email: valid email format
- password: non-empty string
```

**Payload Size:** Max 100KB (express.json limit)

### SQL Injection Prevention
- **Parameterized Queries:** All database queries use `$1, $2, ...` placeholders
- **No String Concatenation:** Dynamic values never concatenated into SQL

```javascript
// ✅ Safe
await pool.query("SELECT * FROM users WHERE email = $1", [email]);

// ❌ Never
await pool.query(`SELECT * FROM users WHERE email = '${email}'`);
```

### XSS Protection
- Response JSON never contains raw HTML/scripts
- Error messages sanitized
- Helmet CSP headers prevent inline scripts

---

## 4. CORS & Origin Validation

### Allowed Origins (Production)
```
- https://payza-gray.vercel.app
- https://payza.vercel.app
- https://payza-fj0xjzd4n-yulchinarziyev-1538s-projects.vercel.app (preview)
```

### CORS Flow
1. Preflight (OPTIONS) → Helmet returns allowed headers + methods
2. Actual request → Origin header validated against whitelist
3. Response includes `Access-Control-Allow-Origin` header

### Cross-Site Request Forgery (CSRF)
- No cookies used (JWT via headers only)
- Implicit CSRF protection via SameSite=None not needed
- Origin validation acts as additional protection

---

## 5. HTTP Security Headers

### Helmet.js Configuration

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | nosniff | Prevent MIME type sniffing |
| `X-Frame-Options` | DENY | Prevent clickjacking |
| `Strict-Transport-Security` | max-age=31536000 | Force HTTPS for 1 year |
| `Content-Security-Policy` | default-src 'self' | Restrict resource loading |
| `Referrer-Policy` | strict-origin | Limit referrer leakage |

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: { maxAge: 31536000, preload: true }
}));
```

---

## 6. HTTPS & Transport Security

### Production Enforcement
- All HTTP requests redirected to HTTPS
- `x-forwarded-proto` header checked (for proxies)
- HSTS preload ready (1 year max-age)

```javascript
if (nodeEnv === "production" && req.header("x-forwarded-proto") !== "https") {
  return res.redirect(`https://${req.header("host")}${req.url}`);
}
```

### Certificate Pinning
- Not implemented (Railway/Vercel handle certs)
- Enable if hosting on custom domain

---

## 7. Auditing & Logging

### Events Logged
- User registration
- Login attempts (success/failure)
- Failed login attempts (triggers lockout)
- Password reset requests
- HTTP errors (4xx/5xx)

### Log Format
```json
{
  "level": "warn",
  "timestamp": "2026-02-24T10:30:45.123Z",
  "requestId": "1708844445123-42",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "eventType": "login",
  "isSuccess": true,
  "ipAddress": "203.0.113.45",
  "userAgent": "Mozilla/5.0..."
}
```

### Search Production Logs
```bash
# Failed logins
railway logs | grep '"isSuccess":false'

# Specific user
railway logs | grep "user@example.com"

# HTTP errors
railway logs | grep '"status":50'
```

---

## 8. Data Protection

### Encryption in Transit
- TLS 1.2+ on all endpoints (Railway enforced)
- No plain-text passwords in logs/errors

### Encryption at Rest
- Database: Railway PostgreSQL (encrypted storage)
- Tokens: JWT signed (integrity verified, not encrypted)

### Sensitive Data Handling
- Passwords never logged
- Tokens truncated in logs (first 40 chars only)
- PII minimized in error responses

---

## 9. Password Reset Flow (Future)

### Implementation TODO
1. User submits email → `/api/auth/forgot-password` (rate-limited 3/hr)
2. Backend generates `resetToken` (crypto.randomBytes(32))
3. Store token hash + expiry (30 min) in `users` table
4. Send email with reset link: `https://payza-gray.vercel.app/reset?token=...`
5. User clicks link → frontend submits new password
6. Backend validates token, updates password, clears token
7. Audit log entry created

**Security Notes:**
- Email never reveals if account exists (prevent enumeration)
- Token expires after 30 minutes
- Token single-use (deleted after reset)
- New password logged as audit event

---

## 10. Security Checklist

- [x] JWT with HS256 + 32-char secret
- [x] Bcrypt password hashing (10-14 rounds)
- [x] Rate limiting (auth: 10/15min, API: 300/15min)
- [x] Account lockout (5 attempts → 15 min)
- [x] CORS whitelist + origin validation
- [x] CSP + HSTS + X-Frame-Options headers
- [x] Parameterized SQL queries (no injection)
- [x] Structured audit logging
- [x] HTTPS enforcement + redirect
- [x] Helmet.js security middleware
- [ ] Email-based password reset (TODO)
- [ ] 2FA/MFA (future)
- [ ] API key rotation (future)
- [ ] Penetration testing (TODO)

---

## 11. Vulnerability Reporting

### If You Find a Security Issue:

1. **Do NOT** open a public GitHub issue
2. Email: [contact-email-TBD]
3. Include: CVE (if applicable), reproduction steps, impact assessment
4. **Do NOT** disclose exploits publicly until patch released

### Response Timeline
- Critical: 24 hours
- High: 1 week
- Medium: 2 weeks

---

## 12. Security Tools & Dependencies

### Current
- `helmet` — HTTP security headers
- `bcryptjs` — Password hashing
- `jsonwebtoken` — JWT signing/verification
- `express-rate-limit` — Rate limiting
- `zod` — Input validation
- `pg` — Parameterized queries

### Recommended Updates
```bash
# Regular security updates
npm audit
npm audit fix

# Dependency scanning
npm install -g snyk
snyk test

# Runtime security (future)
npm install helmet helmet-csp
```

---

## 13. References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Rate Limiting Strategy](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Prevention_Cheat_Sheet.html)
- [SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

---

**Last Updated:** February 24, 2026  
**Version:** 1.0.0
