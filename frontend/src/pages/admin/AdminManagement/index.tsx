import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, RefreshCw, Search, UserX, UserCheck, Trash2, User, Wand2,
} from 'lucide-react'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { AdminProfileFull, GenerateAdminResult } from '@/types'
import styles from './AdminManagement.module.css'

type CreateMode = 'custom' | 'generate'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

export default function AdminManagement(): React.ReactElement {
  useHead({ title: 'Admin Management - Super Admin', description: 'Manage admin accounts.' })

  const [admins, setAdmins] = useState<AdminProfileFull[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'REVOKED'>('ALL')

  // Create modal
  const [modalOpen, setModalOpen] = useState(false)
  const [createMode, setCreateMode] = useState<CreateMode>('custom')
  const [creating, setCreating] = useState(false)
  const [genResult, setGenResult] = useState<GenerateAdminResult | null>(null)

  // Custom form
  const [form, setForm] = useState({
    email: '', name: '', password: '', university: '', program: '', contactNo: '',
  })

  // Generate form
  const [genForm, setGenForm] = useState({ university: '', program: '', contactNo: '' })

  // Confirm delete
  const [deleteTarget, setDeleteTarget] = useState<AdminProfileFull | null>(null)
  const [deleting, setDeleting] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const data = await api.admin.getAdminsFull()
      setAdmins(data)
    } catch {
      showToast('Failed to load admins.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAdmins() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return admins.filter((a) => {
      if (statusFilter === 'ACTIVE' && a.isRevoked) return false
      if (statusFilter === 'REVOKED' && !a.isRevoked) return false
      if (q && !a.name.toLowerCase().includes(q) && !a.email.toLowerCase().includes(q) && !a.university.toLowerCase().includes(q)) return false
      return true
    })
  }, [admins, search, statusFilter])

  const activeAdmins = filtered.filter((a) => !a.isRevoked)
  const revokedAdmins = filtered.filter((a) => a.isRevoked)

  const handleRevoke = async (id: string) => {
    try {
      await api.admin.revokeAdmin(id)
      setAdmins((prev) => prev.map((a) =>
        a.userId === id ? { ...a, isRevoked: true, revokedAt: new Date().toISOString() } : a
      ))
      showToast('Admin access revoked.')
    } catch (e: unknown) {
      showToast((e as Error).message ?? 'Failed to revoke.')
    }
  }

  const handleReinstate = async (id: string) => {
    try {
      await api.admin.reinstateAdmin(id)
      setAdmins((prev) => prev.map((a) =>
        a.userId === id ? { ...a, isRevoked: false, revokedAt: null } : a
      ))
      showToast('Admin reinstated.')
    } catch (e: unknown) {
      showToast((e as Error).message ?? 'Failed to reinstate.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.admin.deleteAdmin(deleteTarget.userId)
      setAdmins((prev) => prev.filter((a) => a.userId !== deleteTarget.userId))
      showToast('Admin account permanently deleted.')
      setDeleteTarget(null)
    } catch (e: unknown) {
      showToast((e as Error).message ?? 'Failed to delete.')
    } finally {
      setDeleting(false)
    }
  }

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.admin.createAdmin({
        email: form.email,
        name: form.name,
        password: form.password,
        university: form.university,
        program: form.program,
        contactNo: form.contactNo || undefined,
      })
      showToast('Admin created successfully.')
      setModalOpen(false)
      setForm({ email: '', name: '', password: '', university: '', program: '', contactNo: '' })
      fetchAdmins()
    } catch (e: unknown) {
      showToast((e as Error).message ?? 'Failed to create admin.')
    } finally {
      setCreating(false)
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const result = await api.admin.generateAdmin({
        university: genForm.university,
        program: genForm.program,
        contactNo: genForm.contactNo || undefined,
      })
      setGenResult(result)
      fetchAdmins()
    } catch (e: unknown) {
      showToast((e as Error).message ?? 'Failed to generate admin.')
    } finally {
      setCreating(false)
    }
  }

  const renderAdminRow = (a: AdminProfileFull) => (
    <motion.tr key={a.userId} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <td className={styles.table ? styles.table : ''} style={{ padding: '0.75rem 1rem' }}>
        <div className={styles.adminCell}>
          {a.pfpUrl
            ? <img src={a.pfpUrl} alt="" className={styles.pfp} />
            : <div className={styles.pfpPlaceholder}><User size={16} /></div>
          }
          <div>
            <div className={styles.adminName}>{a.name}</div>
            <div className={styles.adminEmail}>{a.email}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '0.75rem 1rem' }}>
        <span className={a.role === 'SUPER_ADMIN' ? `${styles.roleBadge} ${styles.roleSuper}` : `${styles.roleBadge} ${styles.roleAdmin}`}>
          {a.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
        </span>
      </td>
      <td style={{ padding: '0.75rem 1rem' }}>
        <div className={styles.metaCell}>
          <span className={styles.metaMain}>{a.university}</span>
          <span className={styles.metaSub}>{a.program}</span>
        </div>
      </td>
      <td style={{ padding: '0.75rem 1rem' }}>
        {a.isRevoked
          ? <span className={styles.contactHidden}>Hidden</span>
          : <span className={styles.contactCell}>{a.contactNo ?? '—'}</span>
        }
      </td>
      <td style={{ padding: '0.75rem 1rem' }}>
        {a.isRevoked
          ? <span className={styles.statusRevoked}>Revoked</span>
          : <span className={styles.statusActive}>Active</span>
        }
      </td>
      <td style={{ padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{timeAgo(a.joinedAt)}</span>
      </td>
      <td style={{ padding: '0.75rem 1rem' }}>
        <div className={styles.actionsCell}>
          {a.role !== 'SUPER_ADMIN' && (
            <>
              {a.isRevoked
                ? (
                  <button className={styles.reinstateBtn} onClick={() => handleReinstate(a.userId)}>
                    <UserCheck size={13} /> Reinstate
                  </button>
                ) : (
                  <button className={styles.revokeBtn} onClick={() => handleRevoke(a.userId)}>
                    <UserX size={13} /> Revoke
                  </button>
                )
              }
              <button className={styles.deleteBtn} onClick={() => setDeleteTarget(a)}>
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      </td>
    </motion.tr>
  )

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Admin Management</h1>
          <p className={styles.pageSubtitle}>Create, revoke, and manage admin accounts.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" leftIcon={<RefreshCw size={14} />} onClick={fetchAdmins} isLoading={loading}>
            Refresh
          </Button>
          <Button leftIcon={<Plus size={14} />} onClick={() => { setModalOpen(true); setGenResult(null) }}>
            Create Admin
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} aria-hidden="true" />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by name, email or university…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'REVOKED')}>
          <option value="ALL">All Admins</option>
          <option value="ACTIVE">Active</option>
          <option value="REVOKED">Revoked</option>
        </select>
        {!loading && (
          <span className={styles.filterCount}>{filtered.length} of {admins.length}</span>
        )}
      </div>

      {/* Skeleton */}
      {loading ? (
        <div className={styles.skeletonTable}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className={styles.skeletonRow} />)}
        </div>
      ) : (
        <>
          {/* ─── Current Admins ──────────────────────────────────────────────── */}
          <div className={styles.sectionLabel}>Current Admins <span style={{ color: 'var(--text-primary)', fontStyle: 'normal' }}>({activeAdmins.length})</span></div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Role</th>
                  <th>Institution / Program</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeAdmins.length === 0 ? (
                  <tr className={styles.emptyRow}><td colSpan={7}>No active admins.</td></tr>
                ) : activeAdmins.map(renderAdminRow)}
              </tbody>
            </table>
          </div>

          {/* ─── Past Admins ─────────────────────────────────────────────────── */}
          {(statusFilter === 'ALL' || statusFilter === 'REVOKED') && (
            <>
              <div className={styles.sectionLabel} style={{ marginTop: '0.5rem' }}>Past Admins <span style={{ color: 'var(--text-muted)', fontStyle: 'normal' }}>({revokedAdmins.length})</span></div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Admin</th>
                      <th>Role</th>
                      <th>Institution / Program</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Revoked</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revokedAdmins.length === 0 ? (
                      <tr className={styles.emptyRow}><td colSpan={7}>No past admins yet.</td></tr>
                    ) : revokedAdmins.map(renderAdminRow)}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* ─── Create Admin Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setGenResult(null) }}
        title="Create Admin"
        size="sm"
      >
        {genResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className={styles.credBox}>
              <p className={styles.credTitle}>Admin Generated</p>
              <p className={styles.credNote}>Save these credentials now — the password cannot be retrieved again.</p>
              <div className={styles.credRow}>
                <span className={styles.credLabel}>Email</span>
                <span className={styles.credValue}>{genResult.generatedEmail}</span>
              </div>
              <div className={styles.credRow}>
                <span className={styles.credLabel}>Password</span>
                <span className={styles.credValue}>{genResult.generatedPassword}</span>
              </div>
            </div>
            <div className={styles.modalActions}>
              <Button onClick={() => { setModalOpen(false); setGenResult(null) }}>Done</Button>
            </div>
          </div>
        ) : (
          <>
            {/* Mode toggle */}
            <div className={styles.modeToggle} style={{ marginBottom: '1rem' }}>
              <button
                className={[styles.modeBtn, createMode === 'custom' ? styles.modeBtnActive : ''].join(' ')}
                onClick={() => setCreateMode('custom')}
                type="button"
              >
                Custom Admin
              </button>
              <button
                className={[styles.modeBtn, createMode === 'generate' ? styles.modeBtnActive : ''].join(' ')}
                onClick={() => setCreateMode('generate')}
                type="button"
              >
                <Wand2 size={13} style={{ marginRight: 4 }} />
                Generate Admin
              </button>
            </div>

            {createMode === 'custom' ? (
              <form className={styles.form} onSubmit={handleCreateCustom}>
                <div className={styles.field}>
                  <label className={styles.label}>Name</label>
                  <input className={styles.input} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input className={styles.input} type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Password</label>
                  <input className={styles.input} type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} minLength={8} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>University / Institution</label>
                  <input className={styles.input} value={form.university} onChange={(e) => setForm((f) => ({ ...f, university: e.target.value }))} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Program</label>
                  <input className={styles.input} value={form.program} onChange={(e) => setForm((f) => ({ ...f, program: e.target.value }))} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Contact No. (optional)</label>
                  <input className={styles.input} value={form.contactNo} onChange={(e) => setForm((f) => ({ ...f, contactNo: e.target.value }))} />
                </div>
                <div className={styles.modalActions}>
                  <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={creating}>Cancel</Button>
                  <Button type="submit" isLoading={creating}>Create</Button>
                </div>
              </form>
            ) : (
              <form className={styles.form} onSubmit={handleGenerate}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 0.25rem' }}>
                  System will auto-generate a memorable email and a strong random password.
                </p>
                <div className={styles.field}>
                  <label className={styles.label}>University / Institution</label>
                  <input className={styles.input} value={genForm.university} onChange={(e) => setGenForm((f) => ({ ...f, university: e.target.value }))} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Program</label>
                  <input className={styles.input} value={genForm.program} onChange={(e) => setGenForm((f) => ({ ...f, program: e.target.value }))} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Contact No. (optional)</label>
                  <input className={styles.input} value={genForm.contactNo} onChange={(e) => setGenForm((f) => ({ ...f, contactNo: e.target.value }))} />
                </div>
                <div className={styles.modalActions}>
                  <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={creating}>Cancel</Button>
                  <Button type="submit" leftIcon={<Wand2 size={14} />} isLoading={creating}>Generate</Button>
                </div>
              </form>
            )}
          </>
        )}
      </Modal>

      {/* ─── Delete Confirm Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Delete Admin Account"
        size="sm"
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem' }}>
          Permanently delete <strong>{deleteTarget?.name}</strong>'s account? This cannot be undone and all their data will be removed.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button variant="danger" isLoading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      {/* Toast */}
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
