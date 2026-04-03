import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Download,
  Sparkles,
  TrendingUp,
  FileText,
  Lightbulb,
  LayoutGrid,
  Upload,
  Heart,
} from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import { ResourceCard } from '@/components/common/ResourceCard'
import { Badge } from '@/components/ui/Badge'
import type { Institution, Resource, InstitutionType, PlatformStats } from '@/types'
import styles from './Home.module.css'

// ─── Hero Background Carousel ────────────────────────────────────────────────
const HERO_BG_SLOTS = [1, 2, 3, 4, 5, 6, 7]
const CAROUSEL_INTERVAL = 5000

// In-memory image cache
const imageCache: Record<string, boolean> = {};

function HeroCarousel(): React.ReactElement {
  const [active, setActive] = useState(0)
  const [loaded, setLoaded] = useState<Record<number, boolean>>({})
  const failed = useRef<Set<number>>(new Set())

  // Prefetch images on mount
  useEffect(() => {
    HERO_BG_SLOTS.forEach((n, i) => {
      const src = `/images/hero/${n}.png`;
      if (imageCache[src]) {
        setLoaded(prev => ({ ...prev, [i]: true }));
        return;
      }
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageCache[src] = true;
        setLoaded(prev => ({ ...prev, [i]: true }));
      };
      img.onerror = () => failed.current.add(i);
    });
  }, []);

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
            i === active && loaded[i] ? styles.heroBgImgActive : '',
          ].join(' ')}
          loading="eager"
        />
      ))}
    </div>
  )
}

// ─── Typewriter ───────────────────────────────────────────────────────────────
const TYPEWRITER_WORDS = ['Notes', 'Past Papers', 'Syllabi', 'Guess Papers']
const TYPE_SPEED = 60
const DELETE_SPEED = 35
const PAUSE_MS = 2000

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


export default function Home(): React.ReactElement {
  const { t, locale } = useLocale()
  const [institutions, setInstitutions]       = useState<Institution[]>([])
  const [recentResources, setRecentResources] = useState<Resource[]>([])
  const [loadingInstitutions, setLoadingInstitutions] = useState(true)
  const [loadingResources, setLoadingResources]       = useState(true)
  const [platformStats, setPlatformStats]     = useState<PlatformStats | null>(null)

  const universitySectionRef = useRef<HTMLElement>(null)
  const recentSectionRef     = useRef<HTMLElement>(null)

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
    ])
      .then(([recent]) => {
        setRecentResources(recent.items || [])
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

        <div className={styles.heroScrim} aria-hidden="true" />

        <div className={styles.heroContent}>
          <div className={styles.heroInner}>
            <motion.div
              className={styles.heroBadge}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
            >
              <span className={styles.heroBadgeDot} aria-hidden="true" />
              U.N.I.T. — University Notes &amp; Issue Tracker
            </motion.div>

            <motion.h1
              className={styles.heroTitle}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Academic Excellence Starts Here
              <Typewriter />
            </motion.h1>

            <motion.p
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.25 }}
            >
              Access premium notes, verified past papers, and expert-crafted syllabi. 
              Built by students, for students in Kashmir.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              className={styles.featurePills}
              aria-hidden="true"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 }}
            >
              {FEATURES.map((f) => (
                <span key={f.label} className={styles.pill}>
                  {f.icon}
                  {f.label}
                </span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              className={styles.heroCta}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link to={`/${locale}/resources`} className={styles.ctaPrimary}>
                <BookOpen size={17} />
                Browse
              </Link>
              <Link to={`/${locale}/contribute`} className={styles.ctaGhost}>
                <Upload size={16} />
                Contribute
              </Link>
              <a
                href={import.meta.env.VITE_RAZORPAY_LINK ?? 'https://rzp.io/l/U.N.I.T.-kasmir'}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaDonate}
              >
                <Heart size={15} />
                Support Kashmir Hub
              </a>
            </motion.div>

            {platformStats && (
              <motion.div
                className={styles.statsStrip}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className={styles.statItem}>
                  <span className={styles.statNum}>{platformStats.totalResources.toLocaleString()}+</span>
                  <span className={styles.statLbl}>Resources</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                  <span className={styles.statNum}>{fmtNum(platformStats.totalDownloads)}</span>
                  <span className={styles.statLbl}>Downloads</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                  <span className={styles.statNum}>{platformStats.totalInstitutions}+</span>
                  <span className={styles.statLbl}>Institutions</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

      </section>

      {/* ══════════════════════════════════════════════ BROWSE BY UNIVERSITY ══ */}
      <section className={styles.section} ref={universitySectionRef}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>{t.home.sections.universities}</h2>
              <p className={styles.sectionSubtitle}>Verified materials from across the valley</p>
            </div>
            <Link to={`/${locale}/resources`} className={styles.viewAllLink}>
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className={styles.institutionsGrid}>
            {loadingInstitutions ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              institutions.map((inst) => (
                <Link key={inst.id} to={`/${locale}/resources/${inst.slug}`} className={styles.institutionCard}>
                  <div className={styles.instCardTop}>
                    <div className={styles.instIcon}>
                      {inst.logoUrl ? <img src={inst.logoUrl} alt="" className={styles.instLogo} /> : <GraduationCap size={22} />}
                    </div>
                    <Badge variant={INSTITUTION_TYPE_VARIANT[inst.type]} size="sm">{inst.type}</Badge>
                  </div>
                  <h3 className={styles.instName}>{inst.name}</h3>
                  <p className={styles.instMeta}>{inst.programs?.length ?? 0} {t.home.sections.programs}</p>
                  <span className={styles.instAction}>Browse <ArrowRight size={13} /></span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ RECENTLY ADDED ══ */}
      <section className={[styles.section, styles.sectionAlt].join(' ')} ref={recentSectionRef}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionEyebrow}><Sparkles size={12} /> New</div>
              <h2 className={styles.sectionTitle}>{t.home.sections.recentlyAdded}</h2>
              <p className={styles.sectionSubtitle}>Freshly uploaded study materials</p>
            </div>
          </div>
          <div className={styles.resourcesGrid}>
            {loadingResources
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              : recentResources.map((resource) => <ResourceCard key={resource.id} resource={resource} locale={locale} />)
            }
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ NODE PROMO ══ */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.boardPromo}>
            <div className={styles.boardPromoText}>
              <span className={styles.sectionEyebrow}><TrendingUp size={12} /> The Node</span>
              <h2 className={styles.sectionTitle}>Network for Open Discussions & Education</h2>
              <p className={styles.sectionSubtitle}>
                A dedicated community for students to share ideas, ask questions, and grow together. 
                Experience a new way of academic collaboration.
              </p>
            </div>
            <Link to={`/${locale}/node`} className={styles.boardPromoBtn}>
              Join Node <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerInner}>
          <div className={styles.ctaBannerIcon}><Download size={26} /></div>
          <div className={styles.ctaBannerText}>
            <h2 className={styles.ctaBannerTitle}>Supporting Your Success</h2>
            <p className={styles.ctaBannerSub}>Can't find what you need? Request specialized materials from our community.</p>
          </div>
          <Link to={`/${locale}/request`} className={styles.ctaBannerBtn}>
            Request Materials <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  )
}
