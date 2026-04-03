import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Download, BookOpen, Heart, ExternalLink, Code2, CheckCircle2 } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import type { PlatformStats } from '@/types'
import styles from './About.module.css'

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
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className={styles.hero} aria-label="About hero">
        <div className={styles.heroInner}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className={styles.unitBadge}>U.N.I.T. — University Notes &amp; Issue Tracker</p>
            <h1 className={styles.heroTitle}>{t.about.title}</h1>
            <p className={styles.heroSubtitle}>{t.about.subtitle}</p>
          </motion.div>
        </div>
      </section>

      <div className={styles.container}>
        {/* ─── Support Message (Floating Card) ──────────────────────────────── */}
        <section className={styles.supportMessageContainer}>
          <motion.div
            className={styles.supportMessageCard}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className={styles.supportMainText}>
              "This platform is yours. It exists for you. It exists because of you. 
              Together, we are building Kashmir's most resilient academic network."
            </p>
          </motion.div>
        </section>

        {/* ─── The Node (Rebrand Info) ───────────────────────────────────────── */}
        <section className={styles.nodeSection}>
          <motion.div
            className={styles.nodeCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.nodeBadge}>Platform Feature</div>
            <h2 className={styles.nodeTitle}>The Node: Network for Open Discussions & Education</h2>
            <p className={styles.nodeText}>
              Formerly the Board, <strong>The Node</strong> is our dedicated space for collective intelligence. 
              We believe that education isn't just about static notes—it's about the dynamic discussions that happen 
              around them. 
            </p>
            <p className={styles.nodeText}>
              From academic queries to campus concerns, The Node empowers you to speak, share, and solve. 
              Join the conversation today and experience academic collaboration redesigned.
            </p>
            <div className={styles.nodeFeatures}>
              <span className={styles.nodeFeature}><CheckCircle2 size={14} /> Open Discussion</span>
              <span className={styles.nodeFeature}><CheckCircle2 size={14} /> Global Impact</span>
              <span className={styles.nodeFeature}><CheckCircle2 size={14} /> Peer Support</span>
            </div>
          </motion.div>
        </section>
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

        {/* Origin Story */}
        <section className={styles.originSection} aria-labelledby="origin-heading">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45 }}
          >
            <h2 id="origin-heading" className={styles.sectionTitle}>
              {t.about.origin.title}
            </h2>
            <div className={styles.originText}>
              {t.about.origin.body.split('\n\n').map((para, i) => (
                <p key={i} className={styles.originParagraph}>{para}</p>
              ))}
            </div>
          </motion.div>
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
              href={import.meta.env.VITE_RAZORPAY_LINK ?? 'https://rzp.io/l/U.N.I.T.-kasmir'}
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
