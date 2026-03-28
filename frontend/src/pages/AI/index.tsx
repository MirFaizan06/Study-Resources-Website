import React from 'react'
import { motion } from 'framer-motion'
import { Brain, FileText, FlaskConical, Sparkles, Clock } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import styles from './AI.module.scss'

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Guess Paper Generator',
    desc: 'Upload a syllabus or past papers — our AI will generate targeted guess questions ranked by exam likelihood, so you focus only on what matters.',
  },
  {
    icon: FlaskConical,
    title: 'Mock Examiner',
    desc: 'Get quizzed on any subject in exam format. The AI grades your answers, explains mistakes, and tracks your confidence over time.',
  },
  {
    icon: FileText,
    title: 'Smart Notes Summariser',
    desc: 'Paste or upload dense notes and get a clean, exam-ready summary in seconds — bullet points, key definitions, and memory hooks included.',
  },
  {
    icon: Sparkles,
    title: 'Last-Minute Prep Mode',
    desc: 'Got 30 minutes before an exam? Tell us the subject and we\'ll build a personalised crash-plan — the 20% of content that covers 80% of marks.',
  },
]

export default function AIPage(): React.ReactElement {
  const { t, locale } = useLocale()

  useHead({
    title: t.seo.ai.title,
    description: t.seo.ai.description,
  })

  return (
    <div className={styles.page}>
      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.heroInner}>
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className={styles.badge}>
              <Clock size={13} aria-hidden="true" />
              <span>Coming Soon</span>
            </div>

            <h1 className={styles.heroTitle}>
              AI-Powered
              <span className={styles.heroAccent}> Exam Tools</span>
            </h1>

            <p className={styles.heroSubtitle}>
              We&apos;re building a suite of AI tools designed specifically for
              Kashmir University students — guess paper generation, mock exams,
              and instant last-minute prep. All free.
            </p>

            <div className={styles.heroCta}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} />
              </div>
              <p className={styles.progressLabel}>Development in progress</p>
            </div>
          </motion.div>

          <motion.div
            className={styles.heroIcon}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            aria-hidden="true"
          >
            <Brain size={120} className={styles.brainIcon} />
            <div className={styles.orbit} />
            <div className={styles.orbit2} />
          </motion.div>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────────────────── */}
      <section className={styles.features}>
        <div className={styles.featuresInner}>
          <h2 className={styles.featuresTitle}>What&apos;s being built</h2>
          <p className={styles.featuresSubtitle}>
            Every tool is built around one goal: help you pass your exams with less stress.
          </p>

          <div className={styles.featureGrid}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                className={styles.featureCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className={styles.featureIconWrap} aria-hidden="true">
                  <f.icon size={22} />
                </div>
                <div>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Notice ──────────────────────────────────────────────────────────── */}
      <section className={styles.notice}>
        <div className={styles.noticeInner}>
          <Sparkles size={20} className={styles.noticeIcon} aria-hidden="true" />
          <p className={styles.noticeText}>
            In the meantime, browse our existing collection of{' '}
            <strong>AI-generated Guess Papers</strong> — already available for
            multiple subjects, clearly tagged so you know what you&apos;re reading.
          </p>
          <a href={`/${locale}/browse`} className={styles.noticeBtn}>
            Browse Resources
          </a>
        </div>
      </section>
    </div>
  )
}
