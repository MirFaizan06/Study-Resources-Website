// TODO: Localization for this page will be added in a future release due to content complexity.

import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  BookOpen,
  Download,
  ChevronDown,
  ChevronUp,
  Clock,
  Star,
  CalendarDays,
  Zap,
  Flame,
  CheckCircle2,
} from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useAuth } from '@/contexts/AuthContext'
import { STUDY_PLANS, type StudyPlan } from './data/plans'
import styles from './StudyPlans.module.scss'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getIntensityIcon(intensity: StudyPlan['intensity']) {
  if (intensity === 'light') return <BookOpen size={12} />
  if (intensity === 'moderate') return <Zap size={12} />
  return <Flame size={12} />
}

function getDurationCategory(duration: string): 'short' | 'medium' | 'long' {
  const lower = duration.toLowerCase()
  if (lower.includes('day') || lower.includes('3') || lower.includes('7') || lower.includes('14')) {
    const match = lower.match(/(\d+)/)
    if (match) {
      const n = parseInt(match[1], 10)
      if (n <= 7) return 'short'
      if (n <= 14) return 'medium'
    }
  }
  if (lower.includes('week')) {
    const match = lower.match(/(\d+)/)
    if (match) {
      const n = parseInt(match[1], 10)
      if (n <= 2) return 'medium'
    }
  }
  return 'long'
}

// ─── PDF Download ─────────────────────────────────────────────────────────────
function downloadPlanAsPDF(plan: StudyPlan) {
  const weekHtml = plan.weeks
    .map(
      (week) => `
      <div class="week">
        <div class="week-header">
          <span class="week-label">Week ${week.week}</span>
          <strong>${week.title}</strong>
          ${week.theme ? `<span class="week-theme">${week.theme}</span>` : ''}
        </div>
        ${week.summary ? `<p class="week-summary">${week.summary}</p>` : ''}
        ${
          week.goals
            ? `<ul class="goals">${week.goals.map((g) => `<li>${g}</li>`).join('')}</ul>`
            : ''
        }
        ${
          week.days
            ? week.days
                .map(
                  (day) => `
            <div class="day">
              <div class="day-label">${day.label}${day.hours ? ` — ${day.hours}h` : ''}</div>
              ${day.focus ? `<div class="day-focus">${day.focus}</div>` : ''}
              <ul>${day.tasks.map((t) => `<li>${t}</li>`).join('')}</ul>
            </div>
          `
                )
                .join('')
            : ''
        }
      </div>
    `
    )
    .join('')

  const tipsHtml =
    plan.tips && plan.tips.length > 0
      ? `<div class="tips-section"><h3>Tips</h3><ul>${plan.tips.map((t) => `<li>${t}</li>`).join('')}</ul></div>`
      : ''

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${plan.title} — NotesHub Kashmir</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      line-height: 1.6;
      color: #1e293b;
      padding: 32px 40px;
    }
    .brand-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    .brand-name {
      font-size: 18px;
      font-weight: 800;
      color: #2563eb;
    }
    .brand-url {
      font-size: 11px;
      color: #64748b;
    }
    .plan-title {
      font-size: 22px;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 6px;
    }
    .plan-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 10px;
    }
    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      border: 1px solid #e2e8f0;
      color: #475569;
      background: #f8fafc;
    }
    .plan-description {
      color: #475569;
      margin-bottom: 24px;
      font-size: 13px;
    }
    .week {
      margin-bottom: 28px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .week-header {
      background: #eff6ff;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #dbeafe;
    }
    .week-label {
      background: #2563eb;
      color: white;
      border-radius: 4px;
      padding: 1px 8px;
      font-size: 11px;
      font-weight: 700;
    }
    .week-theme {
      color: #64748b;
      font-size: 11px;
      font-style: italic;
    }
    .week-summary {
      padding: 10px 16px;
      color: #475569;
      font-style: italic;
      border-bottom: 1px solid #f1f5f9;
    }
    .goals {
      padding: 10px 16px 10px 32px;
      color: #334155;
    }
    .goals li { margin-bottom: 4px; }
    .day {
      padding: 12px 16px;
      border-bottom: 1px solid #f1f5f9;
    }
    .day:last-child { border-bottom: none; }
    .day-label {
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 2px;
    }
    .day-focus {
      display: inline-block;
      font-size: 10px;
      background: #dbeafe;
      color: #1d4ed8;
      border-radius: 4px;
      padding: 1px 6px;
      margin-bottom: 6px;
      font-weight: 600;
    }
    .day ul {
      padding-left: 18px;
      color: #475569;
    }
    .day li { margin-bottom: 3px; }
    .tips-section {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 16px;
      margin-top: 24px;
    }
    .tips-section h3 {
      color: #1d4ed8;
      font-size: 14px;
      margin-bottom: 10px;
    }
    .tips-section ul { padding-left: 18px; color: #334155; }
    .tips-section li { margin-bottom: 5px; }
    .pdf-footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
    }
    @media print {
      body { padding: 16px 20px; }
      .week { break-inside: avoid; }
      .day { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="brand-header">
    <div class="brand-name">NotesHub Kashmir</div>
    <div class="brand-url">noteshubkashmir.in</div>
  </div>
  <div class="plan-title">${plan.title}</div>
  <div class="plan-meta">
    <span class="badge">${plan.duration}</span>
    <span class="badge">${plan.intensity.charAt(0).toUpperCase() + plan.intensity.slice(1)} Intensity</span>
    <span class="badge">${plan.goal.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
  </div>
  <p class="plan-description">${plan.description}</p>
  ${weekHtml}
  ${tipsHtml}
  <div class="pdf-footer">Generated by NotesHub Kashmir &middot; noteshubkashmir.in &middot; Free Educational Resource for Kashmiri Students</div>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => {
    win.print()
  }, 500)
}

// ─── Plan Card ─────────────────────────────────────────────────────────────────
interface PlanCardProps {
  plan: StudyPlan
  isRecommended: boolean
  isExpanded: boolean
  onToggle: () => void
}

function PlanCard({ plan, isRecommended, isExpanded, onToggle }: PlanCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderTop}>
          {isRecommended && (
            <span className={styles.recommendedBadge}>
              <Star size={11} />
              Recommended
            </span>
          )}
          <h3 className={styles.cardTitle}>{plan.title}</h3>
          <p className={styles.cardDescription}>{plan.description}</p>
        </div>
        <div className={styles.cardBadges}>
          <span className={styles.durationBadge}>
            <Clock size={11} />
            {plan.duration}
          </span>
          <span className={`${styles.intensityBadge} ${styles[`intensity_${plan.intensity}`]}`}>
            {getIntensityIcon(plan.intensity)}
            {plan.intensity.charAt(0).toUpperCase() + plan.intensity.slice(1)}
          </span>
        </div>
        <div className={styles.tags}>
          {plan.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className={styles.cardActions}>
          <button className={styles.viewBtn} onClick={onToggle}>
            {isExpanded ? (
              <>
                <ChevronUp size={15} /> Hide Plan
              </>
            ) : (
              <>
                <ChevronDown size={15} /> View Plan
              </>
            )}
          </button>
          <button
            className={styles.downloadBtn}
            onClick={() => downloadPlanAsPDF(plan)}
            title="Download as PDF"
          >
            <Download size={15} />
            Download PDF
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className={styles.planExpanded}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className={styles.planExpandedInner}>
              {plan.weeks.map((week, wi) => (
                <div key={wi} className={styles.weekBlock}>
                  <div className={styles.weekHeader}>
                    <span className={styles.weekLabel}>
                      {typeof week.week === 'number' ? `Week ${week.week}` : week.week}
                    </span>
                    <strong>{week.title}</strong>
                    {week.theme && <span className={styles.weekTheme}>{week.theme}</span>}
                  </div>
                  {week.summary && <p className={styles.weekSummary}>{week.summary}</p>}
                  {week.goals && (
                    <ul className={styles.weekGoals}>
                      {week.goals.map((g, gi) => (
                        <li key={gi}>
                          <CheckCircle2 size={13} />
                          {g}
                        </li>
                      ))}
                    </ul>
                  )}
                  {week.days &&
                    week.days.map((day, di) => (
                      <div key={di} className={styles.dayRow}>
                        <div className={styles.dayLabel}>{day.label}</div>
                        <div className={styles.dayMeta}>
                          {day.focus && <span className={styles.dayFocus}>{day.focus}</span>}
                          {day.hours && (
                            <span className={styles.dayHours}>
                              <Clock size={11} /> {day.hours}h
                            </span>
                          )}
                        </div>
                        <ul className={styles.taskList}>
                          {day.tasks.map((task, ti) => (
                            <li key={ti}>{task}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>
              ))}
              {plan.tips && plan.tips.length > 0 && (
                <div className={styles.tipsBox}>
                  <strong>Tips</strong>
                  <ul>
                    {plan.tips.map((tip, ti) => (
                      <li key={ti}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type GoalFilter = 'all' | 'exam_prep' | 'concept_mastery' | 'habit_building'
type IntensityFilter = 'all' | 'light' | 'moderate' | 'intense'
type DurationFilter = 'all' | 'short' | 'medium' | 'long'

export default function StudyPlans(): React.ReactElement {
  const { locale } = useLocale()
  const { user } = useAuth()

  const [goalFilter, setGoalFilter] = useState<GoalFilter>('all')
  const [intensityFilter, setIntensityFilter] = useState<IntensityFilter>('all')
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return STUDY_PLANS.filter((plan) => {
      if (goalFilter !== 'all' && plan.goal !== goalFilter) return false
      if (intensityFilter !== 'all' && plan.intensity !== intensityFilter) return false
      if (durationFilter !== 'all' && getDurationCategory(plan.duration) !== durationFilter)
        return false
      return true
    })
  }, [goalFilter, intensityFilter, durationFilter])

  // Lock screen
  if (!user) {
    return (
      <div className={styles.lockScreen}>
        <motion.div
          className={styles.lockCard}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.lockIcon}>
            <Lock size={32} />
          </div>
          <h2 className={styles.lockTitle}>Study Plans</h2>
          <p className={styles.lockMessage}>
            Study Plans are available to registered students. Create a free account to access all
            plans, download PDFs, and track your progress.
          </p>
          <div className={styles.lockActions}>
            <Link to={`/${locale}/register`} className={styles.lockRegisterBtn}>
              Create Free Account
            </Link>
            <Link to={`/${locale}/login`} className={styles.lockLoginLink}>
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <CalendarDays size={14} />
          <span>Structured Plans · PDF Export</span>
        </div>
        <h1 className={styles.title}>Study Plans</h1>
        <p className={styles.subtitle}>
          From 3-day rescue plans to full semester roadmaps — structured, actionable, and designed
          for Kashmiri students.
        </p>
      </section>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Goal</span>
          {(
            [
              { value: 'all', label: 'All' },
              { value: 'exam_prep', label: 'Exam Prep' },
              { value: 'concept_mastery', label: 'Concept Mastery' },
              { value: 'habit_building', label: 'Habit Building' },
            ] as { value: GoalFilter; label: string }[]
          ).map(({ value, label }) => (
            <button
              key={value}
              className={`${styles.chip} ${goalFilter === value ? styles.chipActive : ''}`}
              onClick={() => setGoalFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Intensity</span>
          {(
            [
              { value: 'all', label: 'All' },
              { value: 'light', label: 'Light' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'intense', label: 'Intense' },
            ] as { value: IntensityFilter; label: string }[]
          ).map(({ value, label }) => (
            <button
              key={value}
              className={`${styles.chip} ${intensityFilter === value ? styles.chipActive : ''}`}
              onClick={() => setIntensityFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Duration</span>
          {(
            [
              { value: 'all', label: 'All' },
              { value: 'short', label: '1–7 Days' },
              { value: 'medium', label: '1–2 Weeks' },
              { value: 'long', label: 'Multi-Week' },
            ] as { value: DurationFilter; label: string }[]
          ).map(({ value, label }) => (
            <button
              key={value}
              className={`${styles.chip} ${durationFilter === value ? styles.chipActive : ''}`}
              onClick={() => setDurationFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      {filtered.length === 0 ? (
        <div className={styles.noResults}>
          <p>No plans match the selected filters. Try adjusting your selection.</p>
        </div>
      ) : (
        <motion.div
          className={styles.grid}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {filtered.map((plan, index) => (
            <motion.div
              key={plan.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
              }}
            >
              <PlanCard
                plan={plan}
                isRecommended={index === 0}
                isExpanded={expandedId === plan.id}
                onToggle={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Coming Soon */}
      <div className={styles.comingSoon}>
        <div className={styles.comingSoonIcon}>
          <Clock size={28} />
        </div>
        <h3>Custom Study Planner</h3>
        <p>
          Build a personalised study plan based on your subjects, available time, and exam date.
          Coming soon.
        </p>
        <span className={styles.comingSoonBadge}>Coming Soon</span>
      </div>
    </div>
  )
}
