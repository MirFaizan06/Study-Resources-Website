import React from 'react'
import styles from './Badge.module.scss'

type BadgeVariant = 'default' | 'blue' | 'orange' | 'green' | 'purple' | 'red'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  children: React.ReactNode
  className?: string
}

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className = '',
}: BadgeProps): React.ReactElement {
  return (
    <span
      className={[
        styles.badge,
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
