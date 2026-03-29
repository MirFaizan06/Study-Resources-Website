import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Server, Cloud, Brain } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import styles from './DonatePopup.module.scss'

const SESSION_KEY = 'donate_popup_shown'
const TRIGGER_DELAY = 8000 // 8 seconds after mount

const REASON_ICONS = [
  <Server size={14} key="s" />,
  <Cloud size={14} key="c" />,
  <Brain size={14} key="b" />,
]

export function DonatePopup(): React.ReactElement | null {
  const { t, locale } = useLocale()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem(SESSION_KEY)) return

    const tid = setTimeout(() => {
      setVisible(true)
      sessionStorage.setItem(SESSION_KEY, '1')
    }, TRIGGER_DELAY)

    return () => clearTimeout(tid)
  }, [])

  const dismiss = () => setVisible(false)

  const DONATION_URL =
    (import.meta.env.VITE_RAZORPAY_LINK as string | undefined) ??
    'https://rzp.io/l/noteshub-kasmir'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.popup}
          initial={{ opacity: 0, y: 32, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="donate-popup-title"
        >
          {/* Close */}
          <button className={styles.closeBtn} onClick={dismiss} aria-label="Close">
            <X size={16} />
          </button>

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.iconWrap}>
              <Heart size={20} />
            </div>
            <div>
              <p className={styles.eyebrow}>{t.donatePopup.eyebrow}</p>
              <h3 id="donate-popup-title" className={styles.title}>
                {t.donatePopup.title}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className={styles.desc}>{t.donatePopup.desc}</p>

          {/* Reason list */}
          <ul className={styles.reasons}>
            {t.donatePopup.reasons.map((r, i) => (
              <li key={i} className={styles.reason}>
                <span className={styles.reasonIcon}>{REASON_ICONS[i]}</span>
                {r}
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className={styles.actions}>
            <a
              href={DONATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.donateBtn}
              onClick={dismiss}
            >
              <Heart size={14} />
              {t.donatePopup.donateBtn}
            </a>
            <button className={styles.laterBtn} onClick={dismiss}>
              {t.donatePopup.laterBtn}
            </button>
          </div>

          {/* Supporters link */}
          <Link
            to={`/${locale}/supporters`}
            className={styles.supportersLink}
            onClick={dismiss}
          >
            {t.donatePopup.supportersLink}
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
