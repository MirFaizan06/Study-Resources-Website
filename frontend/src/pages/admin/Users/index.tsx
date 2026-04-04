import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { UserX, UserCheck, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { api } from '@/services/api'
import type { AdminUserEntry, AdminUsersPage } from '@/types'
import styles from './Users.module.css'

type StatusFilter = 'ALL' | 'ACTIVE' | 'BANNED'
type RoleFilter   = 'ALL' | 'STUDENT' | 'CONTRIBUTOR' | 'ADMIN'

export default function AdminUsersPage(): React.ReactElement {
  const { t } = useLocale()
  const [data, setData] = useState<AdminUsersPage | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionStates, setActionStates] = useState<Record<string, 'banning' | 'unbanning'>>({})
  const [banReason, setBanReason] = useState<Record<string, string>>({})
  const [confirmBanId, setConfirmBanId] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  const load = useCallback((p: number) => {
    setLoading(true)
    api.admin.getUsers(p)
      .then((d) => { setData(d); setPage(p) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(1) }, [load])

  const filteredUsers = useMemo(() => {
    if (!data) return []
    const q = search.toLowerCase().trim()
    return data.users.filter((u) => {
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false
      if (statusFilter === 'ACTIVE' && u.isBanned) return false
      if (statusFilter === 'BANNED' && !u.isBanned) return false
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false
      return true
    })
  }, [data, search, statusFilter, roleFilter])

  const handleBan = async (user: AdminUserEntry) => {
    if (confirmBanId !== user.id) {
      setConfirmBanId(user.id)
      return
    }
    setConfirmBanId(null)
    setActionStates((s) => ({ ...s, [user.id]: 'banning' }))
    try {
      await api.admin.banUser(user.id, banReason[user.id] ?? '')
      setData((d) =>
        d
          ? {
              ...d,
              users: d.users.map((u) =>
                u.id === user.id ? { ...u, isBanned: true, banReason: banReason[user.id] ?? null } : u
              ),
            }
          : d
      )
      showToast(t.admin.users.banSuccess)
    } catch { /* silent */ }
    finally {
      setActionStates((s) => { const n = { ...s }; delete n[user.id]; return n })
    }
  }

  const handleUnban = async (userId: string) => {
    setActionStates((s) => ({ ...s, [userId]: 'unbanning' }))
    try {
      await api.admin.unbanUser(userId)
      setData((d) =>
        d
          ? { ...d, users: d.users.map((u) => u.id === userId ? { ...u, isBanned: false, banReason: null } : u) }
          : d
      )
      showToast(t.admin.users.unbanSuccess)
    } catch { /* silent */ }
    finally {
      setActionStates((s) => { const n = { ...s }; delete n[userId]; return n })
    }
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t.admin.users.title}</h1>
        <p className={styles.subtitle}>{t.admin.users.subtitle}</p>
      </div>

      {/* ─── Filters ─────────────────────────────────────────────────────────── */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} aria-hidden="true" />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} aria-label="Filter by status">
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="BANNED">Banned</option>
        </select>
        <select className={styles.filterSelect} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as RoleFilter)} aria-label="Filter by role">
          <option value="ALL">All Roles</option>
          <option value="STUDENT">Student</option>
          <option value="CONTRIBUTOR">Contributor</option>
          <option value="ADMIN">Admin</option>
        </select>
        {!loading && data && (
          <span className={styles.filterCount}>{filteredUsers.length} of {data.users.length} users</span>
        )}
      </div>

      {toast && (
        <motion.p
          className={styles.toast}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {toast}
        </motion.p>
      )}

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loaderRow}>
            <div className={styles.spinner} />
          </div>
        ) : !data || filteredUsers.length === 0 ? (
          <p className={styles.empty}>
            {!data || data.users.length === 0 ? t.admin.users.noUsers : 'No users match the current filters.'}
          </p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t.admin.users.columns.name}</th>
                <th className={styles.hideXs}>{t.admin.users.columns.email}</th>
                <th className={styles.hideSm}>{t.admin.users.columns.university}</th>
                <th>{t.admin.users.columns.posts}</th>
                <th>{t.admin.users.columns.status}</th>
                <th>{t.admin.users.columns.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <React.Fragment key={user.id}>
                  <tr className={user.isBanned ? styles.rowBanned : ''}>
                    <td>
                      <div className={styles.nameCell}>
                        <span className={styles.userName}>{user.name}</span>
                        <span className={styles.userRole}>{user.role}</span>
                      </div>
                    </td>
                    <td className={styles.hideXs}>
                      <span className={styles.emailCell}>{user.email}</span>
                    </td>
                    <td className={styles.hideSm}>
                      {user.university ?? <span className={styles.none}>—</span>}
                    </td>
                    <td className={styles.countCell}>{user._count.concernPosts}</td>
                    <td>
                      <span className={[styles.badge, user.isBanned ? styles.badgeBanned : styles.badgeActive].join(' ')}>
                        {user.isBanned ? t.admin.users.banned : t.admin.users.active}
                      </span>
                    </td>
                    <td>
                      {user.isBanned ? (
                        <button
                          className={styles.unbanBtn}
                          onClick={() => handleUnban(user.id)}
                          disabled={!!actionStates[user.id]}
                        >
                          {actionStates[user.id] === 'unbanning' ? (
                            <span className={styles.spin} />
                          ) : (
                            <UserCheck size={14} />
                          )}
                          {t.admin.users.unban}
                        </button>
                      ) : (
                        <button
                          className={[styles.banBtn, confirmBanId === user.id ? styles.banBtnConfirm : ''].join(' ')}
                          onClick={() => handleBan(user)}
                          disabled={!!actionStates[user.id] || user.role === 'ADMIN'}
                          title={user.role === 'ADMIN' ? 'Cannot ban admin accounts' : undefined}
                        >
                          {actionStates[user.id] === 'banning' ? (
                            <span className={styles.spin} />
                          ) : (
                            <UserX size={14} />
                          )}
                          {confirmBanId === user.id ? t.admin.users.confirmBan : t.admin.users.ban}
                        </button>
                      )}
                    </td>
                  </tr>
                  {/* Ban reason input row — only shown when confirming */}
                  {confirmBanId === user.id && (
                    <tr className={styles.banReasonRow}>
                      <td colSpan={6}>
                        <div className={styles.banReasonInner}>
                          <input
                            className={styles.banReasonInput}
                            type="text"
                            placeholder={t.admin.users.banReasonPlaceholder}
                            value={banReason[user.id] ?? ''}
                            onChange={(e) => setBanReason((r) => ({ ...r, [user.id]: e.target.value }))}
                          />
                          <button
                            className={styles.cancelBanBtn}
                            type="button"
                            onClick={() => setConfirmBanId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => load(page - 1)}
            disabled={page <= 1 || loading}
          >
            <ChevronLeft size={16} />
          </button>
          <span className={styles.pageInfo}>
            {page} / {totalPages}
          </span>
          <button
            className={styles.pageBtn}
            onClick={() => load(page + 1)}
            disabled={page >= totalPages || loading}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
