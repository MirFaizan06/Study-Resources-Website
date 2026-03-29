import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Download, BookOpen, Heart, ExternalLink, Code2 } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import type { PlatformStats } from '@/types'
import styles from './About.module.scss'

const ICON_MAP: Record<string, React.ReactNode> = {
  Search: <Search size={28} />,
  Download: <Download size={28} />,
  BookOpen: <BookOpen size={28} />,
}

export default function About(): React.ReactElement {
  const { t } = useLocale()
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)

  useEffect(() => {
    api.stats.get().then(setPlatformStats).catch(() => null)
  }, [])

  useHead({
    title: t.seo.about.title,
    description: t.seo.about.description,
  })

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero} aria-label="About hero">
        <div className={styles.heroInner}>
          <motion.div
            className={styles.heroText}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className={styles.heroTitle}>{t.about.title}</h1>
            <p className={styles.heroSubtitle}>{t.about.subtitle}</p>
          </motion.div>
          <motion.div
            className={styles.heroIllustration}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <img
              src="/images/about-illustration.png"
              alt={t.about.imageAlt}
              className={styles.heroImg}
              width="480"
              height="380"
            />
          </motion.div>
        </div>
      </section>

      <div className={styles.container}>
        {/* Mission */}
        <section className={styles.missionSection} aria-labelledby="mission-heading">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45 }}
          >
            <h2 id="mission-heading" className={styles.sectionTitle}>
              {t.about.mission}
            </h2>
            <p className={styles.missionText}>{t.about.missionText}</p>
            <p className={styles.missionDesc}>{t.about.description}</p>
          </motion.div>
        </section>

        {/* How it works */}
        <section className={styles.howItWorks} aria-labelledby="how-heading">
          <h2 id="how-heading" className={styles.sectionTitle}>
            {t.about.howItWorks.title}
          </h2>
          <div className={styles.howSteps}>
            {t.about.howItWorks.steps.map((step, i) => (
              <motion.div
                key={i}
                className={styles.howStep}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.12, duration: 0.45 }}
              >
                <div className={styles.howStepIcon} aria-hidden="true">
                  {ICON_MAP[step.icon] ?? <BookOpen size={28} />}
                </div>
                <div className={styles.howStepNumber} aria-label={`Step ${i + 1}`}>
                  {i + 1}
                </div>
                <h3 className={styles.howStepTitle}>{step.title}</h3>
                <p className={styles.howStepDesc}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className={styles.statsSection} aria-labelledby="stats-heading">
          <h2 id="stats-heading" className={styles.srOnly}>
            Platform Statistics
          </h2>
          <div className={styles.statsGrid}>
            {t.about.stats.map((stat, i) => {
              let liveValue: string
              if (!platformStats) {
                liveValue = '—'
              } else if (i === 0) {
                liveValue = `${platformStats.totalResources.toLocaleString()}+`
              } else if (i === 1) {
                liveValue = platformStats.totalDownloads >= 1000
                  ? `${Math.floor(platformStats.totalDownloads / 1000)}k+`
                  : `${platformStats.totalDownloads}+`
              } else if (i === 2) {
                liveValue = `${platformStats.totalInstitutions}+`
              } else if (i === 3) {
                liveValue = `${platformStats.requestsFulfilled}+`
              } else {
                liveValue = '—'
              }
              return (
                <motion.div
                  key={i}
                  className={styles.statCard}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <span className={styles.statValue}>{liveValue}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Team */}
        <section className={styles.teamSection} aria-labelledby="team-heading">
          <div className={styles.teamCard}>
            <div className={styles.teamIcon} aria-hidden="true">
              <BookOpen size={40} />
            </div>
            <div className={styles.teamContent}>
              <h2 id="team-heading" className={styles.sectionTitle}>
                {t.about.team.title}
              </h2>
              <p className={styles.teamDesc}>{t.about.team.description}</p>
            </div>
          </div>
        </section>

        {/* Developers */}
        <section className={styles.devSection} aria-labelledby="dev-heading">
          <h2 id="dev-heading" className={styles.sectionTitle}>
            {t.about.developers.title}
          </h2>
          <p className={styles.devSubtitle}>{t.about.developers.subtitle}</p>
          <div className={styles.devGrid}>
            {t.about.developers.people.map((person, i) => (
              <motion.div
                key={i}
                className={styles.devCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <div className={styles.devAvatar} aria-hidden="true">
                  <Code2 size={28} />
                </div>
                <div className={styles.devInfo}>
                  <h3 className={styles.devName}>{person.name}</h3>
                  <p className={styles.devRole}>{person.role}</p>
                  <p className={styles.devBio}>{person.bio}</p>
                  {person.portfolioUrl && (
                    <a
                      href={person.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.devPortfolio}
                    >
                      Portfolio
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Donate */}
        <section
          id="donate"
          className={styles.donateSection}
          aria-labelledby="donate-heading"
        >
          <div className={styles.donateCard}>
            <div className={styles.donateIconWrap} aria-hidden="true">
              <Heart size={36} />
            </div>
            <h2 id="donate-heading" className={styles.donateSectionTitle}>
              {t.about.donate.title}
            </h2>
            <p className={styles.donateDescription}>{t.about.donate.description}</p>
            <a
              href={import.meta.env.VITE_RAZORPAY_LINK ?? 'https://rzp.io/l/noteshub-kasmir'}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.donateBtn}
            >
              <Heart size={18} aria-hidden="true" />
              {t.about.donate.button}
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
