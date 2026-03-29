import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Menu,
  X,
  Search,
  Globe,
  Palette,
  Check,
  ChevronDown,
  User,
  LogOut,
  MessageCircleWarning,
  Library,
  Megaphone,
} from 'lucide-react'
import { useThemeContext } from '@/contexts/ThemeContext'
import { useLocale } from '@/hooks/useLocale'
import { useAuth } from '@/contexts/AuthContext'
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
  orange:        { label: 'Warm',         swatch: '#ea580c' },
  'orange-dark': { label: 'Warm Dark',    swatch: '#7a2e08' },
  teal:          { label: 'Teal',         swatch: '#0d9488' },
  'teal-dark':   { label: 'Teal Dark',    swatch: '#061a18' },
  rose:          { label: 'Rose',         swatch: '#e11d48' },
  'rose-dark':   { label: 'Rose Dark',    swatch: '#1a0009' },
  indigo:        { label: 'Indigo',       swatch: '#4f46e5' },
  'indigo-dark': { label: 'Indigo Dark',  swatch: '#0d0b2e' },
  emerald:       { label: 'Emerald',      swatch: '#059669' },
  'emerald-dark':{ label: 'Emerald Dark', swatch: '#061a12' },
  light:         { label: 'Light',        swatch: '#2563eb' },
  dark:          { label: 'Dark',         swatch: '#0f172a' },
}

export function Navbar(): React.ReactElement {
  const { theme, setTheme } = useThemeContext()
  const { t, locale, setLocale } = useLocale()
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const debouncedSearch = useDebounce(searchQuery, 400)
  const langRef = useRef<HTMLDivElement>(null)
  const themeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
    setLangOpen(false)
    setThemeOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (debouncedSearch.trim().length > 1) {
      navigate(`/${locale}/resources?q=${encodeURIComponent(debouncedSearch.trim())}`)
    }
  }, [debouncedSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  const navLinks = [
    { href: `/${locale}/`, label: t.nav.home },
    { href: `/${locale}/resources`, label: t.nav.browse, highlight: 'resources' as const },
    { href: `/${locale}/board`, label: t.nav.board, highlight: 'board' as const },
    { href: `/${locale}/ai`, label: t.nav.ai },
    { href: `/${locale}/contribute`, label: t.nav.contribute },
    { href: `/${locale}/request`, label: t.nav.request },
    { href: `/${locale}/about`, label: t.nav.about },
  ]

  const isActive = (href: string) => {
    if (href === `/${locale}/`) return location.pathname === href
    return location.pathname.startsWith(href)
  }

  const panelVariants = {
    hidden: { opacity: 0, scale: 0.97, y: -4 },
    show:   { opacity: 1, scale: 1,    y: 0    },
  }

  return (
    <header className={[styles.header, isScrolled ? styles.scrolled : ''].join(' ')}>
      <nav className={styles.nav} aria-label="Main navigation">
        <div className={styles.inner}>

          {/* ─── Logo ─────────────────────────────────────────────────────── */}
          <Link to={`/${locale}/`} className={styles.logo} aria-label="NotesHub Kashmir – Home">
            <div className={styles.logoMark} aria-hidden="true">
              <BookOpen size={16} />
            </div>
            <span className={styles.logoText}>NotesHub</span>
            <span className={styles.logoSub}>Kashmir</span>
          </Link>

          {/* ─── Desktop Links ────────────────────────────────────────────── */}
          <ul className={styles.links} role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={[
                    styles.link,
                    isActive(link.href) ? styles.linkActive : '',
                    link.highlight === 'resources' ? styles.linkResources : '',
                    link.highlight === 'board' ? styles.linkBoard : '',
                  ].join(' ')}
                >
                  {link.highlight === 'resources' && <Library size={13} aria-hidden="true" />}
                  {link.highlight === 'board' && <Megaphone size={13} aria-hidden="true" />}
                  {link.label}
                  {isActive(link.href) && <span className={styles.linkDot} aria-hidden="true" />}
                </Link>
              </li>
            ))}
          </ul>

          {/* ─── Desktop Actions ──────────────────────────────────────────── */}
          <div className={styles.actions}>
            {/* Search */}
            <button
              className={[styles.iconBtn, searchOpen ? styles.iconBtnActive : ''].join(' ')}
              onClick={() => setSearchOpen((p) => !p)}
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <Search size={17} />
            </button>

            {/* Language dropdown */}
            <div className={styles.dropdownWrap} ref={langRef}>
              <button
                className={[styles.chipBtn, langOpen ? styles.chipBtnActive : ''].join(' ')}
                onClick={() => { setLangOpen((p) => !p); setThemeOpen(false) }}
                aria-label="Select language"
                aria-expanded={langOpen}
                aria-haspopup="listbox"
              >
                <Globe size={14} aria-hidden="true" />
                <span className={styles.chipBtnLabel}>{LOCALE_LABELS[locale].native}</span>
                <ChevronDown size={12} className={[styles.chevron, langOpen ? styles.chevronOpen : ''].join(' ')} aria-hidden="true" />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    className={styles.dropdown}
                    variants={panelVariants}
                    initial="hidden" animate="show" exit="hidden"
                    transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1] }}
                    role="listbox"
                    aria-label="Select language"
                  >
                    {SUPPORTED_LOCALES.map((code) => (
                      <button
                        key={code}
                        className={[styles.dropdownItem, code === locale ? styles.dropdownItemActive : ''].join(' ')}
                        onClick={() => { setLocale(code); setLangOpen(false) }}
                        role="option"
                        aria-selected={code === locale}
                      >
                        <span className={styles.itemNative}>{LOCALE_LABELS[code].native}</span>
                        <span className={styles.itemEn}>{LOCALE_LABELS[code].english}</span>
                        {code === locale && <Check size={12} className={styles.itemCheck} aria-hidden="true" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme dropdown */}
            <div className={styles.dropdownWrap} ref={themeRef}>
              <button
                className={[styles.chipBtn, themeOpen ? styles.chipBtnActive : ''].join(' ')}
                onClick={() => { setThemeOpen((p) => !p); setLangOpen(false) }}
                aria-label="Select theme"
                aria-expanded={themeOpen}
                aria-haspopup="listbox"
              >
                <span
                  className={styles.themeSwatchInline}
                  style={{ background: THEME_META[theme].swatch }}
                  aria-hidden="true"
                />
                <Palette size={14} aria-hidden="true" />
                <ChevronDown size={12} className={[styles.chevron, themeOpen ? styles.chevronOpen : ''].join(' ')} aria-hidden="true" />
              </button>

              <AnimatePresence>
                {themeOpen && (
                  <motion.div
                    className={[styles.dropdown, styles.dropdownTheme].join(' ')}
                    variants={panelVariants}
                    initial="hidden" animate="show" exit="hidden"
                    transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1] }}
                    role="listbox"
                    aria-label="Select theme"
                  >
                    {THEMES.map((th) => (
                      <button
                        key={th}
                        className={[styles.themeItem, th === theme ? styles.themeItemActive : ''].join(' ')}
                        onClick={() => { setTheme(th); setThemeOpen(false) }}
                        role="option"
                        aria-selected={th === theme}
                        title={THEME_META[th].label}
                      >
                        <span
                          className={styles.themeSwatch}
                          style={{ background: THEME_META[th].swatch }}
                          aria-hidden="true"
                        />
                        <span className={styles.themeLabel}>{THEME_META[th].label}</span>
                        {th === theme && <Check size={11} className={styles.itemCheck} aria-hidden="true" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User menu */}
            {user ? (
              <div className={styles.dropdownWrap} ref={userMenuRef}>
                <button
                  className={[styles.userBtn, userMenuOpen ? styles.userBtnActive : ''].join(' ')}
                  onClick={() => { setUserMenuOpen((p) => !p); setLangOpen(false); setThemeOpen(false) }}
                  aria-label="Account menu"
                >
                  {user.profilePicUrl ? (
                    <img src={user.profilePicUrl} alt={user.name} className={styles.userAvatar} />
                  ) : (
                    <div className={styles.userAvatarFallback}><User size={14} /></div>
                  )}
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      className={[styles.dropdown, styles.userDropdown].join(' ')}
                      variants={panelVariants}
                      initial="hidden" animate="show" exit="hidden"
                      transition={{ duration: 0.14 }}
                    >
                      <div className={styles.userMenuName}>{user.name}</div>
                      <div className={styles.userMenuEmail}>{user.email}</div>
                      <div className={styles.userMenuDivider} />
                      <button
                        className={styles.userMenuItem}
                        onClick={() => { navigate(`/${locale}/board`); setUserMenuOpen(false) }}
                      >
                        <MessageCircleWarning size={14} />
                        {t.nav.board}
                      </button>
                      <button
                        className={styles.userMenuItem}
                        onClick={() => { navigate(`/${locale}/profile`); setUserMenuOpen(false) }}
                      >
                        <User size={14} />
                        {t.board.profile.title}
                      </button>
                      <div className={styles.userMenuDivider} />
                      <button
                        className={[styles.userMenuItem, styles.userMenuLogout].join(' ')}
                        onClick={() => { logout(); setUserMenuOpen(false) }}
                      >
                        <LogOut size={14} />
                        {t.board.profile.logout}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to={`/${locale}/login`} className={styles.signInBtn}>
                {t.board.auth.signIn}
              </Link>
            )}

            {/* Hamburger */}
            <button
              className={[styles.iconBtn, styles.hamburger].join(' ')}
              onClick={() => setMobileOpen((p) => !p)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen
                  ? <motion.span key="x"   initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={20} /></motion.span>
                  : <motion.span key="mnu" initial={{ rotate: 90, opacity: 0 }}  animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu size={20} /></motion.span>
                }
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* ─── Search Bar ───────────────────────────────────────────────────── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className={styles.searchBar}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div className={styles.searchInner}>
                <Search size={17} className={styles.searchIcon} aria-hidden="true" />
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
                  <button className={styles.searchClear} onClick={() => setSearchQuery('')} aria-label="Clear search">
                    <X size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── Mobile Menu ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Mobile search */}
            <div className={styles.mobileSearch}>
              <Search size={15} className={styles.searchIcon} aria-hidden="true" />
              <input
                type="search"
                className={styles.mobileSearchInput}
                placeholder={t.nav.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Nav links */}
            <ul className={styles.mobileLinks} role="list">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={link.href}
                    className={[
                      styles.mobileLink,
                      isActive(link.href) ? styles.mobileLinkActive : '',
                      link.highlight === 'resources' ? styles.mobileLinkResources : '',
                      link.highlight === 'board' ? styles.mobileLinkBoard : '',
                    ].join(' ')}
                  >
                    {link.highlight === 'resources' && <Library size={13} aria-hidden="true" />}
                    {link.highlight === 'board' && <Megaphone size={13} aria-hidden="true" />}
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>

            {/* Language */}
            <div className={styles.mobilePrefSection}>
              <p className={styles.mobilePrefLabel}>
                <Globe size={12} aria-hidden="true" />
                Language
              </p>
              <div className={styles.mobileChips}>
                {SUPPORTED_LOCALES.map((code) => (
                  <button
                    key={code}
                    className={[styles.mobileChip, code === locale ? styles.mobileChipActive : ''].join(' ')}
                    onClick={() => setLocale(code)}
                    title={LOCALE_LABELS[code].english}
                  >
                    {LOCALE_LABELS[code].native}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className={styles.mobilePrefSection}>
              <p className={styles.mobilePrefLabel}>
                <Palette size={12} aria-hidden="true" />
                Theme
              </p>
              <div className={styles.mobileThemeGrid}>
                {THEMES.map((th) => (
                  <button
                    key={th}
                    className={[styles.mobileThemeBtn, th === theme ? styles.mobileThemeBtnActive : ''].join(' ')}
                    onClick={() => setTheme(th)}
                  >
                    <span
                      className={styles.mobileThemeSwatch}
                      style={{ background: THEME_META[th].swatch }}
                      aria-hidden="true"
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
