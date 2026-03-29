// TODO: Localization for this page will be added in a future release due to content complexity.

import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  FlaskConical,
  CalendarDays,
  Users,
  Zap,
  ArrowRight,
  LockOpen,
} from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import styles from './Blogs.module.scss'

const ICON_MAP: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen size={22} />,
  FlaskConical: <FlaskConical size={22} />,
  CalendarDays: <CalendarDays size={22} />,
  Users: <Users size={22} />,
  Zap: <Zap size={22} />,
}

const BLOG_POSTS = [
  {
    slug: 'rules-of-studying',
    title: 'The 7 Rules of Studying That Actually Work',
    excerpt:
      'Core principles that separate effective students from those who waste hours with nothing to show for it.',
    readTime: '6 min read',
    category: 'Fundamentals',
    date: 'Jan 15, 2026',
    icon: 'BookOpen',
  },
  {
    slug: 'study-techniques',
    title: 'Study Techniques Science Actually Backs',
    excerpt:
      'From spaced repetition to active recall — the methods with real research behind them.',
    readTime: '8 min read',
    category: 'Methods',
    date: 'Jan 22, 2026',
    icon: 'FlaskConical',
  },
  {
    slug: 'semester-planning',
    title: 'How to Build an Effective Semester Plan',
    excerpt:
      'A week-by-week guide to staying ahead without burning out across a full Kashmir University semester.',
    readTime: '7 min read',
    category: 'Planning',
    date: 'Feb 3, 2026',
    icon: 'CalendarDays',
  },
  {
    slug: 'types-of-students',
    title: 'The 6 Types of Students — Which One Are You?',
    excerpt:
      'An honest look at the student archetypes in every classroom and what each needs to level up.',
    readTime: '5 min read',
    category: 'Self-Awareness',
    date: 'Feb 17, 2026',
    icon: 'Users',
  },
  {
    slug: 'deep-work',
    title: "Deep Work: The Student's Secret Weapon",
    excerpt:
      'How to enter flow state, eliminate distraction, and study more in 2 hours than most do in 6.',
    readTime: '7 min read',
    category: 'Productivity',
    date: 'Mar 1, 2026',
    icon: 'Zap',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function Blogs(): React.ReactElement {
  const { locale } = useLocale()

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <LockOpen size={14} />
          <span>Free · No Login Required</span>
        </div>
        <h1 className={styles.title}>Study Blogs</h1>
        <p className={styles.subtitle}>
          Evidence-based insights for Kashmiri students — from planning your semester to mastering
          deep focus.
        </p>
      </section>

      <motion.div
        className={styles.grid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {BLOG_POSTS.map((post) => (
          <motion.div key={post.slug} variants={cardVariants} whileHover={{ y: -4 }}>
            <Link to={`/${locale}/blogs/${post.slug}`} className={styles.card}>
              <div className={styles.cardIcon}>{ICON_MAP[post.icon]}</div>
              <span className={styles.categoryBadge}>{post.category}</span>
              <h2 className={styles.cardTitle}>{post.title}</h2>
              <p className={styles.cardExcerpt}>{post.excerpt}</p>
              <div className={styles.cardMeta}>
                <span>{post.date}</span>
                <span>{post.readTime}</span>
                <span className={styles.cardArrow}>
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
