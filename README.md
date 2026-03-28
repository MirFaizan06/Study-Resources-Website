# NotesHub Kashmir

**Free academic resources and community platform for Kashmiri university students.**
Notes, PYQs, Syllabi, AI-generated Guess Papers, and a Student Concerns Board — all in one place.

Built by **Hachi wa Studios**.

---

## What is this?

NotesHub Kashmir is a hyper-fast, SEO-optimized educational platform for students of Kashmir University, Cluster University Srinagar, GDC Sopore, and more. Students can:

- Browse resources by institution → program → subject
- Download Notes, Past Papers (PYQs), Syllabi, and Guess Papers for free
- Request materials that aren't available yet
- Contribute their own notes (pending admin approval)
- Post campus concerns on the Student Concerns Board and upvote community issues

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
| Auth | JWT (admin token + student token) |
| Validation | Zod |
| Deploy | Railway (backend) + Netlify (frontend) |

---

## Project Structure

```
NotesWebsite/
├── frontend/          # React + Vite app
├── backend/           # Express API
├── docs/              # Setup guides (AdSense, Razorpay, S3)
├── README.md
├── SETUP.md           # Full local + deployment setup guide
└── prompts.txt        # Gemini image prompts
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
- Filter resources by type (Notes, PYQ, Syllabus, Guess Paper) and subject category
- Search across all resources with debounced full-text search
- Download with one click (increments download counter)
- Share via Web Share API or clipboard copy
- Request missing materials via a simple form
- Contribute own notes (submitted as pending, reviewed by admin)

### Student Concerns Board
- Reddit-style community upvote system for real campus issues
- Image-only posts with title, description, and category
- Hot / New / Top sorting; category filter sidebar
- **Rate limits:** 1 post per week per user; 1 comment per post per user
- Guest browsing; account required to post, vote, or comment
- First-time guided tutorial (2 versions: guest and logged-in)
- Student accounts: Email, Password, University, College, Semester + optional profile pic

### For Admins
- Protected dashboard at `/[locale]/admin`
- Approve or reject community contributions
- Upload resources directly with S3 presigned URL
- View and fulfill student requests
- Board moderation: remove/restore posts and comments
- Platform stats: total resources, downloads, pending contributions, board activity

### Platform
- **i18n:** Path-based routing — `/en/`, `/ur/`, `/ks/`, `/hi/`, `/pa/`, `/doi/`
  - Only English ships; drop in translation files and the app auto-detects them
- **SEO:** Dynamic `<title>`, `<meta>`, OG tags per page; sitemap.xml; robots.txt
- **Dark / Light / Indigo / Emerald themes:** Persisted to localStorage, no FOUC
- **AI Disclaimer:** All AI-generated guess papers are prominently tagged
- **Google Ads:** AdSense-ready (slots in Home, Resources, Board feed + sidebar)
- **Google Analytics 4:** Stub in `index.html`
- **Donations:** Razorpay link in footer

---

## API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/institutions` | — | List institutions with program counts |
| GET | `/api/resources` | — | Search/filter resources (cursor-paginated) |
| POST | `/api/resources/upload` | Admin | Presigned S3 URL + create resource |
| POST | `/api/requests` | — | Student material request |
| POST | `/api/contribute` | — | Submit resource for approval |
| POST | `/api/auth/register` | — | Create student account |
| POST | `/api/auth/login` | — | Student login |
| GET | `/api/auth/me` | Student | Get current user |
| PATCH | `/api/auth/profile` | Student | Update profile |
| POST | `/api/auth/profile-pic-url` | Student | Get S3 presigned URL for avatar |
| GET | `/api/board/posts` | — | List posts (hot/new/top, category filter) |
| GET | `/api/board/posts/:id` | — | Get single post with comments |
| POST | `/api/board/posts/image-url` | Student | Presigned URL for post image |
| POST | `/api/board/posts` | Student | Create post (1/week limit) |
| POST | `/api/board/posts/:id/vote` | Student | Toggle upvote |
| DELETE | `/api/board/posts/:id` | Student/Admin | Soft-delete post |
| POST | `/api/board/posts/:id/comments` | Student | Add comment (1/post limit) |
| DELETE | `/api/board/posts/:id/comments/:id` | Student/Admin | Soft-delete comment |
| POST | `/api/board/posts/:id/comments/:id/vote` | Student | Toggle comment upvote |
| GET | `/api/admin/*` | Admin | Admin dashboard routes |

---

## Resource Naming Convention

| Type | Format | Example |
|---|---|---|
| Notes | `[Category] - [Topic] - [Subject] \| Semester [N]` | `Major - Programming with C - Computer Applications \| Semester 2` |
| Syllabus | `[Category] - Syllabus - [Subject] \| Semester [N]` | `Major - Syllabus - Data Structures \| Semester 3` |
| PYQ | `[Category] - PYQ [Year] - [Subject] \| Semester [N]` | `Major - PYQ 2024 - Operating Systems \| Semester 4` |

**Subject Categories:** Major · Minor · MD · AEC · VAC · SEC

---

## Localization

Drop locale files into `frontend/src/i18n/locales/` — the app auto-detects them.

Supported language codes: `en` (default), `ur`, `ks`, `hi`, `pa`, `doi`

See `GEMINI_LOCALIZATION_PROMPT.md` for a ready-made Gemini prompt to generate translation files.

---

## Setup Docs

| Guide | Path |
|---|---|
| Amazon S3 | [docs/AMAZON_S3_SETUP.md](docs/AMAZON_S3_SETUP.md) |
| Google AdSense | [docs/ADSENSE_SETUP.md](docs/ADSENSE_SETUP.md) |
| Razorpay Donations | [docs/RAZORPAY_SETUP.md](docs/RAZORPAY_SETUP.md) |
| Full setup & deploy | [SETUP.md](SETUP.md) |

---

## License

© 2026 Hachi wa Studios. All rights reserved.
