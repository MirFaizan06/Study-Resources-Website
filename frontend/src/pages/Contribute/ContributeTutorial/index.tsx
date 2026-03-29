import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, GraduationCap, FileText, Link2, CheckCircle } from 'lucide-react'
import styles from './ContributeTutorial.module.scss'

const STORAGE_KEY = 'contribute_tutorial_seen'

const STEPS = [
  {
    Icon: GraduationCap,
    title: 'Step 1 — Select Your Subject',
    desc: 'Choose your institution, then your program, then the specific subject the resource belongs to. We use this to file it correctly so other students can find it.',
  },
  {
    Icon: FileText,
    title: 'Step 2 — Fill Resource Details',
    desc: 'Give the resource a clear title (e.g. "Data Structures Notes Unit 1–3"), pick the type (Notes, Past Paper, Syllabus, or Guess Paper), and optionally add the year.',
  },
  {
    Icon: Link2,
    title: 'Step 3 — Upload to Google Drive',
    desc: 'Upload your PDF to Google Drive, change the share setting to "Anyone with the link", then copy and paste the link into our form. We do not store files directly — Google Drive is our free storage layer.',
  },
  {
    Icon: CheckCircle,
    title: 'Step 4 — Submit for Review',
    desc: 'Our team reviews every submission before publishing it. This usually takes 24–48 hours. You will be notified by email if you provided one. Thank you for helping fellow students!',
  },
]

export default function ContributeTutorial(): React.ReactElement | null {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const [showAgain, setShowAgain] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) {
      const tid = setTimeout(() => setVisible(true), 400)
      return () => clearTimeout(tid)
    }
  }, [])

  const dismiss = () => {
    if (!showAgain) {
      localStorage.setItem(STORAGE_KEY, '1')
    }
    setVisible(false)
    setStep(0)
  }

  if (!visible) return null

  const total = STEPS.length
  const isLast = step === total - 1
  const { Icon, title, desc } = STEPS[step]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) dismiss() }}
        >
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Close */}
            <button className={styles.closeBtn} onClick={dismiss} aria-label="Close tutorial">
              <X size={18} />
            </button>

            {/* Progress dots */}
            <div className={styles.dots}>
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  className={[styles.dot, i === step ? styles.dotActive : ''].join(' ')}
                  onClick={() => setStep(i)}
                  aria-label={`Step ${i + 1}`}
                />
              ))}
            </div>

            <p className={styles.stepLabel}>Step {step + 1} of {total}</p>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                className={styles.stepBody}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }}
              >
                <div className={styles.iconWrap}>
                  <Icon size={28} className={styles.stepIcon} />
                </div>
                <h2 className={styles.stepTitle}>{title}</h2>
                <p className={styles.stepDesc}>{desc}</p>
              </motion.div>
            </AnimatePresence>

            {/* Nav */}
            <div className={styles.nav}>
              {step > 0 && (
                <button className={styles.prevBtn} onClick={() => setStep((s) => s - 1)}>
                  <ChevronLeft size={16} />
                  Back
                </button>
              )}
              <div className={styles.navRight}>
                {!isLast ? (
                  <button className={styles.nextBtn} onClick={() => setStep((s) => s + 1)}>
                    Next
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button className={styles.nextBtn} onClick={dismiss}>
                    Start Contributing
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Show again toggle */}
            <label className={styles.showAgainRow}>
              <input
                type="checkbox"
                checked={showAgain}
                onChange={(e) => setShowAgain(e.target.checked)}
                className={styles.showAgainCheck}
              />
              <span className={styles.showAgainLabel}>Show this guide every time I visit</span>
            </label>

            {!isLast && (
              <button className={styles.skipLink} onClick={dismiss}>
                Skip guide
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
