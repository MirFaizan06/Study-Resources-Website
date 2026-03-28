import React, { useEffect, useState, useCallback } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, SlidersHorizontal, BookOpen, ChevronDown } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { useDebounce } from '@/hooks/useDebounce'
import { api } from '@/services/api'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ResourceCard } from '@/components/common/ResourceCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SearchBar } from '@/components/common/SearchBar'
import { AdBanner } from '@/components/common/AdBanner'
import type { Resource, Subject, Program, Institution, ResourceType, SubjectCategory } from '@/types'
import styles from './Resources.module.scss'

type SortOption = 'newest' | 'popular'

const RESOURCE_TYPE_FILTERS: Array<{ value: ResourceType | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'NOTE', label: 'Notes' },
  { value: 'PYQ', label: 'Past Papers' },
  { value: 'SYLLABUS', label: 'Syllabus' },
  { value: 'GUESS_PAPER', label: 'Guess Papers' },
]

const CATEGORY_FILTERS: Array<{ value: SubjectCategory | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'MAJOR', label: 'Major' },
  { value: 'MINOR', label: 'Minor' },
  { value: 'MD', label: 'MD' },
  { value: 'AEC', label: 'AEC' },
  { value: 'VAC', label: 'VAC' },
  { value: 'SEC', label: 'SEC' },
]

const CATEGORY_VARIANT: Record<SubjectCategory, 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'default'> = {
  MAJOR: 'blue',
  MINOR: 'purple',
  MD: 'green',
  AEC: 'orange',
  VAC: 'default',
  SEC: 'red',
}

export default function Resources(): React.ReactElement {
  const { locale } = useLocale()
  const { institutionSlug, programId, subjectId } = useParams<{
    institutionSlug?: string
    programId?: string
    subjectId?: string
  }>()
  const [searchParams, setSearchParams] = useSearchParams()

  const [resources, setResources] = useState<Resource[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Context data
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [program, setProgram] = useState<Program | null>(null)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])

  // Filters
  const [typeFilter, setTypeFilter] = useState<ResourceType | 'ALL'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<SubjectCategory | 'ALL'>('ALL')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '')
  const debouncedSearch = useDebounce(searchQuery, 400)

  const pageTitle = subject
    ? `${subject.name} Resources`
    : program
    ? `${program.name} - Subjects`
    : institution
    ? `${institution.name} Programs`
    : 'Browse Resources'

  useHead({
    title: `${pageTitle} - NotesHub Kashmir`,
    description: `Browse ${pageTitle} - Notes, past papers, syllabi and more.`,
  })

  // Load context data
  useEffect(() => {
    if (institutionSlug) {
      api.institutions.getBySlug(institutionSlug).then((inst) => {
        setInstitution(inst)
        if (programId) {
          api.institutions.getProgram(programId).then((prog) => {
            setProgram(prog)
            setSubjects(prog.subjects ?? [])
            if (subjectId) {
              api.institutions.getSubject(subjectId).then(setSubject)
            }
          })
        }
      })
    }
  }, [institutionSlug, programId, subjectId])

  // Load resources
  const loadResources = useCallback(
    async (cursor?: string) => {
      const isFirstLoad = !cursor
      if (isFirstLoad) setLoading(true)
      else setLoadingMore(true)

      try {
        const params = {
          ...(subjectId ? { subjectId } : {}),
          ...(programId && !subjectId ? { programId } : {}),
          ...(institutionSlug && !programId ? { institutionSlug } : {}),
          ...(typeFilter !== 'ALL' ? { type: typeFilter } : {}),
          ...(categoryFilter !== 'ALL' ? { category: categoryFilter } : {}),
          sort: sortBy,
          search: debouncedSearch || undefined,
          cursor,
          limit: 12,
        }

        const result = await api.resources.getAll(params)

        if (isFirstLoad) {
          setResources(result.data)
        } else {
          setResources((prev) => [...prev, ...result.data])
        }
        setNextCursor(result.nextCursor)
      } catch (err) {
        console.error('Failed to load resources:', err)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [subjectId, programId, institutionSlug, typeFilter, categoryFilter, sortBy, debouncedSearch]
  )

  useEffect(() => {
    loadResources()
  }, [loadResources])

  // Sync search query to URL
  useEffect(() => {
    if (debouncedSearch) {
      setSearchParams({ q: debouncedSearch }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }, [debouncedSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  // Group subjects by semester
  const subjectsBySemester = subjects.reduce<Record<number, Subject[]>>((acc, s) => {
    if (!acc[s.semester]) acc[s.semester] = []
    acc[s.semester].push(s)
    return acc
  }, {})

  const breadcrumbs = [
    { label: 'Home', href: `/${locale}/` },
    { label: 'Browse', href: `/${locale}/browse` },
    ...(institution
      ? [{ label: institution.name, href: `/${locale}/browse/${institutionSlug}` }]
      : []),
    ...(program && institutionSlug
      ? [{ label: program.name, href: `/${locale}/browse/${institutionSlug}/${programId}` }]
      : []),
    ...(subject ? [{ label: subject.name }] : []),
  ]

  // Program view — show subjects by semester
  if (programId && !subjectId) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <Breadcrumb items={breadcrumbs} />

          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              {program?.name ?? 'Program'}
            </h1>
            {institution && (
              <p className={styles.pageSubtitle}>{institution.name}</p>
            )}
          </div>

          {Object.keys(subjectsBySemester).length === 0 && !loading ? (
            <p className={styles.emptyMessage}>No subjects found for this program.</p>
          ) : (
            Object.entries(subjectsBySemester).map(([sem, semSubjects]) => (
              <section key={sem} className={styles.semesterSection} aria-labelledby={`sem-${sem}`}>
                <h2 id={`sem-${sem}`} className={styles.semesterTitle}>
                  Semester {sem}
                </h2>
                <div className={styles.subjectsGrid}>
                  {semSubjects.map((s) => (
                    <Link
                      key={s.id}
                      to={`/${locale}/browse/${institutionSlug}/${programId}/${s.id}`}
                      className={styles.subjectCard}
                    >
                      <BookOpen size={20} className={styles.subjectIcon} aria-hidden="true" />
                      <span className={styles.subjectName}>{s.name}</span>
                      <div className={styles.subjectBadges}>
                        <Badge variant="default" size="sm">
                          Sem {s.semester}
                        </Badge>
                        {s.category && (
                          <Badge variant={CATEGORY_VARIANT[s.category]} size="sm">
                            {s.category}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    )
  }

  // Resource listing view
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Breadcrumb items={breadcrumbs} />

        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>
              {subject?.name ?? 'Browse Resources'}
            </h1>
            {program && (
              <p className={styles.pageSubtitle}>
                {program.name}
                {subject && <> · Semester {subject.semester}</>}
              </p>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className={styles.filterBar}>
          {/* Search */}
          <div className={styles.searchWrap}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search resources..."
              size="sm"
            />
          </div>

          {/* Type tabs */}
          <div className={styles.typeTabs} role="tablist" aria-label="Filter by type">
            {RESOURCE_TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                role="tab"
                aria-selected={typeFilter === f.value}
                className={[
                  styles.typeTab,
                  typeFilter === f.value ? styles.typeTabActive : '',
                ].join(' ')}
                onClick={() => setTypeFilter(f.value as ResourceType | 'ALL')}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className={styles.sortWrap}>
            <Filter size={16} aria-hidden="true" />
            <select
              className={styles.sortSelect}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as SubjectCategory | 'ALL')}
              aria-label="Filter by subject category"
            >
              {CATEGORY_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <ChevronDown size={14} aria-hidden="true" className={styles.selectChevron} />
          </div>

          {/* Sort */}
          <div className={styles.sortWrap}>
            <SlidersHorizontal size={16} aria-hidden="true" />
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort resources"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
            <ChevronDown size={14} aria-hidden="true" className={styles.selectChevron} />
          </div>
        </div>

        {/* Ad between filters and results */}
        <AdBanner slot="1122334455" format="auto" />

        {/* Resources grid */}
        {loading ? (
          <div className={styles.resourcesGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className={styles.emptyState}>
            <img
              src="/images/empty-state.png"
              alt="No resources found"
              className={styles.emptyImg}
              width="220"
              height="160"
            />
            <p className={styles.emptyTitle}>No resources found</p>
            <p className={styles.emptySubtitle}>
              Try adjusting your filters or search query.
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${typeFilter}-${sortBy}-${debouncedSearch}`}
                className={styles.resourcesGrid}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {resources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} locale={locale} />
                ))}
              </motion.div>
            </AnimatePresence>

            {nextCursor && (
              <div className={styles.loadMoreWrap}>
                <Button
                  variant="secondary"
                  isLoading={loadingMore}
                  onClick={() => loadResources(nextCursor)}
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
