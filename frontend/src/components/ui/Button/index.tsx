import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import styles from './Button.module.scss'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset'
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled = false,
  onClick,
  type = 'button',
  children,
  className = '',
  fullWidth = false,
}: ButtonProps): React.ReactElement {
  const isDisabled = disabled || isLoading

  return (
    <motion.button
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      className={[
        styles.button,
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        fullWidth ? styles.fullWidth : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <Loader2 className={styles.spinner} size={size === 'sm' ? 14 : 16} aria-hidden="true" />
      ) : (
        leftIcon && (
          <span className={styles.icon} aria-hidden="true">
            {leftIcon}
          </span>
        )
      )}

      <span>{children}</span>

      {!isLoading && rightIcon && (
        <span className={styles.icon} aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </motion.button>
  )
}
