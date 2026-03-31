import React, { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ImageIcon, ArrowLeft, Send, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { useAuth } from '@/contexts/AuthContext'
import { api, ApiError } from '@/services/api'
import type { PostCategory } from '@/types'
import styles from './CreatePost.module.scss'

const CATEGORIES: Array<{ value: PostCategory; label: string }> = [
  { value: 'ACADEMICS', label: 'Academics' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'ADMINISTRATION', label: 'Administration' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'HOSTEL', label: 'Hostel' },
  { value: 'SPORTS_CULTURE', label: 'Sports & Culture' },
  { value: 'OTHER', label: 'Other' },
]

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export default function CreatePostPage(): React.ReactElement {
  const { t, locale } = useLocale()
  const { user, acceptBoardTos } = useAuth()
  const navigate = useNavigate()

  useHead({ title: t.board.createPost + ' — U.N.I.T.', description: '' })

  // Redirect if not logged in
  if (!user) {
    navigate(`/${locale}/login`, { state: { from: `/${locale}/board/create` }, replace: true })
  }

  const [tosAgreed, setTosAgreed] = useState(false)
  const [tosAccepting, setTosAccepting] = useState(false)
  const [tosError, setTosError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<PostCategory>('OTHER')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'done'>('idle')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      setError(t.board.imageTypeError)
      return
    }
    if (file.size > MAX_SIZE) {
      setError(t.board.imageSizeError)
      return
    }
    setError('')
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) { setError(t.board.imageRequired); return }
    if (!title.trim()) { setError(t.board.titleRequired); return }

    setSubmitting(true)
    setError('')

    try {
      // 1. Get presigned URL
      setUploadProgress('uploading')
      const { uploadUrl, fileUrl } = await api.board.requestImageUrl(
        imageFile.name,
        imageFile.type
      )

      // 2. Upload directly to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: imageFile,
        headers: { 'Content-Type': imageFile.type },
      })
      setUploadProgress('done')

      // 3. Create post
      await api.board.createPost({
        title: title.trim(),
        description: description.trim() || undefined,
        imageUrl: fileUrl,
        category,
      })

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.common.error)
      setUploadProgress('idle')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAcceptTos = async () => {
    if (!tosAgreed) return
    setTosAccepting(true)
    setTosError('')
    try {
      await acceptBoardTos()
    } catch {
      setTosError(t.common.error)
    } finally {
      setTosAccepting(false)
    }
  }

  // Show ToS gate if user hasn't accepted yet
  const showTosGate = user && !user.boardTosAccepted

  return (
    <div className={styles.page}>
      {/* ─── ToS Gate Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showTosGate && (
          <motion.div
            className={styles.tosOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.tosModal}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className={styles.tosIconWrap} aria-hidden="true">
                <ShieldAlert size={28} />
              </div>
              <h2 className={styles.tosTitle}>{t.boardTos.title}</h2>
              <div className={styles.tosBody}>
                {t.boardTos.body.split('\n\n').map((para, i) => (
                  <p key={i} className={styles.tosPara}>{para}</p>
                ))}
              </div>
              <Link
                to={`/${locale}/legal`}
                className={styles.tosReadFull}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.boardTos.readFull}
              </Link>
              {tosError && <p className={styles.tosError}>{tosError}</p>}
              <label className={styles.tosCheck}>
                <input
                  type="checkbox"
                  checked={tosAgreed}
                  onChange={(e) => setTosAgreed(e.target.checked)}
                  className={styles.tosCheckInput}
                />
                <span>{t.boardTos.agree}</span>
              </label>
              <div className={styles.tosActions}>
                <button
                  className={styles.tosProceedBtn}
                  onClick={handleAcceptTos}
                  disabled={!tosAgreed || tosAccepting}
                >
                  {tosAccepting ? <span className={styles.tosSpin} /> : null}
                  {t.boardTos.proceed}
                </button>
                <button
                  className={styles.tosDeclineBtn}
                  onClick={() => navigate(`/${locale}/board`)}
                >
                  {t.boardTos.decline}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.inner}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(`/${locale}/board`)}
        >
          <ArrowLeft size={16} />
          {t.board.backToBoard}
        </button>

        {submitted ? (
          <motion.div
            className={styles.successCard}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div className={styles.successIcon} aria-hidden="true">
              <CheckCircle2 size={40} />
            </div>
            <h2 className={styles.successTitle}>{t.board.postSubmitted}</h2>
            <p className={styles.successBody}>{t.board.postPendingReview}</p>
            <button
              className={styles.submitBtn}
              onClick={() => navigate(`/${locale}/board`)}
            >
              <ArrowLeft size={16} />
              {t.board.backToBoard}
            </button>
          </motion.div>
        ) : (

        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className={styles.title}>{t.board.createPost}</h1>
          <p className={styles.subtitle}>{t.board.createPostSubtitle}</p>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* Image upload */}
            <div className={styles.field}>
              <label className={styles.label}>{t.board.image} *</label>
              <div
                className={[styles.dropZone, imagePreview ? styles.hasImage : ''].join(' ')}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className={styles.preview} />
                ) : (
                  <div className={styles.dropHint}>
                    <ImageIcon size={32} className={styles.dropIcon} />
                    <p className={styles.dropText}>{t.board.dropImage}</p>
                    <p className={styles.dropSub}>JPEG, PNG, WebP — max 5 MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPTED.join(',')}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className={styles.hidden}
              />
              {imagePreview && (
                <button
                  type="button"
                  className={styles.changeImageBtn}
                  onClick={() => { setImageFile(null); setImagePreview(null) }}
                >
                  {t.board.changeImage}
                </button>
              )}
            </div>

            {/* Title */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="post-title">
                {t.board.postTitle} *
              </label>
              <input
                id="post-title"
                type="text"
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.board.postTitlePlaceholder}
                maxLength={255}
                required
              />
              <span className={styles.charCount}>{title.length}/255</span>
            </div>

            {/* Description */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="post-desc">
                {t.board.description} ({t.common.cancel !== '' ? 'optional' : ''})
              </label>
              <textarea
                id="post-desc"
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.board.descriptionPlaceholder}
                rows={4}
                maxLength={2000}
              />
              <span className={styles.charCount}>{description.length}/2000</span>
            </div>

            {/* Category */}
            <div className={styles.field}>
              <label className={styles.label}>{t.board.category}</label>
              <div className={styles.catGrid}>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={[
                      styles.catChip,
                      category === c.value ? styles.catChipActive : '',
                    ].join(' ')}
                    onClick={() => setCategory(c.value)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? (
                <>
                  <span className={styles.spinner} />
                  {uploadProgress === 'uploading' ? t.board.uploading : t.board.posting}
                </>
              ) : (
                <>
                  <Send size={16} />
                  {t.board.postBtn}
                </>
              )}
            </button>
          </form>
        </motion.div>
        )}
      </div>
    </div>
  )
}
