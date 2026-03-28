import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import styles from './Breadcrumb.module.scss'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps): React.ReactElement {
  return (
    <nav aria-label="Breadcrumb" className={styles.nav}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className={styles.item}>
              {index === 0 && (
                <Home size={14} className={styles.homeIcon} aria-hidden="true" />
              )}

              {isLast || !item.href ? (
                <span
                  className={[styles.label, isLast ? styles.current : ''].join(' ')}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link to={item.href} className={styles.link}>
                  {item.label}
                </Link>
              )}

              {!isLast && (
                <ChevronRight
                  size={14}
                  className={styles.separator}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
