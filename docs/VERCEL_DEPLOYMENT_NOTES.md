# Vercel Deployment Architecture

## Project Structure

This is a monorepo with two separate Vercel deployments:

- **Frontend**: Next.js app at `/frontend/`
  - Deployed at: https://ldj.heistats.com
  - Project: "frontend"
  - Linked project ID: prj_fI7OXotFAF3scTgSuUqD7rAqlHAw

- **Backend**: FastAPI app at `/backend/`
  - Deployed at: https://ldj-api.heistats.com
  - Project: "backend"
  - Serverless function entry: `/api/index.py`

## How Vercel Python Routing Works

1. **Auto-detection**: Vercel scans for `.py` files in `/api/` directory
2. **Serverless functions**: Each file becomes a serverless endpoint
3. **Path mapping**: `/api/index.py` handles all requests to `/api/*`
4. **ASGI support**: FastAPI apps are ASGI applications that Vercel runs directly
5. **Internal routing**: The FastAPI app's router handles sub-path routing

### Example Request Flow

```
Request: GET /api/v1/health
    ↓
Vercel detects /api/ → routes to /api/index.py
    ↓
/api/index.py imports FastAPI app from backend/app/main.py
    ↓
FastAPI router matches /api/v1/health endpoint
    ↓
Response: {"status": "healthy", ...}
```

## Why No vercel.json is Needed in Backend

**Vercel automatically:**
- Detects Python files in `/api/` directory
- Routes all `/api/*` requests to `/api/index.py`
- Handles ASGI/WSGI application serving
- Manages environment variables and secrets

**Manual rewrites are:**
- ❌ Unnecessary - Vercel knows where to route
- ❌ Harmful - Can create infinite loops
- ❌ Redundant - FastAPI handles internal routing

## Frontend Proxy Configuration

The frontend Next.js app proxies API requests to the separate backend domain:

**File:** `/frontend/next.config.js`

```javascript
async rewrites() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL; // https://ldj-api.heistats.com
  if (!apiUrl) return [];
  
  return [
    { source: '/api/:path*', destination: `${apiUrl}/api/:path*` },
    { source: '/uploads/:path*', destination: `${apiUrl}/uploads/:path*` }
  ];
}
```

This is correct because:
- Frontend requests to `/api/v1/health` are proxied to backend
- Backend handles the request via `/api/index.py`
- No circular routing - frontend → backend is one-way

## Common Pitfall: Self-Referential Rewrites

**❌ WRONG (creates infinite loop):**
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index"
    }
  ]
}
```

**Problem:** `/api/index` matches `/api/(.*)` → rewrites to itself infinitely

**✅ CORRECT:**
```json
{}
```
Or just delete `vercel.json` entirely - Vercel handles routing automatically.

## If You Need vercel.json Later

Use it only for:
- Function configuration (timeout, memory, regions)
- Security headers
- Redirects (HTTP→HTTPS, old paths)
- Environment-specific settings

**Example safe configuration:**
```json
{
  "functions": {
    "api/index.py": {
      "maxDuration": 60,
      "memory": 1024
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Custom-Header", "value": "my-value" }
      ]
    }
  ]
}
```

## Historical Fixes

- **Commit c48061d** (June 12, 2026): Successfully removed rewrite rule from root vercel.json
- **Commit 792a9bf** (June 12, 2026): Incorrectly "fixed" backend vercel.json by narrowing pattern - still caused loops
- **This fix**: Removes the rewrite entirely from backend, completing the correction

## Verification Checklist

After deployment, verify:

- [ ] Backend health: `curl https://ldj-api.heistats.com/api/v1/health`
- [ ] API docs: `curl https://ldj-api.heistats.com/docs`
- [ ] Frontend proxy: `curl https://ldj.heistats.com/api/v1/health`
- [ ] No timeout errors in Vercel logs
- [ ] Browser DevTools shows API calls succeeding
- [ ] No infinite loop errors in deployment logs

## References

- [Vercel Python Runtime](https://vercel.com/docs/functions/runtimes/python)
- [Vercel Configuration](https://vercel.com/docs/projects/project-configuration)
- [Vercel Infinite Loop Error](https://vercel.com/docs/errors/infinite_loop_detected)
