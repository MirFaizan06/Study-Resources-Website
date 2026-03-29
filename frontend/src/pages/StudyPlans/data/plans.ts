export interface StudyDay {
  day: number | string
  label: string
  tasks: string[]
  focus?: string
  hours?: number
}

export interface StudyWeek {
  week: number | string
  title: string
  theme?: string
  days?: StudyDay[]
  summary?: string
  goals?: string[]
}

export interface StudyPlan {
  id: string
  title: string
  description: string
  duration: string
  goal: 'exam_prep' | 'concept_mastery' | 'habit_building'
  intensity: 'light' | 'moderate' | 'intense'
  tags: string[]
  weeks: StudyWeek[]
  tips?: string[]
}

export const STUDY_PLANS: StudyPlan[] = [
  // ─── Plan 1: 14-Day Exam Sprint ────────────────────────────────────────────
  {
    id: 'exam-sprint-14',
    title: '14-Day Exam Sprint',
    description:
      "For when exams are 2 weeks away and you need a structured battle plan. No fluff — just focused execution.",
    duration: '14 Days',
    goal: 'exam_prep',
    intensity: 'intense',
    tags: ['Exam Prep', 'Short Term', 'High Intensity'],
    tips: [
      'Do not start new topics after Day 10. Only consolidate what you have.',
      'Solve past papers under timed conditions — not casually.',
      'Sleep 7 hours minimum every night. Fatigue kills retention.',
      'If you miss a day, do not try to "catch up" — just resume the plan the next day.',
    ],
    weeks: [
      {
        week: 1,
        title: 'Week 1',
        theme: 'Rapid Coverage',
        days: [
          {
            day: 1,
            label: 'Day 1 — Subject Mapping',
            focus: 'Orientation',
            hours: 3,
            tasks: [
              'List all subjects and their full chapter lists.',
              'Collect all previous year question papers (last 5 years per subject).',
              'Identify the 3 highest-weightage topics per subject from PYQ patterns.',
              'Create a daily study schedule for Days 3–13 based on subject count.',
            ],
          },
          {
            day: 2,
            label: 'Day 2 — Past Paper Analysis',
            focus: 'Orientation',
            hours: 3,
            tasks: [
              'Skim through all PYQs to identify repeating question patterns.',
              'Mark "must cover" topics with a star in each subject.',
              'Set up revision notebooks — one per subject.',
              'Prepare your study space: clean desk, charged devices, phone in another room.',
            ],
          },
          {
            day: 3,
            label: 'Day 3 — Subject Coverage Begins',
            focus: 'Active Learning',
            hours: 5,
            tasks: [
              'Cover 2 main chapters from your heaviest subject.',
              'Focus on definitions, key frameworks, and important examples.',
              'Write a half-page summary of each chapter in your revision notebook.',
              'End session with a 10-minute active recall test (close notes, write what you remember).',
            ],
          },
          {
            day: 4,
            label: 'Day 4 — Subject Coverage',
            focus: 'Active Learning',
            hours: 5,
            tasks: [
              'Cover 2 main chapters from your second subject.',
              'Prioritise chapters that appear most frequently in PYQs.',
              'Write chapter summaries in revision notebook.',
              'Quick review of Day 3 material (15 minutes spaced repetition).',
            ],
          },
          {
            day: 5,
            label: 'Day 5 — Subject Coverage',
            focus: 'Active Learning',
            hours: 5,
            tasks: [
              'Cover remaining subjects (2 chapters each, high-priority only).',
              'Complete revision notebook entries for all subjects covered so far.',
              'Solve 10 short-answer questions from PYQs across subjects.',
              "Identify remaining gaps — what haven't you touched yet?",
            ],
          },
          {
            day: 6,
            label: 'Day 6 — Full Review of Week 1',
            focus: 'Consolidation',
            hours: 4,
            tasks: [
              'Review all revision notebook entries from Days 3–5.',
              'Re-do active recall for every subject covered.',
              'Solve 5 long-answer questions from PYQs.',
              'Update your weak-areas list.',
            ],
          },
          {
            day: 7,
            label: 'Day 7 — Rest & Light Revision',
            focus: 'Recovery',
            hours: 1.5,
            tasks: [
              'Rest day — no heavy studying.',
              'Light read-through of revision notebook (30 minutes only).',
              'Physical activity: walk, stretch, get outside.',
              'Sleep by 10pm.',
            ],
          },
        ],
      },
      {
        week: 2,
        title: 'Week 2',
        theme: 'Consolidation & Practice',
        days: [
          {
            day: 8,
            label: 'Day 8 — PYQ Practice Begins',
            focus: 'Exam Practice',
            hours: 5,
            tasks: [
              'Solve 2 full past papers for your first subject (timed).',
              'Mark your answers honestly.',
              'Note every question you got wrong or couldn\'t answer.',
              'Add weak areas to your gap list.',
            ],
          },
          {
            day: 9,
            label: 'Day 9 — PYQ Practice',
            focus: 'Exam Practice',
            hours: 5,
            tasks: [
              'Solve 2 full past papers for your second subject (timed).',
              'Review and self-mark.',
              'Spend 45 minutes on specific topics you struggled with.',
              'Quick revision notebook review for all subjects.',
            ],
          },
          {
            day: 10,
            label: 'Day 10 — PYQ Practice',
            focus: 'Exam Practice',
            hours: 5,
            tasks: [
              'Solve past papers for remaining subjects (2 papers each).',
              'Complete your gap list — identify the 3 weakest areas per subject.',
              'Begin targeted gap-fill revision.',
            ],
          },
          {
            day: 11,
            label: 'Day 11 — Gap Filling',
            focus: 'Targeted Revision',
            hours: 5,
            tasks: [
              'Work exclusively through your weak-areas list.',
              'For each weak area: read, close the book, write what you know, check.',
              'Do not start new material — only consolidate what you have.',
              'Update revision notebooks with any missing key points.',
            ],
          },
          {
            day: 12,
            label: 'Day 12 — Gap Filling & Review',
            focus: 'Targeted Revision',
            hours: 4,
            tasks: [
              'Continue through weak-areas list.',
              'Full read-through of all revision notebooks.',
              'Final active recall session: close all notes, write everything you know per subject.',
            ],
          },
          {
            day: 13,
            label: 'Day 13 — Mock Self-Exam',
            focus: 'Simulation',
            hours: 4,
            tasks: [
              'Simulate exam conditions: timed, closed-book, no phone.',
              'Answer 5 long-answer and 10 short-answer questions per subject from memory.',
              'Review answers against your notes after the session.',
              'Sleep by 10pm. No late-night studying.',
            ],
          },
          {
            day: 14,
            label: 'Day 14 — Light Review & Rest',
            focus: 'Recovery',
            hours: 1.5,
            tasks: [
              'Read revision notebooks one final time — light, relaxed pass.',
              'Do not attempt new practice questions.',
              'Eat well, hydrate, short walk.',
              'Sleep by 9:30pm. You\'ve done the work. Trust it.',
            ],
          },
        ],
      },
    ],
  },

  // ─── Plan 2: Full Semester Roadmap ─────────────────────────────────────────
  {
    id: 'semester-roadmap',
    title: 'Full Semester Roadmap',
    description:
      "A complete semester plan from Day 1 to exam. Designed for Kashmir University's 6-month semesters — sustainable, thorough, and panic-free.",
    duration: '18 Weeks',
    goal: 'concept_mastery',
    intensity: 'moderate',
    tags: ['Full Semester', 'Long Term', 'Balanced'],
    tips: [
      'Do not skip the Foundation phase — it pays dividends for the rest of the semester.',
      'Consistency beats intensity. 2 hours every day beats 10 hours once a week.',
      'Review older material on Mondays before starting new content each week.',
      'PYQ practice in Weeks 13–18 is non-negotiable. No exceptions.',
    ],
    weeks: [
      {
        week: '1–2',
        title: 'Phase 1: Foundation',
        theme: 'Orientation & Setup',
        goals: [
          'Collect all syllabi and create a chapter inventory per subject.',
          'Identify the heaviest and most difficult subjects.',
          'Download last 5 years of PYQs for each subject.',
          'Set up your study space — clean, consistent, phone-free.',
          'Create a revision notebook for each subject.',
          'Build your weekly schedule: 2 hours/day minimum, fixed time.',
        ],
        days: [
          {
            day: 'Week 1, Day 1',
            label: 'Day 1 — Orientation',
            focus: 'Setup',
            hours: 2,
            tasks: [
              'Collect all syllabi (printed or digital).',
              'List every chapter for every subject in a master document.',
              'Identify 2–3 subjects that will require the most work.',
            ],
          },
          {
            day: 'Week 1, Day 2',
            label: 'Day 2 — Resource Collection',
            focus: 'Setup',
            hours: 2,
            tasks: [
              'Download or locate PYQs for each subject (last 5 years).',
              'Gather textbooks and reference materials.',
              'Set up revision notebooks — label one per subject.',
            ],
          },
          {
            day: 'Week 1, Day 3',
            label: 'Day 3 — Schedule Building',
            focus: 'Planning',
            hours: 1.5,
            tasks: [
              'Build your weekly study schedule.',
              'Assign subjects to specific days — avoid mixing subjects in one session.',
              'Block out your fixed deep-work time (same time daily).',
              'Set up spaced repetition review slots (Monday = review previous week).',
            ],
          },
          {
            day: 'Week 1, Day 4–7',
            label: 'Days 4–7 — Study Space & Habit Installation',
            focus: 'Setup',
            hours: 2,
            tasks: [
              'Clean and organise your study space.',
              'Practice one 90-minute focused session daily (no new content yet — review prior knowledge).',
              'Track your sessions in a simple log.',
              'No phone in the room during study time.',
            ],
          },
        ],
      },
      {
        week: '3–12',
        title: 'Phase 2: Consistent Progress',
        theme: 'Chapter-by-Chapter Coverage',
        summary:
          '10 weeks of steady, focused study. Cover one chapter per subject per week. Write revision notebook summaries. Review previous week\'s material every Monday. Do not skip weeks — the compounding effect of consistent coverage is the entire point of this phase.',
        goals: [
          '2 hours of focused study daily — phone-free, timed, logged.',
          '1 chapter per subject per week — completed, summarised, recalled.',
          'Monday spaced review: 20 minutes reviewing last week\'s material before new content.',
          'Weekly revision notebook entry for every subject every week.',
          'Solve 3–5 short PYQ questions per subject each week to stay familiar with exam style.',
          'Identify weak areas continuously — add them to a running gap list.',
        ],
      },
      {
        week: '13–15',
        title: 'Phase 3: Review Phase',
        theme: 'Consolidation & PYQ Practice',
        goals: [
          'No new material. The learning phase is complete.',
          'Full read-through of all revision notebooks (one pass per subject per week).',
          'Solve minimum 3 full past papers per subject under timed conditions.',
          'Identify and target weak areas from PYQ practice.',
          'Dedicate one targeted session per subject to your weak-area list.',
          'Active recall: close all notes, write everything per subject from memory.',
        ],
      },
      {
        week: '16–18',
        title: 'Phase 4: Exam Sprint',
        theme: 'Simulation & Performance',
        goals: [
          'Mock self-exams: timed, closed-book, exam conditions.',
          'Practice writing speed and structure for long-answer questions.',
          'Final revision notebook review — relaxed, one final pass.',
          '7–8 hours sleep every night. Non-negotiable.',
          'Day before each exam: light review only. No new material.',
          'Trust the work done in Weeks 3–12. The sprint is just performance, not learning.',
        ],
      },
    ],
  },

  // ─── Plan 3: Weekend Warrior ────────────────────────────────────────────────
  {
    id: 'weekend-warrior',
    title: 'Weekend Warrior',
    description:
      'For students with jobs, internships, or packed weekday schedules. Maximise Saturdays and Sundays without burning out.',
    duration: '8 Weeks',
    goal: 'concept_mastery',
    intensity: 'moderate',
    tags: ['Weekends Only', 'Flexible', 'Part-Time'],
    tips: [
      'Protect your weekends aggressively — treat them like non-negotiable appointments.',
      'Use weekday evenings (15–20 min) for light review to maintain memory between weekends.',
      'If you miss a weekend, do not try to double up the next one — just resume.',
      'Prioritise subjects by PYQ frequency, not personal preference.',
    ],
    weeks: [
      {
        week: '1–2',
        title: 'Weeks 1–2: Foundation Weekends',
        theme: 'Orientation',
        days: [
          {
            day: 'Saturday',
            label: 'Saturday — Orientation & Planning',
            focus: 'Setup',
            hours: 4,
            tasks: [
              'Collect all syllabi, list all chapters.',
              'Download PYQs for each subject.',
              'Build your 8-week weekend schedule — assign subjects to weekends.',
              'Set up revision notebooks.',
            ],
          },
          {
            day: 'Sunday',
            label: 'Sunday — Deep Coverage: Week 1 Subject',
            focus: 'Active Learning',
            hours: 3,
            tasks: [
              'Begin Chapter 1 of your first assigned subject.',
              'Read, summarise, recall.',
              'Write revision notebook entry.',
              'Solve 3 short PYQ questions on this chapter.',
            ],
          },
        ],
      },
      {
        week: '3–7',
        title: 'Weeks 3–7: Consistent Coverage',
        theme: 'Chapter-by-Chapter Progress',
        summary:
          'Each weekend follows the same two-day pattern: Saturday for deep coverage, Sunday for revision and PYQ practice. Rotate through subjects weekly.',
        days: [
          {
            day: 'Saturday',
            label: 'Saturday — Deep Coverage',
            focus: 'Active Learning',
            hours: 5,
            tasks: [
              'Cover 2–3 chapters of the assigned subject for this weekend.',
              'Read actively — take notes, write summaries.',
              'Complete revision notebook entries.',
              'End with 20-minute active recall: close everything, write what you know.',
            ],
          },
          {
            day: 'Sunday',
            label: 'Sunday — Revision & PYQ Practice',
            focus: 'Exam Practice',
            hours: 4,
            tasks: [
              'Review Saturday\'s material (spaced repetition).',
              'Solve 1 full past paper or 10 PYQ questions for the current subject.',
              'Mark your answers and identify gaps.',
              'Brief 20-minute review of previous weekend\'s subject.',
            ],
          },
        ],
      },
      {
        week: '8',
        title: 'Week 8: Final Review Weekend',
        theme: 'Consolidation',
        days: [
          {
            day: 'Saturday',
            label: 'Saturday — Full Revision',
            focus: 'Consolidation',
            hours: 5,
            tasks: [
              'Read through all revision notebooks.',
              'Active recall for every subject.',
              'Flag remaining weak areas.',
            ],
          },
          {
            day: 'Sunday',
            label: 'Sunday — Mock Exam',
            focus: 'Simulation',
            hours: 4,
            tasks: [
              'Simulate exam conditions: timed, closed-book.',
              'Attempt questions from all subjects.',
              'Review performance honestly.',
              'Rest and sleep early.',
            ],
          },
        ],
      },
    ],
  },

  // ─── Plan 4: 3-Day Rescue Plan ──────────────────────────────────────────────
  {
    id: 'rescue-3day',
    title: '3-Day Rescue Plan',
    description:
      'You forgot. Exam is in 3 days. This is your recovery plan — ruthlessly prioritised, no time wasted.',
    duration: '3 Days',
    goal: 'exam_prep',
    intensity: 'intense',
    tags: ['Emergency', 'Last Minute', 'High Stakes'],
    tips: [
      'There is no time for everything. There is time for the most important things.',
      'Do not panic-study everything. Ruthless prioritisation is the entire strategy.',
      'Sleep is mandatory, not optional. Pulling all-nighters will cost you more marks than they earn.',
      'On exam morning: light breakfast, revision notebook read, arrive early.',
    ],
    weeks: [
      {
        week: 1,
        title: '3-Day Plan',
        theme: 'Emergency Preparation',
        days: [
          {
            day: 1,
            label: 'Day 1 — Triage & High-Priority Coverage',
            focus: 'Prioritisation',
            hours: 8,
            tasks: [
              'TRIAGE (first 30 minutes): List every topic on the syllabus for each subject.',
              'Star the high-weightage topics based on PYQ patterns (what appears most often).',
              'Cross out topics that have never appeared in 5 years of PYQs — skip them.',
              'You now have a triage list: starred = must cover, unmarked = cover if time permits.',
              'Spend the rest of Day 1 studying only starred topics — 2 subjects.',
              'Write brief revision notes as you go (key points only — no lengthy summaries).',
              'Active recall after every 90-minute block.',
              'Sleep by 11pm. No exceptions.',
            ],
          },
          {
            day: 2,
            label: 'Day 2 — Past Papers & Gap Filling',
            focus: 'Exam Practice',
            hours: 8,
            tasks: [
              'Morning: cover starred topics for remaining subjects.',
              'Afternoon: solve 2 past papers per subject — answer only the questions on your triage list.',
              'Mark your answers honestly. For every blank or wrong answer, spend 10 minutes on that specific topic.',
              'Do not solve topics outside your triage list today.',
              'Evening: review all revision notes from Day 1 (spaced repetition).',
              'Sleep by 10:30pm.',
            ],
          },
          {
            day: 3,
            label: 'Day 3 — Final Review & Rest',
            focus: 'Consolidation & Recovery',
            hours: 4,
            tasks: [
              'Morning (2 hours): Final read-through of all triage notes. Speak them out loud.',
              'Mid-morning (1 hour): revisit any topics still feeling shaky — one focused pass only.',
              'Afternoon: rest. No heavy studying. Short walk, good meal.',
              'Evening: light scan of revision notes (30 minutes maximum). Then stop.',
              'Sleep by 9:30pm. Your brain consolidates during sleep. This is the most productive thing you can do tonight.',
            ],
          },
        ],
      },
    ],
  },

  // ─── Plan 5: Daily Habit Builder ────────────────────────────────────────────
  {
    id: 'habit-builder',
    title: 'Daily Habit Builder',
    description:
      "For students who struggle with consistency. Build a 90-minute daily study habit from scratch — no overwhelm, just momentum.",
    duration: '4 Weeks',
    goal: 'habit_building',
    intensity: 'light',
    tags: ['Habit', 'Beginner', 'Consistent'],
    tips: [
      'The goal of Week 1 is not to learn. It is to show up. That\'s it.',
      'Same time, same place, every day. Consistency of environment accelerates habit formation.',
      'Remove the phone from the room before every session — non-negotiable from Day 1.',
      'Miss one day? Fine. Miss two? That\'s a pattern. Restart immediately on Day 3.',
      'Track your sessions with a simple tick on a calendar. Streaks are motivating.',
    ],
    weeks: [
      {
        week: 1,
        title: 'Week 1: Just Show Up',
        theme: 'Consistency',
        summary:
          '30 minutes per day. The only goal is to sit down, open the book, and stay for 30 minutes without your phone. What you study does not matter yet. That the session happens every day is what matters.',
        goals: [
          '30 minutes of study every single day.',
          'Phone in another room for every session.',
          'Same time, same place each day.',
          'Log each session with a tick mark.',
          'Do not worry about what you study — just show up.',
        ],
      },
      {
        week: 2,
        title: 'Week 2: Build & Review',
        theme: 'Momentum',
        summary:
          '45 minutes per day. Add a 5-minute active recall review at the end of each session: close your notes and write the main things you covered. This builds the retrieval habit early.',
        goals: [
          '45 minutes of focused study every day.',
          '5-minute active recall at end of every session (close notes, write what you remember).',
          'Continue: phone out, same time, same place.',
          'Start a revision notebook — write one key point from each session.',
        ],
      },
      {
        week: 3,
        title: 'Week 3: Quality Check',
        theme: 'Depth',
        summary:
          '60 minutes per day. Add a weekly self-quiz on Sunday: spend 20 minutes reviewing everything from the week and testing yourself without any notes. Track which topics you couldn\'t recall — they go on next week\'s priority list.',
        goals: [
          '60 minutes of focused study every day.',
          'Weekly self-quiz every Sunday (20 minutes, no notes).',
          'Add weak topics from the self-quiz to next week\'s study list.',
          'Begin solving 2–3 short PYQ questions at the end of each session.',
        ],
      },
      {
        week: 4,
        title: 'Week 4: Full Routine',
        theme: 'Consolidation',
        summary:
          '90 minutes per day — the target habit. At this point you have three weeks of consistency behind you. The 90-minute session should feel sustainable, not punishing. This is your new baseline.',
        goals: [
          '90 minutes of focused study every day — the full target habit.',
          'Use the first 5 minutes to write your session goal (one sentence).',
          'Mid-session break at 45 minutes (5 minutes, no phone).',
          'End every session with 10-minute active recall.',
          'End-of-week full revision review (Sunday, 30 minutes).',
          'Celebrate: you built a habit. The hardest part is done.',
        ],
      },
    ],
  },

  // ─── Plan 6: Subject Deep Dive ──────────────────────────────────────────────
  {
    id: 'subject-deep-dive',
    title: 'Subject Deep Dive',
    description:
      "Dedicate one week to mastering a single subject completely — for that subject you've been avoiding all semester.",
    duration: '7 Days',
    goal: 'concept_mastery',
    intensity: 'moderate',
    tags: ['Single Subject', 'Deep Learning', 'Focus'],
    tips: [
      'Pick the subject you\'ve been avoiding the most. This plan is designed for that one.',
      'Do not check messages during study sessions. Single-subject focus is the whole point.',
      'The mind map on Day 5 is not optional — it is the most important session of the week.',
      'Day 7 teach-back: talk out loud even if alone. Hearing yourself explain concepts reveals gaps instantly.',
    ],
    weeks: [
      {
        week: 1,
        title: '7-Day Deep Dive',
        theme: 'Single Subject Mastery',
        days: [
          {
            day: 1,
            label: 'Day 1 — Syllabus Overview & Resource Collection',
            focus: 'Orientation',
            hours: 2,
            tasks: [
              'Print or list the complete syllabus for the chosen subject.',
              'Collect all required resources: textbook, class notes, reference books, PYQs.',
              'Read the syllabus in full — do not study yet, just understand the terrain.',
              'Identify the 5 most important and most frequently-tested topics from PYQ analysis.',
              'Set up a dedicated revision notebook for this subject.',
              'Write your Week Goal: what does "mastered" mean for this subject by Day 7?',
            ],
          },
          {
            day: 2,
            label: 'Day 2 — Chapters 1 & 2',
            focus: 'Active Learning',
            hours: 4,
            tasks: [
              'Study Chapter 1: read actively, write key points, close and recall.',
              'Write a half-page summary in revision notebook.',
              'Study Chapter 2: same method.',
              'Write a half-page summary.',
              'End session: active recall — explain both chapters from memory (out loud or written).',
            ],
          },
          {
            day: 3,
            label: 'Day 3 — Chapters 3 & 4',
            focus: 'Active Learning',
            hours: 4,
            tasks: [
              '10-minute review of Days 1–2 summaries (spaced repetition).',
              'Study Chapter 3: read, note, recall.',
              'Write summary in revision notebook.',
              'Study Chapter 4: same method.',
              'Write summary.',
              'Active recall: explain all 4 chapters from memory.',
            ],
          },
          {
            day: 4,
            label: 'Day 4 — Remaining Chapters',
            focus: 'Active Learning',
            hours: 4,
            tasks: [
              '10-minute review of all previous summaries.',
              'Cover all remaining chapters (2 chapters per 90-minute block).',
              'Complete revision notebook entries for all chapters.',
              'Compile a complete list of key terms, definitions, and formulas from the subject.',
            ],
          },
          {
            day: 5,
            label: 'Day 5 — Mind Map of Entire Subject',
            focus: 'Synthesis',
            hours: 3,
            tasks: [
              'Close all notes and books.',
              'On a blank A3 page (or large blank document), draw a mind map of the entire subject from memory.',
              'Central topic in the middle — branch to main themes — branch to sub-topics.',
              'After completing from memory, open your notes and fill in the gaps.',
              'The gaps in your mind map are exactly your weak areas. Circle them.',
            ],
          },
          {
            day: 6,
            label: 'Day 6 — Past Paper Practice',
            focus: 'Exam Practice',
            hours: 4,
            tasks: [
              'Solve 2 full past papers for this subject under timed conditions.',
              'Do not look at your notes during the papers.',
              'Mark honestly after each paper.',
              'Spend the remaining session on every topic you got wrong or left blank.',
              'Update revision notebook with any remaining gaps.',
            ],
          },
          {
            day: 7,
            label: 'Day 7 — Teach-Back Session',
            focus: 'Synthesis & Review',
            hours: 2.5,
            tasks: [
              'Final read-through of complete revision notebook.',
              'Teach-back: for every chapter and major topic, explain it out loud as if teaching a student who knows nothing.',
              'No notes during the teach-back — speak from memory. Refer to notes only to check after.',
              'For every topic you couldn\'t explain clearly, write a one-paragraph summary in your own words.',
              'You have now covered the subject three times in depth. Rest.',
            ],
          },
        ],
      },
    ],
  },
]
