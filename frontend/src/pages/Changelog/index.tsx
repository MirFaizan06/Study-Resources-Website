// TODO: Localization for this page will be added in a future release due to content complexity.

import React from 'react'
import { motion } from 'framer-motion'
import { GitCommitHorizontal } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import styles from './Changelog.module.scss'

interface ChangelogEntry {
  version: string
  date: string
  name: string
  type: 'major' | 'patch'
  features?: string[]
  note?: string
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: 'v0.0.0',
    date: 'December 2025',
    name: 'Initial Release',
    type: 'major',
    features: [
      'Platform foundation: React frontend + Node.js backend',
      'MySQL database with Prisma ORM',
      'Multi-language support (EN, UR, KS, HI, PA, DOI)',
      '8 custom themes',
    ],
  },
  {
    version: 'v0.0.1',
    date: 'January 2026',
    name: 'Resources Module',
    type: 'major',
    features: [
      'Full resource library: Notes, PYQs, Syllabi, Guess Papers',
      'Kashmir University + Cluster University support',
      'AI-Generated Guess Papers with disclaimer tags',
      'Contribute & Request Materials workflows',
      'Admin panel: upload, approve, manage resources',
    ],
  },
  {
    version: 'v0.0.2',
    date: 'January 2026',
    name: 'Bug Fixes & Polish',
    type: 'patch',
    note: 'Fixed mobile navigation, improved search debounce, auth token refresh stability, CORS fixes in production.',
  },
  {
    version: 'v0.0.3',
    date: 'January 2026',
    name: 'UI Improvements',
    type: 'patch',
    note: 'New hero carousel animation, improved resource card layout, stats strip added to homepage, footer redesign with social links.',
  },
  {
    version: 'v0.0.4',
    date: 'February 2026',
    name: 'Student Concerns Board',
    type: 'major',
    features: [
      'Anonymous concern posting with ToS gate',
      'Upvoting + downvoting system',
      'Threaded comments',
      'Admin moderation + PENDING_REVIEW flow',
      'Board Tutorial for new users',
    ],
  },
  {
    version: 'v0.0.5',
    date: 'February 2026',
    name: 'Security & Auth',
    type: 'patch',
    note: 'Refresh token implementation, board rate limiting (1 post/week), IP-based vote deduplication, admin ban/unban system.',
  },
  {
    version: 'v0.0.6',
    date: 'March 2026',
    name: 'Performance',
    type: 'patch',
    note: 'Lazy-loaded locale chunks, code splitting improvements, /browse renamed to /resources, Navbar Resources + Board highlights.',
  },
  {
    version: 'v0.0.7',
    date: 'March 2026',
    name: 'Study Hub',
    type: 'major',
    features: [
      'Study Blogs (5 articles)',
      'Study Plans with PDF export',
      'Changelog page',
      'Version badge in footer',
    ],
  },
  {
    version: 'v0.0.8',
    date: 'April 2026',
    name: 'Bug Fixes & Theme Purge',
    type: 'patch',
    note: 'Fixed board post visibility issue, removed unused themes, added Discord Dark theme, and improved cache invalidation.',
  },
  {
    version: 'v0.0.9',
    date: 'April 2026',
    name: 'U.N.I.T. Rebranding & UI/UX Rewamp',
    type: 'major',
    features: [
      'Full Rebranding: NotesHub Kashmir is now U.N.I.T.',
      'Board renamed to Node system',
      'Modern glassmorphism UI/UX design and softer shadows',
      'New typography setup with Inter & Outfit',
    ],
  },
]

export default function Changelog(): React.ReactElement {
  // locale used for potential future links
  useLocale()

  const latestVersion = CHANGELOG[CHANGELOG.length - 1].version

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.betaBadge}>
          <GitCommitHorizontal size={14} />
          <span>Beta</span>
        </div>
        <h1 className={styles.title}>Changelog</h1>
        <p className={styles.subtitle}>
          Every feature, fix, and improvement — documented.
        </p>
      </section>

      {/* Timeline */}
      <div className={styles.timeline}>
        {[...CHANGELOG].reverse().map((entry, index) => (
          <motion.div
            key={entry.version}
            className={styles.entry}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.05 }}
          >
            <div
              className={`${styles.dot} ${
                entry.type === 'major' ? styles.dotMajor : styles.dotPatch
              }`}
            />
            <div className={styles.entryContent}>
              <div className={styles.entryHeader}>
                <span className={styles.versionBadge}>{entry.version}</span>
                {entry.version === latestVersion && (
                  <span className={styles.latestBadge}>Latest</span>
                )}
              </div>
              <div className={styles.releaseName}>{entry.name}</div>
              <div className={styles.releaseDate}>{entry.date}</div>
              {entry.type === 'major' && entry.features && (
                <ul className={styles.featureList}>
                  {entry.features.map((f, fi) => (
                    <li key={fi}>{f}</li>
                  ))}
                </ul>
              )}
              {entry.type === 'patch' && entry.note && (
                <p className={styles.patchNote}>{entry.note}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
