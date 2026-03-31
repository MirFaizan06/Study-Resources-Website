import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PlusCircle, RefreshCw } from 'lucide-react'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { Institution, InstitutionType } from '@/types'
import styles from './Institutions.module.scss'

export default function AdminInstitutions(): React.ReactElement {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState<{ name: string; type: InstitutionType; logoUrl: string }>({ name: '', type: 'UNIVERSITY', logoUrl: '' })
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState('')

  useHead({ title: 'Institutions - Admin', description: 'Manage institutions' })

  useEffect(() => {
    fetch()
  }, [])

  const fetch = () => {
    setLoading(true)
    api.institutions
      .getAll()
      .then(setInstitutions)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setCreating(true)
    try {
      await api.admin.createInstitution(form)
      setToast('Institution created')
      setIsOpen(false)
      setForm({ name: '', type: 'UNIVERSITY', logoUrl: '' })
      fetch()
    } catch (err) {
      setToast('Failed to create institution')
    } finally {
      setCreating(false)
      setTimeout(() => setToast(''), 3000)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Institutions</h1>
          <p className={styles.pageSubtitle}>Manage universities, colleges, and schools.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" leftIcon={<RefreshCw size={14} />} onClick={fetch} isLoading={loading}>
            Refresh
          </Button>
          <Button leftIcon={<PlusCircle size={14} />} onClick={() => setIsOpen(true)}>
            New Institution
          </Button>
        </div>
      </div>

      {loading ? (
        <div className={styles.skeletonTable}>{Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.skeletonRow} />
        ))}</div>
      ) : institutions.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No institutions yet</p>
          <p className={styles.emptySubtitle}>Add an institution to get started.</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Type</th>
                <th className={styles.th}>Programs</th>
              </tr>
            </thead>
            <tbody>
              {institutions.map((inst) => (
                <motion.tr key={inst.id} className={styles.tr} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td className={styles.td}>{inst.name}</td>
                  <td className={styles.td}>{inst.type}</td>
                  <td className={styles.td}>{inst.programs?.length ?? 0}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Institution" size="sm">
        <form className={styles.form} onSubmit={handleCreate}>
          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input className={styles.input} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Type</label>
            <select className={styles.input} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as InstitutionType }))}>
              <option value="UNIVERSITY">University</option>
              <option value="COLLEGE">College</option>
              <option value="SCHOOL">School</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Logo URL (optional)</label>
            <input className={styles.input} value={form.logoUrl} onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
            <Button variant="secondary" onClick={() => setIsOpen(false)} disabled={creating}>Cancel</Button>
            <Button type="submit" isLoading={creating}>Create</Button>
          </div>
        </form>
      </Modal>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  )
}
