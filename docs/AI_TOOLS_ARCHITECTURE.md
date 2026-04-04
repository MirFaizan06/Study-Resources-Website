# AI Tools Architecture — Hachi wa Studios Notes Hub

> **Document purpose:** Full technical + product design spec for the Gen AI feature suite.
> **Status:** Planning / Pre-implementation
> **Last updated:** 2026-03-29

---

## Table of Contents

1. [Big Picture & Provider Decision](#1-big-picture--provider-decision)
2. [The Four Tools — Product Overview](#2-the-four-tools--product-overview)
3. [Subscription & Rate-Limit Model](#3-subscription--rate-limit-model)
4. [Database Schema Additions](#4-database-schema-additions)
5. [Backend Architecture](#5-backend-architecture)
6. [Frontend Architecture & UI/UX](#6-frontend-architecture--uiux)
7. [Resource Integration from DB](#7-resource-integration-from-db)
8. [API Reference](#8-api-reference)
9. [Payment Flow (Razorpay)](#9-payment-flow-razorpay)
10. [Security & Abuse Prevention](#10-security--abuse-prevention)
11. [Rollout Strategy](#11-rollout-strategy)

---

## 1. Big Picture & Provider Decision

### Why Not Self-Host a Model?

Self-hosting (Ollama on Railway, etc.) requires a GPU-tier machine — Railway's GPU add-on costs ~$0.001/GPU-second, which becomes expensive under any real load. For a student-focused site in Kashmir this is not viable.

### Recommended Provider: Groq

**Groq** runs open-source models (Llama 3.3 70B, Mixtral 8x7B) on dedicated inference hardware.

| Attribute | Detail |
|---|---|
| Cost | Free tier: 30 req/min, 6000 req/day — zero dollars |
| Speed | ~500 tokens/second (fastest available publicly) |
| Models | `llama-3.3-70b-versatile` (best), `llama-3.1-8b-instant` (fallback) |
| Privacy | Data not used for training |
| SDK | `groq` npm package (drop-in) |
| Swap-out | The service layer abstracts the provider — swap to Claude/OpenAI/Together AI by changing one env var and one adapter file |

**Why not Gemini?** Cost and vendor lock-in. Gemini Flash free tier has aggressive rate limits and adds Google billing dependency.

**Fallback chain:** `llama-3.3-70b-versatile` → `llama-3.1-8b-instant` → 503 with friendly message.

### Provider Abstraction Pattern

```
backend/src/ai/
  provider.ts          ← interface: generateText(prompt, options) → string
  groq.adapter.ts      ← implements provider using Groq SDK
  mock.adapter.ts      ← deterministic fake for tests/dev
  index.ts             ← reads AI_PROVIDER env var, exports active adapter
```

Swapping providers = change `AI_PROVIDER=groq` to `AI_PROVIDER=claude` and add `claude.adapter.ts`. Zero other changes.

---

## 2. The Four Tools — Product Overview

### Tool A — AI Guess Paper Generator

**What it does:** Analyses a syllabus or past-paper PDF (already in our S3/DB) and returns a ranked list of likely exam questions with confidence scores.

**Input options:**
- Pick a subject from our DB (syllabus/PYQ resources auto-loaded)
- Or paste raw text (fallback for content we don't have yet)
- Specify exam type: End Semester / Internal / Practical Viva

**Output structure:**
```
Section A (Short Questions)       [2–5 marks each]
  Q1. [Question text]             Likelihood: ███████░░░ High
  Q2. ...

Section B (Long Questions)        [8–15 marks each]
  Q1. ...

Important Topics / Key Definitions
  - [Term]: [one-line definition]
```

**Prompt engineering strategy:**
- System prompt: "You are an experienced Kashmir University exam setter. Given syllabus content and past papers, generate a realistic guess paper..."
- Temperature: 0.7 (creative enough to not just repeat past papers)
- Max tokens: ~2000 (one full guess paper)

---

### Tool B — Mock Examiner

**What it does:** Conducts a full exam session. Asks questions one-by-one, evaluates answers, gives per-question scores, running total, and a final report with explanations.

**Session lifecycle:**
```
1. User configures exam (subject, # of questions, difficulty, time limit)
2. AI generates question bank (stored server-side for the session)
3. User is presented Question 1 — types or speaks answer
4. On submit: AI evaluates, shows score (0-10) + explanation
5. Next question loads — timer continues
6. After all questions: Final Report page
```

**Grading rubric the AI uses:**
- Factual correctness (0–5 pts)
- Completeness / coverage of key points (0–3 pts)
- Clarity (0–2 pts)
- Always returns `score`, `feedback`, `correct_answer`, `key_points_missed`

**Confidence tracking:** After each answer, user optionally rates their own confidence (Not sure / Somewhat sure / Very sure). Stored per-question. Final report shows calibration: were they confident when they were wrong? This is the "tracks confidence over time" feature.

**Session persistence:** Sessions are saved to DB so users can resume if they close the tab. Sessions expire after 48 hours.

---

### Tool C — Smart Notes Summariser

**What it does:** Takes dense lecture notes (uploaded PDF from our DB, pasted text, or manually uploaded PDF) and returns a structured exam-ready summary.

**Output format:**
```
## Topic: [Auto-detected topic name]

### Key Concepts
- [Concept]: [One-sentence definition]
- ...

### Important Formulas / Laws
- [Name]: [Formula or rule]

### Memory Hooks
- Remember [X] as: [Analogy / mnemonic]

### 5 Most Likely Exam Questions from This Content
1. ...
```

**Chunking strategy for large PDFs:** If extracted text > 8000 tokens, split into semantic chunks (by heading/section), summarise each chunk independently, then run a "meta-summarise" pass to merge. All handled server-side transparently.

---

### Tool D — Last-Minute Prep Mode

**What it does:** User says "I have 30 minutes and my exam is on Operating Systems." The AI builds a personalised crash-plan — prioritised topics, what to read, what to skip, quick-fire definitions.

**Input:**
- Subject (from our DB or free text)
- Time available (5 min / 15 min / 30 min / 1 hour)
- Self-assessed weak areas (optional multi-select from syllabus topics)

**Output: a timed action plan:**
```
[Your 30-Minute Crash Plan: Operating Systems]

 0–8 min   → Read: Process Scheduling (FCFS, SJF, Round Robin)
            Focus: Be able to draw Gantt charts
            Skip: Priority aging algorithm (rarely asked, complex)

 8–15 min  → Read: Memory Management + Paging
            Key formula: Physical Address = Frame No × Page Size + Offset
            Skip: Segmentation vs Paging deep-dive

15–22 min  → Read: Deadlock (4 conditions + Banker's Algorithm)
            Memory hook: "HMWC" — Hold, Mutual, Wait, Circular

22–28 min  → Flash revision: File Systems (FAT, inode)

28–30 min  → Re-read your own weak areas: [shows what user flagged]

Likely Questions (pick 2–3 to prep answers for):
  1. ...
  2. ...
```

**Personalisation lever:** If the user has done a Mock Exam session for this subject before, the system looks up their low-scoring topics and automatically adds them to weak areas. This is the key data-loop between tools.

---

## 3. Subscription & Rate-Limit Model

### Tiers

| Feature | Free | Pro (₹199/month) |
|---|---|---|
| Guess Paper Generator | 1 per week | 25 per month |
| Mock Examiner | 1 session per week | 25 sessions per month |
| Smart Notes Summariser | 1 per week | 25 per month |
| Last-Minute Prep | 1 per week | 25 per month |
| **Shared pool?** | **Yes — 1 AI prompt/week total** | **No — 25 per tool per month** |
| Session resume | No (restarts on reload) | Yes (48-hour resume) |
| History / past results | No | Yes (last 30 sessions) |
| PDF upload (own notes) | No | Yes |
| Ad-free | No | Yes |

> **Implementation note:** "1 prompt per week" means 1 across ALL tools combined for free users. This is easier to enforce and prevents gaming by switching tools.

### Rate-Limit Implementation (No Redis)

Rate limits are enforced at the database level using the `AIUsage` table.

**Free user check (pseudo-SQL):**
```sql
SELECT COUNT(*) FROM AIUsage
WHERE userId = ?
  AND createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
```
If count >= 1 → reject with 429.

**Pro user check:**
```sql
SELECT COUNT(*) FROM AIUsage
WHERE userId = ?
  AND toolType = ?
  AND createdAt >= DATE_TRUNC('month', NOW())
```
If count >= 25 → reject with 429.

**Anonymous users:** Rate-limited by IP address using a lightweight in-memory counter (Map + setInterval flush every 24h). Limit: 0 completions — must log in. Can see UI but not run tools.

### Quota Reset Logic

- Free users: rolling 7-day window (no cron needed — just check timestamp diff at request time)
- Pro users: resets on billing anniversary date (stored in `Subscription.currentPeriodStart`)

---

## 4. Database Schema Additions

Add to `prisma/schema.prisma`:

```prisma
// ─── Subscriptions ──────────────────────────────────────────────────────────

model Subscription {
  id                  String            @id @default(cuid())
  userId              String            @unique
  user                User              @relation(fields: [userId], references: [id])
  plan                SubscriptionPlan  @default(FREE)
  status              SubStatus         @default(ACTIVE)
  razorpaySubId       String?           // Razorpay subscription ID
  currentPeriodStart  DateTime
  currentPeriodEnd    DateTime
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  @@index([userId])
  @@index([status])
}

enum SubscriptionPlan {
  FREE
  PRO
}

enum SubStatus {
  ACTIVE
  CANCELLED
  PAST_DUE
  PAUSED
}

// ─── AI Usage Log ────────────────────────────────────────────────────────────

model AIUsage {
  id           String      @id @default(cuid())
  userId       String
  user         User        @relation(fields: [userId], references: [id])
  toolType     AIToolType
  tokensUsed   Int
  modelUsed    String      // e.g. "llama-3.3-70b-versatile"
  subjectId    String?     // which subject resource was used
  createdAt    DateTime    @default(now())

  @@index([userId, createdAt])      // for rate-limit queries
  @@index([userId, toolType, createdAt])
}

enum AIToolType {
  GUESS_PAPER
  MOCK_EXAM
  SUMMARISER
  LASTMINUTE_PREP
}

// ─── Mock Exam Sessions ───────────────────────────────────────────────────────

model MockExamSession {
  id             String              @id @default(cuid())
  userId         String
  user           User                @relation(fields: [userId], references: [id])
  subjectId      String?
  subjectName    String              // denormalised for display
  status         ExamStatus          @default(IN_PROGRESS)
  totalQuestions Int
  timeLimit      Int                 // seconds
  startedAt      DateTime            @default(now())
  finishedAt     DateTime?
  finalScore     Float?              // 0.0 – 10.0
  answers        MockExamAnswer[]
  expiresAt      DateTime            // startedAt + 48h for pro, +2h for free

  @@index([userId, status])
  @@index([expiresAt])              // for cleanup cron
}

enum ExamStatus {
  IN_PROGRESS
  COMPLETED
  ABANDONED
  EXPIRED
}

model MockExamAnswer {
  id              String           @id @default(cuid())
  sessionId       String
  session         MockExamSession  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  questionIndex   Int
  questionText    String           @db.Text
  userAnswer      String           @db.Text
  aiScore         Float            // 0–10
  aiFeedback      String           @db.Text
  correctAnswer   String           @db.Text
  keyPointsMissed String           @db.Text     // JSON array stored as text
  userConfidence  ConfidenceLevel?
  answeredAt      DateTime         @default(now())

  @@index([sessionId])
}

enum ConfidenceLevel {
  LOW
  MEDIUM
  HIGH
}

// ─── AI History (Pro only) ────────────────────────────────────────────────────

model AIResult {
  id          String      @id @default(cuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  toolType    AIToolType
  title       String      // e.g. "Guess Paper — BCA Sem 4 OS"
  inputHash   String      // SHA-256 of input — for dedup / caching
  output      String      @db.LongText
  subjectId   String?
  createdAt   DateTime    @default(now())

  @@index([userId, toolType, createdAt])
  @@index([inputHash])              // cache lookups — same input = return stored output
}
```

**User model additions** (extend existing):
```prisma
// Add to existing User model:
subscription    Subscription?
aiUsages        AIUsage[]
mockSessions    MockExamSession[]
aiResults       AIResult[]
```

---

## 5. Backend Architecture

### Folder Structure

```
backend/src/
  ai/
    provider.ts              ← LLMProvider interface
    groq.adapter.ts          ← Groq SDK adapter
    mock.adapter.ts          ← Test adapter
    index.ts                 ← Factory: exports active provider
    prompts/
      guessPaper.prompt.ts   ← System + user prompt builders
      mockExam.prompt.ts
      summariser.prompt.ts
      lastMinute.prompt.ts
    chunker.ts               ← Text chunking for large PDFs
    extractor.ts             ← PDF text extraction (pdfjs or pdf-parse)

  modules/
    ai/
      ai.router.ts           ← Express router: /api/ai/*
      ai.controller.ts       ← Request handling, rate-limit checks
      ai.service.ts          ← Business logic, DB writes
      ai.schema.ts           ← Zod validation schemas
      ai.ratelimit.ts        ← Rate-limit check helpers

    subscriptions/
      subscription.router.ts
      subscription.controller.ts
      subscription.service.ts     ← Razorpay webhook handling
      subscription.schema.ts
```

### Core Service: `ai.service.ts`

```typescript
// Simplified skeleton — shows the key concerns

export class AIService {

  async runGuessPaper(userId: string, input: GuessPaperInput): Promise<string> {
    await this.assertQuota(userId, AIToolType.GUESS_PAPER);

    const context = await this.buildContext(input);   // fetch from DB if subjectId given
    const cached  = await this.checkCache(input);     // sha256 of context+options
    if (cached) return cached.output;

    const prompt  = buildGuessPaperPrompt(context, input);
    const output  = await llm.generateText(prompt, { maxTokens: 2000, temperature: 0.7 });

    await this.logUsage(userId, AIToolType.GUESS_PAPER, output.tokensUsed);
    await this.saveResult(userId, AIToolType.GUESS_PAPER, input, output.text);

    return output.text;
  }

  private async assertQuota(userId: string, tool: AIToolType): Promise<void> {
    const subscription = await db.subscription.findUnique({ where: { userId } });
    const plan = subscription?.plan ?? 'FREE';

    if (plan === 'FREE') {
      const weeklyCount = await db.aIUsage.count({
        where: { userId, createdAt: { gte: subDays(new Date(), 7) } }
      });
      if (weeklyCount >= 1) throw new QuotaExceededError('free_weekly');
    } else {
      const monthlyCount = await db.aIUsage.count({
        where: { userId, toolType: tool,
                 createdAt: { gte: subscription.currentPeriodStart } }
      });
      if (monthlyCount >= 25) throw new QuotaExceededError('pro_monthly');
    }
  }

  private async checkCache(input: object): Promise<AIResult | null> {
    const hash = sha256(JSON.stringify(input));
    return db.aIResult.findFirst({ where: { inputHash: hash } });
    // Same input from ANY user returns cached result — saves tokens & cost
  }
}
```

### PDF Text Extraction

For resources already in our S3:
1. Download PDF buffer from S3 presigned URL (backend-side, never exposed to client)
2. Extract text with `pdf-parse` (lightweight, no native deps)
3. Truncate / chunk if > 8000 tokens

```
backend/src/ai/extractor.ts
  extractTextFromS3Pdf(fileUrl: string): Promise<string>
  extractTextFromBuffer(buffer: Buffer): Promise<string>
```

### Streaming Responses

For tools that produce long output (Guess Paper, Summary), use **Server-Sent Events (SSE)** so the user sees text streaming in — feels instant, prevents timeout on long generations.

```
GET /api/ai/guess-paper/stream  → text/event-stream
GET /api/ai/summarise/stream    → text/event-stream
```

Mock Exam uses regular JSON (per-question requests are short).

---

## 6. Frontend Architecture & UI/UX

### Route Structure

```
/[lang]/ai                     ← AI Hub landing (shows all 4 tools)
/[lang]/ai/guess-paper         ← Tool A
/[lang]/ai/mock-exam           ← Tool B landing
/[lang]/ai/mock-exam/[sessionId] ← Active session
/[lang]/ai/mock-exam/[sessionId]/report ← Final report
/[lang]/ai/summariser          ← Tool C
/[lang]/ai/last-minute         ← Tool D
/[lang]/ai/history             ← Pro: past results
/[lang]/pricing                ← Plans page
```

### AI Hub Landing (`/ai`)

Four large feature cards in a 2×2 grid (collapses to 1-column on mobile):

```
┌─────────────────────┐  ┌─────────────────────┐
│  [Sparkles icon]    │  │  [PenLine icon]      │
│  Guess Paper        │  │  Mock Examiner       │
│  Generator          │  │                      │
│                     │  │                      │
│  "Upload syllabus   │  │  "Get quizzed in     │
│  or pick a subject  │  │  exam format. AI     │
│  → ranked likely    │  │  grades and          │
│  questions"         │  │  explains."          │
│                     │  │                      │
│  [Try it →]         │  │  [Start Exam →]      │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│  [BookOpen icon]    │  │  [Zap icon]          │
│  Smart Notes        │  │  Last-Minute         │
│  Summariser         │  │  Prep Mode           │
│                     │  │                      │
│  "Paste or upload   │  │  "30 minutes before  │
│  dense notes →      │  │  exam? Build your    │
│  exam-ready         │  │  crash-plan now."    │
│  summary"           │  │                      │
│  [Summarise →]      │  │  [Build Plan →]      │
└─────────────────────┘  └─────────────────────┘

[Quota chip] — top-right: "1 free prompt remaining this week"  ← always visible
```

### Tool A — Guess Paper UI

**Step 1: Input**
```
┌───────────────────────────────────────────────────────────┐
│  Generate Guess Paper                                      │
│                                                            │
│  Subject                          Exam Type               │
│  [Select Institution ▾]           ○ End Semester           │
│  [Select Program ▾]               ○ Internal               │
│  [Select Subject ▾]               ○ Practical Viva         │
│                                                            │
│  ─── or paste your own syllabus ───────────────────────── │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Paste syllabus / notes / past paper text here...     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [Generate Guess Paper]      Costs: 1 of your 1 weekly    │
└───────────────────────────────────────────────────────────┘
```

**Step 2: Streaming output — live text appears section by section**
```
┌───────────────────────────────────────────────────────────┐
│  ✦ AI Guess Paper — Operating Systems (BCA Sem 4)         │
│  Generated by llama-3.3-70b  •  [Download PDF]  [Share]   │
│  ─────────────────────────────────────────────────────────│
│  SECTION A — Short Questions                               │
│                                                            │
│  Q1. Define process scheduling. Explain FCFS algorithm.   │
│       Likelihood ████████░░ High                           │
│                                                            │
│  Q2. What is a deadlock? State four necessary conditions. │
│       Likelihood ██████████ Very High                      │
│  ...                                                       │
└───────────────────────────────────────────────────────────┘
```

Likelihood bar uses CSS `--likelihood: 0.8` custom property — colour shifts green → orange → red for High → Medium → Low.

---

### Tool B — Mock Examiner UI (Most Complex)

**Step 1: Configure Exam**
```
┌───────────────────────────────────────────────────────────┐
│  Configure Mock Exam                                       │
│                                                            │
│  Subject: [Select or type subject name]                   │
│                                                            │
│  Number of Questions:  ○ 5    ○ 10    ○ 15    ○ 20        │
│  Difficulty:           ○ Easy  ○ Mixed  ○ Hard            │
│  Time Limit:           ○ 15 min  ○ 30 min  ○ 45 min       │
│  Question Types:       ☑ Short Answer  ☑ Long Answer      │
│                        ☐ MCQ  ☐ Numerical                 │
│                                                            │
│  [Start Exam]                                              │
└───────────────────────────────────────────────────────────┘
```

**Step 2: Active Exam — `/ai/mock-exam/[sessionId]`**

Full-screen focus mode (navbar hidden, minimal chrome):

```
┌─────────────────────────────────────────────────────────────┐
│  Operating Systems Mock Exam          Q 3 / 10   [28:41] ⏱ │
│  ─────────────────────────────────────────────────────────  │
│  Progress: ●●●○○○○○○○                                       │
│                                                             │
│  Question 3                                                 │
│  ─────────────────────────────────────────────────────────  │
│  Explain the difference between paging and segmentation.   │
│  How does paging solve the problem of external             │
│  fragmentation?                                            │
│                                                             │
│  Your Answer:                                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  (type here...)                                     │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│  0 / 500 words                                             │
│                                                             │
│  How confident are you?   [Not sure]  [Somewhat]  [Sure]   │
│                                                             │
│  [Submit Answer →]                    [Skip Question]      │
└─────────────────────────────────────────────────────────────┘
```

Timer turns orange at 5 min remaining, red + pulses at 1 min.

**Step 3: Answer Feedback (shows immediately after Submit)**
```
┌─────────────────────────────────────────────────────────────┐
│  Question 3 — Graded                                        │
│  ─────────────────────────────────────────────────────────  │
│  Your Score:  7.5 / 10     ████████░░                       │
│                                                             │
│  [+] What you got right                                     │
│  ✓ Correctly explained paging with fixed-size frames       │
│  ✓ Mentioned page table and frame number mapping           │
│                                                             │
│  [!] Key Points Missed                                      │
│  ✗ Did not mention that paging eliminates external         │
│    fragmentation but introduces internal fragmentation     │
│  ✗ No mention of segmentation's variable-size segments     │
│                                                             │
│  Model Answer (condensed):                                  │
│  Paging divides memory into fixed-size pages; segments     │
│  are variable. Paging removes external fragmentation...    │
│                                                             │
│  [Next Question →]                                          │
└─────────────────────────────────────────────────────────────┘
```

**Step 4: Final Report — `/ai/mock-exam/[sessionId]/report`**
```
┌─────────────────────────────────────────────────────────────┐
│  Exam Complete — Operating Systems                          │
│                                                             │
│  Final Score:  72 / 100        Passed ✓                    │
│                                                             │
│  ┌──────────────────────────────────────────┐              │
│  │  Accuracy   Confidence   Topics           │              │
│  │  72%        Calibration: 78%             │  ← tab bar  │
│  └──────────────────────────────────────────┘              │
│                                                             │
│  Question-by-Question Breakdown:                           │
│  Q1  8/10  ████████░░  Sure → Correct ✓                   │
│  Q2  4/10  ████░░░░░░  Sure → Wrong ✗  ← overconfident!   │
│  Q3  7/10  ███████░░░  Somewhat → Correct ✓               │
│  ...                                                       │
│                                                             │
│  Weak Areas to Revisit:                                    │
│  • Deadlock Avoidance (scored 3/10)                       │
│  • File System Structures (scored 4/10)                   │
│                                                             │
│  [Retake Exam]  [Generate Guess Paper for weak areas]      │
│                 ↑ this button pre-fills Tool A!            │
└─────────────────────────────────────────────────────────────┘
```

"Generate Guess Paper for weak areas" is the cross-tool integration CTA — it pre-populates Tool A with the subject and a context note about what was weak.

---

### Tool C — Summariser UI

```
┌───────────────────────────────────────────────────────────┐
│  Smart Notes Summariser                                    │
│                                                            │
│  Source:                                                   │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ Our Notes│  │  Paste Text  │  │  Upload PDF (Pro)  │  │
│  └──────────┘  └──────────────┘  └────────────────────┘  │
│                                                            │
│  [If "Our Notes" selected:]                               │
│  Pick Subject: [Select ▾]                                 │
│  Resources for this subject:                              │
│  ○ Lecture Notes — Unit 1 (uploaded Jan 2026)            │
│  ○ Lecture Notes — Unit 2–4                              │
│  ● Study Guide (PDF, 3.2 MB)   ← radio selection         │
│                                                            │
│  Output Style:                                            │
│  ○ Bullet Summary  ○ Cornell Notes  ○ Mind Map Text       │
│                                                            │
│  [Summarise Notes]                                         │
└───────────────────────────────────────────────────────────┘
```

Output streams in with section headers appearing first (feels fast):
```
┌───────────────────────────────────────────────────────────┐
│  Summary — Operating Systems Unit 3 (Memory Management)   │
│  [Copy All]  [Download .txt]  [Save to History (Pro)]     │
│  ─────────────────────────────────────────────────────────│
│  Key Concepts                                              │
│  • Paging: Divides logical memory into fixed-size pages   │
│  • Frame: Physical memory unit equal in size to a page    │
│  ...                                                       │
│                                                            │
│  Memory Hooks                                              │
│  • Paging = Post Office grid system — each PO Box = frame │
│  ...                                                       │
└───────────────────────────────────────────────────────────┘
```

---

### Tool D — Last-Minute Prep UI

Simple, urgent-feeling design (intentionally minimal — user has no time):

```
┌───────────────────────────────────────────────────────────┐
│  ⚡ Last-Minute Prep                                       │
│                                                            │
│  Subject:  [Type or select subject]                       │
│                                                            │
│  Time available:                                          │
│  [5 min]  [15 min]  [30 min]  [1 hour]                   │
│                                                            │
│  Weak areas (optional — tick what worries you):           │
│  ☐ Topic 1   ☐ Topic 2   ☐ Topic 3  ← auto-loaded from   │
│                                        syllabus if known  │
│                                                            │
│  [Build My Crash Plan]                                    │
└───────────────────────────────────────────────────────────┘
```

Output uses a timeline layout — each time block is a card with a coloured left border:

```
┌─ 0–8 min  ──────────────────────────── [Process Scheduling]
│  READ: FCFS, SJF, Round Robin
│  FOCUS: Be able to draw Gantt charts
│  SKIP: Priority aging (rarely asked)
└─────────────────────────────────────────────────────────────

┌─ 8–15 min ──────────────────────────── [Memory Management]
│  READ: Paging basics + address translation
│  KEY FORMULA: PA = Frame × PageSize + Offset
│  SKIP: Segmentation deep dive
└─────────────────────────────────────────────────────────────
```

---

### Quota / Paywall UI Patterns

**Quota chip** (always visible on AI pages, top-right):
- Free, has usage remaining: `1 prompt left this week`  — grey badge
- Free, quota exhausted: `0 prompts left · Resets Mon`  — orange badge
- Pro: `18 / 25 this month`  — green badge

**Paywall intercept** (when free user tries to use second prompt):
```
┌───────────────────────────────────────────────────────────┐
│  [Lock icon]  You've used your free prompt this week      │
│                                                           │
│  Upgrade to Pro to get:                                   │
│  ✓  25 AI prompts / month across all 4 tools             │
│  ✓  Session resume for Mock Exams                        │
│  ✓  Full history of past results                         │
│  ✓  Upload your own PDFs                                 │
│  ✓  Ad-free experience                                   │
│                                                          │
│  ₹199 / month  — less than one chai per week             │
│                                                          │
│  [Upgrade to Pro]          [Remind me next week]         │
└───────────────────────────────────────────────────────────┘
```

This is a bottom-sheet on mobile, a centered modal on desktop. Never blocks the page — user can dismiss and browse.

---

## 7. Resource Integration from DB

This is the key differentiator — AI tools that know *our* content.

### How it works

When a user selects a Subject in any AI tool:

1. Frontend calls `GET /api/ai/context?subjectId=xxx`
2. Backend fetches all approved resources for that subject (type: NOTE, SYLLABUS, PYQ) from DB
3. For each resource, if `fileUrl` is an S3 PDF:
   - Backend downloads + extracts text (cached in `AIResult.output` keyed by file hash)
   - Returns extracted text chunks
4. Frontend gets back a `contextPackage`:
   ```json
   {
     "subjectName": "Operating Systems",
     "syllabus": "Unit 1: Process Management...",
     "pastPaperQuestions": ["Define scheduling...", "Explain deadlock..."],
     "notesSnippets": ["A process is...", "FCFS algorithm..."]
   }
   ```
5. This context is embedded into the AI prompt as grounding material

### Context Budget Management

LLMs have token limits (~8000 context for free model tier). Prioritise:
1. Syllabus text (most important for guess paper / last-minute)
2. PYQ questions (critical for guess paper)
3. Notes snippets (for summariser, mock exam)

If total context > 6000 tokens, truncate notes first, then past papers (keep titles), always keep full syllabus.

### PDF Text Caching

Extracting text from a PDF on every request is expensive. Cache extracted text:

```prisma
model ResourceTextCache {
  resourceId    String   @id   // FK to Resource
  extractedText String   @db.LongText
  extractedAt   DateTime @default(now())
  pageCount     Int
}
```

On first use → extract + cache. On subsequent uses → serve cache. Cache is invalidated if the Resource file is replaced.

---

## 8. API Reference

All routes under `/api/ai/`. All require authentication except where noted.

### Rate-limiting

All routes: 10 req/min per user (express-rate-limit on userId). Prevents parallel request spam.

### Endpoints

```
POST   /api/ai/guess-paper          Body: { subjectId?, customText?, examType }
GET    /api/ai/guess-paper/stream   SSE. Same params as above via query string.
       → streams markdown text

POST   /api/ai/mock-exam/sessions           Create new session
GET    /api/ai/mock-exam/sessions/:id       Get session state (for resume)
POST   /api/ai/mock-exam/sessions/:id/question  Get next question
POST   /api/ai/mock-exam/sessions/:id/answer    Submit answer, get feedback
POST   /api/ai/mock-exam/sessions/:id/complete  Finish early
GET    /api/ai/mock-exam/sessions/:id/report    Final report (completed sessions)

POST   /api/ai/summarise            Body: { subjectId?, resourceId?, customText?, style }
GET    /api/ai/summarise/stream     SSE.

POST   /api/ai/last-minute          Body: { subjectId?, subjectName, timeMinutes, weakAreas[] }
GET    /api/ai/last-minute/stream   SSE.

GET    /api/ai/context              Query: subjectId — returns context package (no AI call)
GET    /api/ai/quota                Returns current user's quota status
GET    /api/ai/history              Pro only. Returns past AIResult list.
GET    /api/ai/history/:id          Pro only. Full result content.

POST   /api/subscriptions/checkout          Create Razorpay subscription
POST   /api/subscriptions/webhook           Razorpay webhook handler (no auth, verified by signature)
GET    /api/subscriptions/status            Current subscription details
POST   /api/subscriptions/cancel            Cancel at period end
```

### Response shapes

**Quota response:**
```json
{
  "plan": "FREE",
  "used": 1,
  "limit": 1,
  "window": "weekly",
  "resetsAt": "2026-04-05T00:00:00Z",
  "canUse": false
}
```

**Mock exam answer response:**
```json
{
  "score": 7.5,
  "feedback": "Good coverage of paging...",
  "correctAnswer": "Paging divides memory...",
  "keyPointsMissed": ["internal fragmentation not mentioned"],
  "nextQuestionIndex": 4,
  "sessionComplete": false
}
```

---

## 9. Payment Flow (Razorpay)

See `docs/RAZORPAY_SETUP.md` for existing Razorpay configuration. Subscriptions work as follows:

1. User clicks "Upgrade to Pro" → `POST /api/subscriptions/checkout`
2. Backend creates Razorpay subscription plan (`199/month`) if not exists, creates subscription object, returns `subscriptionId` + `keyId`
3. Frontend opens Razorpay checkout modal with subscription details
4. On payment success, Razorpay fires webhook to `POST /api/subscriptions/webhook`
5. Backend verifies HMAC signature, updates `Subscription` record to `PRO / ACTIVE`, sets `currentPeriodStart` and `currentPeriodEnd`
6. On `subscription.charged` events: extend `currentPeriodEnd`
7. On `subscription.cancelled` / `subscription.halted`: update status, user reverts to FREE at period end

Webhook events to handle:
- `subscription.activated` → set PRO
- `subscription.charged` → extend period
- `subscription.cancelled` → set cancellation flag (stays PRO until `currentPeriodEnd`)
- `subscription.halted` → set PAST_DUE, warn user

---

## 10. Security & Abuse Prevention

### Prompt Injection Defence

User-supplied text (syllabus paste, custom notes) goes into the prompt as a grounded document, wrapped in explicit XML-style delimiters:

```
<document source="user-provided">
  [user text here]
</document>

Using ONLY the content in the document above, generate...
```

The system prompt explicitly instructs the model to ignore any instructions found inside `<document>` tags.

### Output Sanitisation

AI output is rendered as Markdown. Sanitise with `dompurify` on the frontend before rendering to prevent XSS via injected HTML in AI responses.

### Cost Control

Hard caps enforced server-side, regardless of subscription:
- Max 3000 output tokens per request (prevents runaway generation)
- Max 8000 input tokens per request (prevents giant pastes)
- If Groq API errors budget exceeded → fail gracefully, notify admin via log

### Data Privacy

- User answers in Mock Exam are stored in DB but never sent to the AI provider as training data (Groq's terms confirm this)
- Past papers / syllabus from our S3 are only sent to Groq for that request, not stored by provider
- Add a clear "AI Data Notice" banner on first use: "Your text is sent to Groq (llama-3.3-70b) for processing. No personal data is stored by Groq."

---

## 11. Rollout Strategy

### Phase 1 — Core Infrastructure (Week 1–2)

- [ ] Add DB schema (Subscription, AIUsage, MockExamSession, AIResult, ResourceTextCache)
- [ ] Build AI provider abstraction + Groq adapter
- [ ] Build `ai.service.ts` with quota enforcement
- [ ] Build PDF extractor + ResourceTextCache
- [ ] Wire up Razorpay subscriptions

### Phase 2 — Tools A, C, D (Week 3)

- [ ] Guess Paper Generator (simplest prompt, highest student value)
- [ ] Notes Summariser
- [ ] Last-Minute Prep
- [ ] SSE streaming for all three
- [ ] Frontend pages + quota chip + paywall modal

### Phase 3 — Mock Examiner (Week 4)

- [ ] Session management API
- [ ] Multi-turn question/answer loop
- [ ] Final report with confidence calibration
- [ ] Full-screen exam UI

### Phase 4 — Polish & Launch

- [ ] History page (Pro)
- [ ] Cross-tool integration CTAs (report → guess paper)
- [ ] A/B test paywall copy
- [ ] Performance: cache hot subjects' context packages in `ResourceTextCache`
- [ ] Analytics: track which tools are most used, conversion rate on paywall

---

## Appendix: Key Env Vars to Add

```
# AI
GROQ_API_KEY=gsk_...
AI_PROVIDER=groq
AI_MODEL_PRIMARY=llama-3.3-70b-versatile
AI_MODEL_FALLBACK=llama-3.1-8b-instant
AI_MAX_INPUT_TOKENS=8000
AI_MAX_OUTPUT_TOKENS=3000

# Subscriptions
RAZORPAY_PLAN_ID_PRO=plan_...      # Create once in Razorpay dashboard
```

---

*Document maintained by Hachi wa Studios. Update when architecture decisions change.*
