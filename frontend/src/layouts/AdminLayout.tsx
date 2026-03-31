import React, { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CheckCircle,
  MessageSquare,
  Upload,
  LogOut,
  Menu,
  X,
  BookOpen,
  ShieldAlert,
  Users,
} from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import styles from './AdminLayout.module.scss'

export function AdminLayout(): React.ReactElement {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, locale } = useLocale()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const token = localStorage.getItem('admin_token')

  if (!token) {
    return <Navigate to={`/${locale}/admin/login`} replace />
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate(`/${locale}/admin/login`)
  }

  const navItems = [
    {
      href: `/${locale}/admin`,
      label: t.admin.sidebar.dashboard,
      icon: <LayoutDashboard size={18} />,
      exact: true,
    },
    {
      href: `/${locale}/admin/contributions`,
      label: t.admin.sidebar.contributions,
      icon: <CheckCircle size={18} />,
    },
    {
      href: `/${locale}/admin/institutions`,
      label: ((t.admin.sidebar as any).institutions as string) || 'Institutions',
      icon: <BookOpen size={18} />,
    },
    {
      href: `/${locale}/admin/programs`,
      label: ((t.admin.sidebar as any).programs as string) || 'Programs',
      icon: <LayoutDashboard size={18} />,
    },
    {
      href: `/${locale}/admin/subjects`,
      label: ((t.admin.sidebar as any).subjects as string) || 'Subjects',
      icon: <Upload size={18} />,
    },
    {
      href: `/${locale}/admin/requests`,
      label: t.admin.sidebar.requests,
      icon: <MessageSquare size={18} />,
    },
    {
      href: `/${locale}/admin/upload`,
      label: t.admin.sidebar.upload,
      icon: <Upload size={18} />,
    },
    {
      href: `/${locale}/admin/moderation`,
      label: t.admin.sidebar.moderation,
      icon: <ShieldAlert size={18} />,
    },
    {
      href: `/${locale}/admin/users`,
      label: t.admin.sidebar.users,
      icon: <Users size={18} />,
    },
  ]

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location.pathname === href
    return location.pathname.startsWith(href)
  }

  return (
    <div className={styles.shell}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={[styles.sidebar, sidebarOpen ? styles.sidebarOpen : ''].join(' ')}
        aria-label="Admin navigation"
      >
        {/* Sidebar header */}
        <div className={styles.sidebarHeader}>
          <Link to={`/${locale}/`} className={styles.sidebarLogo}>
            <BookOpen size={20} aria-hidden="true" />
            <span>NotesHub</span>
          </Link>
          <button
            className={styles.sidebarClose}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className={styles.sidebarNav}>
          <ul role="list">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={[
                    styles.navItem,
                    isActive(item.href, item.exact) ? styles.navItemActive : '',
                  ].join(' ')}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className={styles.navIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} aria-hidden="true" />
            {t.admin.sidebar.logout}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={styles.main}>
        {/* Top bar (mobile) */}
        <header className={styles.topBar}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <span className={styles.topBarTitle}>Admin Panel</span>
        </header>

        {/* Page content */}
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
