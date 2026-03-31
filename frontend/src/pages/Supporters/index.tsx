import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Server, Cloud, Brain, Globe, ArrowLeft, Sparkles } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import styles from './Supporters.module.scss'

const REASON_ICONS: Record<string, React.ReactNode> = {
  Server: <Server size={22} />,
  Cloud: <Cloud size={22} />,
  Brain: <Brain size={22} />,
  Globe: <Globe size={22} />,
}

interface Donor {
  id: string
  donorName: string
  message: string | null
  amount: number | null
  isAnonymous: boolean
  createdAt: string
}

export default function SupportersPage(): React.ReactElement {
  const { t, locale } = useLocale()
  const [searchParams] = useSearchParams()
  const paymentId = searchParams.get('razorpay_payment_id')
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)

  useHead({
    title: t.seo.supporters.title,
    description: t.seo.supporters.description,
  })

  useEffect(() => {
    api.donors.list()
      .then(setDonors)
      .catch(() => setDonors([]))
      .finally(() => setLoading(false))
  }, [])

  const DONATION_URL =
    (import.meta.env.VITE_RAZORPAY_LINK as string | undefined) ??
    'https://rzp.io/l/U.N.I.T.-kasmir'

  return (
    <div className={styles.page}>
      {/* ─── Thank-you banner (after Razorpay redirect) ───────────────────── */}
      <AnimatePresence>
        {paymentId && (
          <motion.div
            className={styles.thankBanner}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className={styles.thankBannerInner}>
              <div className={styles.thankIcon}>
                <Heart size={28} />
              </div>
              <div>
                <h2 className={styles.thankTitle}>{t.supporters.thankYouTitle}</h2>
                <p className={styles.thankDesc}>{t.supporters.thankYouDesc}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.eyebrowRow}>
              <Heart size={16} className={styles.eyebrowIcon} />
              <span className={styles.eyebrow}>Community</span>
            </div>
            <h1 className={styles.heroTitle}>{t.supporters.title}</h1>
            <p className={styles.heroSubtitle}>{t.supporters.subtitle}</p>
          </motion.div>
        </div>
      </section>

      <div className={styles.layout}>
        {/* ─── Why we need support ─────────────────────────────────────────── */}
        <section className={styles.whySection}>
          <h2 className={styles.sectionTitle}>{t.supporters.whyTitle}</h2>
          <p className={styles.whyDesc}>{t.supporters.whyDesc}</p>
          <div className={styles.reasonsGrid}>
            {t.supporters.reasons.map((r, i) => (
              <motion.div
                key={i}
                className={styles.reasonCard}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <div className={styles.reasonIcon}>
                  {REASON_ICONS[r.icon] ?? <Sparkles size={22} />}
                </div>
                <h3 className={styles.reasonTitle}>{r.title}</h3>
                <p className={styles.reasonDesc}>{r.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className={styles.donateCta}>
            <a
              href={DONATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.donateBtn}
            >
              <Heart size={16} />
              {t.supporters.donateBtn}
            </a>
          </div>
        </section>

        {/* ─── Donors wall ─────────────────────────────────────────────────── */}
        <section className={styles.donorsSection}>
          <h2 className={styles.sectionTitle}>Wall of Thanks</h2>

          {loading ? (
            <div className={styles.donorGrid}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.skeletonDonor} />
              ))}
            </div>
          ) : donors.length === 0 ? (
            <div className={styles.emptyState}>
              <Heart size={40} className={styles.emptyIcon} />
              <p className={styles.emptyText}>{t.supporters.noSupporters}</p>
              <p className={styles.emptyHint}>{t.supporters.yourName}</p>
              <a
                href={DONATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.donateBtn}
              >
                <Heart size={14} />
                {t.supporters.beFirst}
              </a>
            </div>
          ) : (
            <div className={styles.donorGrid}>
              {donors.map((donor, i) => (
                <motion.div
                  key={donor.id}
                  className={styles.donorCard}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                >
                  <div className={styles.donorAvatar}>
                    {(donor.isAnonymous ? '?' : donor.donorName[0]).toUpperCase()}
                  </div>
                  <div className={styles.donorInfo}>
                    <span className={styles.donorName}>
                      {donor.isAnonymous ? t.supporters.anonymous : donor.donorName}
                    </span>
                    {donor.amount && (
                      <span className={styles.donorAmount}>
                        {t.supporters.donorCard} ₹{donor.amount}
                      </span>
                    )}
                    {donor.message && (
                      <p className={styles.donorMessage}>"{donor.message}"</p>
                    )}
                  </div>
                  <Heart size={14} className={styles.donorHeart} />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className={styles.backRow}>
        <Link to={`/${locale}/`} className={styles.backLink}>
          <ArrowLeft size={15} />
          {t.supporters.backToHome}
        </Link>
      </div>
    </div>
  )
}
