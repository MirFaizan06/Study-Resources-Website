import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, ShieldX, Eye, MessageSquare, Search } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { api } from '@/services/api'
import type { BoardModerationPost, BoardModerationComment } from '@/types'
import styles from './Moderation.module.css'

type Tab = 'posts' | 'comments'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

export default function ModerationPage(): React.ReactElement {
  const { t } = useLocale()
  const [tab, setTab] = useState<Tab>('posts')
  const [posts, setPosts] = useState<BoardModerationPost[]>([])
  const [comments, setComments] = useState<BoardModerationComment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [search, setSearch] = useState('')

  const filteredPosts = useMemo(() => {
    const q = search.toLowerCase().trim()
    return posts.filter((p) => {
      if (categoryFilter && p.category !== categoryFilter) return false
      if (q && !p.title.toLowerCase().includes(q) && !p.author.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [posts, categoryFilter, search])

  const filteredComments = useMemo(() => {
    const q = search.toLowerCase().trim()
    return comments.filter((c) => {
      if (q && !c.content.toLowerCase().includes(q) && !c.author.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [comments, search])

  useEffect(() => {
    setLoading(true)
    const req = tab === 'posts'
      ? api.admin.getModerationPosts(statusFilter || undefined).then((d) => { setPosts(d); })
      : api.admin.getModerationComments(statusFilter || undefined).then((d) => { setComments(d); })
    req.catch(() => {}).finally(() => setLoading(false))
  }, [tab, statusFilter])

  const setPostStatus = async (id: string, status: 'ACTIVE' | 'REMOVED') => {
    try {
      await api.admin.setPostStatus(id, status)
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status } : p))
    } catch { /* silent */ }
  }

  const setCommentStatus = async (id: string, status: 'ACTIVE' | 'REMOVED') => {
    try {
      await api.admin.setCommentStatus(id, status)
      setComments((prev) => prev.map((c) => c.id === id ? { ...c, status } : c))
    } catch { /* silent */ }
  }

  const CATEGORY_LABELS: Record<string, string> = {
    ACADEMICS: 'Academics', INFRASTRUCTURE: 'Infrastructure',
    ADMINISTRATION: 'Administration', TRANSPORT: 'Transport',
    HOSTEL: 'Hostel', SPORTS_CULTURE: 'Sports & Culture', OTHER: 'Other',
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t.admin.moderation.title}</h1>
        <p className={styles.subtitle}>{t.admin.moderation.subtitle}</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.tabs}>
          <button
            className={[styles.tab, tab === 'posts' ? styles.tabActive : ''].join(' ')}
            onClick={() => setTab('posts')}
          >
            <Eye size={15} />
            {t.admin.moderation.posts}
          </button>
          <button
            className={[styles.tab, tab === 'comments' ? styles.tabActive : ''].join(' ')}
            onClick={() => setTab('comments')}
          >
            <MessageSquare size={15} />
            {t.admin.moderation.comments}
          </button>
        </div>

        <select
          className={styles.statusFilter}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">{t.admin.moderation.allStatus}</option>
          <option value="ACTIVE">{t.admin.moderation.active}</option>
          <option value="REMOVED">{t.admin.moderation.removed}</option>
        </select>

        {tab === 'posts' && (
          <select
            className={styles.statusFilter}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        )}

        <div className={styles.searchWrap}>
          <Search size={13} aria-hidden="true" style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder={tab === 'posts' ? 'Search posts…' : 'Search comments…'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loader}>
          <div className={styles.spinner} />
        </div>
      ) : tab === 'posts' ? (
        <motion.div
          className={styles.tableWrap}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredPosts.length === 0 ? (
            <p className={styles.empty}>{posts.length === 0 ? t.admin.moderation.noPosts : 'No posts match the current filters.'}</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t.admin.contributions.columns.title}</th>
                  <th>{t.admin.moderation.category}</th>
                  <th>{t.admin.moderation.author}</th>
                  <th>{t.admin.contributions.columns.date}</th>
                  <th>{t.admin.moderation.votes}</th>
                  <th>{t.admin.contributions.columns.status}</th>
                  <th>{t.admin.contributions.columns.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id}>
                    <td className={styles.titleCell}>{post.title}</td>
                    <td><span className={styles.catTag}>{CATEGORY_LABELS[post.category] ?? post.category}</span></td>
                    <td>
                      <div className={styles.authorCell}>
                        <span>{post.author.name}</span>
                        <small>{post.author.email}</small>
                      </div>
                    </td>
                    <td className={styles.dateCell}>{timeAgo(post.createdAt)}</td>
                    <td>{post.upvotesCount}</td>
                    <td>
                      <span className={[styles.statusBadge, post.status === 'REMOVED' ? styles.removed : styles.active].join(' ')}>
                        {post.status}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      {post.status === 'ACTIVE' ? (
                        <button
                          className={styles.removeBtn}
                          onClick={() => setPostStatus(post.id, 'REMOVED')}
                        >
                          <ShieldX size={14} />
                          {t.admin.moderation.remove}
                        </button>
                      ) : (
                        <button
                          className={styles.restoreBtn}
                          onClick={() => setPostStatus(post.id, 'ACTIVE')}
                        >
                          <ShieldCheck size={14} />
                          {t.admin.moderation.restore}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      ) : (
        <motion.div
          className={styles.tableWrap}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredComments.length === 0 ? (
            <p className={styles.empty}>{comments.length === 0 ? t.admin.moderation.noComments : 'No comments match the current filters.'}</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t.admin.moderation.comment}</th>
                  <th>{t.admin.moderation.post}</th>
                  <th>{t.admin.moderation.author}</th>
                  <th>{t.admin.contributions.columns.date}</th>
                  <th>{t.admin.contributions.columns.status}</th>
                  <th>{t.admin.contributions.columns.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredComments.map((comment) => (
                  <tr key={comment.id}>
                    <td className={styles.contentCell}>{comment.content}</td>
                    <td className={styles.titleCell}>{comment.post.title}</td>
                    <td>
                      <div className={styles.authorCell}>
                        <span>{comment.author.name}</span>
                        <small>{comment.author.email}</small>
                      </div>
                    </td>
                    <td className={styles.dateCell}>{timeAgo(comment.createdAt)}</td>
                    <td>
                      <span className={[styles.statusBadge, comment.status === 'REMOVED' ? styles.removed : styles.active].join(' ')}>
                        {comment.status}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      {comment.status === 'ACTIVE' ? (
                        <button
                          className={styles.removeBtn}
                          onClick={() => setCommentStatus(comment.id, 'REMOVED')}
                        >
                          <ShieldX size={14} />
                          {t.admin.moderation.remove}
                        </button>
                      ) : (
                        <button
                          className={styles.restoreBtn}
                          onClick={() => setCommentStatus(comment.id, 'ACTIVE')}
                        >
                          <ShieldCheck size={14} />
                          {t.admin.moderation.restore}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      )}
    </div>
  )
}
