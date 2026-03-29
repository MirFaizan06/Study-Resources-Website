// TODO: Localization for this page will be added in a future release due to content complexity.

import React from 'react'
import { BookOpen } from 'lucide-react'
import BlogPost from '../BlogPost'

export default function RulesOfStudying(): React.ReactElement {
  return (
    <BlogPost
      title="The 7 Rules of Studying That Actually Work"
      category="Fundamentals"
      date="Jan 15, 2026"
      readTime="6 min read"
      icon={<BookOpen size={28} />}
    >
      <p>
        Most students study. Very few study effectively. The difference isn't intelligence — it's
        method. These seven rules aren't hacks or shortcuts. They are the foundational principles
        that separate students who retain knowledge from those who spend hours staring at their notes
        and walk out of exams with nothing to show for it.
      </p>

      <h2>1. The 90-Minute Rule</h2>
      <p>
        Never study a single subject for more than 90 minutes in one sitting. After 90 minutes, your
        brain's working memory is saturated — new information stops sticking and starts bouncing off.
      </p>
      <p>
        After 90 minutes, take a genuine 15-minute break. Walk. Drink water. Breathe. <strong>No
        phone.</strong> The break is not a reward — it is part of the process. Memory consolidation
        happens during rest, not during the session itself.
      </p>

      <h2>2. One Subject Per Session</h2>
      <p>
        Context switching between subjects in a single study session destroys deep encoding. Your
        brain needs time to settle into a subject's language, structure, and logic. The moment you
        switch, you pay a cognitive toll — and you never fully recover it within that session.
      </p>
      <p>
        Commit to one subject per sitting. If you have three subjects today, run three separate
        sessions with breaks between them. This is non-negotiable.
      </p>

      <h2>3. Active Recall Beats Re-Reading</h2>
      <p>
        Every time you re-read your notes, you <em>feel</em> productive but retain almost nothing.
        Re-reading is passive. Your brain treats familiar text as already-known and processes it at
        surface level.
      </p>
      <p>
        Instead: close your notes and write down everything you remember. Then open your notes and
        check. The act of <strong>retrieving</strong> information — even imperfectly — strengthens
        the neural pathway far more than any amount of re-reading.
      </p>

      <h2>4. Write, Don't Highlight</h2>
      <p>
        Highlighting is the academic equivalent of junk food. It feels productive, it looks like
        work, but it feeds nothing meaningful. Your brain is not challenged. It is merely
        decorating.
      </p>
      <p>
        Write summaries in your own words. Summarising forces your brain to compress, reframe, and
        reconstruct information — which is exactly how long-term memory is built.
      </p>

      <h2>5. Your Environment Is Your Output</h2>
      <p>
        A cluttered desk produces cluttered thinking. Your study environment sends signals to your
        brain before you even open a book. A messy, noisy, phone-filled space tells your brain this
        is leisure time.
      </p>
      <p>
        Keep your study space clean, well-lit, and phone-free. If possible, use the same space every
        day — your brain will begin to associate that location with focus and slip into work mode
        faster over time.
      </p>

      <h2>6. Sleep Is Non-Negotiable</h2>
      <p>
        Memory consolidation — the process by which short-term learning becomes long-term memory —
        happens almost entirely during sleep. Every hour of sleep you sacrifice before an exam is an
        hour of study you are actively undoing.
      </p>
      <p>
        Pulling all-nighters before exams is not dedication. It is self-sabotage. <strong>7–8 hours
        of sleep is a study technique</strong> — arguably the most powerful one on this list. The
        students who sleep before exams consistently outperform the ones who don't.
      </p>

      <h2>7. Teach What You Learn</h2>
      <p>
        If you cannot explain a concept to a 10-year-old in simple language, you do not understand
        it yet. You may have memorised words, but that is not the same as understanding.
      </p>
      <p>
        Find a study partner and explain concepts to each other. If you study alone, talk to a wall.
        The act of teaching forces your brain to identify gaps — the places where you thought you
        understood but couldn't produce an explanation. Those gaps are exactly where your next study
        session should focus.
      </p>

      <div className="divider" />

      <div className="tip">
        The simplest version: close your notes, write what you know, check, repeat. Everything else
        is noise.
      </div>
    </BlogPost>
  )
}
