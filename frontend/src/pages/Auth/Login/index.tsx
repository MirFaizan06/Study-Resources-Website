import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Eye, EyeOff, BookOpen } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/services/api'
import styles from './Login.module.scss'

export default function LoginPage(): React.ReactElement {
  const { t, locale } = useLocale()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useHead({ title: t.board.auth.loginTitle + ' — U.N.I.T.', description: '' })

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = (location.state as { from?: string })?.from ?? `/${locale}/board`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
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
          <span className={styles.logoText}>U.N.I.T.</span>
        </div>

        <h1 className={styles.title}>{t.board.auth.loginTitle}</h1>
        <p className={styles.subtitle}>{t.board.auth.loginSubtitle}</p>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              {t.board.auth.email}
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              {t.board.auth.password}
            </label>
            <div className={styles.passwordWrap}>
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
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

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <>
                <LogIn size={16} />
                {t.board.auth.loginBtn}
              </>
            )}
          </button>
        </form>

        <p className={styles.switchText}>
          {t.board.auth.noAccount}{' '}
          <Link to={`/${locale}/register`} className={styles.switchLink}>
            {t.board.auth.signUp}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
