// TODO: Localization for this page will be added in a future release due to content complexity.

import React from 'react'
import { Users } from 'lucide-react'
import BlogPost from '../BlogPost'

export default function TypesOfStudents(): React.ReactElement {
  return (
    <BlogPost
      title="The 6 Types of Students — Which One Are You?"
      category="Self-Awareness"
      date="Feb 17, 2026"
      readTime="5 min read"
      icon={<Users size={28} />}
    >
      <p>
        Walk into any classroom and you'll find the same six archetypes. They exist across every
        university, every subject, every generation of students. The names change. The patterns
        don't. Identifying which type you are is not about labelling yourself — it's about seeing
        your habits clearly enough to change them.
      </p>

      <h2>1. The Last-Minute Crammer</h2>
      <p>
        This student studies with extraordinary intensity for 48 hours before every exam. They pull
        all-nighters fuelled by tea and anxiety, cover weeks of material in hours, and often walk
        out of the exam hall feeling like it went reasonably well. And it usually does — in the
        short term. The problem is the retention window. Within a week, almost everything is gone.
        By the time finals come around, they're starting from scratch again.
      </p>
      <p>
        <strong>What they need:</strong> A semester plan and a 30-minute daily review habit. Even
        one short study session per day throughout the semester is more effective than 48 hours of
        intense cramming. The goal is to make exams feel like review, not discovery.
      </p>

      <h2>2. The Over-Achiever</h2>
      <p>
        They attend every lecture, sit in the front row, highlight entire textbooks, and make
        beautiful colour-coded notes. On paper, they look like the ideal student. But many
        over-achievers carry a quiet anxiety — they can never feel prepared enough because they
        equate quantity of effort with quality of learning. They confuse busy with effective.
      </p>
      <p>
        <strong>What they need:</strong> Fewer, deeper study sessions. Quality over quantity. The
        Feynman Technique is particularly useful here — it forces them to confront the difference
        between having read something and actually understanding it.
      </p>

      <h2>3. The Procrastinator</h2>
      <p>
        Always "going to start tomorrow." Has an extraordinary ability to find urgent reasons not to
        study right now. Their phone is their greatest adversary — and often their most loyal
        companion. The procrastinator isn't lazy. They are often overwhelmed or afraid of starting
        because starting makes the gap between where they are and where they need to be suddenly
        very real.
      </p>
      <p>
        <strong>What they need:</strong> To start with just 5 minutes. Set a timer for 5 minutes
        and open the book. Just open it. Momentum is the goal, not perfection. The hardest part is
        always starting — once in motion, the procrastinator can work well. Remove the phone from
        the room entirely.
      </p>

      <h2>4. The Social Butterfly</h2>
      <p>
        This student genuinely learns well in groups — discussion, debate, and explanation help
        solidify their understanding. But group sessions have a gravitational pull toward
        conversation, gossip, and distraction. What begins as a study group becomes a social
        gathering with textbooks open on the table as props.
      </p>
      <p>
        <strong>What they need:</strong> Structured group sessions with a defined agenda and a time
        limit. Set a clear goal at the start: "Today we will cover Chapters 3 and 4. We have 90
        minutes." Appoint someone to keep the session on track. Socialising is fine — build it into
        the break, not the session.
      </p>

      <h2>5. The Consistent Grinder</h2>
      <p>
        Two hours every day. Rain or shine. Exam season or vacation. This student doesn't rely on
        motivation — they rely on routine. They are the rarest archetype in any classroom, and often
        the most underestimated. During exam season, when others are panicking, the Consistent
        Grinder is calm. They've already done the work.
      </p>
      <p>
        <strong>What they need:</strong> To trust the process and resist the anxiety of comparison.
        During cramming season, their calmer, steadier approach can feel inadequate next to students
        in a visible frenzy of last-minute study. It isn't. The work was done. The grind was quiet.
        The results speak.
      </p>

      <h2>6. The Selective Studier</h2>
      <p>
        Smart, strategic, and sometimes brilliant. This student identifies what's likely to appear
        on the exam and focuses almost exclusively on those topics. Sometimes they're right and
        score well. Sometimes they skip a topic that accounts for 20% of the exam and pay a
        significant price. The selective studier confuses efficiency with coverage gaps.
      </p>
      <p>
        <strong>What they need:</strong> A minimum coverage threshold for every subject — a rule
        that says, "I must have at least touched every chapter before I start prioritising." Smart
        selection is a legitimate strategy; zero coverage of major topics is a gamble.
      </p>

      <div className="divider" />

      <p>
        No type is permanently fixed. Students shift between these archetypes as their habits
        evolve, as their workload changes, and as they mature. The point of this exercise is not
        self-judgement — it's self-awareness. <strong>Awareness is step one. Change is a
        habit.</strong> And habits are built one session at a time.
      </p>
    </BlogPost>
  )
}
