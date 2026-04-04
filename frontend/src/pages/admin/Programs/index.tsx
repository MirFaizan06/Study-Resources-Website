import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { PlusCircle, RefreshCw, Search } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { Institution, Program } from '@/types'
import styles from './Programs.module.css'

export default function AdminPrograms(): React.ReactElement {
  useLocale()
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ name: '', institutionId: '' })
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [instFilter, setInstFilter] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return programs.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false
      if (instFilter && p.institutionId !== instFilter) return false
      return true
    })
  }, [programs, search, instFilter])

  useHead({ title: 'Programs - Admin', description: 'Manage programs' })

  useEffect(() => {
    fetch()
  }, [])

  const fetch = async () => {
    setLoading(true)
    try {
      const inst = await api.institutions.getAll()
      setInstitutions(inst)
      // flatten programs
      const p: Program[] = []
      inst.forEach((i) => {
        (i.programs || []).forEach((pr) => p.push({ ...pr, institution: i }))
      })
      setPrograms(p)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!form.institutionId) return setToast('Please select an institution')
    setCreating(true)
    try {
      await api.admin.createProgram(form)
      setToast('Program created')
      setIsOpen(false)
      setForm({ name: '', institutionId: '' })
      fetch()
    } catch {
      setToast('Failed to create program')
    } finally {
      setCreating(false)
      setTimeout(() => setToast(''), 3000)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Programs</h1>
          <p className={styles.pageSubtitle}>Manage programs under institutions.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" leftIcon={<RefreshCw size={14} />} onClick={fetch} isLoading={loading}>
            Refresh
          </Button>
          <Button leftIcon={<PlusCircle size={14} />} onClick={() => setIsOpen(true)}>
            New Program
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} aria-hidden="true" />
          <input className={styles.searchInput} type="text" placeholder="Search programs…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className={styles.filterSelect} value={instFilter} onChange={(e) => setInstFilter(e.target.value)} aria-label="Filter by institution">
          <option value="">All Institutions</option>
          {institutions.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        {!loading && <span className={styles.filterCount}>{filtered.length} of {programs.length}</span>}
      </div>

      {loading ? (
        <div className={styles.skeletonTable}>{Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.skeletonRow} />
        ))}</div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>{programs.length === 0 ? 'No programs found' : 'No programs match your filters.'}</p>
          <p className={styles.emptySubtitle}>{programs.length === 0 ? 'Add programs to your institutions.' : 'Try clearing the search or institution filter.'}</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Program</th>
                <th className={styles.th}>Institution</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <motion.tr key={p.id} className={styles.tr} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td className={styles.td}>{p.name}</td>
                  <td className={styles.td}>{(p as any).institution?.name ?? '—'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Program" size="sm">
        <form className={styles.form} onSubmit={handleCreate}>
          <div className={styles.field}>
            <label className={styles.label}>Program Name</label>
            <input className={styles.input} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Institution</label>
            <select className={styles.input} value={form.institutionId} onChange={(e) => setForm((f) => ({ ...f, institutionId: e.target.value }))} required>
              <option value="">Select institution</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
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
