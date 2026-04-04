Here is the updated project specification. I've integrated the localization requirements directly into the technical directives, ensuring the architecture supports path-based routing (`/en/`, `/ur/`) while keeping the implementation simple and saving your token limits by only requesting the English locale file. 

***

# Project Overview: Educational Resource Hub for Kashmiri Students
**Developer Entity:** Hachi wa Studios
**Target Audience:** Students in Kashmir (starting with university/college level, built to scale to high schools). 
**Core Mission:** Provide a hyper-fast, SEO-optimized, and highly accessible platform for Notes, PYQs (Previous Year Questions), Syllabi, and AI-Generated Guess Papers. 

## 1. Architectural Philosophy & Scalability
This project must be engineered for extreme scalability and modularity. In the future, new modules (e.g., "High Schools", "Competitive Exams", "Video Lectures") will be added.
* **Decoupled & Modular:** Treat the frontend and backend as independent entities connected by a strictly typed API.
* **Entity-Driven Hierarchy:** The core taxonomy relies on `Institution` (e.g., Kashmir University, Cluster University Srinagar) -> `Degree/Course` -> `Semester/Year` -> `Subject` -> `Resource Type`.
* **Database First, No Redis:** Because we are avoiding paid in-memory caching layers like Redis, the backend must rely on hyper-optimized MySQL queries via Prisma. You must implement robust indexing, cursor-based pagination for large datasets, and strategic application-level memoization where strictly necessary and memory-safe.
* **Modern 2026 Standards:** Utilize the latest stable features of React, Node.js, and CSS. Ensure no deprecated libraries or obsolete patterns are used.

## 2. Tech Stack & Infrastructure
* **Frontend:** React (TypeScript) via Vite or React Router v7 (for robust SSR/SEO).
* **Styling:** Custom SASS/SCSS (CSS Modules). **NO TAILWIND.** Write super responsive, modern CSS using Grid, Flexbox, Container Queries, and CSS variables for theming.
* **Animations:** Framer Motion (or equivalent lightweight motion library) for subtle, performant page transitions and micro-interactions.
* **Icons:** `lucide-react` or `react-icons`. **Strictly NO emojis** in the UI.
* **Backend:** Node.js framework (Express or Fastify) written in strict TypeScript. Deploying on Railway.
* **Database:** MySQL with Prisma ORM.
* **Storage:** Amazon S3 (exclusively for storing PDF resources and lightweight image assets like organization logos).
* **Monetization/Funding:** Integrated Google Ads (non-intrusive placements) and a secure, simple donation workflow (e.g., Razorpay/Stripe payment link integration) to cover server fees.

## 3. Database Schema Blueprint (Prisma)
Design the schema to be highly relational and indexed. Core models should include:
* `User`: (Optional registration). ID, email, name, role (STUDENT, ADMIN, CONTRIBUTOR), createdAt.
* `Institution`: ID, name (e.g., "Kashmir University"), slug, type (UNIVERSITY, COLLEGE, SCHOOL).
* `Program`: ID, name (e.g., "BCA", "B.Tech"), institutionId.
* `Subject`: ID, name, programId, semester.
* `Resource`: ID, title, type (NOTE, PYQ, SYLLABUS, GUESS_PAPER), fileUrl (S3 link), subjectId, uploaderId, downloadsCount, isApproved (boolean for contributions), createdAt.
* `Request`: ID, studentName, requestedMaterial, status (PENDING, FULFILLED), createdAt.
* *Note on Guess Papers:* Add a specific boolean or metadata tag to explicitly flag AI-generated guess papers so the UI can render a mandatory disclaimer.

## 4. Frontend: Page-by-Page Specifications
The UI/UX must be excellent, fast, and optimized for mobile devices (which the vast majority of the target demographic will use).

* **Global Layout:** Minimalist, clean navigation. Global search bar (debounced, optimized). Footer with donation links, "Built by Hachi wa Studios", and legal disclaimers.
* **Home Page:** * Dynamic hero section.
    * Quick navigation cards by University (Kashmir University, Cluster University, etc.).
    * "Recently Added" and "Most Downloaded" resource carousels.
* **Institution/Program Hub:** Displays semesters and subjects cleanly. Breadcrumb navigation is mandatory for UX and SEO.
* **Resource Listing Page:**
    * Robust filtering (by Resource Type, Year, Semester) and sorting (Newest, Popular).
    * Clear, native-feeling cards for each resource.
    * If a resource is an "AI Guess Paper", it must feature a highly visible, styled disclaimer tag stating: *"AI-Generated: Rough idea only, not 100% reliable."*
* **Resource View/Download Modal:** PDF preview option (if performant) or direct download link. Native Web Share API integration for mobile sharing.
* **Request Materials Page:** Simple form for students to ask for specific notes.
* **Contribute Page:** Form for users to upload PDFs. Must require title, university, subject, and resource type. Submissions go to a "pending" state for admin approval.
* **Admin Panel (Protected Route):**
    * Simple dashboard with key metrics (total downloads, active requests).
    * Table view of user contributions to Approve/Reject.
    * Form to manually upload new resources directly to S3 and add to the database.
    * Table view to manage and mark student `Requests` as fulfilled.

## 5. Backend: Module Breakdown & APIs
Ensure all API routes are strictly typed, validated (e.g., using Zod), and rate-limited to prevent abuse.

* `GET /api/institutions`: Fetch hierarchical data. Use optimized SQL joins to prevent N+1 query problems.
* `GET /api/resources`: The heavy-lifter. Must support advanced querying (search terms, filtering by institution/subject/type, sorting) with cursor-based pagination.
* `POST /api/resources/upload`: Admin or Contributor upload endpoint. Must handle secure presigned URLs to S3 to offload file upload bandwidth from the Railway server.
* `POST /api/requests`: Endpoint for students to request notes.
* `POST /api/contribute`: Endpoint for students to submit resources (defaults to `isApproved: false`).
* `GET /api/admin/*`: Protected routes for admin operations. Implement simple, secure JWT or session-based authentication.

## 6. Create prompts for images/illustrations to use in website, using Gemini.
Create prompts.txt for gemini prompts to use images in our website for increasing content and nice ui/ux. plan it from start only where to use, so that when i add images in public folder, they just get added easily.
Also create nice hero section for home page with cta, about page too. 

## 7. Technical & Non-Technical Directives for AI Generation
* **SEO Mastery:** Implement dynamic `<title>`, `<meta name="description">`, and Open Graph tags for every single page. Use semantic HTML5 (`<article>`, `<section>`, `<nav>`, `<aside>`).
* **CSS Architecture:** Structure SASS thoughtfully. Use an `abstracts` folder for variables/mixins, `base` for resets, and module-specific files. Ensure perfect contrast ratios and modern touch-target sizes for mobile.
* **S3 Upload Flow:** Implement the "Presigned URL" pattern. The client requests an upload URL from the backend, then uploads the PDF directly to S3. This keeps the backend fast and unburdened by multipart form parsing for large files.
* **Localization (i18n) Architecture [IMPORTANT]:** Implement simple, path-based routing for localization supporting English (en - Default), Urdu (ur), Kashmiri (ks), Hindi (hi), and Punjabi (pa). The URL structure must follow the pattern `www.website.netlify.app/en/` or `www.website.netlify.app/ur/`. 
    * **Constraint:** Do not complicate things. Keep the i18n implementation incredibly straightforward.
    * **Resource Saving:** To save generation tokens, **only create the `en` (English) locale file/dictionary**. Write the localization logic in such a way that when I manually generate and drop in the translation files for the other languages later, the application automatically detects and reflects them without requiring any structural code changes.
* **Error Handling:** Implement global error boundaries on the frontend and global error middleware on the backend. No raw database errors should ever leak to the client.
* **Execution:** When generating code, create the folder structure first. Then, build the database schema. Then, write the backend core. Finally, build the frontend components iteratively. Do not use placeholder data; mock realistic 2026 academic data for Kashmir institutions during development testing.

***

Let me know if you'd like to adjust any of the wording or add specific technical libraries (like `react-i18next`) to the prompt before you pass it on!