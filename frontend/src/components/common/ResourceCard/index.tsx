import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, AlertCircle, Share2, BookOpen, FileText, GraduationCap, Lightbulb } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/services/api'
import type { Resource, ResourceType, SubjectCategory } from '@/types'
import styles from './ResourceCard.module.scss'

interface ResourceCardProps {
  resource: Resource
  locale?: string
}

const CATEGORY_VARIANT: Record<SubjectCategory, 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'default'> = {
  MAJOR: 'blue',
  MINOR: 'purple',
  MD: 'green',
  AEC: 'orange',
  VAC: 'default',
  SEC: 'red',
}

const TYPE_CONFIG: Record<ResourceType, { label: string; variant: 'blue' | 'orange' | 'green' | 'purple'; icon: React.ReactNode }> = {
  NOTE: { label: 'Notes', variant: 'blue', icon: <BookOpen size={14} /> },
  PYQ: { label: 'Past Papers', variant: 'orange', icon: <FileText size={14} /> },
  SYLLABUS: { label: 'Syllabus', variant: 'green', icon: <GraduationCap size={14} /> },
  GUESS_PAPER: { label: 'Guess Paper', variant: 'purple', icon: <Lightbulb size={14} /> },
}

export function ResourceCard({ resource, locale = 'en' }: ResourceCardProps): React.ReactElement {
  const [isDownloading, setIsDownloading] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const typeConfig = TYPE_CONFIG[resource.type]

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isDownloading) return

    setIsDownloading(true)
    try {
      const { fileUrl } = await api.resources.download(resource.id)
      window.open(fileUrl, '_blank', 'noopener,noreferrer')
    } catch {
      // Fallback to direct URL
      window.open(resource.fileUrl, '_blank', 'noopener,noreferrer')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    const shareUrl = `${window.location.origin}/${locale}/resources?resource=${resource.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: resource.title,
          url: shareUrl,
        })
      } catch {
        // User cancelled, ignore
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <motion.article
      className={styles.card}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <div className={styles.badges}>
          <Badge variant={typeConfig.variant} size="sm">
            <span className={styles.badgeInner}>
              {typeConfig.icon}
              {typeConfig.label}
            </span>
          </Badge>

          {resource.isAiGenerated && (
            <Badge variant="red" size="sm">
              AI-Generated
            </Badge>
          )}
        </div>

        <button
          className={styles.shareBtn}
          onClick={handleShare}
          aria-label="Share resource"
          title={copySuccess ? 'Copied!' : 'Share'}
        >
          <Share2 size={15} />
          {copySuccess && <span className={styles.copyTooltip}>Copied!</span>}
        </button>
      </div>

      <h3 className={styles.title}>{resource.title}</h3>

      {resource.isAiGenerated && (
        <div className={styles.aiDisclaimer} role="note">
          <AlertCircle size={13} aria-hidden="true" />
          <span>AI-Generated: Rough idea only, not 100% reliable.</span>
        </div>
      )}

      <div className={styles.meta}>
        {resource.subject && (
          <span className={styles.metaItem}>
            <BookOpen size={13} aria-hidden="true" />
            {resource.subject.name}
            {resource.subject.semester && (
              <span className={styles.semester}>
                {' '}· Sem {resource.subject.semester}
              </span>
            )}
            {resource.subject.category && (
              <Badge
                variant={CATEGORY_VARIANT[resource.subject.category]}
                size="sm"
              >
                {resource.subject.category}
              </Badge>
            )}
          </span>
        )}

        {resource.year && (
          <span className={styles.metaItem}>
            <span className={styles.metaDot} aria-hidden="true" />
            {resource.year}
          </span>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.stats}>
          <Download size={13} aria-hidden="true" />
          <span>
            {resource.downloadsCount.toLocaleString()}{' '}
            <span className={styles.statsLabel}>downloads</span>
          </span>
          {resource.createdAt && (
            <span className={styles.date}>{formatDate(resource.createdAt)}</span>
          )}
        </div>

        <button
          className={styles.downloadBtn}
          onClick={handleDownload}
          disabled={isDownloading}
          aria-label={`Download ${resource.title}`}
        >
          {isDownloading ? (
            <span className={styles.downloadingSpinner} aria-hidden="true" />
          ) : (
            <Download size={15} aria-hidden="true" />
          )}
          {isDownloading ? 'Opening...' : 'Download'}
        </button>
      </div>
    </motion.article>
  )
}
