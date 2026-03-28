import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import { Button } from '@/components/ui/Button'
import styles from './Login.module.scss'

export default function AdminLogin(): React.ReactElement {
  const navigate = useNavigate()
  const { t, locale } = useLocale()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useHead({
    title: t.seo.admin.title,
    description: t.seo.admin.description,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsSubmitting(true)
    setError('')

    try {
      const { token } = await api.admin.login(email, password)
      localStorage.setItem('admin_token', token)
      navigate(`/${locale}/admin`)
    } catch {
      setError(t.admin.login.error)
    } finally {
      setIsSubmitting(false)
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
        {/* Logo */}
        <div className={styles.header}>
          <div className={styles.logoWrap}>
            <BookOpen size={28} aria-hidden="true" />
          </div>
          <h1 className={styles.title}>{t.admin.login.title}</h1>
          <p className={styles.subtitle}>{t.admin.login.subtitle}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="email">
              {t.admin.login.email}
            </label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} aria-hidden="true" />
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder={t.admin.login.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="password">
              {t.admin.login.password}
            </label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} aria-hidden="true" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={[styles.input, styles.inputWithToggle].join(' ')}
                placeholder={t.admin.login.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.errorMsg} role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            isLoading={isSubmitting}
            fullWidth
          >
            {isSubmitting ? t.admin.login.submitting : t.admin.login.submit}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
