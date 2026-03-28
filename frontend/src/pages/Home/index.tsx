import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  MessageSquare,
  GraduationCap,
  Library,
} from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import { ResourceCard } from '@/components/common/ResourceCard'
import { Badge } from '@/components/ui/Badge'
import { AdBanner } from '@/components/common/AdBanner'
import type { Institution, Resource, InstitutionType } from '@/types'
import styles from './Home.module.scss'

const INSTITUTION_TYPE_VARIANT: Record<InstitutionType, 'blue' | 'purple' | 'green'> = {
  UNIVERSITY: 'blue',
  COLLEGE: 'purple',
  SCHOOL: 'green',
}

function SkeletonCard(): React.ReactElement {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonLine} style={{ width: '60%', height: '20px' }} />
      <div className={styles.skeletonLine} style={{ width: '40%', height: '16px', marginTop: '8px' }} />
      <div className={styles.skeletonLine} style={{ width: '80%', height: '14px', marginTop: '12px' }} />
    </div>
  )
}

const stagger = {
  container: {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  },
}

export default function Home(): React.ReactElement {
  const { t, locale } = useLocale()
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [recentResources, setRecentResources] = useState<Resource[]>([])
  const [popularResources, setPopularResources] = useState<Resource[]>([])
  const [loadingInstitutions, setLoadingInstitutions] = useState(true)
  const [loadingResources, setLoadingResources] = useState(true)

  const universitySectionRef = useRef<HTMLElement>(null)
  const recentSectionRef = useRef<HTMLElement>(null)
  const popularSectionRef = useRef<HTMLElement>(null)

  const uniInView = useInView(universitySectionRef, { once: true, margin: '-80px' })
  const recentInView = useInView(recentSectionRef, { once: true, margin: '-80px' })
  const popularInView = useInView(popularSectionRef, { once: true, margin: '-80px' })

  useHead({
    title: t.seo.home.title,
    description: t.seo.home.description,
    ogImage: '/images/og-home.png',
  })

  useEffect(() => {
    api.institutions
      .getAll()
      .then(setInstitutions)
      .catch(console.error)
      .finally(() => setLoadingInstitutions(false))

    Promise.all([
      api.resources.getAll({ sort: 'newest', limit: 6 }),
      api.resources.getAll({ sort: 'popular', limit: 6 }),
    ])
      .then(([recent, popular]) => {
        setRecentResources(recent.data)
        setPopularResources(popular.data)
      })
      .catch(console.error)
      .finally(() => setLoadingResources(false))
  }, [])

  return (
    <div className={styles.page}>
      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <section className={styles.hero} aria-label="Hero">
        <div className={styles.heroPattern} aria-hidden="true" />
        <div className={styles.heroContent}>
          <motion.div
            className={styles.heroText}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className={styles.heroBadge}>
              <Library size={14} aria-hidden="true" />
              <span>Kashmir's #1 Free Academic Hub</span>
            </div>

            <h1 className={styles.heroTitle}>{t.home.hero.title}</h1>
            <p className={styles.heroSubtitle}>{t.home.hero.subtitle}</p>

            <div className={styles.heroCta}>
              <Link to={`/${locale}/browse`} className={styles.ctaPrimary}>
                <BookOpen size={18} aria-hidden="true" />
                {t.home.hero.cta}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link to={`/${locale}/request`} className={styles.ctaSecondary}>
                <MessageSquare size={18} aria-hidden="true" />
                {t.home.hero.ctaSecondary}
              </Link>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNumber}>1,000+</span>
                <span className={styles.heroStatLabel}>Resources</span>
              </div>
              <div className={styles.heroStatDivider} aria-hidden="true" />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNumber}>10k+</span>
                <span className={styles.heroStatLabel}>Downloads</span>
              </div>
              <div className={styles.heroStatDivider} aria-hidden="true" />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNumber}>5+</span>
                <span className={styles.heroStatLabel}>Universities</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={styles.heroIllustration}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <img
              src="/images/hero-illustration.png"
              alt={t.home.hero.imageAlt}
              className={styles.heroImg}
              loading="eager"
              width="560"
              height="480"
            />
          </motion.div>
        </div>
      </section>

      {/* ─── Browse by University ──────────────────────────────────────────────── */}
      <section
        className={styles.section}
        ref={universitySectionRef}
        aria-labelledby="universities-heading"
      >
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="universities-heading" className={styles.sectionTitle}>
                {t.home.sections.universities}
              </h2>
              <p className={styles.sectionSubtitle}>
                Find resources from your institution
              </p>
            </div>
            <Link to={`/${locale}/browse`} className={styles.viewAllLink}>
              {t.home.sections.browseAll}
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          </div>

          {loadingInstitutions ? (
            <div className={styles.institutionsGrid}>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : institutions.length === 0 ? (
            <p className={styles.emptyMessage}>{t.home.noInstitutions}</p>
          ) : (
            <motion.div
              className={styles.institutionsGrid}
              variants={stagger.container}
              initial="hidden"
              animate={uniInView ? 'show' : 'hidden'}
            >
              {institutions.map((inst) => (
                <motion.div key={inst.id} variants={stagger.item}>
                  <Link
                    to={`/${locale}/browse/${inst.slug}`}
                    className={styles.institutionCard}
                  >
                    <div className={styles.institutionCardTop}>
                      <div className={styles.institutionIcon}>
                        {inst.logoUrl ? (
                          <img
                            src={inst.logoUrl}
                            alt={`${inst.name} logo`}
                            className={styles.institutionLogo}
                            width="40"
                            height="40"
                          />
                        ) : (
                          <GraduationCap size={28} aria-hidden="true" />
                        )}
                      </div>
                      <Badge
                        variant={INSTITUTION_TYPE_VARIANT[inst.type]}
                        size="sm"
                      >
                        {inst.type}
                      </Badge>
                    </div>

                    <h3 className={styles.institutionName}>{inst.name}</h3>

                    {inst.programs && (
                      <p className={styles.institutionMeta}>
                        {inst.programs.length} {t.home.sections.programs}
                      </p>
                    )}

                    <span className={styles.browseBtn}>
                      {t.home.institutionCard.browse}
                      <ArrowRight size={14} aria-hidden="true" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ─── Ad Banner 1 (between University section and Recently Added) ─────── */}
      <div className={styles.adRow}>
        <AdBanner slot="1234567890" format="auto" />
      </div>

      {/* ─── Recently Added ────────────────────────────────────────────────────── */}
      <section
        className={[styles.section, styles.sectionAlt].join(' ')}
        ref={recentSectionRef}
        aria-labelledby="recent-heading"
      >
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="recent-heading" className={styles.sectionTitle}>
                {t.home.sections.recentlyAdded}
              </h2>
              <p className={styles.sectionSubtitle}>Latest study materials</p>
            </div>
            <Link to={`/${locale}/browse?sort=newest`} className={styles.viewAllLink}>
              {t.home.sections.viewAll}
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.carousel}>
            {loadingResources
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              : recentResources.map((resource) => (
                  <motion.div
                    key={resource.id}
                    className={styles.carouselItem}
                    initial={{ opacity: 0, x: 20 }}
                    animate={recentInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    <ResourceCard resource={resource} locale={locale} />
                  </motion.div>
                ))}
          </div>
        </div>
      </section>

      {/* ─── Most Downloaded ──────────────────────────────────────────────────── */}
      <section
        className={styles.section}
        ref={popularSectionRef}
        aria-labelledby="popular-heading"
      >
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="popular-heading" className={styles.sectionTitle}>
                {t.home.sections.mostDownloaded}
              </h2>
              <p className={styles.sectionSubtitle}>
                Most popular resources among students
              </p>
            </div>
            <Link to={`/${locale}/browse?sort=popular`} className={styles.viewAllLink}>
              {t.home.sections.viewAll}
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <motion.div
            className={styles.resourcesGrid}
            variants={stagger.container}
            initial="hidden"
            animate={popularInView ? 'show' : 'hidden'}
          >
            {loadingResources
              ? Array.from({ length: 6 }).map((_, i) => (
                  <motion.div key={i} variants={stagger.item}>
                    <SkeletonCard />
                  </motion.div>
                ))
              : popularResources.map((resource) => (
                  <motion.div key={resource.id} variants={stagger.item}>
                    <ResourceCard resource={resource} locale={locale} />
                  </motion.div>
                ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Ad Banner 2 (before CTA banner) ─────────────────────────────────── */}
      <div className={styles.adRow}>
        <AdBanner slot="0987654321" format="auto" />
      </div>

      {/* ─── CTA Banner ───────────────────────────────────────────────────────── */}
      <section className={styles.ctaBanner} aria-label="Request materials">
        <div className={styles.ctaBannerInner}>
          <div className={styles.ctaBannerText}>
            <h2 className={styles.ctaBannerTitle}>
              {t.home.sections.ctaBanner}
            </h2>
            <p className={styles.ctaBannerSubtitle}>
              {t.home.sections.ctaBannerSub}
            </p>
          </div>
          <Link to={`/${locale}/request`} className={styles.ctaBannerBtn}>
            <MessageSquare size={18} aria-hidden="true" />
            {t.home.sections.ctaBannerButton}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}
