# NotesHub Kashmir

**Free academic resources for Kashmiri university students.**
Notes, PYQs, Syllabi, and AI-generated Guess Papers — all in one place.

Built by **Hachi wa Studios**.

---

## What is this?

NotesHub Kashmir is a hyper-fast, SEO-optimized educational platform for students of Kashmir University, Cluster University Srinagar, GDC Sopore, and more. Students can:

- Browse resources by institution → program → subject
- Download Notes, Past Papers (PYQs), Syllabi, and Guess Papers for free
- Request materials that aren't available yet
- Contribute their own notes (pending admin approval)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Custom SCSS (CSS Modules) — no Tailwind |
| Animations | Framer Motion |
| Icons | lucide-react |
| Backend | Node.js + Express + TypeScript |
| Database | MySQL + Prisma ORM |
| Storage | Amazon S3 (presigned URL pattern) |
| Auth | JWT |
| Validation | Zod |
| Deploy | Railway (backend) + Netlify (frontend) |

---

## Project Structure

```
NotesWebsite/
├── frontend/          # React + Vite app
├── backend/           # Express API
├── README.md
├── SETUP.md           # Full setup guide
├── GEMINI_LOCALIZATION_PROMPT.md   # For generating translation files
├── prompts.txt        # Gemini image + icon prompts
└── .env.example
```

---

## Quick Start

See [SETUP.md](SETUP.md) for the full step-by-step setup guide.

**TL;DR:**
```bash
# Backend
cd backend
cp .env.example .env  # fill in DB, S3, JWT values
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev           # runs on port 3001

# Frontend
cd frontend
cp .env.example .env  # set VITE_API_BASE_URL
npm install
npm run dev           # runs on port 5173
```

Admin login: `admin@noteswebsite.com` / `Admin@123`

---

## Features

### For Students
- Browse by institution → degree program → semester → subject
- Filter resources by type (Notes, PYQ, Syllabus, Guess Paper) and subject category (Major, Minor, AEC, VAC, MD, SEC)
- Search across all resources with debounced full-text search
- Download with one click (increments download counter)
- Share via Web Share API or clipboard copy
- Request missing materials via a simple form
- Contribute own notes (submitted as pending, reviewed by admin)

### For Admins
- Protected dashboard at `/[locale]/admin`
- Approve or reject community contributions
- Upload resources directly with S3 presigned URL (no server upload bottleneck)
- View and fulfill student requests
- Platform stats: total resources, downloads, pending contributions

### Platform
- **i18n:** Path-based routing — `/en/`, `/ur/`, `/ks/`, `/hi/`, `/pa/`
  - Only English is shipped; other languages auto-detect when you drop translation files in
- **SEO:** Dynamic `<title>`, `<meta>`, OG tags per page; sitemap.xml; robots.txt
- **Dark / Light theme:** Persisted to localStorage, no FOUC
- **AI Disclaimer:** All AI-generated guess papers are prominently tagged
- **Google Ads:** Placement-ready (uncomment in `index.html` after AdSense approval)
- **Google Analytics 4:** Stub in `index.html` (uncomment after setting up GA4)
- **Donations:** Razorpay link in footer

---

## Resource Naming Convention

When uploading or contributing, use this format:

| Type | Format | Example |
|---|---|---|
| Notes | `[Category] - [Topic] - [Subject] \| Semester [N]` | `Major - Programming with C - Computer Applications \| Semester 2` |
| Syllabus | `[Category] - Syllabus - [Subject] \| Semester [N]` | `Major - Syllabus - Data Structures \| Semester 3` |
| PYQ | `[Category] - PYQ [Year] - [Subject] \| Semester [N]` | `Major - PYQ 2024 - Operating Systems \| Semester 4` |

**Subject Categories:** Major · Minor · MD · AEC · VAC · SEC

---

## Localization

See [GEMINI_LOCALIZATION_PROMPT.md](GEMINI_LOCALIZATION_PROMPT.md) to generate translation files using Gemini.

Drop files into `frontend/src/i18n/locales/` — the app auto-detects them.

Supported language codes: `en`, `ur`, `ks`, `hi`, `pa`

---

## License

© 2026 Hachi wa Studios. All rights reserved.
