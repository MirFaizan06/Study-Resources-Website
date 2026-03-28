import React from 'react'
import { motion } from 'framer-motion'
import { Brain, FileText, FlaskConical, Sparkles, Clock } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import styles from './AI.module.scss'

const FEATURE_ICONS = [Brain, FlaskConical, FileText, Sparkles]

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
              <span>{t.ai.badge}</span>
            </div>

            <h1 className={styles.heroTitle}>
              {t.ai.title}
              <span className={styles.heroAccent}> {t.ai.titleAccent}</span>
            </h1>

            <p className={styles.heroSubtitle}>{t.ai.subtitle}</p>

            <div className={styles.heroCta}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} />
              </div>
              <p className={styles.progressLabel}>{t.ai.progressLabel}</p>
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
          <h2 className={styles.featuresTitle}>{t.ai.featuresTitle}</h2>
          <p className={styles.featuresSubtitle}>{t.ai.featuresSubtitle}</p>

          <div className={styles.featureGrid}>
            {t.ai.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i] ?? Brain
              return (
                <motion.div
                  key={i}
                  className={styles.featureCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div className={styles.featureIconWrap} aria-hidden="true">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className={styles.featureTitle}>{f.title}</h3>
                    <p className={styles.featureDesc}>{f.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Notice ──────────────────────────────────────────────────────────── */}
      <section className={styles.notice}>
        <div className={styles.noticeInner}>
          <Sparkles size={20} className={styles.noticeIcon} aria-hidden="true" />
          <p className={styles.noticeText}>{t.ai.noticeText}</p>
          <a href={`/${locale}/browse`} className={styles.noticeBtn}>
            {t.ai.noticeBtn}
          </a>
        </div>
      </section>
    </div>
  )
}
