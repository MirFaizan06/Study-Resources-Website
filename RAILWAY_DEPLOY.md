# Railway Deployment Guide — NotesHub Kashmir Backend

> **First month:** Railway gives $5 free credits on the Hobby plan. Your usage estimate is well within $5–10/month for early traffic.

---

## 1. Pre-Deployment Checklist

- [ ] Railway account created at [railway.app](https://railway.app)
- [ ] GitHub repo connected to Railway
- [ ] MySQL database provisioned on Railway (or PlanetScale/Railway MySQL plugin)
- [ ] All environment variables ready (see Section 3)
- [ ] Razorpay key secret noted from your Razorpay dashboard
- [ ] AWS S3 bucket created, IAM user with `s3:PutObject` + `s3:GetObject` permissions

---

## 2. Project Structure on Railway

Deploy **two services** from the same GitHub repo:

| Service | Root Directory | Purpose |
|---------|---------------|---------|
| `noteshub-api` | `backend/` | Node.js API |
| `noteshub-db` | *(Railway MySQL plugin)* | MySQL 8 database |

The frontend deploys separately on **Netlify** (already done).

---

## 3. Environment Variables

Set these in Railway → your service → **Variables** tab.

### Required

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `mysql://user:pass@host:3306/noteshub?connection_limit=10&pool_timeout=20` | From Railway MySQL plugin → Connect tab. Add the query params for connection pooling. |
| `JWT_SECRET` | 32+ random chars | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `PORT` | `3001` | Railway exposes this automatically; set it explicitly to avoid surprises |
| `NODE_ENV` | `production` | Critical — controls error detail level and logging |
| `AWS_REGION` | `ap-south-1` | Mumbai region (closest to Kashmir) |
| `AWS_ACCESS_KEY_ID` | from AWS IAM | |
| `AWS_SECRET_ACCESS_KEY` | from AWS IAM | |
| `S3_BUCKET_NAME` | `noteshub-kashmir-resources` | Your S3 bucket name |
| `ALLOWED_ORIGINS` | `https://your-site.netlify.app` | Your Netlify URL, no trailing slash. Comma-separate multiple origins. |

### Optional but strongly recommended

| Variable | Value | Notes |
|----------|-------|-------|
| `RAZORPAY_KEY_SECRET` | from Razorpay dashboard | Enables payment signature verification. Without this, signatures are skipped (unsafe in prod). |

---

## 4. Railway Service Configuration

### Build & Start Commands

In Railway → service → **Settings** → **Deploy**:

```
Root Directory:   backend
Build Command:    npm run build
Start Command:    node dist/server.js
```

Or add a `railway.json` in the `backend/` folder:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "node dist/server.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### Resource Limits (Hobby plan)

Railway Hobby gives 512MB RAM and shared CPU. Our app is light. Set in Railway → service → **Settings**:

- **Memory:** 512 MB (default is fine)
- **Sleep on idle:** Disable this — API must always be responsive

---

## 5. Database Setup on Railway

### Step 1: Add MySQL Plugin

Railway dashboard → **New** → **Database** → **MySQL** → Add to project.

### Step 2: Get the Connection URL

Click the MySQL service → **Connect** tab → copy the `DATABASE_URL` (format: `mysql://...`).

Append connection pool params:
```
mysql://user:pass@containers-us-west-XX.railway.app:3306/railway?connection_limit=10&pool_timeout=20&connect_timeout=10
```

### Step 3: Run Migrations

After first deploy, open Railway → service → **Shell** tab and run:

```bash
cd backend
npx prisma migrate deploy --schema=src/prisma/schema.prisma
```

Or push schema directly (simpler for first deploy):

```bash
npx prisma db push --schema=src/prisma/schema.prisma
```

### Step 4: Seed the Database (optional)

```bash
npm run db:seed
```

This creates the admin user, institutions, programs, subjects, and sample resources.

> **Admin credentials after seed:**
> - Email: `admin@noteshubkashmir.in`
> - Password: `Admin@1234!` ← **Change this immediately after first login**

---

## 6. First Deploy Steps

1. Push your code to GitHub (main branch)
2. Railway → **New Project** → **Deploy from GitHub repo**
3. Select your repo → set **Root Directory** to `backend`
4. Add all environment variables (Section 3)
5. Railway auto-detects Node.js and builds
6. After build: run migrations (Section 5, Step 3)
7. Visit `https://your-railway-app.up.railway.app/health` — should return `{ "success": true }`

---

## 7. Update Netlify Frontend to Point to Railway API

In your Netlify site → **Environment variables**, set:

```
VITE_API_URL=https://your-railway-app.up.railway.app
```

Then redeploy the Netlify frontend (`npm run build` or push to main).

---

## 8. S3 Bucket Configuration

### Bucket Policy (allow public read for PDFs)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::noteshub-kashmir-resources/*"
    }
  ]
}
```

### CORS Configuration (allow presigned URL uploads from Netlify)

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["https://your-site.netlify.app"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### IAM User Permissions (minimum required)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::noteshub-kashmir-resources/*"
    }
  ]
}
```

---

## 9. Razorpay Payment Link Setup

1. Razorpay dashboard → **Payment Links** → Create a link
2. Set amount (or let donor choose)
3. In **Callback URL**, set: `https://your-site.netlify.app/en/` (or a dedicated thank-you page)
4. In redirect, Razorpay appends these query params automatically:
   - `razorpay_payment_id`
   - `razorpay_payment_link_id`
   - `razorpay_payment_link_reference_id`
   - `razorpay_payment_link_status`
   - `razorpay_signature`
5. Your frontend reads these params and calls `POST /api/donors/thank` with them
6. The backend verifies the HMAC-SHA256 signature using `RAZORPAY_KEY_SECRET`

**Where to find the key secret:** Razorpay dashboard → **Account & Settings** → **API Keys** → `Key Secret`

---

## 10. Post-Deploy Security Checklist

- [ ] `NODE_ENV=production` is set (disables verbose Prisma query logs)
- [ ] `RAZORPAY_KEY_SECRET` is set (enables payment verification)
- [ ] `ALLOWED_ORIGINS` is set to your exact Netlify domain
- [ ] Admin password changed from default seed value
- [ ] Railway service URL is **not** publicly listed anywhere (API is backend-only)
- [ ] S3 bucket has no `s3:ListBucket` public permission
- [ ] Health endpoint works: `GET /health`
- [ ] Test a resource download (presigned URL flow)
- [ ] Test a donation flow end-to-end with a ₹1 test payment

---

## 11. Monitoring & Logs

Railway provides built-in logging. View in: Railway dashboard → your service → **Logs** tab.

Key log lines to watch for:
- `[server] NotesWebsite API running on port 3001` — startup success
- `[Unhandled Error]` — unexpected crash (fix immediately)
- `[server] Uncaught Exception` — process-level crash

---

## 12. Cost Estimate

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Railway (API + MySQL) | Hobby | $5/month (500 credits) |
| Netlify (Frontend) | Free | $0 |
| AWS S3 | Free tier (10 GB) | $0 for first year |
| Groq AI | Free tier | $0 |
| **Total** | | **~$5/month** |

First month: $0 (Railway $5 free credit covers it).

---

## 13. Updating the Deployment

Every push to `main` branch auto-deploys via Railway's GitHub integration. No manual steps needed after initial setup.

For database schema changes:
```bash
# After pushing schema changes to GitHub, open Railway Shell:
npx prisma migrate deploy --schema=src/prisma/schema.prisma
```
