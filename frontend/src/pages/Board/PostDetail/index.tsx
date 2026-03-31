import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronUp, MessageSquare, ArrowLeft, Trash2, Send } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/services/api'
import type { ConcernPostDetail, ConcernComment } from '@/types'
import styles from './PostDetail.module.scss'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

const CATEGORY_LABELS: Record<string, string> = {
  ACADEMICS: 'Academics', INFRASTRUCTURE: 'Infrastructure',
  ADMINISTRATION: 'Administration', TRANSPORT: 'Transport',
  HOSTEL: 'Hostel', SPORTS_CULTURE: 'Sports & Culture', OTHER: 'Other',
}

export default function PostDetailPage(): React.ReactElement {
  const { postId } = useParams<{ postId: string }>()
  const { t, locale } = useLocale()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [post, setPost] = useState<ConcernPostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [commentError, setCommentError] = useState('')

  useHead({
    title: post ? post.title + ' — U.N.I.T. Board' : 'Post — U.N.I.T.',
    description: post?.description ?? '',
  })

  useEffect(() => {
    if (!postId) return
    setLoading(true)
    api.board
      .getPost(postId)
      .then((p) => setPost(p))
      .catch(() => setError(t.common.error))
      .finally(() => setLoading(false))
  }, [postId, t.common.error])

  const handleVotePost = async () => {
    if (!user) { navigate(`/${locale}/login`, { state: { from: `/${locale}/board/${postId}` } }); return }
    if (!post) return
    try {
      const result = await api.board.vote(post.id)
      setPost((p) => p ? { ...p, upvotesCount: result.upvotesCount, hasVoted: result.voted } : p)
    } catch { /* silent */ }
  }

  const handleVoteComment = async (commentId: string) => {
    if (!user || !post) return
    try {
      const result = await api.board.voteComment(post.id, commentId)
      setPost((p) =>
        p
          ? {
              ...p,
              comments: p.comments.map((c) =>
                c.id === commentId
                  ? { ...c, upvotesCount: result.upvotesCount, hasVoted: result.voted }
                  : c
              ),
            }
          : p
      )
    } catch { /* silent */ }
  }

  const handleDeleteComment = async (c: ConcernComment) => {
    if (!post || !user) return
    if (!window.confirm(t.board.confirmDelete)) return
    try {
      await api.board.deleteComment(post.id, c.id)
      setPost((p) =>
        p ? { ...p, comments: p.comments.filter((x) => x.id !== c.id) } : p
      )
    } catch { /* silent */ }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { navigate(`/${locale}/login`); return }
    if (!comment.trim() || !post) return
    setSubmitting(true)
    setCommentError('')
    try {
      const newComment = await api.board.addComment(post.id, comment.trim())
      setPost((p) =>
        p ? { ...p, comments: [...p.comments, newComment as ConcernComment] } : p
      )
      setComment('')
    } catch {
      setCommentError(t.common.error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePost = async () => {
    if (!post || !user) return
    if (!window.confirm(t.board.confirmDelete)) return
    try {
      await api.board.deletePost(post.id)
      navigate(`/${locale}/board`)
    } catch { /* silent */ }
  }

  if (loading) return (
    <div className={styles.loaderWrap}>
      <div className={styles.spinner} />
    </div>
  )

  if (error || !post) return (
    <div className={styles.errorWrap}>
      <p>{error || t.common.error}</p>
      <Link to={`/${locale}/board`} className={styles.backLink}>
        <ArrowLeft size={16} /> {t.board.backToBoard}
      </Link>
    </div>
  )

  const canDelete = user && (user.id === post.authorId || user.role === 'ADMIN')

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to={`/${locale}/board`} className={styles.backLink}>
          <ArrowLeft size={16} />
          {t.board.backToBoard}
        </Link>

        {/* ─── Post ────────────────────────────────────────────────────────── */}
        <motion.article
          className={styles.postCard}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className={styles.postHeader}>
            <span className={styles.catBadge}>
              {CATEGORY_LABELS[post.category] ?? post.category}
            </span>
            {canDelete && (
              <button className={styles.deleteBtn} onClick={handleDeletePost} title="Delete post">
                <Trash2 size={15} />
              </button>
            )}
          </div>

          <h1 className={styles.postTitle}>{post.title}</h1>

          <div className={styles.postMeta}>
            <span className={styles.metaText}>{t.common.by} {post.author.name}</span>
            {post.author.university && (
              <span className={styles.metaText}>{post.author.university}</span>
            )}
            <span className={styles.metaTime}>{timeAgo(post.createdAt)}</span>
          </div>

          <img
            src={post.imageUrl}
            alt={post.title}
            className={styles.postImage}
          />

          {post.description && (
            <p className={styles.postDesc}>{post.description}</p>
          )}

          <div className={styles.postActions}>
            <button
              className={[styles.voteBtn, post.hasVoted ? styles.voted : ''].join(' ')}
              onClick={handleVotePost}
            >
              <ChevronUp size={18} />
              <span>{post.upvotesCount}</span>
              {t.board.upvotes}
            </button>
            <span className={styles.commentCount}>
              <MessageSquare size={16} />
              {post.comments.length} {t.board.comments}
            </span>
          </div>
        </motion.article>

        {/* ─── Comment form ─────────────────────────────────────────────────── */}
        <div className={styles.commentSection}>
          <h2 className={styles.commentsTitle}>
            {post.comments.length} {t.board.comments}
          </h2>

          {user ? (
            <form onSubmit={handleSubmitComment} className={styles.commentForm}>
              <textarea
                className={styles.commentInput}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t.board.commentPlaceholder}
                rows={3}
                maxLength={1000}
              />
              {commentError && <p className={styles.commentErr}>{commentError}</p>}
              <div className={styles.commentFormFooter}>
                <span className={styles.charCount}>{comment.length}/1000</span>
                <button type="submit" className={styles.submitCommentBtn} disabled={submitting || !comment.trim()}>
                  <Send size={14} />
                  {submitting ? t.common.loading : t.board.addComment}
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.loginPrompt}>
              <Link to={`/${locale}/login`} className={styles.loginLink}>
                {t.board.loginToComment}
              </Link>
            </div>
          )}

          {/* Comments list */}
          <div className={styles.commentsList}>
            {post.comments.map((c) => (
              <div key={c.id} className={styles.comment}>
                <div className={styles.commentVote}>
                  <button
                    className={[styles.smallVoteBtn, c.hasVoted ? styles.voted : ''].join(' ')}
                    onClick={() => user ? handleVoteComment(c.id) : navigate(`/${locale}/login`)}
                    aria-label="Upvote comment"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <span className={styles.smallVoteCount}>{c.upvotesCount}</span>
                </div>
                <div className={styles.commentContent}>
                  <div className={styles.commentMeta}>
                    <span className={styles.commentAuthor}>{c.author.name}</span>
                    {c.author.university && (
                      <span className={styles.commentUniv}>{c.author.university}</span>
                    )}
                    <time className={styles.commentTime}>{timeAgo(c.createdAt)}</time>
                    {user && (user.id === c.authorId || user.role === 'ADMIN') && (
                      <button
                        className={styles.deleteCommentBtn}
                        onClick={() => handleDeleteComment(c)}
                        title="Delete comment"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p className={styles.commentText}>{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
