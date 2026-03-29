// TODO: Localization for this page will be added in a future release due to content complexity.

import React from 'react'
import { CalendarDays } from 'lucide-react'
import BlogPost from '../BlogPost'

export default function SemesterPlanning(): React.ReactElement {
  return (
    <BlogPost
      title="How to Build an Effective Semester Plan"
      category="Planning"
      date="Feb 3, 2026"
      readTime="7 min read"
      icon={<CalendarDays size={28} />}
    >
      <p>
        Most students live reactively. They wait for exams to appear on the horizon before they
        start studying. By then, there isn't enough time, the workload feels overwhelming, and panic
        becomes the strategy. A semester plan flips this entirely. Instead of reacting to the
        semester, you design it.
      </p>
      <p>
        This guide is built around Kashmir University's typical 6-month semester structure. Adapt
        the weeks to your institution's timeline, but keep the phases intact — they're based on how
        learning and memory actually work, not on how the academic calendar is laid out.
      </p>

      <h2>Weeks 1–2: Foundation</h2>
      <p>
        The first two weeks are not for studying. They are for orientation. Before you can plan a
        journey, you need to know the terrain.
      </p>
      <ul>
        <li>
          <strong>Collect all syllabi</strong> for every subject. Print them or save them somewhere
          you'll actually look.
        </li>
        <li>
          <strong>Build a subject inventory</strong> — for each subject, list every chapter and
          topic on the syllabus. This becomes your master checklist.
        </li>
        <li>
          <strong>Identify the heaviest subjects</strong> — the ones with the most chapters, the
          most abstract concepts, or the ones you already know you find difficult. These get more
          weekly time.
        </li>
        <li>
          <strong>Set up your study space</strong> — clean, consistent, phone-free. The environment
          is infrastructure. Get it right now, not later.
        </li>
        <li>
          Download or collect previous year question papers for each subject. You won't use them yet,
          but having them in Week 1 saves a frantic search in Week 13.
        </li>
      </ul>

      <h2>Weeks 3–10: Consistent Progress</h2>
      <p>
        This is where the semester is actually won or lost. Eight weeks of consistent, focused work
        separates students who sail through exam season from students who drown in it.
      </p>
      <ul>
        <li>
          <strong>2 hours of focused study daily</strong>, minimum. Not 2 hours in the room. 2 hours
          of actual work. Use a timer. Track it.
        </li>
        <li>
          <strong>Cover 1 chapter per subject per week</strong>. At 5 subjects and 8 weeks, that's
          40 chapters fully covered before exam revision even begins.
        </li>
        <li>
          <strong>Start a revision notebook</strong> — a single notebook per subject where you
          compress each chapter into one page of key points, definitions, and formulas. This becomes
          your primary exam revision material.
        </li>
        <li>
          Do not rely on class notes alone. Cross-reference with the textbook and any good reference
          books available. Class notes have gaps.
        </li>
        <li>
          <strong>Review last week's material on Mondays</strong> before starting new content. 20
          minutes of spaced repetition keeps earlier chapters fresh.
        </li>
      </ul>

      <h2>Weeks 11–13: Review Phase</h2>
      <p>
        No new material in these weeks. The learning phase is over. These weeks are for
        consolidation.
      </p>
      <ul>
        <li>
          Review all revision notebook entries — one full pass per subject per week.
        </li>
        <li>
          <strong>Solve previous year question papers</strong> for every subject. At least 3 papers
          per subject. Time yourself.
        </li>
        <li>
          Identify weak areas from the PYQ practice — topics where you struggled, blanked, or got
          answers wrong. Make a weak-area list.
        </li>
        <li>
          Spend one dedicated session per subject specifically on your weak-area list. This targeted
          revision is more valuable than another full review of already-known material.
        </li>
      </ul>

      <h2>Weeks 14–16: Exam Sprint</h2>
      <p>
        The exam sprint is not about learning. It is about performance. Your job in these weeks is
        to convert what you know into what you can produce in an exam hall under time pressure.
      </p>
      <ul>
        <li>
          <strong>Mock exams</strong> — sit full, timed, closed-book practice papers in exam
          conditions. No looking things up mid-session. Score yourself honestly.
        </li>
        <li>
          <strong>Timed practice</strong> — practice writing answers quickly. Kashmir University
          exams are written, time-limited assessments. Speed and clarity matter.
        </li>
        <li>
          <strong>Sleep discipline</strong> — 7–8 hours minimum every night during exam week. This
          is not optional. Memory consolidation requires sleep.
        </li>
        <li>
          The day before each exam: light review only. Read your revision notebook once. Do not
          attempt to learn anything new. Trust the work done in Weeks 3–10.
        </li>
      </ul>

      <h2>Kashmir University Specific Notes</h2>
      <p>
        Kashmir University semesters run approximately 6 months from start of classes to final
        exams, though delays are common. Build buffer time into your plan — assume exams could be
        pushed 2–4 weeks in either direction and plan for the earlier date.
      </p>
      <p>
        KU exams are heavily PYQ-based. Questions repeat with high frequency, especially in
        undergraduate programs. Solving the last 5 years of papers for each subject is one of the
        highest-ROI activities you can do in the final weeks. Focus on "important questions" lists
        shared by faculty, but do not rely on them exclusively — coverage matters.
      </p>
      <p>
        Cluster University Srinagar and affiliated colleges follow a similar structure. The
        principles here apply equally — adjust the chapter targets based on your actual syllabus
        length.
      </p>

      <div className="divider" />

      <div className="tip">
        The secret is in Weeks 3–10. The students who do the work there don't panic during Weeks
        14–16. The sprint is easy when the foundation is solid.
      </div>
    </BlogPost>
  )
}
