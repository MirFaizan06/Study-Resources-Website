import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText,
  Download,
  Clock,
  MessageSquare,
  Building,
  ArrowRight,
  Upload,
  TrendingUp,
} from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import type { AdminStats } from '@/types'
import styles from './Dashboard.module.css'

interface StatCard {
  key: keyof AdminStats
  label: string
  icon: React.ReactNode
  color: string
}

const STAT_CARDS: StatCard[] = [
  {
    key: 'totalResources',
    label: 'Total Resources',
    icon: <FileText size={24} />,
    color: 'blue',
  },
  {
    key: 'totalDownloads',
    label: 'Total Downloads',
    icon: <Download size={24} />,
    color: 'green',
  },
  {
    key: 'pendingContributions',
    label: 'Pending Contributions',
    icon: <Clock size={24} />,
    color: 'orange',
  },
  {
    key: 'openRequests',
    label: 'Open Requests',
    icon: <MessageSquare size={24} />,
    color: 'purple',
  },
  {
    key: 'totalInstitutions',
    label: 'Institutions',
    icon: <Building size={24} />,
    color: 'default',
  },
]

export default function AdminDashboard(): React.ReactElement {
  const { t, locale } = useLocale()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useHead({
    title: t.seo.admin.title,
    description: t.seo.admin.description,
  })

  useEffect(() => {
    api.admin
      .getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t.admin.dashboard.title}</h1>
        <p className={styles.pageSubtitle}>{t.admin.dashboard.subtitle}</p>
      </div>

      {/* Stats grid */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className={styles.sectionTitle}>
          Overview
        </h2>
        <div className={styles.statsGrid}>
          {STAT_CARDS.map((card, i) => (
            <motion.div
              key={card.key}
              className={[styles.statCard, styles[`color-${card.color}`]].join(' ')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
            >
              <div className={styles.statIcon} aria-hidden="true">
                {card.icon}
              </div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>{card.label}</span>
                <span className={styles.statValue}>
                  {loading ? (
                    <span className={styles.statSkeleton} />
                  ) : (
                    stats?.[card.key]?.toLocaleString() ?? '—'
                  )}
                </span>
              </div>
              <TrendingUp size={16} className={styles.statTrend} aria-hidden="true" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section aria-labelledby="actions-heading" className={styles.quickActions}>
        <h2 id="actions-heading" className={styles.sectionTitle}>
          {t.admin.dashboard.quickActions}
        </h2>
        <div className={styles.actionsGrid}>
          <Link to={`/${locale}/admin/contributions`} className={styles.actionCard}>
            <div className={[styles.actionIcon, styles.actionIconBlue].join(' ')} aria-hidden="true">
              <Clock size={22} />
            </div>
            <div className={styles.actionInfo}>
              <h3 className={styles.actionTitle}>{t.admin.dashboard.approveAll}</h3>
              <p className={styles.actionDesc}>
                {stats?.pendingContributions ?? 0} items pending review
              </p>
            </div>
            <ArrowRight size={18} className={styles.actionArrow} aria-hidden="true" />
          </Link>

          <Link to={`/${locale}/admin/requests`} className={styles.actionCard}>
            <div className={[styles.actionIcon, styles.actionIconPurple].join(' ')} aria-hidden="true">
              <MessageSquare size={22} />
            </div>
            <div className={styles.actionInfo}>
              <h3 className={styles.actionTitle}>{t.admin.dashboard.viewRequests}</h3>
              <p className={styles.actionDesc}>
                {stats?.openRequests ?? 0} open student requests
              </p>
            </div>
            <ArrowRight size={18} className={styles.actionArrow} aria-hidden="true" />
          </Link>

          <Link to={`/${locale}/admin/upload`} className={styles.actionCard}>
            <div className={[styles.actionIcon, styles.actionIconGreen].join(' ')} aria-hidden="true">
              <Upload size={22} />
            </div>
            <div className={styles.actionInfo}>
              <h3 className={styles.actionTitle}>{t.admin.dashboard.uploadNew}</h3>
              <p className={styles.actionDesc}>Add a new resource to the platform</p>
            </div>
            <ArrowRight size={18} className={styles.actionArrow} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}
