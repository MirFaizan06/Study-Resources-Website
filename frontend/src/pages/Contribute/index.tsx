import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ChevronRight, Upload, AlertCircle, HardDrive, ExternalLink } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import { Button } from '@/components/ui/Button'
import ContributeTutorial from './ContributeTutorial'
import type { Institution, Program, Subject, ResourceType, ContributePayload } from '@/types'
import styles from './Contribute.module.css'

const RESOURCE_TYPES: Array<{ value: ResourceType; label: string }> = [
  { value: 'NOTE', label: 'Notes' },
  { value: 'PYQ', label: 'Past Papers (PYQ)' },
  { value: 'SYLLABUS', label: 'Syllabus' },
  { value: 'GUESS_PAPER', label: 'Guess Paper' },
]

const STEPS = [
  { label: 'Select Subject', desc: 'Choose institution, program & subject' },
  { label: 'Resource Details', desc: 'Title, type, and file link' },
  { label: 'Submit', desc: 'Review and submit' },
]

interface FormState {
  institutionId: string
  programId: string
  subjectId: string
  title: string
  type: ResourceType | ''
  year: string
  yourName: string
  yourEmail: string
  fileUrl: string
  isAiGenerated: boolean
}

const INITIAL_FORM: FormState = {
  institutionId: '',
  programId: '',
  subjectId: '',
  title: '',
  type: '',
  year: '',
  yourName: '',
  yourEmail: '',
  fileUrl: '',
  isAiGenerated: false,
}

export default function Contribute(): React.ReactElement {
  const { t } = useLocale()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useHead({
    title: t.seo.contribute.title,
    description: t.seo.contribute.description,
  })

  useEffect(() => {
    api.institutions.getAll().then(setInstitutions).catch(console.error)
  }, [])

  const handleInstitutionChange = (id: string) => {
    setForm((p) => ({ ...p, institutionId: id, programId: '', subjectId: '' }))
    setPrograms([])
    setSubjects([])

    const inst = institutions.find((i) => i.id === id)
    if (inst?.programs) {
      setPrograms(inst.programs)
    }
  }

  const handleProgramChange = (id: string) => {
    setForm((p) => ({ ...p, programId: id, subjectId: '' }))
    setSubjects([])

    api.institutions
      .getProgram(id)
      .then((prog) => setSubjects(prog.subjects ?? []))
      .catch(console.error)
  }

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {}

    if (currentStep === 0) {
      if (!form.institutionId) newErrors.institutionId = 'Required'
      if (!form.programId) newErrors.programId = 'Required'
      if (!form.subjectId) newErrors.subjectId = 'Required'
    }

    if (currentStep === 1) {
      if (!form.title.trim()) newErrors.title = 'Required'
      if (!form.type) newErrors.type = 'Required'
      if (!form.fileUrl.trim()) newErrors.fileUrl = 'Required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => s + 1)
  }

  const handleBack = () => setStep((s) => s - 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(1)) return

    setIsSubmitting(true)
    setSubmitError('')

    const payload: ContributePayload = {
      title: form.title.trim(),
      type: form.type as ResourceType,
      fileUrl: form.fileUrl.trim(),
      subjectId: form.subjectId,
      year: form.year ? parseInt(form.year) : undefined,
      isAiGenerated: form.isAiGenerated,
      uploaderName: form.yourName || undefined,
      uploaderEmail: form.yourEmail || undefined,
    }

    try {
      await api.contribute.submit(payload)
      setSubmitSuccess(true)
    } catch {
      setSubmitError(t.contribute.form.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const update = (key: keyof FormState, value: string | boolean) => {
    setForm((p) => ({ ...p, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  if (submitSuccess) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <motion.div
            className={styles.successState}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <img
              src="/images/success-animation-frame.png"
              alt="Success"
              className={styles.successImg}
              width="120"
              height="120"
            />
            <h2 className={styles.successTitle}>Contribution Submitted!</h2>
            <p className={styles.successMessage}>{t.contribute.form.success}</p>
            <Button
              onClick={() => {
                setForm(INITIAL_FORM)
                setStep(0)
                setSubmitSuccess(false)
              }}
            >
              Submit Another
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <ContributeTutorial />
      <div className={styles.container}>
        {/* Page header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{t.contribute.title}</h1>
          <p className={styles.pageSubtitle}>{t.contribute.subtitle}</p>
        </div>

        {/* Stepper */}
        <div className={styles.stepper} aria-label="Progress">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={[
                styles.stepperItem,
                i < step ? styles.stepperDone : '',
                i === step ? styles.stepperActive : '',
              ].join(' ')}
            >
              <div className={styles.stepperNumber}>
                {i < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              <div className={styles.stepperText}>
                <span className={styles.stepperLabel}>{s.label}</span>
                <span className={styles.stepperDesc}>{s.desc}</span>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight size={18} className={styles.stepperArrow} aria-hidden="true" />
              )}
            </div>
          ))}
        </div>

        <div className={styles.formArea}>
          <AnimatePresence mode="wait">
            {/* Step 0: Select Subject */}
            {step === 0 && (
              <motion.div
                key="step0"
                className={styles.formStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <h2 className={styles.stepTitle}>Select Subject</h2>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="institution">
                    Institution <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="institution"
                    className={[styles.select, errors.institutionId ? styles.selectError : ''].join(' ')}
                    value={form.institutionId}
                    onChange={(e) => handleInstitutionChange(e.target.value)}
                  >
                    <option value="">{t.contribute.form.selectInstitution}</option>
                    {institutions.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                  {errors.institutionId && (
                    <span className={styles.fieldError}>{errors.institutionId}</span>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="program">
                    Program <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="program"
                    className={[styles.select, errors.programId ? styles.selectError : ''].join(' ')}
                    value={form.programId}
                    onChange={(e) => handleProgramChange(e.target.value)}
                    disabled={!form.institutionId}
                  >
                    <option value="">{t.contribute.form.selectProgram}</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {errors.programId && (
                    <span className={styles.fieldError}>{errors.programId}</span>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="subject">
                    Subject <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="subject"
                    className={[styles.select, errors.subjectId ? styles.selectError : ''].join(' ')}
                    value={form.subjectId}
                    onChange={(e) => update('subjectId', e.target.value)}
                    disabled={!form.programId}
                  >
                    <option value="">{t.contribute.form.selectSubject}</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Sem {s.semester})
                      </option>
                    ))}
                  </select>
                  {errors.subjectId && (
                    <span className={styles.fieldError}>{errors.subjectId}</span>
                  )}
                </div>

                <div className={styles.stepActions}>
                  <Button onClick={handleNext} rightIcon={<ChevronRight size={16} />}>
                    {t.contribute.form.next}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 1: Resource Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                className={styles.formStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <h2 className={styles.stepTitle}>Resource Details</h2>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="title">
                    {t.contribute.form.title} <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    className={[styles.input, errors.title ? styles.inputError : ''].join(' ')}
                    placeholder={t.contribute.form.titlePlaceholder}
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                  />
                  {errors.title && (
                    <span className={styles.fieldError}>{errors.title}</span>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="type">
                    {t.contribute.form.type} <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="type"
                    className={[styles.select, errors.type ? styles.selectError : ''].join(' ')}
                    value={form.type}
                    onChange={(e) => update('type', e.target.value)}
                  >
                    <option value="">{t.contribute.form.selectType}</option>
                    {RESOURCE_TYPES.map((rt) => (
                      <option key={rt.value} value={rt.value}>
                        {rt.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <span className={styles.fieldError}>{errors.type}</span>
                  )}
                </div>

                <div className={styles.row}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="year">
                      {t.contribute.form.year}
                    </label>
                    <input
                      id="year"
                      type="number"
                      className={styles.input}
                      placeholder={t.contribute.form.yearPlaceholder}
                      value={form.year}
                      onChange={(e) => update('year', e.target.value)}
                      min="2000"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="yourName">
                      {t.contribute.form.yourName}
                    </label>
                    <input
                      id="yourName"
                      type="text"
                      className={styles.input}
                      placeholder={t.contribute.form.yourNamePlaceholder}
                      value={form.yourName}
                      onChange={(e) => update('yourName', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="yourEmail">
                    {t.contribute.form.yourEmail}
                  </label>
                  <input
                    id="yourEmail"
                    type="email"
                    className={styles.input}
                    placeholder={t.contribute.form.yourEmailPlaceholder}
                    value={form.yourEmail}
                    onChange={(e) => update('yourEmail', e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="fileUrl">
                    Google Drive Link <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="fileUrl"
                    type="url"
                    className={[styles.input, errors.fileUrl ? styles.inputError : ''].join(' ')}
                    placeholder="https://drive.google.com/file/d/..."
                    value={form.fileUrl}
                    onChange={(e) => update('fileUrl', e.target.value)}
                  />
                  <p className={styles.fieldHelp}>
                    <AlertCircle size={13} aria-hidden="true" />
                    Paste your Google Drive share link (must be set to "Anyone with the link")
                  </p>
                  {errors.fileUrl && (
                    <span className={styles.fieldError}>{errors.fileUrl}</span>
                  )}
                </div>

                <div className={styles.checkboxGroup}>
                  <input
                    id="isAiGenerated"
                    type="checkbox"
                    className={styles.checkbox}
                    checked={form.isAiGenerated}
                    onChange={(e) => update('isAiGenerated', e.target.checked)}
                  />
                  <div>
                    <label className={styles.checkboxLabel} htmlFor="isAiGenerated">
                      {t.contribute.form.isAiGenerated}
                    </label>
                    <p className={styles.checkboxHelp}>{t.contribute.form.isAiGeneratedHelp}</p>
                  </div>
                </div>

                <div className={styles.stepActions}>
                  <Button variant="secondary" onClick={handleBack}>
                    {t.contribute.form.back}
                  </Button>
                  <Button onClick={handleNext} rightIcon={<ChevronRight size={16} />}>
                    {t.contribute.form.next}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Review + Submit */}
            {step === 2 && (
              <motion.form
                key="step2"
                className={styles.formStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                onSubmit={handleSubmit}
              >
                <h2 className={styles.stepTitle}>Review & Submit</h2>

                <div className={styles.reviewCard}>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewKey}>Subject</span>
                    <span className={styles.reviewValue}>
                      {subjects.find((s) => s.id === form.subjectId)?.name ?? form.subjectId}
                    </span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewKey}>Title</span>
                    <span className={styles.reviewValue}>{form.title}</span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewKey}>Type</span>
                    <span className={styles.reviewValue}>
                      {RESOURCE_TYPES.find((r) => r.value === form.type)?.label}
                    </span>
                  </div>
                  {form.year && (
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewKey}>Year</span>
                      <span className={styles.reviewValue}>{form.year}</span>
                    </div>
                  )}
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewKey}>File URL</span>
                    <a
                      href={form.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.reviewLink}
                    >
                      Preview link
                    </a>
                  </div>
                  {form.isAiGenerated && (
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewKey}>AI-Generated</span>
                      <span className={styles.reviewValue}>Yes — disclaimer will be shown</span>
                    </div>
                  )}
                </div>

                {submitError && (
                  <div className={styles.submitError} role="alert">
                    <AlertCircle size={16} aria-hidden="true" />
                    {submitError}
                  </div>
                )}

                <p className={styles.reviewNote}>
                  Your submission will be reviewed by our team before being published.
                </p>

                <div className={styles.stepActions}>
                  <Button variant="secondary" onClick={handleBack}>
                    {t.contribute.form.back}
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    leftIcon={<Upload size={16} />}
                  >
                    {isSubmitting ? t.contribute.form.submitting : t.contribute.form.submit}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Guidelines sidebar */}
        <aside className={styles.guidelines}>
          {/* Google Drive guide */}
          <div className={styles.driveGuide}>
            <div className={styles.driveGuideHeader}>
              <HardDrive size={16} className={styles.driveGuideIcon} aria-hidden="true" />
              <h3 className={styles.driveGuideTitle}>How to share your PDF</h3>
            </div>
            <p className={styles.driveGuideIntro}>
              We only accept Google Drive links. Follow these steps:
            </p>
            <ol className={styles.driveSteps}>
              <li className={styles.driveStep}>
                <span className={styles.driveStepNum}>1</span>
                <div>
                  <strong>Go to</strong>{' '}
                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.driveLink}
                  >
                    drive.google.com <ExternalLink size={11} aria-hidden="true" />
                  </a>{' '}
                  and sign in with your Google account.
                </div>
              </li>
              <li className={styles.driveStep}>
                <span className={styles.driveStepNum}>2</span>
                <div>
                  Click <strong>New → File Upload</strong> and select your PDF file.
                </div>
              </li>
              <li className={styles.driveStep}>
                <span className={styles.driveStepNum}>3</span>
                <div>
                  Once uploaded, <strong>right-click the file</strong> and select{' '}
                  <strong>"Share"</strong>.
                </div>
              </li>
              <li className={styles.driveStep}>
                <span className={styles.driveStepNum}>4</span>
                <div>
                  Under <strong>"General access"</strong>, change it from{' '}
                  <em>"Restricted"</em> to{' '}
                  <strong>"Anyone with the link"</strong>.
                </div>
              </li>
              <li className={styles.driveStep}>
                <span className={styles.driveStepNum}>5</span>
                <div>
                  Click <strong>"Copy link"</strong> and paste it in the form.
                </div>
              </li>
            </ol>
            <p className={styles.driveGuideNote}>
              Our team will verify the link, fix the listing details if needed, and publish it in the catalog.
            </p>
          </div>

          <h3 className={styles.guidelinesTitle}>{t.contribute.guidelines.title}</h3>
          <ul className={styles.guidelinesList}>
            {t.contribute.guidelines.items.map((item, i) => (
              <li key={i} className={styles.guidelinesItem}>
                <CheckCircle size={14} className={styles.guidelinesIcon} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <div className={styles.namingGuide}>
            <h4 className={styles.namingGuideTitle}>{t.contribute.namingConvention.title}</h4>
            <p className={styles.namingGuideSubtitle}>{t.contribute.namingConvention.subtitle}</p>

            {[
              t.contribute.namingConvention.notes,
              t.contribute.namingConvention.syllabus,
              t.contribute.namingConvention.pyq,
            ].map((item) => (
              <div key={item.label} className={styles.namingItem}>
                <span className={styles.namingLabel}>{item.label}</span>
                <code className={styles.namingFormat}>{item.format}</code>
                <span className={styles.namingExample}>{item.example}</span>
              </div>
            ))}

            <p className={styles.namingCategories}>{t.contribute.namingConvention.categories}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
