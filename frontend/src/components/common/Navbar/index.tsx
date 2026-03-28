import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Menu,
  X,
  Search,
  SlidersHorizontal,
  Check,
} from 'lucide-react'
import { useThemeContext } from '@/contexts/ThemeContext'
import { useLocale } from '@/hooks/useLocale'
import { useDebounce } from '@/hooks/useDebounce'
import { SUPPORTED_LOCALES, type LocaleCode } from '@/i18n'
import { THEMES, type Theme } from '@/hooks/useTheme'
import styles from './Navbar.module.scss'

const LOCALE_LABELS: Record<LocaleCode, { native: string; english: string }> = {
  en:  { native: 'English',  english: 'English'  },
  ur:  { native: 'اردو',     english: 'Urdu'     },
  ks:  { native: 'کٲشُر',    english: 'Kashmiri' },
  hi:  { native: 'हिंदी',    english: 'Hindi'    },
  pa:  { native: 'ਪੰਜਾਬੀ',   english: 'Punjabi'  },
  doi: { native: 'डोगरी',    english: 'Dogri'    },
}

const THEME_META: Record<Theme, { label: string; swatch: string }> = {
  orange:      { label: 'Warm',      swatch: '#ea580c' },
  'orange-dark': { label: 'Warm Dark', swatch: '#7a2e08' },
  light:       { label: 'Light',     swatch: '#2563eb' },
  dark:        { label: 'Dark',      swatch: '#0f172a' },
}

export function Navbar(): React.ReactElement {
  const { theme, setTheme } = useThemeContext()
  const { t, locale, setLocale } = useLocale()
  const location = useLocation()
  const navigate = useNavigate()

  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const debouncedSearch = useDebounce(searchQuery, 400)
  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
    setSettingsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (debouncedSearch.trim().length > 1) {
      navigate(`/${locale}/browse?q=${encodeURIComponent(debouncedSearch.trim())}`)
    }
  }, [debouncedSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  const navLinks = [
    { href: `/${locale}/`, label: t.nav.home },
    { href: `/${locale}/browse`, label: t.nav.browse },
    { href: `/${locale}/ai`, label: 'AI' },
    { href: `/${locale}/contribute`, label: t.nav.contribute },
    { href: `/${locale}/request`, label: t.nav.request },
    { href: `/${locale}/about`, label: t.nav.about },
  ]

  const isActive = (href: string) => {
    if (href === `/${locale}/`) return location.pathname === href
    return location.pathname.startsWith(href)
  }

  return (
    <header
      className={[styles.header, isScrolled ? styles.scrolled : ''].join(' ')}
    >
      <nav className={styles.nav} aria-label="Main navigation">
        <div className={styles.inner}>
          {/* Logo */}
          <Link to={`/${locale}/`} className={styles.logo} aria-label="NotesHub Kashmir - Home">
            <BookOpen size={22} className={styles.logoIcon} aria-hidden="true" />
            <span className={styles.logoText}>NotesHub</span>
            <span className={styles.logoAccent}>Kashmir</span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className={styles.links} role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={[
                    styles.link,
                    isActive(link.href) ? styles.linkActive : '',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop Actions */}
          <div className={styles.actions}>
            {/* Search toggle */}
            <button
              className={styles.iconBtn}
              onClick={() => setSearchOpen((p) => !p)}
              aria-label="Toggle search"
              aria-expanded={searchOpen}
            >
              <Search size={18} />
            </button>

            {/* Settings Panel */}
            <div className={styles.settingsWrap} ref={settingsRef}>
              <button
                className={[styles.iconBtn, styles.settingsBtn].join(' ')}
                onClick={() => setSettingsOpen((p) => !p)}
                aria-label="Preferences"
                aria-expanded={settingsOpen}
                aria-haspopup="true"
              >
                <SlidersHorizontal size={17} />
                <span className={styles.settingsBtnLabel}>{LOCALE_LABELS[locale].native}</span>
              </button>

              <AnimatePresence>
                {settingsOpen && (
                  <motion.div
                    className={styles.settingsPanel}
                    initial={{ opacity: 0, scale: 0.97, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: -6 }}
                    transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                    role="dialog"
                    aria-label="Preferences"
                  >
                    {/* Language section */}
                    <p className={styles.panelSectionLabel}>Language</p>
                    <ul className={styles.langList} role="listbox" aria-label="Select language">
                      {SUPPORTED_LOCALES.map((code) => (
                        <li key={code} role="option" aria-selected={code === locale}>
                          <button
                            className={[
                              styles.langOption,
                              code === locale ? styles.langOptionActive : '',
                            ].join(' ')}
                            onClick={() => setLocale(code)}
                          >
                            <span className={styles.langNative}>{LOCALE_LABELS[code].native}</span>
                            <span className={styles.langEnglish}>{LOCALE_LABELS[code].english}</span>
                            {code === locale && <Check size={13} className={styles.optionCheck} aria-hidden="true" />}
                          </button>
                        </li>
                      ))}
                    </ul>

                    <div className={styles.panelDivider} />

                    {/* Theme section */}
                    <p className={styles.panelSectionLabel}>Theme</p>
                    <div className={styles.themeRow}>
                      {THEMES.map((t) => (
                        <button
                          key={t}
                          className={[
                            styles.themeBtn,
                            t === theme ? styles.themeBtnActive : '',
                          ].join(' ')}
                          onClick={() => setTheme(t)}
                          aria-pressed={t === theme}
                          title={THEME_META[t].label}
                        >
                          <span
                            className={styles.themeSwatch}
                            style={{ background: THEME_META[t].swatch }}
                          />
                          <span className={styles.themeLabel}>{THEME_META[t].label}</span>
                          {t === theme && <Check size={11} className={styles.optionCheck} aria-hidden="true" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile hamburger */}
            <button
              className={[styles.iconBtn, styles.hamburger].join(' ')}
              onClick={() => setMobileOpen((p) => !p)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search Bar expansion */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className={styles.searchBar}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.searchInner}>
                <Search size={18} className={styles.searchIcon} aria-hidden="true" />
                <input
                  type="search"
                  className={styles.searchInput}
                  placeholder={t.nav.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  aria-label={t.nav.search}
                />
                {searchQuery && (
                  <button
                    className={styles.searchClear}
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <ul className={styles.mobileLinks} role="list">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    to={link.href}
                    className={[
                      styles.mobileLink,
                      isActive(link.href) ? styles.mobileLinkActive : '',
                    ].join(' ')}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>

            {/* Mobile search */}
            <div className={styles.mobileSearch}>
              <Search size={16} className={styles.searchIcon} aria-hidden="true" />
              <input
                type="search"
                className={styles.mobileSearchInput}
                placeholder={t.nav.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Mobile preferences */}
            <div className={styles.mobilePrefs}>
              <p className={styles.mobilePrefLabel}>Language</p>
              <div className={styles.mobileLang}>
                {SUPPORTED_LOCALES.map((code) => (
                  <button
                    key={code}
                    className={[
                      styles.mobileLangBtn,
                      code === locale ? styles.mobileLangActive : '',
                    ].join(' ')}
                    onClick={() => setLocale(code)}
                    title={LOCALE_LABELS[code].english}
                  >
                    {LOCALE_LABELS[code].native}
                  </button>
                ))}
              </div>

              <p className={styles.mobilePrefLabel} style={{ marginTop: '12px' }}>Theme</p>
              <div className={styles.mobileThemeRow}>
                {THEMES.map((th) => (
                  <button
                    key={th}
                    className={[
                      styles.mobileThemeBtn,
                      th === theme ? styles.mobileThemeActive : '',
                    ].join(' ')}
                    onClick={() => setTheme(th)}
                  >
                    <span
                      className={styles.mobileThemeSwatch}
                      style={{ background: THEME_META[th].swatch }}
                    />
                    {THEME_META[th].label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
