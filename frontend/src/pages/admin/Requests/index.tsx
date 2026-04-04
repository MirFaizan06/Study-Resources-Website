import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, RefreshCw, Filter, Search } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { MaterialRequest, RequestStatus } from '@/types'
import styles from './Requests.module.css'

type FilterStatus = 'ALL' | RequestStatus

export default function AdminRequests(): React.ReactElement {
  const { t } = useLocale()
  const [requests, setRequests] = useState<MaterialRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('ALL')
  const [fulfilling, setFulfilling] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')

  useHead({
    title: 'Student Requests - Admin',
    description: 'Manage student material requests.',
  })

  const fetchRequests = () => {
    setLoading(true)
    api.admin
      .getRequests()
      .then(setRequests)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(fetchRequests, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleFulfill = async (id: string) => {
    setFulfilling(id)
    try {
      await api.admin.fulfillRequest(id)
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'FULFILLED' as RequestStatus } : r))
      )
      showToast(t.admin.requests.fulfillSuccess)
    } catch {
      showToast('Failed to update request.')
    } finally {
      setFulfilling(null)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return requests.filter((r) => {
      if (filter !== 'ALL' && r.status !== filter) return false
      if (q && !r.studentName.toLowerCase().includes(q) && !r.requestedMaterial.toLowerCase().includes(q)) return false
      return true
    })
  }, [requests, filter, search])

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t.admin.requests.title}</h1>
          <p className={styles.pageSubtitle}>{t.admin.requests.subtitle}</p>
        </div>
        <Button
          variant="secondary"
          leftIcon={<RefreshCw size={15} />}
          onClick={fetchRequests}
          isLoading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Filter row */}
      <div className={styles.filterRow}>
        <Filter size={16} className={styles.filterIcon} aria-hidden="true" />
        {(['ALL', 'PENDING', 'FULFILLED'] as FilterStatus[]).map((status) => (
          <button
            key={status}
            className={[styles.filterTab, filter === status ? styles.filterTabActive : ''].join(' ')}
            onClick={() => setFilter(status)}
          >
            {status === 'ALL'
              ? t.admin.requests.allStatus
              : status === 'PENDING'
              ? t.admin.requests.pending
              : t.admin.requests.fulfilled}
            <span className={styles.filterCount}>
              {status === 'ALL'
                ? requests.length
                : requests.filter((r) => r.status === status).length}
            </span>
          </button>
        ))}
        <div className={styles.searchWrap}>
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} aria-hidden="true" />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by name or material…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.skeletonTable}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <CheckCircle size={48} className={styles.emptyIcon} aria-hidden="true" />
          <p className={styles.emptyTitle}>{t.admin.requests.noRequests}</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>{t.admin.requests.columns.name}</th>
                <th className={styles.th}>{t.admin.requests.columns.material}</th>
                <th className={styles.th}>{t.admin.requests.columns.email}</th>
                <th className={styles.th}>{t.admin.requests.columns.status}</th>
                <th className={styles.th}>{t.admin.requests.columns.date}</th>
                <th className={styles.th}>{t.admin.requests.columns.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req, i) => (
                <motion.tr
                  key={req.id}
                  className={styles.tr}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <td className={styles.td}>
                    <span className={styles.nameText}>{req.studentName}</span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.materialText}>{req.requestedMaterial}</span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.metaText}>
                      {req.contactEmail ? (
                        <a href={`mailto:${req.contactEmail}`} className={styles.emailLink}>
                          {req.contactEmail}
                        </a>
                      ) : (
                        '—'
                      )}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <Badge
                      variant={req.status === 'FULFILLED' ? 'green' : 'orange'}
                      size="sm"
                    >
                      {req.status}
                    </Badge>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.metaText}>{formatDate(req.createdAt)}</span>
                  </td>
                  <td className={styles.td}>
                    {req.status === 'PENDING' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<CheckCircle size={14} />}
                        isLoading={fulfilling === req.id}
                        onClick={() => handleFulfill(req.id)}
                      >
                        {t.admin.requests.markFulfilled}
                      </Button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <motion.div
          className={styles.toast}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          aria-live="polite"
        >
          {toast}
        </motion.div>
      )}
    </div>
  )
}
