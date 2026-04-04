import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { PlusCircle, RefreshCw } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { Institution, Program, Subject, SubjectCategory } from '@/types'
import styles from './Subjects.module.css'

const CATEGORIES = ['MAJOR', 'MINOR', 'MD', 'AEC', 'VAC', 'SEC']

export default function AdminSubjects(): React.ReactElement {
  // locale not used here but keep hook available for future i18n
  useLocale()
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [selectedInstitution, setSelectedInstitution] = useState<string>('')
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [programDetail, setProgramDetail] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState<{ name: string; semester: number; category?: SubjectCategory; programId: string }>({ name: '', semester: 1, category: 'MAJOR', programId: '' })
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState('')
  const [semesterFilter, setSemesterFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  const filteredSubjects = useMemo(() => {
    if (!programDetail?.subjects) return []
    return programDetail.subjects.filter((s) => {
      if (semesterFilter && String(s.semester) !== semesterFilter) return false
      if (categoryFilter && (s.category ?? '') !== categoryFilter) return false
      return true
    })
  }, [programDetail, semesterFilter, categoryFilter])

  useHead({ title: 'Subjects - Admin', description: 'Manage subjects' })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const inst = await api.institutions.getAll()
      setInstitutions(inst)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedProgram) {
      setProgramDetail(null)
      return
    }
    let mounted = true
    api.institutions
      .getProgram(selectedProgram)
      .then((p) => mounted && setProgramDetail(p))
      .catch(console.error)
    return () => { mounted = false }
  }, [selectedProgram])

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!form.programId) return setToast('Select a program')
    setCreating(true)
    try {
      await api.admin.createSubject(form)
      setToast('Subject created')
      setIsOpen(false)
      setForm({ name: '', semester: 1, category: 'MAJOR', programId: '' })
      if (selectedProgram) api.institutions.getProgram(selectedProgram).then(setProgramDetail).catch(console.error)
    } catch {
      setToast('Failed to create subject')
    } finally {
      setCreating(false)
      setTimeout(() => setToast(''), 3000)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Subjects</h1>
          <p className={styles.pageSubtitle}>Manage subjects inside programs.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" leftIcon={<RefreshCw size={14} />} onClick={fetchAll} isLoading={loading}>
            Refresh
          </Button>
          <Button leftIcon={<PlusCircle size={14} />} onClick={() => setIsOpen(true)}>
            New Subject
          </Button>
        </div>
      </div>

      <div className={styles.controls}>
        <select className={styles.input} value={selectedInstitution} onChange={(e) => { setSelectedInstitution(e.target.value); setSelectedProgram('') }}>
          <option value="">Select institution</option>
          {institutions.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>

        <select className={styles.input} value={selectedProgram} onChange={(e) => { setSelectedProgram(e.target.value); setSemesterFilter(''); setCategoryFilter('') }} disabled={!selectedInstitution}>
          <option value="">Select program</option>
          {institutions.find((i) => i.id === selectedInstitution)?.programs?.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {programDetail && (
          <>
            <select className={styles.input} value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)} aria-label="Filter by semester">
              <option value="">All Semesters</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (
                <option key={s} value={String(s)}>Semester {s}</option>
              ))}
            </select>
            <select className={styles.input} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Filter by category">
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {filteredSubjects.length} of {programDetail.subjects?.length ?? 0}
            </span>
          </>
        )}
      </div>

      {programDetail ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Subject</th>
                <th className={styles.th}>Semester</th>
                <th className={styles.th}>Category</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((s: Subject) => (
                <motion.tr key={s.id} className={styles.tr} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td className={styles.td}>{s.name}</td>
                  <td className={styles.td}>{s.semester}</td>
                  <td className={styles.td}>{s.category ?? '—'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}><p className={styles.emptySubtitle}>Select a program to view subjects.</p></div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Subject" size="sm">
        <form className={styles.form} onSubmit={handleCreate}>
          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input className={styles.input} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Program</label>
            <select className={styles.input} value={form.programId} onChange={(e) => setForm((f) => ({ ...f, programId: e.target.value }))} required>
              <option value="">Select program</option>
              {institutions.flatMap((i) => i.programs || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Semester</label>
            <input type="number" className={styles.input} value={form.semester} onChange={(e) => setForm((f) => ({ ...f, semester: Number(e.target.value) }))} min={1} max={12} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Category</label>
            <select className={styles.input} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as SubjectCategory }))}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
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
