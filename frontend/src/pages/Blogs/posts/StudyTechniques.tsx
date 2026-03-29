// TODO: Localization for this page will be added in a future release due to content complexity.

import React from 'react'
import { FlaskConical } from 'lucide-react'
import BlogPost from '../BlogPost'

export default function StudyTechniques(): React.ReactElement {
  return (
    <BlogPost
      title="Study Techniques Science Actually Backs"
      category="Methods"
      date="Jan 22, 2026"
      readTime="8 min read"
      icon={<FlaskConical size={28} />}
    >
      <p>
        Not all study methods are equal. Decades of cognitive science research have tested dozens of
        techniques — and most popular ones (re-reading, highlighting, summarising by copying) rank
        poorly in controlled studies. This article covers only the techniques with real empirical
        backing. Use these and you will outlearn students who put in twice your hours.
      </p>

      <h2>1. Spaced Repetition</h2>
      <p>
        The brain forgets. This is not a flaw — it is a filter. Information that isn't revisited
        fades on a predictable curve called the <strong>Ebbinghaus Forgetting Curve</strong>. Spaced
        repetition exploits this curve deliberately: you review material at increasing intervals just
        before you would forget it.
      </p>
      <p>
        A simple schedule: review on Day 1, Day 3, Day 7, Day 21, and Day 60. Each successful
        recall pushes the next review further into the future. Tools like{' '}
        <strong>Anki</strong> automate this scheduling. If you prefer paper, a simple notebook
        system with dated review sessions works just as well.
      </p>
      <p>
        The compound effect is dramatic. A concept reviewed five times over 60 days is retained for
        months. The same concept studied once for five hours is gone in a week.
      </p>

      <h2>2. Active Recall</h2>
      <p>
        Also known as the <strong>Testing Effect</strong>, active recall is the practice of testing
        yourself on material instead of passively re-reading it. The retrieval attempt itself
        strengthens the memory — whether you succeed or fail.
      </p>
      <p>
        How to apply it: after reading a section, close the book and answer these questions from
        memory: What was the main point? What were the key details? How does this connect to what I
        already know? Use flashcards, practice questions, and past papers liberally. Even an
        unsuccessful attempt — where you couldn't recall the answer — improves future retention over
        a re-read.
      </p>

      <h2>3. The Pomodoro Technique</h2>
      <p>
        Named after a tomato-shaped kitchen timer, the Pomodoro Technique structures work into 25
        minutes of focused effort followed by a 5-minute break. After four cycles (called a set),
        take a longer break of 20–30 minutes.
      </p>
      <p>
        The power of Pomodoro is not the timer — it's the commitment. During a Pomodoro, nothing
        else exists. No phone checks, no messages, no "quick looks" at social media. The 25-minute
        constraint makes focus achievable even when motivation is low. Start a timer, work until it
        rings, stop when it rings.
      </p>
      <p>
        This technique keeps momentum without burnout. It is particularly effective for subjects you
        find difficult or boring — breaking them into 25-minute blocks makes them far less
        psychologically intimidating.
      </p>

      <h2>4. The Feynman Technique</h2>
      <p>
        Named after Nobel Prize-winning physicist Richard Feynman, who was famous for his ability to
        explain complex ideas simply. The technique has four steps:
      </p>
      <ul>
        <li>
          <strong>Pick a concept</strong> you want to learn or revise.
        </li>
        <li>
          <strong>Explain it simply</strong> — write or speak as if you are teaching it to a
          12-year-old with no background in the subject.
        </li>
        <li>
          <strong>Identify the gaps</strong> — where did your explanation stumble? Where did you
          resort to jargon because you didn't actually understand?
        </li>
        <li>
          <strong>Go back and fill them</strong> — return to your source material and learn
          specifically what you couldn't explain.
        </li>
      </ul>
      <p>
        The Feynman Technique is brutal in the best way. It exposes the difference between
        recognition and understanding. If you can't explain it simply, you don't know it yet.
      </p>

      <h2>5. Interleaving</h2>
      <p>
        Traditional wisdom says to study one topic until you've mastered it before moving on — this
        is called <em>blocking</em>. Research consistently shows the opposite approach,{' '}
        <strong>interleaving</strong>, produces stronger long-term retention.
      </p>
      <p>
        Interleaving means mixing topics or problem types within a single session. Instead of solving
        20 questions on the same type of problem, solve 7 on one type, switch to another, then
        another. It feels harder in the moment — and that difficulty is the point. Your brain is
        forced to retrieve and apply knowledge in a less predictable context, which strengthens
        retention dramatically.
      </p>
      <p>
        Apply this to revision: instead of revising Chapter 1 fully before Chapter 2, rotate between
        chapters. It will feel less productive. It isn't.
      </p>

      <h2>6. Mind Mapping</h2>
      <p>
        Mind mapping is particularly effective for visual learners and subjects with many
        interconnected concepts. Start with a central topic in the middle of a blank page. Branch out
        to main themes, then sub-themes. Use colour, simple drawings, and as few words as possible.
      </p>
      <p>
        The critical rule: build the mind map <strong>from memory first</strong>. Only check your
        notes to fill in gaps. The act of constructing the map from retrieval makes it a genuine
        learning exercise, not just a copying exercise. A mind map made entirely from your notes is
        an index. A mind map made from memory is a revision tool.
      </p>

      <div className="divider" />

      <div className="tip">
        Start with Active Recall and Spaced Repetition. These two alone will outperform every other
        technique combined. Once they are habits, layer in the others.
      </div>
    </BlogPost>
  )
}
