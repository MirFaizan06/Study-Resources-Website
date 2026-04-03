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
  MessageCircle,
  BookMarked,
  CalendarCheck,
  GitBranch,
} from 'lucide-react'
import { useThemeContext } from '@/contexts/ThemeContext'
import { useLocale } from '@/hooks/useLocale'
import { useAuth } from '@/contexts/AuthContext'
import { useDebounce } from '@/hooks/useDebounce'
import { SUPPORTED_LOCALES, type LocaleCode } from '@/i18n'
import { THEMES } from '@/hooks/useTheme'
import { APP_VERSION } from '@/constants/app'
import styles from './Navbar.module.css'

const LOCALE_LABELS: Record<LocaleCode, { native: string; english: string }> = {
  en:  { native: 'English',  english: 'English'  },
  ur:  { native: 'اردو',     english: 'Urdu'     },
  ks:  { native: 'کٲشُر',    english: 'Kashmiri' },
  hi:  { native: 'हिंदी',    english: 'Hindi'    },
  pa:  { native: 'ਪੰਜਾਬੀ',   english: 'Punjabi'  },
  doi: { native: 'डोगरी',    english: 'Dogri'    },
}

const THEME_META: Record<string, { label: string; swatch: string }> = {
  'discord-dark': { label: 'Discord', swatch: '#5865f2' },
  'orange':       { label: 'Orange',  swatch: '#f97316' },
  'rose-dark':    { label: 'Rose',    swatch: '#e11d48' },
}

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -6 },
  show:   { opacity: 1, scale: 1,    y: 0   },
}

export function Navbar(): React.ReactElement {
  const { theme, setTheme } = useThemeContext()
  const { t, locale, setLocale } = useLocale()
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [langOpen, setLangOpen]         = useState(false)
  const [themeOpen, setThemeOpen]       = useState(false)
  const [searchOpen, setSearchOpen]     = useState(false)
  const [searchQuery, setSearchQuery]   = useState('')
  const [studyHubOpen, setStudyHubOpen] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 400)
  const langRef      = useRef<HTMLDivElement>(null)
  const themeRef     = useRef<HTMLDivElement>(null)
  const studyHubRef  = useRef<HTMLDivElement>(null)
  const userMenuRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
    setLangOpen(false)
    setThemeOpen(false)
    setStudyHubOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current     && !langRef.current.contains(e.target as Node))     setLangOpen(false)
      if (themeRef.current    && !themeRef.current.contains(e.target as Node))    setThemeOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
      if (studyHubRef.current && !studyHubRef.current.contains(e.target as Node)) setStudyHubOpen(false)
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
    { href: `/${locale}/resources`,   label: t.nav.browse     },
    { href: `/${locale}/node`,        label: 'Node'           },
    { href: `/${locale}/ai`,          label: t.nav.ai         },
    { href: `/${locale}/contribute`,  label: t.nav.contribute },
    { href: `/${locale}/request`,     label: t.nav.request    },
    { href: `/${locale}/about`,       label: t.nav.about      },
  ]

  const isActive = (href: string) => {
    if (href === `/${locale}/`) return location.pathname === href
    return location.pathname.startsWith(href)
  }

  const studyHubActive =
    location.pathname.includes('/blogs') ||
    location.pathname.includes('/study-plans') ||
    location.pathname.includes('/changelog')

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <div className={styles.inner}>

          {/* ─── Logo ───────────────────────────────────────────────────────── */}
          <Link to={`/${locale}/`} className={styles.logo} aria-label="U.N.I.T. Home">
            <div className={styles.logoMark} aria-hidden="true">
              <BookOpen size={17} strokeWidth={2.2} />
            </div>
            <div className={styles.logoTextGroup}>
              <span className={styles.logoText}>U.N.I.T.</span>
              <span className={styles.logoSub}>University Notes &amp; Issue Tracker</span>
            </div>
          </Link>

          {/* ─── Desktop Links ──────────────────────────────────────────────── */}
          <div className={styles.mainNav}>
            <ul className={styles.links} role="list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className={[styles.link, isActive(link.href) ? styles.linkActive : ''].join(' ')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}

              {/* Resources dropdown */}
              <li>
                <div className={styles.dropdownWrap} ref={studyHubRef}>
                  <button
                    className={[
                      styles.link,
                      styles.studyHubBtn,
                      studyHubActive ? styles.linkActive : '',
                    ].join(' ')}
                    onClick={() => setStudyHubOpen((p) => !p)}
                    aria-expanded={studyHubOpen}
                  >
                    Resources
                    <ChevronDown
                      size={12}
                      strokeWidth={2.5}
                      className={[styles.chevron, studyHubOpen ? styles.chevronOpen : ''].join(' ')}
                    />
                  </button>
                  <AnimatePresence>
                    {studyHubOpen && (
                      <motion.div
                        className={styles.dropdown}
                        variants={panelVariants}
                        initial="hidden" animate="show" exit="hidden"
                        transition={{ duration: 0.12, ease: 'easeOut' }}
                      >
                        <Link to={`/${locale}/blogs`} className={styles.dropdownItem}>
                          <BookMarked size={15} />
                          <span>Study Blogs</span>
                        </Link>
                        <Link to={`/${locale}/study-plans`} className={styles.dropdownItem}>
                          <CalendarCheck size={15} />
                          <span>Study Plans</span>
                        </Link>
                        <div className={styles.divider} style={{ margin: '0.25rem 0.375rem', width: 'auto', height: '1px' }} />
                        <Link to={`/${locale}/changelog`} className={styles.dropdownItem}>
                          <GitBranch size={15} />
                          <span>What's new · {APP_VERSION}</span>
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </li>
            </ul>
          </div>

          {/* ─── Desktop Actions ────────────────────────────────────────────── */}
          <div className={styles.actions}>
            {/* Search */}
            <button
              className={[styles.actionBtn, searchOpen ? styles.actionBtnActive : ''].join(' ')}
              onClick={() => setSearchOpen((p) => !p)}
              aria-label="Search"
            >
              <Search size={17} strokeWidth={2.2} />
            </button>

            {/* Language */}
            <div className={styles.dropdownWrap} ref={langRef}>
              <button
                className={styles.actionBtn}
                onClick={() => { setLangOpen((p) => !p); setThemeOpen(false) }}
                aria-label="Language"
              >
                <Globe size={17} strokeWidth={2.2} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    className={styles.dropdown}
                    variants={panelVariants}
                    initial="hidden" animate="show" exit="hidden"
                    transition={{ duration: 0.12 }}
                  >
                    {SUPPORTED_LOCALES.map((code) => (
                      <button
                        key={code}
                        className={[
                          styles.dropdownItem,
                          code === locale ? styles.dropdownItemActive : '',
                        ].join(' ')}
                        onClick={() => setLocale(code)}
                      >
                        <span>{LOCALE_LABELS[code].native}</span>
                        {code === locale && <Check size={13} strokeWidth={2.5} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme */}
            <div className={styles.dropdownWrap} ref={themeRef}>
              <button
                className={styles.actionBtn}
                onClick={() => { setThemeOpen((p) => !p); setLangOpen(false) }}
                aria-label="Theme"
              >
                <Palette size={17} strokeWidth={2.2} />
              </button>
              <AnimatePresence>
                {themeOpen && (
                  <motion.div
                    className={[styles.dropdown, styles.themeDropdown].join(' ')}
                    variants={panelVariants}
                    initial="hidden" animate="show" exit="hidden"
                    transition={{ duration: 0.12 }}
                  >
                    {THEMES.map((th) => (
                      <button
                        key={th}
                        className={[
                          styles.dropdownItem,
                          th === theme ? styles.dropdownItemActive : '',
                        ].join(' ')}
                        onClick={() => setTheme(th)}
                      >
                        <div className={styles.themeSwatch} style={{ background: THEME_META[th].swatch }} />
                        <span>{THEME_META[th].label}</span>
                        {th === theme && <Check size={13} strokeWidth={2.5} style={{ marginLeft: 'auto' }} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={styles.divider} />

            {/* User */}
            {user ? (
              <div className={styles.userSection} ref={userMenuRef}>
                <button className={styles.userButton} onClick={() => setUserMenuOpen((p) => !p)}>
                  <div className={styles.avatar}>
                    {user.profilePicUrl ? <img src={user.profilePicUrl} alt="" /> : <User size={14} />}
                  </div>
                  <span className={styles.userName}>{user.name.split(' ')[0]}</span>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      className={styles.dropdown}
                      variants={panelVariants}
                      initial="hidden" animate="show" exit="hidden"
                      transition={{ duration: 0.12 }}
                    >
                      <Link to={`/${locale}/profile`} className={styles.dropdownItem}>
                        <User size={15} /> Profile
                      </Link>
                      <Link to={`/${locale}/node`} className={styles.dropdownItem}>
                        <MessageCircle size={15} /> Node
                      </Link>
                      <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.25rem 0.375rem' }} />
                      <button className={styles.dropdownLogout} onClick={logout}>
                        <LogOut size={15} /> Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to={`/${locale}/login`} className={styles.loginBtn}>
                Sign In
              </Link>
            )}

            {/* Hamburger */}
            <button
              className={styles.hamburger}
              onClick={() => setMobileOpen((p) => !p)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ─── Search Overlay ─────────────────────────────────────────────────── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className={styles.searchOverlay}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <div className={styles.searchBar}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search resources, topics, or notes…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button onClick={() => setSearchOpen(false)} aria-label="Close search">
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── Mobile Menu ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className={styles.mobileInner}>
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href} className={styles.mobileLink}>
                  {link.label}
                </Link>
              ))}
              <div className={styles.mobileDivider} />
              <Link to={`/${locale}/blogs`}       className={styles.mobileLink}>Study Blogs</Link>
              <Link to={`/${locale}/study-plans`} className={styles.mobileLink}>Study Plans</Link>
              {!user && (
                <Link to={`/${locale}/login`} className={styles.mobileLogin}>Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
