import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Send, Search, Bell } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import { Button } from '@/components/ui/Button'
import type { CreateRequestPayload } from '@/types'
import styles from './Request.module.scss'

interface FormState {
  studentName: string
  requestedMaterial: string
  contactEmail: string
}

const INITIAL_FORM: FormState = {
  studentName: '',
  requestedMaterial: '',
  contactEmail: '',
}

export default function Request(): React.ReactElement {
  const { t } = useLocale()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useHead({
    title: t.seo.request.title,
    description: t.seo.request.description,
  })

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {}
    if (!form.studentName.trim()) newErrors.studentName = 'Your name is required.'
    if (!form.requestedMaterial.trim())
      newErrors.requestedMaterial = 'Please describe what you need.'
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError('')

    const payload: CreateRequestPayload = {
      studentName: form.studentName.trim(),
      requestedMaterial: form.requestedMaterial.trim(),
      contactEmail: form.contactEmail.trim() || undefined,
    }

    try {
      await api.requests.create(payload)
      setSubmitSuccess(true)
    } catch {
      setSubmitError(t.request.form.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const update = (key: keyof FormState, value: string) => {
    setForm((p) => ({ ...p, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const HOW_IT_WORKS = [
    { icon: <Send size={24} />, ...t.request.howItWorks.steps[0] },
    { icon: <Search size={24} />, ...t.request.howItWorks.steps[1] },
    { icon: <Bell size={24} />, ...t.request.howItWorks.steps[2] },
  ]

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero} aria-label="Page hero">
        <div className={styles.heroInner}>
          <motion.div
            className={styles.heroText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className={styles.heroTitle}>{t.request.title}</h1>
            <p className={styles.heroSubtitle}>{t.request.subtitle}</p>
          </motion.div>
          <motion.div
            className={styles.heroIllustration}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img
              src="/images/request-illustration.png"
              alt="Student requesting study materials"
              className={styles.heroImg}
              width="440"
              height="320"
            />
          </motion.div>
        </div>
      </section>

      <div className={styles.container}>
        {/* How it works */}
        <section className={styles.howItWorks} aria-labelledby="how-heading">
          <h2 id="how-heading" className={styles.sectionTitle}>
            {t.request.howItWorks.title}
          </h2>
          <div className={styles.stepsGrid}>
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={i}
                className={styles.stepCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <div className={styles.stepIconWrap}>{step.icon}</div>
                <div className={styles.stepNumber}>Step {i + 1}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Form */}
        <section className={styles.formSection} aria-labelledby="form-heading">
          <h2 id="form-heading" className={styles.sectionTitle}>
            Submit a Request
          </h2>

          {submitSuccess ? (
            <motion.div
              className={styles.successState}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className={styles.successIcon}>
                <CheckCircle size={48} aria-hidden="true" />
              </div>
              <h3 className={styles.successTitle}>Request Submitted!</h3>
              <p className={styles.successMessage}>{t.request.form.success}</p>
              <Button
                onClick={() => {
                  setForm(INITIAL_FORM)
                  setSubmitSuccess(false)
                }}
              >
                Submit Another Request
              </Button>
            </motion.div>
          ) : (
            <form
              className={styles.form}
              onSubmit={handleSubmit}
              noValidate
            >
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="studentName">
                  {t.request.form.name} <span className={styles.required}>*</span>
                </label>
                <input
                  id="studentName"
                  type="text"
                  className={[styles.input, errors.studentName ? styles.inputError : ''].join(' ')}
                  placeholder={t.request.form.namePlaceholder}
                  value={form.studentName}
                  onChange={(e) => update('studentName', e.target.value)}
                  autoComplete="name"
                />
                {errors.studentName && (
                  <span className={styles.fieldError}>{errors.studentName}</span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="requestedMaterial">
                  {t.request.form.material} <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="requestedMaterial"
                  className={[styles.textarea, errors.requestedMaterial ? styles.inputError : ''].join(' ')}
                  placeholder={t.request.form.materialPlaceholder}
                  value={form.requestedMaterial}
                  onChange={(e) => update('requestedMaterial', e.target.value)}
                  rows={4}
                />
                {errors.requestedMaterial && (
                  <span className={styles.fieldError}>{errors.requestedMaterial}</span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="contactEmail">
                  {t.request.form.email}
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  className={[styles.input, errors.contactEmail ? styles.inputError : ''].join(' ')}
                  placeholder={t.request.form.emailPlaceholder}
                  value={form.contactEmail}
                  onChange={(e) => update('contactEmail', e.target.value)}
                  autoComplete="email"
                />
                {errors.contactEmail && (
                  <span className={styles.fieldError}>{errors.contactEmail}</span>
                )}
              </div>

              {submitError && (
                <div className={styles.submitError} role="alert">
                  <AlertCircle size={16} aria-hidden="true" />
                  {submitError}
                </div>
              )}

              <Button
                type="submit"
                isLoading={isSubmitting}
                leftIcon={<Send size={16} />}
                fullWidth
              >
                {isSubmitting ? t.request.form.submitting : t.request.form.submit}
              </Button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
