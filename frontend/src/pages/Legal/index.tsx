import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, FileText, ChevronRight } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import styles from './Legal.module.scss'

export default function LegalPage(): React.ReactElement {
  const { t } = useLocale()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') ?? 'tos') as 'tos' | 'privacy'

  useEffect(() => {
    if (!params.get('tab')) setParams({ tab: 'tos' }, { replace: true })
  }, [params, setParams])

  useHead({
    title: t.seo.legal.title,
    description: t.seo.legal.description,
  })

  const sections = tab === 'tos' ? t.legal.tos : t.legal.privacy
  const heading = tab === 'tos' ? t.legal.tosTitle : t.legal.privacyTitle
  const effective = tab === 'tos' ? t.legal.tosEffective : t.legal.privacyEffective

  return (
    <div className={styles.page}>
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <motion.div
            className={styles.heroText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.eyebrowRow}>
              <Shield size={18} className={styles.eyebrowIcon} />
              <span className={styles.eyebrow}>{t.legal.title}</span>
            </div>
            <h1 className={styles.heroTitle}>{heading}</h1>
            <p className={styles.heroSub}>
              {t.legal.lastUpdated}: <strong>{effective}</strong>
            </p>
          </motion.div>
        </div>
      </section>

      <div className={styles.layout}>
        {/* ─── Sidebar tabs ─────────────────────────────────────────────────── */}
        <aside className={styles.sidebar}>
          <nav className={styles.tabList} aria-label="Legal sections">
            <button
              className={[styles.tab, tab === 'tos' ? styles.tabActive : ''].join(' ')}
              onClick={() => setParams({ tab: 'tos' })}
            >
              <FileText size={16} />
              {t.legal.tosTab}
              {tab === 'tos' && <ChevronRight size={14} className={styles.tabChevron} />}
            </button>
            <button
              className={[styles.tab, tab === 'privacy' ? styles.tabActive : ''].join(' ')}
              onClick={() => setParams({ tab: 'privacy' })}
            >
              <Shield size={16} />
              {t.legal.privacyTab}
              {tab === 'privacy' && <ChevronRight size={14} className={styles.tabChevron} />}
            </button>
          </nav>
        </aside>

        {/* ─── Content ──────────────────────────────────────────────────────── */}
        <main className={styles.content}>
          {/* Mobile tab switcher */}
          <div className={styles.mobileTabs}>
            <button
              className={[styles.mobileTab, tab === 'tos' ? styles.mobileTabActive : ''].join(' ')}
              onClick={() => setParams({ tab: 'tos' })}
            >
              {t.legal.tosTab}
            </button>
            <button
              className={[styles.mobileTab, tab === 'privacy' ? styles.mobileTabActive : ''].join(' ')}
              onClick={() => setParams({ tab: 'privacy' })}
            >
              {t.legal.privacyTab}
            </button>
          </div>

          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {sections.map((sec, i) => (
              <section key={i} className={styles.section}>
                <h2 className={styles.sectionHeading}>{sec.heading}</h2>
                <p className={styles.sectionBody}>{sec.body}</p>
              </section>
            ))}
          </motion.div>

          <p className={styles.contactNote}>
            Questions? Email us at{' '}
            <a href="mailto:hello@noteshubkashmir.in" className={styles.emailLink}>
              hello@noteshubkashmir.in
            </a>
          </p>
        </main>
      </div>
    </div>
  )
}
