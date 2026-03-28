import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, MessageCircleWarning, TrendingUp, Camera, Heart } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useAuth } from '@/contexts/AuthContext'
import styles from './BoardTutorial.module.scss'

const STORAGE_KEY = 'board_tutorial_seen'
const DONATION_URL = 'https://rzp.io/l/noteshub-kasmir'

// ─── Step icons ──────────────────────────────────────────────────────────────
const GUEST_ICONS = [MessageCircleWarning, TrendingUp, Camera, Heart]
const AUTH_ICONS  = [MessageCircleWarning, Camera, TrendingUp, Heart]

interface Props {
  locale: string
}

export default function BoardTutorial({ locale }: Props): React.ReactElement | null {
  const { t } = useLocale()
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      // Small delay so the board page renders first
      const tid = setTimeout(() => setVisible(true), 600)
      return () => clearTimeout(tid)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  // ─── Build steps based on auth state ────────────────────────────────────
  const tut = t.board.tutorial

  const guestSteps = [
    { title: tut.guestStep1Title, desc: tut.guestStep1Desc },
    { title: tut.guestStep2Title, desc: tut.guestStep2Desc },
    { title: tut.guestStep3Title, desc: tut.guestStep3Desc },
    { title: tut.guestStep4Title, desc: tut.guestStep4Desc },
  ]

  const authSteps = [
    { title: tut.authStep1Title, desc: tut.authStep1Desc },
    { title: tut.authStep2Title, desc: tut.authStep2Desc },
    { title: tut.authStep3Title, desc: tut.authStep3Desc },
    { title: tut.authStep4Title, desc: tut.authStep4Desc },
  ]

  const steps = user ? authSteps : guestSteps
  const icons = user ? AUTH_ICONS : GUEST_ICONS
  const total = steps.length
  const isLast = step === total - 1
  const Icon = icons[step]

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
            {/* Close button */}
            <button className={styles.closeBtn} onClick={dismiss} aria-label="Close tutorial">
              <X size={18} />
            </button>

            {/* Progress dots */}
            <div className={styles.dots}>
              {steps.map((_, i) => (
                <button
                  key={i}
                  className={[styles.dot, i === step ? styles.dotActive : ''].join(' ')}
                  onClick={() => setStep(i)}
                  aria-label={`Step ${i + 1}`}
                />
              ))}
            </div>

            {/* Step counter */}
            <p className={styles.stepLabel}>
              Step {step + 1} {tut.stepOf} {total}
            </p>

            {/* Animated step content */}
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
                <h2 className={styles.stepTitle}>{steps[step].title}</h2>
                <p className={styles.stepDesc}>{steps[step].desc}</p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
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
                ) : user ? (
                  /* Last step logged-in: Explore + Donate */
                  <>
                    <a
                      href={DONATION_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.donateBtn}
                      onClick={dismiss}
                    >
                      {tut.authDonate}
                      <Heart size={14} />
                    </a>
                    <button className={styles.nextBtn} onClick={dismiss}>
                      {tut.authCta}
                      <ChevronRight size={16} />
                    </button>
                  </>
                ) : (
                  /* Last step guest: Create account + skip */
                  <>
                    <Link
                      to={`/${locale}/register`}
                      className={styles.nextBtn}
                      onClick={dismiss}
                    >
                      {tut.guestCta}
                      <ChevronRight size={16} />
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Guest last step: skip link */}
            {isLast && !user && (
              <button className={styles.skipLink} onClick={dismiss}>
                {tut.guestSkip}
              </button>
            )}

            {/* Generic skip (non-last steps) */}
            {!isLast && (
              <button className={styles.skipLink} onClick={dismiss}>
                {tut.close}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
