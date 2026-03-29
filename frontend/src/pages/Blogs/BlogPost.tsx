// TODO: Localization for this page will be added in a future release due to content complexity.

import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Info } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import styles from './BlogPost.module.scss'

interface BlogPostProps {
  title: string
  category: string
  date: string
  readTime: string
  icon: React.ReactNode
  children: React.ReactNode
}

export default function BlogPost({
  title,
  category,
  date,
  readTime,
  icon,
  children,
}: BlogPostProps): React.ReactElement {
  const { locale } = useLocale()

  return (
    <div className={styles.wrapper}>
      <Link to={`/${locale}/blogs`} className={styles.backLink}>
        <ArrowLeft size={16} />
        Back to Blogs
      </Link>

      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className={styles.headerIcon}>{icon}</div>
        <span className={styles.categoryBadge}>{category}</span>
        <h1 className={styles.articleTitle}>{title}</h1>
        <div className={styles.meta}>
          <span>{date}</span>
          <span aria-hidden>·</span>
          <span>{readTime}</span>
        </div>
      </motion.header>

      <motion.article
        className={styles.article}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
      >
        {children}
      </motion.article>

      <div className={styles.i18nNote}>
        <Info size={14} />
        <span>
          Note: Localization for this article will be added in a future release. Currently available
          in English only.
        </span>
      </div>
    </div>
  )
}
