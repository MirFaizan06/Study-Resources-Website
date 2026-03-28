import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Clock,
  Star,
  Plus,
  ChevronUp,
  MessageSquare,
  Filter,
} from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/services/api'
import type { ConcernPost, PostSort, PostCategory } from '@/types'
import { AdBanner } from '@/components/common/AdBanner'
import BoardTutorial from './BoardTutorial'
import styles from './Board.module.scss'

const CATEGORIES: Array<{ value: PostCategory | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'ACADEMICS', label: 'Academics' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'ADMINISTRATION', label: 'Administration' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'HOSTEL', label: 'Hostel' },
  { value: 'SPORTS_CULTURE', label: 'Sports & Culture' },
  { value: 'OTHER', label: 'Other' },
]

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

function PostCard({
  post,
  locale,
  onVote,
}: {
  post: ConcernPost
  locale: string
  onVote: (id: string) => void
}): React.ReactElement {
  const { user } = useAuth()

  return (
    <motion.article
      className={styles.postCard}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Vote column */}
      <div className={styles.voteCol}>
        <button
          className={[styles.voteBtn, post.hasVoted ? styles.voted : ''].join(' ')}
          onClick={() => (user ? onVote(post.id) : null)}
          aria-label={post.hasVoted ? 'Remove upvote' : 'Upvote'}
          title={!user ? 'Sign in to vote' : undefined}
        >
          <ChevronUp size={18} />
        </button>
        <span className={styles.voteCount}>{post.upvotesCount}</span>
      </div>

      {/* Image */}
      <Link to={`/${locale}/board/${post.id}`} className={styles.imgWrap}>
        <img
          src={post.imageUrl}
          alt={post.title}
          className={styles.postImg}
          loading="lazy"
        />
      </Link>

      {/* Content */}
      <div className={styles.postBody}>
        <div className={styles.postMeta}>
          <span className={[styles.catBadge, styles[`cat_${post.category.toLowerCase()}`]].join(' ')}>
            {CATEGORIES.find((c) => c.value === post.category)?.label ?? post.category}
          </span>
          <span className={styles.metaDot} aria-hidden="true" />
          <span className={styles.metaText}>{post.author.name}</span>
          {post.author.university && (
            <>
              <span className={styles.metaDot} aria-hidden="true" />
              <span className={styles.metaText}>{post.author.university}</span>
            </>
          )}
          <span className={styles.metaDot} aria-hidden="true" />
          <time className={styles.metaText}>{timeAgo(post.createdAt)}</time>
        </div>

        <Link to={`/${locale}/board/${post.id}`} className={styles.postTitle}>
          {post.title}
        </Link>

        <div className={styles.postFooter}>
          <Link to={`/${locale}/board/${post.id}`} className={styles.commentLink}>
            <MessageSquare size={14} />
            <span>{post._count.comments}</span>
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

export default function BoardPage(): React.ReactElement {
  const { t, locale } = useLocale()
  const { user } = useAuth()
  const navigate = useNavigate()

  useHead({
    title: t.board.title + ' — NotesHub Kashmir',
    description: t.board.subtitle,
  })

  const [sort, setSort] = useState<PostSort>('hot')
  const [category, setCategory] = useState<PostCategory | 'ALL'>('ALL')
  const [posts, setPosts] = useState<ConcernPost[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  const loadPosts = useCallback(
    async (reset = true) => {
      if (reset) setLoading(true)
      else setLoadingMore(true)

      try {
        const result = await api.board.getPosts({
          sort,
          category,
          cursor: reset ? undefined : nextCursor ?? undefined,
        })
        if (!isMounted.current) return
        setPosts((prev) => (reset ? result.items : [...prev, ...result.items]))
        setNextCursor(result.nextCursor)
        setError('')
      } catch {
        if (isMounted.current) setError(t.common.error)
      } finally {
        if (isMounted.current) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    },
    [sort, category, nextCursor, t.common.error]
  )

  useEffect(() => {
    loadPosts(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, category])

  const handleVote = async (postId: string) => {
    if (!user) {
      navigate(`/${locale}/login`, { state: { from: `/${locale}/board` } })
      return
    }
    try {
      const result = await api.board.vote(postId)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, upvotesCount: result.upvotesCount, hasVoted: result.voted }
            : p
        )
      )
    } catch {
      // silent
    }
  }

  const SORT_TABS: Array<{ value: PostSort; icon: React.ReactNode; label: string }> = [
    { value: 'hot', icon: <TrendingUp size={15} />, label: t.board.sortHot },
    { value: 'new', icon: <Clock size={15} />, label: t.board.sortNew },
    { value: 'top', icon: <Star size={15} />, label: t.board.sortTop },
  ]

  return (
    <main className={styles.page}>
      <BoardTutorial locale={locale} />

      {/* ─── Hero banner ─────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>{t.board.title}</h1>
            <p className={styles.heroSubtitle}>{t.board.subtitle}</p>
          </div>
          {user ? (
            <Link to={`/${locale}/board/create`} className={styles.createBtn}>
              <Plus size={16} />
              {t.board.newPost}
            </Link>
          ) : (
            <Link to={`/${locale}/login`} className={styles.createBtn}>
              {t.board.signInToPost}
            </Link>
          )}
        </div>
      </section>

      <div className={styles.layout}>
        {/* ─── Sidebar (desktop) ───────────────────────────────────────────── */}
        <aside className={styles.sidebar}>
          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}>{t.board.categories}</h3>
            <ul className={styles.catList}>
              {CATEGORIES.map((c) => (
                <li key={c.value}>
                  <button
                    className={[
                      styles.catItem,
                      category === c.value ? styles.catItemActive : '',
                    ].join(' ')}
                    onClick={() => setCategory(c.value)}
                  >
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {!user && (
            <div className={styles.sideCard}>
              <h3 className={styles.sideTitle}>{t.board.joinTitle}</h3>
              <p className={styles.sideDesc}>{t.board.joinDesc}</p>
              <Link to={`/${locale}/register`} className={styles.joinBtn}>
                {t.board.auth.registerBtn}
              </Link>
              <Link to={`/${locale}/login`} className={styles.joinBtnGhost}>
                {t.board.auth.loginBtn}
              </Link>
            </div>
          )}

          <AdBanner slot="1122334455" format="vertical" className={styles.sideAd} />
        </aside>

        {/* ─── Main feed ───────────────────────────────────────────────────── */}
        <div className={styles.feed}>
          {/* Sort tabs + mobile category filter */}
          <div className={styles.feedControls}>
            <div className={styles.sortTabs}>
              {SORT_TABS.map((s) => (
                <button
                  key={s.value}
                  className={[styles.sortTab, sort === s.value ? styles.sortTabActive : ''].join(' ')}
                  onClick={() => setSort(s.value)}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>
            <button
              className={styles.mobileFilterBtn}
              onClick={() => setCategory(category === 'ALL' ? 'ACADEMICS' : 'ALL')}
              aria-label="Filter"
            >
              <Filter size={16} />
            </button>
          </div>

          {/* Mobile category pills */}
          <div className={styles.mobileCats}>
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                className={[
                  styles.mobileCatPill,
                  category === c.value ? styles.mobileCatActive : '',
                ].join(' ')}
                onClick={() => setCategory(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          {loading ? (
            <div className={styles.skeletonList}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          ) : error ? (
            <div className={styles.emptyState}>
              <p>{error}</p>
              <button className={styles.retryBtn} onClick={() => loadPosts(true)}>
                {t.common.tryAgain}
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{t.board.noPosts}</p>
              {user && (
                <Link to={`/${locale}/board/create`} className={styles.retryBtn}>
                  {t.board.beFirst}
                </Link>
              )}
            </div>
          ) : (
            <>
              {posts.map((post, idx) => (
                <React.Fragment key={post.id}>
                  <PostCard post={post} locale={locale} onVote={handleVote} />
                  {(idx + 1) % 5 === 0 && (
                    <div className={styles.feedAd}>
                      <AdBanner slot="5566778899" format="auto" />
                    </div>
                  )}
                </React.Fragment>
              ))}
              {nextCursor && (
                <button
                  className={styles.loadMoreBtn}
                  onClick={() => loadPosts(false)}
                  disabled={loadingMore}
                >
                  {loadingMore ? t.common.loading : t.resource.loadMore}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
