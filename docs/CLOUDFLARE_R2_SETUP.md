# Cloudflare R2 Setup Guide — NotesHub Kashmir

Cloudflare R2 replaces AWS S3 for storing PDFs, images, and user uploads.

**Why R2 over S3:**
- **Zero egress fees** — S3 charges ~$0.09/GB for downloads. R2 charges nothing.
- **Free tier:** 10 GB storage, 1 million Class A operations (writes), 10 million Class B operations (reads) per month — enough for a long time.
- **S3-compatible API** — no SDK change required, same `@aws-sdk/client-s3` package.

---

## 1. Create a Cloudflare Account

Sign up at [cloudflare.com](https://cloudflare.com) (free).

---

## 2. Create an R2 Bucket

1. Cloudflare dashboard → **R2 Object Storage** (left sidebar)
2. Click **Create bucket**
3. Name: `noteshub-kashmir` (or any name — this becomes `R2_BUCKET_NAME`)
4. Location: **Automatic** (Cloudflare picks the closest region)
5. Click **Create bucket**

---

## 3. Enable Public Access

Files (PDFs, images) need to be publicly readable so users can view/download them.

### Option A — Use the free `r2.dev` subdomain (easiest, no domain needed)

1. In your bucket → **Settings** tab → **Public access**
2. Toggle **Allow Access** → Confirm
3. Your public URL will be: `https://pub-XXXXXXXXXXXXXXXX.r2.dev`
4. Copy this — it becomes `R2_PUBLIC_URL`
<!-- https://pub-d210c6a50e824a74a9d7109048101ac8.r2.dev -->
### Option B — Use a custom domain (recommended for production)

1. Your domain must be on Cloudflare (free plan works)
2. Bucket → **Settings** → **Custom Domains** → **Connect Domain**
3. Enter: `assets.noteshubkashmir.in` (or similar)
4. Cloudflare auto-creates the DNS record
5. Your public URL: `https://assets.noteshubkashmir.in`
6. This becomes `R2_PUBLIC_URL`

---

## 4. Create an R2 API Token

R2 uses its own API tokens (not your Cloudflare account API key).

1. Cloudflare dashboard → **R2** → **Manage R2 API Tokens** (top right)
2. Click **Create API Token**
3. Settings:
   - **Token name:** `noteshub-backend`
   - **Permissions:** `Object Read & Write`
   - **Specify bucket:** select `noteshub-kashmir`
   - TTL: leave as No Expiry (or set 1 year)
4. Click **Create API Token**
5. **Copy both values immediately** — the secret is shown only once:
   - `Access Key ID` → becomes `R2_ACCESS_KEY_ID`
   - `Secret Access Key` → becomes `R2_SECRET_ACCESS_KEY`
---

## 5. Find Your Account ID

1. Cloudflare dashboard → **R2** (any page)
2. Right sidebar or **Overview** tab shows: **Account ID** (32-char hex string)
3. This becomes `R2_ACCOUNT_ID`
---

## 6. Environment Variables

Set these in Railway → your service → **Variables** tab (replace the old AWS vars):

| Variable | Value | Example |
|----------|-------|---------|
| `R2_ACCOUNT_ID` | Your Cloudflare Account ID | `a1b2c3d4e5f6...` |
| `R2_ACCESS_KEY_ID` | R2 API Token Access Key ID | `abc123...` |
| `R2_SECRET_ACCESS_KEY` | R2 API Token Secret | `xyz789...` |
| `R2_BUCKET_NAME` | Your bucket name | `noteshub-kashmir` |
| `R2_PUBLIC_URL` | Public URL for the bucket | `https://assets.noteshubkashmir.in` |

**Remove the old AWS vars** (`AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`) — they are no longer used.

---

## 7. CORS Configuration

R2 needs CORS configured so the browser can upload directly via presigned URLs.

1. Bucket → **Settings** → **CORS Policy** → **Add CORS policy**
2. Paste this JSON:

```json
[
  {
    "AllowedOrigins": [
      "https://your-site.netlify.app",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["Content-Type", "Content-Length"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Replace `your-site.netlify.app` with your actual Netlify domain.

---

## 8. How the Upload Flow Works

```
Browser                Backend (Railway)              Cloudflare R2
  │                          │                              │
  │── POST /upload-url ──────▶│                              │
  │   { contentType, key }   │── getSignedUrl(PutObject) ──▶│
  │                          │◀─ presigned PUT URL ─────────│
  │◀── { uploadUrl, fileUrl }│                              │
  │                          │                              │
  │── PUT uploadUrl ──────────────────────────────────────▶│
  │   (PDF binary, direct)   │                              │
  │◀── 200 OK ───────────────────────────────────────────── │
  │                          │                              │
  │── POST /resources ───────▶│                              │
  │   { fileUrl, ... }       │── prisma.resource.create ───▶DB
  │◀── { resource } ─────────│                              │
```

The backend never handles the file binary — it only generates a signed URL and stores the final public URL. This keeps Railway bandwidth costs at zero for file uploads.

---

## 9. File Key Naming Convention

The backend generates keys in this format:

| Upload type | Key pattern | Example |
|-------------|------------|---------|
| Resource PDF | `resources/{uuid}.{ext}` | `resources/f47ac10b.pdf` |
| Board post image | `board/{uuid}.{ext}` | `board/a1b2c3d4.jpg` |
| Profile picture | `avatars/{userId}.{ext}` | `avatars/clx123abc.jpg` |

All keys are UUIDs so filenames are unpredictable and can't be enumerated.

---

## 10. Verify the Setup

After deploying with the new env vars:

1. **Test presigned URL generation:**
   ```
   POST https://your-api.railway.app/api/resources/upload-url
   Authorization: Bearer <admin-token>
   { "contentType": "application/pdf", "institutionId": "...", ... }
   ```
   Should return `{ uploadUrl: "https://...r2.cloudflarestorage.com/...", fileUrl: "https://assets.noteshubkashmir.in/..." }`

2. **Test direct upload:**
   ```
   PUT <uploadUrl>
   Content-Type: application/pdf
   <pdf binary>
   ```
   Should return `200 OK`

3. **Test public access:**
   Open `<fileUrl>` in browser — PDF should load directly from R2.

---

## 11. Cost Estimate

| Usage | Free tier | After free tier |
|-------|-----------|----------------|
| Storage | 10 GB/month | $0.015/GB |
| Writes (PUT) | 1M ops/month | $4.50/million |
| Reads (GET) | 10M ops/month | $0.36/million |
| **Egress (downloads)** | **Unlimited FREE** | **FREE forever** |

For a university notes platform at early stage: **$0/month** — the free tier is extremely generous.
