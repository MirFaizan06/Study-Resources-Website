import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, Eye, EyeOff, BookOpen } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/services/api'
import styles from './Register.module.scss'

const SEMESTERS = Array.from({ length: 10 }, (_, i) => i + 1)

export default function RegisterPage(): React.ReactElement {
  const { t, locale } = useLocale()
  const { register } = useAuth()
  const navigate = useNavigate()

  useHead({ title: t.board.auth.registerTitle + ' — NotesHub Kashmir', description: '' })

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    college: '',
    semester: 1,
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: field === 'semester' ? Number(e.target.value) : e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) {
      setError(t.board.auth.passwordTooShort)
      return
    }
    setLoading(true)
    try {
      await register(form)
      navigate(`/${locale}/board`, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.common.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.logoRow}>
          <div className={styles.logoMark}>
            <BookOpen size={20} aria-hidden="true" />
          </div>
          <span className={styles.logoText}>NotesHub</span>
        </div>

        <h1 className={styles.title}>{t.board.auth.registerTitle}</h1>
        <p className={styles.subtitle}>{t.board.auth.registerSubtitle}</p>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-name">{t.board.auth.fullName}</label>
              <input
                id="reg-name"
                type="text"
                className={styles.input}
                value={form.name}
                onChange={set('name')}
                placeholder={t.board.auth.fullNamePlaceholder}
                required
                autoComplete="name"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-email">{t.board.auth.email}</label>
              <input
                id="reg-email"
                type="email"
                className={styles.input}
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-password">{t.board.auth.password}</label>
            <div className={styles.passwordWrap}>
              <input
                id="reg-password"
                type={showPw ? 'text' : 'password'}
                className={styles.input}
                value={form.password}
                onChange={set('password')}
                placeholder="min 8 characters"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-university">{t.board.auth.university}</label>
            <input
              id="reg-university"
              type="text"
              className={styles.input}
              value={form.university}
              onChange={set('university')}
              placeholder={t.board.auth.universityPlaceholder}
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-college">{t.board.auth.college}</label>
              <input
                id="reg-college"
                type="text"
                className={styles.input}
                value={form.college}
                onChange={set('college')}
                placeholder={t.board.auth.collegePlaceholder}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-semester">{t.board.auth.semester}</label>
              <select
                id="reg-semester"
                className={styles.input}
                value={form.semester}
                onChange={set('semester')}
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    {t.common.semester} {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <>
                <UserPlus size={16} />
                {t.board.auth.registerBtn}
              </>
            )}
          </button>
        </form>

        <p className={styles.switchText}>
          {t.board.auth.hasAccount}{' '}
          <Link to={`/${locale}/login`} className={styles.switchLink}>
            {t.board.auth.signIn}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
