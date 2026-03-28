import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { Resource, ResourceType } from '@/types'
import styles from './Contributions.module.scss'

const TYPE_BADGE: Record<ResourceType, 'blue' | 'orange' | 'green' | 'purple'> = {
  NOTE: 'blue',
  PYQ: 'orange',
  SYLLABUS: 'green',
  GUESS_PAPER: 'purple',
}

const TYPE_LABEL: Record<ResourceType, string> = {
  NOTE: 'Notes',
  PYQ: 'Past Papers',
  SYLLABUS: 'Syllabus',
  GUESS_PAPER: 'Guess Paper',
}

export default function AdminContributions(): React.ReactElement {
  const { t } = useLocale()
  const [contributions, setContributions] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  const [pendingAction, setPendingAction] = useState<{
    id: string
    action: 'approve' | 'reject'
    title: string
  } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState('')

  useHead({
    title: 'Contributions - Admin',
    description: 'Review pending contributions.',
  })

  const fetchContributions = () => {
    setLoading(true)
    api.admin
      .getPendingContributions()
      .then(setContributions)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(fetchContributions, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleConfirm = async () => {
    if (!pendingAction) return

    setActionLoading(true)
    try {
      if (pendingAction.action === 'approve') {
        await api.admin.approveContribution(pendingAction.id)
        showToast(t.admin.contributions.approveSuccess)
      } else {
        await api.admin.rejectContribution(pendingAction.id)
        showToast(t.admin.contributions.rejectSuccess)
      }
      setContributions((prev) => prev.filter((c) => c.id !== pendingAction.id))
    } catch {
      showToast('Action failed. Please try again.')
    } finally {
      setActionLoading(false)
      setPendingAction(null)
    }
  }

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
          <h1 className={styles.pageTitle}>{t.admin.contributions.title}</h1>
          <p className={styles.pageSubtitle}>{t.admin.contributions.subtitle}</p>
        </div>
        <Button
          variant="secondary"
          leftIcon={<RefreshCw size={15} />}
          onClick={fetchContributions}
          isLoading={loading}
        >
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className={styles.skeletonTable}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      ) : contributions.length === 0 ? (
        <div className={styles.emptyState}>
          <CheckCircle size={48} className={styles.emptyIcon} aria-hidden="true" />
          <p className={styles.emptyTitle}>{t.admin.contributions.noPending}</p>
          <p className={styles.emptySubtitle}>All contributions have been reviewed.</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>{t.admin.contributions.columns.title}</th>
                <th className={styles.th}>{t.admin.contributions.columns.type}</th>
                <th className={styles.th}>{t.admin.contributions.columns.submittedBy}</th>
                <th className={styles.th}>{t.admin.contributions.columns.date}</th>
                <th className={styles.th}>{t.admin.contributions.columns.actions}</th>
              </tr>
            </thead>
            <tbody>
              {contributions.map((c, i) => (
                <motion.tr
                  key={c.id}
                  className={styles.tr}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <td className={styles.td}>
                    <div className={styles.titleCell}>
                      <span className={styles.resourceTitle}>{c.title}</span>
                      {c.isAiGenerated && (
                        <Badge variant="red" size="sm">
                          AI
                        </Badge>
                      )}
                    </div>
                    {c.fileUrl && (
                      <a
                        href={c.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.previewLink}
                      >
                        Preview file
                      </a>
                    )}
                  </td>
                  <td className={styles.td}>
                    <Badge variant={TYPE_BADGE[c.type]} size="sm">
                      {TYPE_LABEL[c.type]}
                    </Badge>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.metaText}>
                      {c.uploaderName ?? 'Anonymous'}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.metaText}>{formatDate(c.createdAt)}</span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actionBtns}>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<CheckCircle size={14} />}
                        onClick={() =>
                          setPendingAction({
                            id: c.id,
                            action: 'approve',
                            title: c.title,
                          })
                        }
                      >
                        {t.admin.contributions.approve}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<XCircle size={14} />}
                        onClick={() =>
                          setPendingAction({
                            id: c.id,
                            action: 'reject',
                            title: c.title,
                          })
                        }
                      >
                        {t.admin.contributions.reject}
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm modal */}
      <Modal
        isOpen={!!pendingAction}
        onClose={() => !actionLoading && setPendingAction(null)}
        title={
          pendingAction?.action === 'approve'
            ? 'Approve Contribution'
            : 'Reject Contribution'
        }
        size="sm"
      >
        <div className={styles.confirmBody}>
          <div className={styles.confirmIcon}>
            {pendingAction?.action === 'approve' ? (
              <CheckCircle size={32} className={styles.approveIcon} />
            ) : (
              <AlertTriangle size={32} className={styles.rejectIcon} />
            )}
          </div>
          <p className={styles.confirmText}>
            {pendingAction?.action === 'approve'
              ? `Approve "${pendingAction?.title}"? It will become publicly visible.`
              : `Reject "${pendingAction?.title}"? This action cannot be undone.`}
          </p>
          <div className={styles.confirmActions}>
            <Button
              variant="secondary"
              onClick={() => setPendingAction(null)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant={pendingAction?.action === 'reject' ? 'danger' : 'primary'}
              isLoading={actionLoading}
              onClick={handleConfirm}
            >
              {pendingAction?.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <motion.div
          className={styles.toast}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          role="status"
          aria-live="polite"
        >
          {toast}
        </motion.div>
      )}
    </div>
  )
}
