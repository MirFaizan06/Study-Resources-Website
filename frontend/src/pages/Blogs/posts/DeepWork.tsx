// TODO: Localization for this page will be added in a future release due to content complexity.

import React from 'react'
import { Zap } from 'lucide-react'
import BlogPost from '../BlogPost'

export default function DeepWork(): React.ReactElement {
  return (
    <BlogPost
      title="Deep Work: The Student's Secret Weapon"
      category="Productivity"
      date="Mar 1, 2026"
      readTime="7 min read"
      icon={<Zap size={28} />}
    >
      <p>
        The most valuable students are not the ones who study the most hours. They are the ones who
        study the most <em>focused</em> hours. There is a name for this kind of work, coined by
        author and professor Cal Newport: <strong>Deep Work</strong>.
      </p>

      <h2>What Is Deep Work?</h2>
      <p>
        Deep work is cognitively demanding work performed in a distraction-free state. It is the
        kind of studying where you are fully present — where time passes strangely, where complex
        ideas click, where a two-hour session produces more than a six-hour one.
      </p>
      <p>
        The opposite of deep work is <strong>shallow work</strong> — low-effort, easily
        interrupted tasks. For students, shallow work looks like: re-reading highlighted notes,
        checking notifications between paragraphs, watching lecture recordings at 1.5x speed while
        scrolling, being physically present in a study room while mentally absent.
      </p>
      <p>
        Most students spend most of their study time in shallow work. They feel busy. They are not
        being productive.
      </p>

      <h2>Why Students Fail at Deep Work</h2>
      <p>
        Research from Microsoft (2005) found that the average knowledge worker checks their phone or
        gets distracted every 6 minutes. After each interruption, it takes an average of{' '}
        <strong>23 minutes to fully regain concentration</strong>. Do the math: if you check your
        phone four times in a study session, you have effectively lost 92 minutes of focus before
        accounting for any actual time spent on the phone.
      </p>
      <p>
        For students, the situation is often worse. Phones are designed by teams of engineers and
        psychologists to be maximally engaging. Every notification, every scroll, every like is an
        engineered dopamine hit. Studying requires sustained, delayed-reward thinking. These two
        things are in direct competition — and the phone has billions of dollars invested in winning.
      </p>

      <h2>The 4 Rules for Students</h2>
      <ul>
        <li>
          <strong>No phone in the room during study.</strong> Not on silent. Not face-down. Not in
          your bag. In another room. The mere presence of a smartphone on a desk — even face-down
          and switched off — measurably reduces available cognitive capacity (Ward et al., 2017,
          University of Texas). The phone must leave the room.
        </li>
        <li>
          <strong>Start with 30-minute blocks and build to 90 minutes.</strong> If you currently
          can't focus for 30 minutes without distraction, don't aim for 90 from day one. Build the
          capacity. Start with 30 minutes of genuine, phone-free, singular focus. After two weeks,
          move to 45. Build toward the 90-minute ceiling.
        </li>
        <li>
          <strong>Write one sentence before you start.</strong> At the beginning of every session,
          write: "In this block, I will ___." Complete the sentence with a specific, achievable
          task. "Cover Chapter 4 and write a half-page summary." Not "study chemistry." The
          specificity tells your brain where to direct its attention.
        </li>
        <li>
          <strong>Track deep work hours, not study hours.</strong> Hours spent in a library ≠ deep
          work hours. Keep a simple log. Each day, record how many genuine, distraction-free,
          cognitively engaged hours you completed. Even 2 hours of deep work per day, sustained over
          a semester, compounds into a level of mastery that shallowly-working students cannot match
          regardless of total hours logged.
        </li>
      </ul>

      <h2>Deep Work vs. Busyness</h2>
      <p>
        Busyness and productivity are not the same thing, but they can feel identical from the
        inside. A student who spends 6 hours in a study room — checking their phone periodically,
        chatting, re-reading familiar notes — feels like they studied. They put in the time. They
        were present.
      </p>
      <p>
        A student who does 2 focused hours — phone removed, one task, no interruptions — produces
        more, retains more, and finishes the session with energy remaining. They also have 4 hours
        left in their day for rest, social connection, and recovery. This is the paradox of deep
        work: doing less (in hours) produces more (in output).
      </p>

      <h2>Building the Habit</h2>
      <p>
        Deep work is a skill, not a personality trait. It is built through repetition like any other
        habit. The most reliable method: <strong>same time, same place, every day</strong>.
      </p>
      <p>
        Pick one deep work block per day. Anchor it to a consistent time — right after morning tea,
        immediately after the last class, before dinner. Anchor it to a consistent place — your desk,
        the library, a specific room. Remove the phone. Start the timer. Begin.
      </p>
      <p>
        Treat this block like a class you cannot skip. You do not negotiate with yourself about
        whether you feel like attending a lecture. Apply the same logic to your deep work block.
        Show up. The motivation will arrive during the session, not before it.
      </p>

      <div className="divider" />

      <div className="tip">
        The phone is not your friend during study. It is an engagement machine designed by
        billion-dollar companies to keep you scrolling. They have entire teams working to capture
        your attention. Respect the competition — and remove it from the room.
      </div>
    </BlogPost>
  )
}
