# Full Setup Guide — NotesHub Kashmir

Step-by-step instructions to run the project locally and deploy to production.

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20+ |
| npm | 10+ |
| MySQL | 8.0+ |
| Git | any |

---

## 1. Clone & Root Setup

```bash
git clone https://github.com/MirFaizan06/Study-Resources-Website.git
cd Study-Resources-Website
npm install       # installs root workspace + concurrently
```

---

## 2. Backend Setup

### 2a. Environment Variables

```bash
cd backend
cp ../env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL="mysql://YOUR_USER:YOUR_PASSWORD@localhost:3306/noteshubkashmir"
JWT_SECRET="minimum-32-character-random-string-here"
PORT=3001
NODE_ENV=development

# AWS S3
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="noteshub-kashmir-resources"

# CORS (production only — comma-separated)
ALLOWED_ORIGINS="https://noteshubkashmir.in,https://www.noteshubkashmir.in"
```

### 2b. Database

Create your MySQL database:
```sql
CREATE DATABASE noteshubkashmir CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run Prisma:
```bash
npm run db:generate    # generates Prisma client from schema
npm run db:push        # pushes schema to DB (dev) — use db:migrate in prod
npm run db:seed        # seeds institutions, programs, subjects, resources, admin user
```

**Seed creates:**
- 3 institutions (Kashmir University, Cluster University Srinagar, GDC Sopore)
- 6 programs, 36 subjects with semester + category info
- ~250 sample resources (approved, ready to browse)
- Admin user: `admin@noteswebsite.com` / `Admin@123`

### 2c. AWS S3

1. Create an S3 bucket in the AWS console
2. Set the bucket to allow public read on uploaded resources:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
     }]
   }
   ```
3. Create an IAM user with `AmazonS3FullAccess` (or a scoped policy for just this bucket)
4. Generate access keys and put them in `.env`

### 2d. Run Backend

```bash
npm run dev    # ts-node-dev, hot reload on port 3001
```

Health check: `http://localhost:3001/health`

---

## 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

Install and run:
```bash
npm install
npm run dev    # Vite dev server on port 5173
```

Open: `http://localhost:5173/en/`

---

## 4. Running Both Together (from root)

```bash
# From NotesWebsite/ root
npm run dev    # starts backend + frontend in parallel
```

---

## 5. Admin Panel

- URL: `http://localhost:5173/en/admin/login`
- Email: `admin@noteswebsite.com`
- Password: `Admin@123`

**Change the admin password in production** by updating the bcrypt hash in the database or re-running the seed with a new password.

---

## 6. Adding Localization Files

See [GEMINI_LOCALIZATION_PROMPT.md](GEMINI_LOCALIZATION_PROMPT.md) for the Gemini prompt.

Once you have a translation file (e.g., Urdu):
1. Save it as `frontend/src/i18n/locales/ur.ts`
2. No code changes needed — the app detects it automatically
3. Users navigating to `/ur/` will see the Urdu UI

---

## 7. Google Ads Setup

1. Apply for Google AdSense at `adsense.google.com`
2. Once approved, get your **Publisher ID** (`ca-pub-XXXXXXXXXXXXXXXX`)
3. Open `frontend/index.html` and uncomment the AdSense script block, replacing the placeholder ID
4. Open `frontend/src/components/common/AdBanner/index.tsx` and replace `ca-pub-XXXXXXXXXXXXXXXX`
5. Replace the ad slot numbers in:
   - `frontend/src/pages/Home/index.tsx` (2 ad slots)
   - `frontend/src/pages/Resources/index.tsx` (1 ad slot)

Ad slots are positioned non-intrusively between content sections.

---

## 8. Google Analytics 4 Setup

1. Go to `analytics.google.com` → create a new GA4 property
2. Get your **Measurement ID** (`G-XXXXXXXXXX`)
3. Open `frontend/index.html` and uncomment the GA4 script block, replacing the placeholder ID

---

## 9. Donation Setup (Razorpay)

1. Create a Razorpay account at `razorpay.com`
2. Create a Payment Link for donations
3. Open `frontend/src/components/common/Footer/index.tsx`
4. Replace `https://rzp.io/l/noteshub-kasmir` with your actual Razorpay payment link

---

## 10. Production Deployment

### Backend → Railway

1. Push code to GitHub
2. Connect repo in [Railway](https://railway.app)
3. Add environment variables in Railway dashboard (same as `.env`)
4. Railway auto-detects Node.js — set start command: `npm run start`
5. Add a MySQL database service in Railway (or use PlanetScale/Aiven)
6. Run migrations: `npm run db:migrate` (Railway shell or CI)

### Frontend → Netlify

1. Connect repo in [Netlify](https://netlify.com)
2. Build command: `npm run build` (from `frontend/` directory)
3. Publish directory: `frontend/dist`
4. Add environment variable: `VITE_API_BASE_URL=https://your-railway-app.railway.app/api`
5. Add a `frontend/public/_redirects` file for SPA routing:
   ```
   /* /index.html 200
   ```

---

## 11. Netlify Redirects (Required for SPA)

Create this file so path-based routing works on Netlify:

```
# frontend/public/_redirects
/*    /index.html   200
```

---

## 12. Environment Summary

| Variable | Where | Description |
|---|---|---|
| `DATABASE_URL` | backend/.env | MySQL connection string |
| `JWT_SECRET` | backend/.env | Min 32 chars, random |
| `PORT` | backend/.env | Default 3001 |
| `AWS_REGION` | backend/.env | e.g. `ap-south-1` |
| `AWS_ACCESS_KEY_ID` | backend/.env | IAM user key |
| `AWS_SECRET_ACCESS_KEY` | backend/.env | IAM user secret |
| `S3_BUCKET_NAME` | backend/.env | Your S3 bucket name |
| `ALLOWED_ORIGINS` | backend/.env | Prod: your frontend domain |
| `VITE_API_BASE_URL` | frontend/.env | Backend API base URL |

---

## 13. Post-Launch Checklist

- [ ] Change admin password from default `Admin@123`
- [ ] Set `NODE_ENV=production` in backend
- [ ] Add real `ALLOWED_ORIGINS` in backend `.env`
- [ ] Uncomment Google AdSense in `index.html` with real Publisher ID
- [ ] Uncomment Google Analytics 4 in `index.html` with real Measurement ID
- [ ] Replace Razorpay link in Footer with real payment link
- [ ] Add institution logo images (use filenames from `prompts.txt`)
- [ ] Generate and add favicon (use prompts in `prompts.txt`)
- [ ] Generate translation files using `GEMINI_LOCALIZATION_PROMPT.md`
- [ ] Add `frontend/public/_redirects` file for Netlify SPA routing
- [ ] Update `sitemap.xml` with real institution/program URLs after seeding prod DB
- [ ] Verify `robots.txt` is accessible at your domain
- [ ] Test all pages on mobile
