# Full-Scale Caching Guide for U.N.I.T.
> Goal: minimize Railway compute + bandwidth, reduce Netlify function calls, and serve the app fast globally — all on the free tier.

---

## 1. Free Redis in 2026

### Best Option: **Upstash Redis** (recommended)
- **Free tier:** 10,000 commands/day, 256 MB storage, 1 database
- **URL:** https://upstash.com
- **Why:** Serverless Redis with an HTTP REST API — no persistent connection needed. Works perfectly with Railway (Node.js) and even Netlify Edge Functions. Latency is ~1–5 ms from the same region.
- **How to connect:**
  ```bash
  npm install @upstash/redis
  ```
  ```ts
  import { Redis } from '@upstash/redis'
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  ```
- **Limits to watch:** 10k commands/day is ~7 per minute sustained. Each cache read = 1 GET (1 command). Each cache write = 1 SET (1 command). With smart TTLs this is plenty for a low-traffic educational site.

### Alternative: **Redis Cloud** (Redis.io)
- **Free tier:** 30 MB, 1 database, shared infrastructure
- **URL:** https://redis.io/try-free/
- **Downside:** Only 30 MB — fills up fast if you cache large JSON payloads.

### Alternative: **Railway Redis** (add-on)
- Railway has a native Redis plugin. The free tier provides ~50 MB.
- One-click deploy from your Railway dashboard.
- Ideal if you want everything in one place.
- Set `REDIS_URL` env var automatically.

### Not recommended for this use case
- Vercel KV — only free if your frontend is on Vercel (you're on Netlify)
- Netlify Blobs — key/value store for static assets, not suitable for API response caching

---

## 2. What to Cache (Backend — Railway/Express)

Install a cache middleware that works with Upstash or Railway Redis:

```ts
// server/src/cache.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    return await redis.get<T>(key)
  } catch {
    return null // never let cache errors break the app
  }
}

export async function setCached(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    await redis.set(key, value, { ex: ttlSeconds })
  } catch { /* silent */ }
}

export function invalidate(pattern: string): Promise<void> {
  // Upstash doesn't support SCAN on free tier — use deterministic key names
  return redis.del(pattern).then(() => {})
}
```

### Cache Rules by Endpoint

| Endpoint | TTL | Invalidate on |
|---|---|---|
| `GET /api/institutions` | 10 min | Admin creates institution/program/subject |
| `GET /api/institutions/:slug` | 10 min | Same |
| `GET /api/resources?...` (browse) | 2 min | New resource approved or created |
| `GET /api/resources/:id` | 5 min | Resource updated |
| `GET /api/stats` | 5 min | Any resource download or creation |
| `GET /api/donors` | 5 min | New donation |
| `GET /api/fundraiser` | 5 min | New contribution |
| `GET /api/board/posts` | 30 sec | New post, delete post |
| `GET /api/board/posts/:id` | 1 min | Vote, new comment |

### Express middleware example

```ts
// server/src/middleware/cache.ts
import { Request, Response, NextFunction } from 'express'
import { getCached, setCached } from '../cache'

export function cacheMiddleware(ttlSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') return next()

    const key = `cache:${req.originalUrl}`
    const hit = await getCached(key)
    if (hit) {
      res.setHeader('X-Cache', 'HIT')
      return res.json(hit)
    }

    // Monkey-patch res.json to capture the response
    const originalJson = res.json.bind(res)
    res.json = (body) => {
      if (res.statusCode === 200) {
        setCached(key, body, ttlSeconds) // async, don't await
      }
      return originalJson(body)
    }

    res.setHeader('X-Cache', 'MISS')
    next()
  }
}
```

```ts
// Usage in routes
router.get('/institutions', cacheMiddleware(600), institutionController.getAll)
router.get('/stats',        cacheMiddleware(300), statsController.get)
router.get('/resources',    cacheMiddleware(120), resourceController.getAll)
router.get('/board/posts',  cacheMiddleware(30),  boardController.getPosts)
```

---

## 3. What to Cache (Frontend — Already Done)

The frontend already has module-level in-memory caching in `src/services/api.ts`:
- Institutions: 10 min
- Resources: 2–5 min
- Stats/donors/fundraiser: 5 min
- Board: 30 sec / 1 min

This means: **if a user visits multiple pages in one session, subsequent API calls are served from RAM — zero network requests.** This alone drastically cuts Railway compute.

---

## 4. HTTP Cache Headers (Free CDN Layer)

Add these headers in your Express responses for static/slow-changing data. Netlify's CDN will cache them at the edge, meaning some requests **never reach Railway at all**.

```ts
// For GET /api/institutions (rarely changes)
res.setHeader('Cache-Control', 'public, max-age=600, stale-while-revalidate=3600')

// For GET /api/resources (browse page)
res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=300')

// For GET /api/stats
res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')

// For authenticated/user-specific responses
res.setHeader('Cache-Control', 'private, no-store')
```

Netlify's CDN automatically caches `Cache-Control: public` responses. **This is the biggest win** — it can serve hundreds of requests without touching Railway at all.

---

## 5. Netlify Credits — Why They Burn Fast

Netlify charges for:
1. **Bandwidth** — every byte served from your Netlify site
2. **Function invocations** — if you use Netlify Functions
3. **Build minutes** — each `git push` triggers a build

### How to save credits:

**a) Aggressive asset caching**  
Add `netlify.toml` to your repo root:
```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=86400"
```
Vite already content-hashes all JS/CSS filenames, so `immutable` is safe.

**b) Compress images**  
The hero carousel images (`/images/hero/1-7.png`) are the #1 bandwidth hog. Convert them to WebP:
```bash
# Install: npm install -g sharp-cli
for i in 1 2 3 4 5 6 7; do
  sharp input="/images/hero/$i.png" -o "public/images/hero/$i.webp" --format webp --quality 75
done
```
Then in `HeroCarousel`:
```tsx
src={`/images/hero/${n}.webp`}
```
WebP is typically 60–80% smaller than PNG at the same visual quality.

**c) Use a Netlify redirect to proxy the API**  
Instead of exposing your Railway URL in the frontend, proxy through Netlify (zero extra cost, adds CDN):
```toml
# netlify.toml
[[redirects]]
  from = "/api/*"
  to = "https://your-app.railway.app/api/:splat"
  status = 200
  force = true
  headers = {X-From = "Netlify"}
```
Now `Cache-Control: public` responses from Railway get cached at Netlify's edge automatically.

---

## 6. Full Stack Caching Flow

```
User Browser
  │
  ├── Static assets (JS/CSS/images) → Netlify CDN (cached 1 year, immutable)
  │
  └── API calls → Netlify Edge (Cache-Control: public responses cached here)
                    │
                    └── Cache MISS → Railway Express
                                       │
                                       ├── Redis/Upstash (TTL cache)
                                       │     └── Cache HIT → return JSON
                                       │
                                       └── Cache MISS → MySQL (Prisma)
                                                          └── Query → return + populate Redis
```

**Result:** Most users never hit Railway. Railway only serves fresh data. MySQL only runs when Redis TTL expires.

---

## 7. Quick Setup Checklist

- [ ] Create Upstash account at upstash.com → create a Redis database (free tier)
- [ ] Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to Railway env vars
- [ ] Install `@upstash/redis` in server: `npm install @upstash/redis`
- [ ] Create `server/src/cache.ts` (code above)
- [ ] Wrap GET routes with `cacheMiddleware(ttlSeconds)` 
- [ ] Add `Cache-Control` headers to public GET responses
- [ ] Add `netlify.toml` with asset cache headers
- [ ] Convert hero images to WebP
- [ ] Add `[[redirects]]` in `netlify.toml` to proxy `/api/*` through Netlify CDN

---

*Estimated credit savings: 60–80% reduction in Netlify bandwidth once asset caching + image compression is in place.*
