import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, FileText, FlaskConical, Sparkles, Clock, Heart } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import type { FundraiserStatus } from '@/types'
import styles from './AI.module.css'

const FEATURE_ICONS = [Brain, FlaskConical, FileText, Sparkles]

export default function AIPage(): React.ReactElement {
  const { t, locale } = useLocale()
  const [fundraiser, setFundraiser] = useState<FundraiserStatus | null>(null)

  useHead({
    title: t.seo.ai.title,
    description: t.seo.ai.description,
  })

  useEffect(() => {
    api.fundraiser.getStatus().then(setFundraiser).catch(() => null)
  }, [])

  const razorpayLink = import.meta.env.VITE_RAZORPAY_LINK ?? 'https://rzp.io/l/U.N.I.T.-kasmir'

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

      {/* ─── Fundraiser ──────────────────────────────────────────────────────── */}
      <section className={styles.fundraiser} aria-labelledby="fundraiser-heading">
        <div className={styles.fundraiserInner}>
          <motion.div
            className={styles.fundraiserCard}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45 }}
          >
            <h2 id="fundraiser-heading" className={styles.fundraiserTitle}>
              {t.aiFundraiser.title}
            </h2>
            <p className={styles.fundraiserSubtitle}>{t.aiFundraiser.subtitle}</p>

            <div className={styles.fundraiserStats}>
              <div className={styles.fundraiserStat}>
                <span className={styles.fundraiserStatValue}>
                  {fundraiser ? `₹${fundraiser.totalRaised.toLocaleString()}` : '—'}
                </span>
                <span className={styles.fundraiserStatLabel}>{t.aiFundraiser.raised}</span>
              </div>
              <div className={styles.fundraiserStat}>
                <span className={styles.fundraiserStatValue}>
                  {fundraiser ? `₹${fundraiser.goal.toLocaleString()}` : '₹10,000'}
                </span>
                <span className={styles.fundraiserStatLabel}>{t.aiFundraiser.goal}</span>
              </div>
              <div className={styles.fundraiserStat}>
                <span className={styles.fundraiserStatValue}>
                  {fundraiser ? fundraiser.contributorCount : '—'}
                </span>
                <span className={styles.fundraiserStatLabel}>{t.aiFundraiser.contributors}</span>
              </div>
            </div>

            <div className={styles.fundraiserBar} role="progressbar" aria-valuenow={fundraiser?.percentFunded ?? 0} aria-valuemin={0} aria-valuemax={100}>
              <div
                className={styles.fundraiserFill}
                style={{ width: `${fundraiser?.percentFunded ?? 0}%` }}
              />
            </div>
            <p className={styles.fundraiserPercent}>
              {fundraiser ? fundraiser.percentFunded : 0}% {t.aiFundraiser.funded} · {t.aiFundraiser.progressLabel}
            </p>

            <a
              href={razorpayLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.fundraiserBtn}
            >
              <Heart size={15} aria-hidden="true" />
              {t.aiFundraiser.contribute}
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─── Notice ──────────────────────────────────────────────────────────── */}
      <section className={styles.notice}>
        <div className={styles.noticeInner}>
          <Sparkles size={20} className={styles.noticeIcon} aria-hidden="true" />
          <p className={styles.noticeText}>{t.ai.noticeText}</p>
          <a href={`/${locale}/resources`} className={styles.noticeBtn}>
            {t.ai.noticeBtn}
          </a>
        </div>
      </section>
    </div>
  )
}
