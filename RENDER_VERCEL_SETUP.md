# Render + Vercel Deployment Setup Guide

This guide explains how to configure the PayZa backend on Render and frontend on Vercel for proper CORS communication.

## Current Configuration

- **Backend**: Deployed on Render at `https://payza-backend.onrender.com`
- **Database**: PostgreSQL on Render
- **Frontend**: Deployed on Vercel

## Backend Configuration (Render)

### Required Environment Variables

1. **`DATABASE_URL`** (Required)
   - PostgreSQL connection string from Render
   - Format: `postgresql://user:password@host:port/database`

2. **`JWT_SECRET`** (Required)
   - Secure random string (minimum 32 characters)
   - Generate: `node scripts/generate-jwt-secret.js`

3. **`CORS_ORIGINS`** (Required for production)
   - Configure which domains can access the backend
   - Format: comma-separated list of URLs
   - Example: `https://payza.vercel.app,https://www.payza.vercel.app`

4. **`NODE_ENV`**
   - Set to `production`

### Setting Render Environment Variables

On **Render.com**:
1. Go to your backend service settings
2. Navigate to **Environment**
3. Add these variables:

```
DATABASE_URL = postgresql://...
JWT_SECRET = [32+ character random string]
CORS_ORIGINS = https://payza.vercel.app,https://www.payza.vercel.app
NODE_ENV = production
```

⚠️ **IMPORTANT**: The `CORS_ORIGINS` must exactly match your Vercel frontend domain(s). If your Vercel app is at `https://my-payza.vercel.app`, use that exact URL.

## Frontend Configuration (Vercel)

### Environment Variables

The frontend automatically uses the Render backend. No additional configuration is needed because the `src/lib/apiClient.js` uses:

```
DEFAULT_PUBLIC_API_BASE_URL = "https://payza-backend.onrender.com/api"
```

If you want to override this, you can set in Vercel:
- `VITE_API_BASE_URL = https://payza-backend.onrender.com/api`

## How CORS Works

When the Vercel frontend makes a request to the Render backend:

1. Browser sends the frontend origin (e.g., `https://payza.vercel.app`)
2. Backend checks if this origin is in `CORS_ORIGINS` list
3. If allowed, the backend responds with `Access-Control-Allow-Origin` header
4. Browser allows the response

If the origin is not in the list, the browser blocks the response with a CORS error.

## Common Issues

### CORS Error When Accessing from Vercel

**Problem**: `Access-Control-Allow-Origin` header missing

**Solution**: 
1. Check your Vercel domain URL in browser
2. Add that exact URL to `CORS_ORIGINS` on Render
3. No slashes at the end: `https://payza.vercel.app` ✓ not `https://payza.vercel.app/`

### Multiple Vercel Deployments

If you have preview/staging deployments:

```
CORS_ORIGINS = https://payza.vercel.app,https://payza-preview-branch.vercel.app
```

### Mobile/Capacitor Apps

For Android/iOS apps built with Capacitor, no additional origin configuration is needed.

## Verification Steps

1. **Check Render backend is running**:
   ```
   curl https://payza-backend.onrender.com/api/health
   ```

2. **Check database connection**:
   - Look at Render logs for any connection errors
   - Verify `DATABASE_URL` is correct

3. **Test from Vercel frontend**:
   - Open the app at your Vercel domain
   - Try to register or login
   - Check browser console for CORS errors

4. **Debug CORS issue**:
   - Open browser DevTools → Network tab
   - Look for API calls to `payza-backend.onrender.com`
   - Check the response headers for `Access-Control-Allow-Origin`

## Production Checklist

- [ ] `DATABASE_URL` set on Render
- [ ] `JWT_SECRET` set on Render (32+ chars, non-placeholder)
- [ ] `CORS_ORIGINS` set on Render with Vercel domain(s)
- [ ] `NODE_ENV` set to `production` on Render
- [ ] Frontend deployed on Vercel
- [ ] Test registration/login flows end-to-end
- [ ] Monitor Render logs for issues

## Support

If you need to regenerate JWT secret:
```bash
npm run release:secret
```

This will output a new secure 64-character JWT_SECRET for you to use on Render.
