import React, { useRef } from 'react'
import { Search, X } from 'lucide-react'
import styles from './SearchBar.module.scss'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onSubmit?: (value: string) => void
  size?: 'sm' | 'lg'
  className?: string
  autoFocus?: boolean
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search resources...',
  onSubmit,
  size = 'lg',
  className = '',
  autoFocus = false,
}: SearchBarProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(value)
  }

  const handleClear = () => {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <form
      className={[styles.wrapper, styles[`size-${size}`], className].filter(Boolean).join(' ')}
      onSubmit={handleSubmit}
      role="search"
    >
      <span className={styles.searchIcon} aria-hidden="true">
        <Search size={size === 'sm' ? 16 : 20} />
      </span>

      <input
        ref={inputRef}
        type="search"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />

      {value && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}

      {onSubmit && (
        <button type="submit" className={styles.submitBtn}>
          Search
        </button>
      )}
    </form>
  )
}
