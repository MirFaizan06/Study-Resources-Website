import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, BookOpen, ChevronRight } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Badge } from '@/components/ui/Badge'
import type { Institution as InstitutionType } from '@/types'
import styles from './Institution.module.scss'

export default function Institution(): React.ReactElement {
  const { locale } = useLocale()
  const { institutionSlug } = useParams<{ institutionSlug: string }>()
  const [institution, setInstitution] = useState<InstitutionType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useHead({
    title: institution
      ? `${institution.name} - NotesHub Kashmir`
      : 'Institution - NotesHub Kashmir',
    description: institution
      ? `Browse programs and study materials for ${institution.name}. Find notes, past papers, and syllabi.`
      : 'Browse institution resources.',
  })

  useEffect(() => {
    if (!institutionSlug) return

    setLoading(true)
    api.institutions
      .getBySlug(institutionSlug)
      .then(setInstitution)
      .catch(() => setError('Failed to load institution data.'))
      .finally(() => setLoading(false))
  }, [institutionSlug])

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.skeleton}>
            <div className={styles.skeletonHeader} />
            <div className={styles.skeletonGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !institution) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <p>{error ?? 'Institution not found.'}</p>
            <Link to={`/${locale}/browse`} className={styles.backLink}>
              Back to Browse
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const breadcrumbs = [
    { label: 'Home', href: `/${locale}/` },
    { label: 'Browse', href: `/${locale}/browse` },
    { label: institution.name },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbs} />

        {/* Institution Header */}
        <motion.div
          className={styles.institutionHeader}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className={styles.institutionIconWrap}>
            {institution.logoUrl ? (
              <img
                src={institution.logoUrl}
                alt={`${institution.name} logo`}
                className={styles.institutionLogo}
              />
            ) : (
              <GraduationCap size={40} aria-hidden="true" />
            )}
          </div>
          <div className={styles.institutionInfo}>
            <div className={styles.institutionTitleRow}>
              <h1 className={styles.institutionTitle}>{institution.name}</h1>
              <Badge variant="blue" size="md">
                {institution.type}
              </Badge>
            </div>
            {institution.programs && (
              <p className={styles.institutionMeta}>
                {institution.programs.length} Programs Available
              </p>
            )}
          </div>
        </motion.div>

        {/* Programs Grid */}
        <section aria-labelledby="programs-heading">
          <h2 id="programs-heading" className={styles.sectionTitle}>
            Programs
          </h2>

          {!institution.programs || institution.programs.length === 0 ? (
            <p className={styles.emptyMessage}>No programs found for this institution.</p>
          ) : (
            <motion.div
              className={styles.programsGrid}
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.07 },
                },
              }}
            >
              {institution.programs.map((program) => (
                <motion.div
                  key={program.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                  }}
                >
                  <Link
                    to={`/${locale}/browse/${institutionSlug}/${program.id}`}
                    className={styles.programCard}
                  >
                    <div className={styles.programCardIcon} aria-hidden="true">
                      <BookOpen size={24} />
                    </div>
                    <div className={styles.programInfo}>
                      <h3 className={styles.programName}>{program.name}</h3>
                      {program.subjects && (
                        <p className={styles.programMeta}>
                          {program.subjects.length} subjects
                        </p>
                      )}
                    </div>
                    <ChevronRight
                      size={18}
                      className={styles.programArrow}
                      aria-hidden="true"
                    />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </div>
    </div>
  )
}
