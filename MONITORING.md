# Monitoring & Logging Setup

## Overview

PayZa backend includes structured logging with JSON format for easy parsing and monitoring in production environments. All errors, warnings, and HTTP errors (4xx/5xx) are logged with request context.

---

## Log Format

All logs are JSON-structured for easy parsing by monitoring tools:

```json
{
  "level": "error|warn|info",
  "timestamp": "2026-02-24T10:30:45.123Z",
  "requestId": "1708844445123-42",
  "method": "POST",
  "path": "/api/auth/register",
  "status": 400,
  "duration": "12ms",
  "ip": "203.0.113.45",
  "error": {
    "message": "Invalid email format",
    "name": "ZodError",
    "stack": "..."
  }
}
```

---

## Accessing Logs

### Render Dashboard

1. **Open Render Dashboard**
  - Open the Render Dashboard and select your PayZa project
  - Click on the backend service (`payza-backend` or similar)

2. **View Live Logs**
  - Select the "Logs" tab
  - Logs stream in real-time (JSON formatted)
  - Use the dashboard search/filter to find errors:
    - Search: `"level":"error"`
    - Search: `status: 500`
    - Search: specific `requestId`

### Query Recent Errors

Use the Render Dashboard log search to filter recent errors:

**Find all 500 errors in last hour:** Search for `status:500`

**Find specific user's failed requests:** Search for the user's email or `userId`

**Find slow requests (>2s):** Search for `duration` values greater than `2000ms` using the dashboard filters

---

## Health Check Endpoint

Monitor service health at:

```
GET https://payza-backend.onrender.com/api/health
```

**Response:**
```json
{
  "success": true,
  "service": "payza-backend",
  "status": "healthy",
  "database": {
    "status": "ok",
    "responseTime": "5ms"
  },
  "uptime": 3600,
  "environment": "production",
  "timestamp": "2026-02-24T10:30:45.123Z",
  "responseTime": "6ms",
  "version": "1.0.0"
}
```

**Degraded Response (503):**
- Database unreachable
- Service health compromised

---

## Frontend Error Tracking

### Console Errors

Monitor frontend errors via browser console:

1. Go to deployed app: https://payza-gray.vercel.app
2. Open DevTools (F12) → Console tab
3. Look for red error messages or API failures

### Vercel Error Logs

1. **Vercel Dashboard**
   - Go to https://vercel.com → Select PayZa project
   - Click "Function Logs" or "Production Logs"
   - View deployment and edge function errors

---

### Setting Up Alerts (Render)

### Email Alerts

1. Open Render Dashboard → Services → payza-backend → Alerts/Notifications
2. Enable "Email" notifications for:
  - Deployment failures
  - Health check failures
3. Set alert thresholds (CPU, memory, or health check failures)

### Manual Monitoring Script

Create `monitor.js` locally to poll the health endpoint:

```bash
# Run every 5 minutes to monitor health
* * * * * curl -s https://payza-backend.onrender.com/api/health | grep -q '"success":true' || curl -X POST https://your-webhook-url -d "PayZa backend health check failed"
```

---

## Common Errors to Watch For

### 1. Database Connection Errors
```json
{
  "level": "error",
  "event": "health_check_db_failed",
  "error": "connect ECONNREFUSED"
}
```
**Action:** Check Render PostgreSQL service status

### 2. CORS Errors (405 Method Not Allowed)
```json
{
  "level": "warn",
  "status": 405,
  "method": "OPTIONS",
  "path": "/api/auth/register"
}
```
**Action:** Verify `CORS_ORIGINS` environment variable is set correctly

### 3. Authentication Errors
```json
{
  "level": "warn",
  "status": 401,
  "error": "Invalid or expired token"
}
```
**Action:** Users may need to re-login; check JWT expiration

### 4. Rate Limit Breached
```json
{
  "level": "warn",
  "status": 429,
  "path": "/api/auth/login",
  "error": "Too many requests"
}
```
**Action:** Check for brute-force attempts; adjust `API_RATE_LIMIT_MAX` if needed

---

### Performance Monitoring

### Request Duration Tracking

Watch for slow endpoints (>500ms) using the Render Dashboard logs and filters (search by `duration`).

High-latency endpoints may indicate:
- Slow database queries
- External API timeouts
- Missing database indexes

### Database Query Monitoring

Add custom query logging in services:

```javascript
const startTime = Date.now();
await pool.query(sql, params);
const duration = Date.now() - startTime;
if (duration > 100) {
  console.warn(JSON.stringify({
    event: "slow_query",
    duration: `${duration}ms`,
    query: sql.substring(0, 100)
  }));
}
```

---

## Environment Variables for Monitoring

Ensure these are set in the Render service:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
CORS_ORIGINS=https://payza-gray.vercel.app,https://payza.vercel.app
JWT_SECRET=<your-secret-32-chars>
API_RATE_LIMIT_MAX=300  # requests per 15 minutes
API_RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
```

---

## Next Steps

- [ ] Set up email alerts in Render
- [ ] Create monitoring dashboard (Grafana/DataDog optional)
- [ ] Configure log aggregation if scaling
- [ ] Test health check regularly
- [ ] Review and act on error logs daily

---

## Support

For issues:
1. Check Render logs: Open the Render Dashboard → Services → payza-backend → Logs (use search/filter)
2. Health endpoint: `curl https://payza-backend.onrender.com/api/health`
3. Review MONITORING.md (this file)
4. Contact DevOps team
