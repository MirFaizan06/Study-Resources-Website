import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  MessageSquare,
  GraduationCap,
  Download,
  Sparkles,
  TrendingUp,
  FileText,
  Lightbulb,
  LayoutGrid,
  Upload,
} from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import { ResourceCard } from '@/components/common/ResourceCard'
import { Badge } from '@/components/ui/Badge'
import { AdBanner } from '@/components/common/AdBanner'
import type { Institution, Resource, InstitutionType, PlatformStats } from '@/types'
import styles from './Home.module.scss'

// ─── Hero Background Carousel ────────────────────────────────────────────────
const HERO_BG_SLOTS = [1, 2, 3, 4, 5, 6, 7]
const CAROUSEL_INTERVAL = 5000

function HeroCarousel(): React.ReactElement {
  const [active, setActive] = useState(0)
  const [available, setAvailable] = useState<Set<number>>(new Set())
  const failed = useRef<Set<number>>(new Set())

  const advance = useCallback(() => {
    setActive((prev) => {
      for (let i = 1; i <= HERO_BG_SLOTS.length; i++) {
        const next = (prev + i) % HERO_BG_SLOTS.length
        if (!failed.current.has(next)) return next
      }
      return prev
    })
  }, [])

  useEffect(() => {
    const id = setInterval(advance, CAROUSEL_INTERVAL)
    return () => clearInterval(id)
  }, [advance])

  return (
    <div className={styles.heroBgCarousel} aria-hidden="true">
      {HERO_BG_SLOTS.map((n, i) => (
        <img
          key={n}
          src={`/images/hero/${n}.png`}
          alt=""
          className={[
            styles.heroBgImg,
            i === active && available.has(i) ? styles.heroBgImgActive : '',
          ].join(' ')}
          onLoad={() => setAvailable((s) => new Set([...s, i]))}
          onError={() => { failed.current.add(i) }}
        />
      ))}
    </div>
  )
}

// ─── Typewriter ───────────────────────────────────────────────────────────────
const TYPEWRITER_WORDS = ['Notes', 'Past Papers', 'Syllabi', 'Guess Papers', 'Study Materials']
const TYPE_SPEED = 60
const DELETE_SPEED = 35
const PAUSE_MS = 1800

function Typewriter(): React.ReactElement {
  const [displayed, setDisplayed] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [typing, setTyping] = useState(true)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const word = TYPEWRITER_WORDS[wordIdx]

    if (typing) {
      if (displayed.length < word.length) {
        timeout.current = setTimeout(() => {
          setDisplayed(word.slice(0, displayed.length + 1))
        }, TYPE_SPEED)
      } else {
        timeout.current = setTimeout(() => setTyping(false), PAUSE_MS)
      }
    } else {
      if (displayed.length > 0) {
        timeout.current = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1))
        }, DELETE_SPEED)
      } else {
        setWordIdx((i) => (i + 1) % TYPEWRITER_WORDS.length)
        setTyping(true)
      }
    }

    return () => { if (timeout.current) clearTimeout(timeout.current) }
  }, [displayed, typing, wordIdx])

  return (
    <span className={styles.typewriter} aria-live="polite">
      {displayed}
      <span className={styles.cursor} aria-hidden="true" />
    </span>
  )
}

// ─── Feature pills ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: <FileText size={13} />,   label: 'Notes'       },
  { icon: <BookOpen size={13} />,   label: 'Past Papers' },
  { icon: <LayoutGrid size={13} />, label: 'Syllabi'     },
  { icon: <Lightbulb size={13} />,  label: 'Guess Papers'},
]

// ─── Institution type badge colours ──────────────────────────────────────────
const INSTITUTION_TYPE_VARIANT: Record<InstitutionType, 'blue' | 'purple' | 'green'> = {
  UNIVERSITY: 'blue',
  COLLEGE:    'purple',
  SCHOOL:     'green',
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
  container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
  item: {
    hidden: { opacity: 0, y: 20 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  },
}

// ─── Home page ────────────────────────────────────────────────────────────────
export default function Home(): React.ReactElement {
  const { t, locale } = useLocale()
  const [institutions, setInstitutions]       = useState<Institution[]>([])
  const [recentResources, setRecentResources] = useState<Resource[]>([])
  const [popularResources, setPopularResources] = useState<Resource[]>([])
  const [loadingInstitutions, setLoadingInstitutions] = useState(true)
  const [loadingResources, setLoadingResources]       = useState(true)
  const [platformStats, setPlatformStats]     = useState<PlatformStats | null>(null)

  const universitySectionRef = useRef<HTMLElement>(null)
  const recentSectionRef     = useRef<HTMLElement>(null)
  const popularSectionRef    = useRef<HTMLElement>(null)

  const uniInView     = useInView(universitySectionRef, { once: true, margin: '-80px' })
  const recentInView  = useInView(recentSectionRef,     { once: true, margin: '-80px' })
  const popularInView = useInView(popularSectionRef,    { once: true, margin: '-80px' })

  useHead({
    title:       t.seo.home.title,
    description: t.seo.home.description,
    ogImage:     '/images/og-home.png',
  })

  useEffect(() => {
    api.institutions.getAll()
      .then(setInstitutions)
      .catch(console.error)
      .finally(() => setLoadingInstitutions(false))

    Promise.all([
      api.resources.getAll({ sort: 'newest',  limit: 6 }),
      api.resources.getAll({ sort: 'popular', limit: 6 }),
    ])
      .then(([recent, popular]) => {
        setRecentResources(recent.data)
        setPopularResources(popular.data)
      })
      .catch(console.error)
      .finally(() => setLoadingResources(false))

    api.stats.get().then(setPlatformStats).catch(() => null)
  }, [])

  const fmtNum = (n: number) =>
    n >= 1000 ? `${Math.floor(n / 1000)}k+` : `${n}+`

  return (
    <div className={styles.page}>

      {/* ══════════════════════════════════════════════════════ HERO ══════════ */}
      <section className={styles.hero} aria-label="Hero">
        <HeroCarousel />

        {/* Dark scrim so images are vivid but text stays readable */}
        <div className={styles.heroScrim} aria-hidden="true" />

        <div className={styles.heroContent}>
          <motion.div
            className={styles.heroInner}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Eyebrow */}
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} aria-hidden="true" />
              Kashmir's Free Academic Hub
            </div>

            {/* Headline */}
            <h1 className={styles.heroTitle}>
              Find Your
              <br />
              <Typewriter />
            </h1>

            <p className={styles.heroSubtitle}>
              Free notes, past papers, syllabi and AI-powered guess papers for
              Kashmir University, Cluster University and more — all in one place.
            </p>

            {/* Feature pills */}
            <div className={styles.featurePills} aria-hidden="true">
              {FEATURES.map((f) => (
                <span key={f.label} className={styles.pill}>
                  {f.icon}
                  {f.label}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className={styles.heroCta}>
              <Link to={`/${locale}/browse`} className={styles.ctaPrimary}>
                <BookOpen size={17} aria-hidden="true" />
                Browse Resources
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <Link to={`/${locale}/contribute`} className={styles.ctaGhost}>
                <Upload size={16} aria-hidden="true" />
                Contribute
              </Link>
              <Link to={`/${locale}/request`} className={styles.ctaGhost}>
                <MessageSquare size={16} aria-hidden="true" />
                Request Notes
              </Link>
            </div>

            {/* Live stats */}
            <div className={styles.statsStrip}>
              {[
                { val: platformStats ? `${platformStats.totalResources.toLocaleString()}+` : '—', lbl: 'Resources' },
                { val: platformStats ? fmtNum(platformStats.totalDownloads) : '—', lbl: 'Downloads' },
                { val: platformStats ? `${platformStats.totalInstitutions}+` : '—', lbl: 'Universities' },
                { val: platformStats ? `${platformStats.requestsFulfilled}+` : '—', lbl: 'Requests Met' },
              ].map((s, i) => (
                <React.Fragment key={s.lbl}>
                  {i > 0 && <div className={styles.statDivider} aria-hidden="true" />}
                  <div className={styles.statItem}>
                    <span className={styles.statNum}>{s.val}</span>
                    <span className={styles.statLbl}>{s.lbl}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <div className={styles.scrollHint} aria-hidden="true">
          <motion.div
            className={styles.scrollDot}
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════ BROWSE BY UNIVERSITY ══ */}
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
              <p className={styles.sectionSubtitle}>Select your institution to get started</p>
            </div>
            <Link to={`/${locale}/browse`} className={styles.viewAllLink}>
              {t.home.sections.browseAll} <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {loadingInstitutions ? (
            <div className={styles.institutionsGrid}>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
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
                  <Link to={`/${locale}/browse/${inst.slug}`} className={styles.institutionCard}>
                    <div className={styles.instCardTop}>
                      <div className={styles.instIcon}>
                        {inst.logoUrl ? (
                          <img src={inst.logoUrl} alt={`${inst.name} logo`} className={styles.instLogo} width="36" height="36" />
                        ) : (
                          <GraduationCap size={22} aria-hidden="true" />
                        )}
                      </div>
                      <Badge variant={INSTITUTION_TYPE_VARIANT[inst.type]} size="sm">
                        {inst.type}
                      </Badge>
                    </div>
                    <h3 className={styles.instName}>{inst.name}</h3>
                    {inst.programs && (
                      <p className={styles.instMeta}>{inst.programs.length} {t.home.sections.programs}</p>
                    )}
                    <span className={styles.instAction}>
                      {t.home.institutionCard.browse}
                      <ArrowRight size={13} aria-hidden="true" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Ad Banner 1 */}
      <div className={styles.adRow}>
        <AdBanner slot="1234567890" format="auto" />
      </div>

      {/* ══════════════════════════════════════════════════ RECENTLY ADDED ══ */}
      <section
        className={[styles.section, styles.sectionAlt].join(' ')}
        ref={recentSectionRef}
        aria-labelledby="recent-heading"
      >
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionEyebrow}>
                <Sparkles size={12} aria-hidden="true" /> New
              </div>
              <h2 id="recent-heading" className={styles.sectionTitle}>
                {t.home.sections.recentlyAdded}
              </h2>
              <p className={styles.sectionSubtitle}>Latest study materials uploaded</p>
            </div>
            <Link to={`/${locale}/browse?sort=newest`} className={styles.viewAllLink}>
              {t.home.sections.viewAll} <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.resourcesGrid}>
            {loadingResources
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              : recentResources.map((resource, i) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={recentInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                  >
                    <ResourceCard resource={resource} locale={locale} />
                  </motion.div>
                ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ MOST DOWNLOADED ══ */}
      <section
        className={styles.section}
        ref={popularSectionRef}
        aria-labelledby="popular-heading"
      >
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionEyebrow}>
                <TrendingUp size={12} aria-hidden="true" /> Popular
              </div>
              <h2 id="popular-heading" className={styles.sectionTitle}>
                {t.home.sections.mostDownloaded}
              </h2>
              <p className={styles.sectionSubtitle}>Most downloaded by students this month</p>
            </div>
            <Link to={`/${locale}/browse?sort=popular`} className={styles.viewAllLink}>
              {t.home.sections.viewAll} <ChevronRight size={14} aria-hidden="true" />
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
                  <motion.div key={i} variants={stagger.item}><SkeletonCard /></motion.div>
                ))
              : popularResources.map((resource) => (
                  <motion.div key={resource.id} variants={stagger.item}>
                    <ResourceCard resource={resource} locale={locale} />
                  </motion.div>
                ))}
          </motion.div>
        </div>
      </section>

      {/* Ad Banner 2 */}
      <div className={styles.adRow}>
        <AdBanner slot="0987654321" format="auto" />
      </div>

      {/* ══════════════════════════════════════════════════════ BOARD PROMO ═ */}
      <section className={[styles.section, styles.sectionAlt].join(' ')}>
        <div className={styles.sectionInner}>
          <div className={styles.boardPromo}>
            <div className={styles.boardPromoText}>
              <span className={styles.sectionEyebrow}>
                <TrendingUp size={12} aria-hidden="true" />
                {t.home.sections.boardEyebrow}
              </span>
              <h2 className={styles.sectionTitle}>{t.home.sections.boardTitle}</h2>
              <p className={styles.sectionSubtitle}>{t.home.sections.boardSubtitle}</p>
            </div>
            <Link to={`/${locale}/board`} className={styles.boardPromoBtn}>
              {t.home.sections.boardCta}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ CTA BANNER ══ */}
      <section className={styles.ctaBanner} aria-label="Request materials">
        <div className={styles.ctaBannerInner}>
          <div className={styles.ctaBannerIcon} aria-hidden="true">
            <Download size={26} />
          </div>
          <div className={styles.ctaBannerText}>
            <h2 className={styles.ctaBannerTitle}>{t.home.sections.ctaBanner}</h2>
            <p className={styles.ctaBannerSub}>{t.home.sections.ctaBannerSub}</p>
          </div>
          <Link to={`/${locale}/request`} className={styles.ctaBannerBtn}>
            <MessageSquare size={16} aria-hidden="true" />
            {t.home.sections.ctaBannerButton}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </section>

    </div>
  )
}
