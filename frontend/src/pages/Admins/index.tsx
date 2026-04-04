import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Search } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import type { AdminProfilePublic } from '@/types'
import styles from './Admins.module.css'

export default function AdminsPage(): React.ReactElement {
  useLocale()
  useHead({
    title: 'Our Admins - U.N.I.T.',
    description: 'Meet the dedicated administrators who help moderate and maintain U.N.I.T. for Kashmiri students.',
  })

  const [admins, setAdmins] = useState<AdminProfilePublic[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.admin.getAdminsPublic()
      .then(setAdmins)
      .catch(() => setAdmins([]))
      .finally(() => setLoading(false))
  }, [])

  const current = useMemo(() => {
    const q = search.toLowerCase().trim()
    return admins.filter((a) => !a.isRevoked && (!q || a.name.toLowerCase().includes(q) || a.university.toLowerCase().includes(q)))
  }, [admins, search])

  const past = useMemo(() => {
    const q = search.toLowerCase().trim()
    return admins.filter((a) => a.isRevoked && (!q || a.name.toLowerCase().includes(q) || a.university.toLowerCase().includes(q)))
  }, [admins, search])

  const AdminCard = ({ admin }: { admin: AdminProfilePublic }) => (
    <motion.div
      className={[styles.card, admin.isRevoked ? styles.cardRevoked : ''].join(' ')}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.cardTop}>
        {admin.pfpUrl
          ? <img src={admin.pfpUrl} alt={admin.name} className={styles.avatar} />
          : (
            <div className={styles.avatarPlaceholder}>
              <User size={28} />
            </div>
          )
        }
        {admin.role === 'SUPER_ADMIN' && (
          <span className={styles.superBadge}>Super Admin</span>
        )}
        {admin.isRevoked && (
          <span className={styles.revokedBadge}>Past Admin</span>
        )}
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.adminName}>{admin.name}</h3>
        <p className={styles.adminInst}>{admin.university}</p>
        <p className={styles.adminProg}>{admin.program}</p>
        {!admin.isRevoked && admin.contactNo && (
          <div className={styles.contactRow}>
            <Phone size={13} className={styles.contactIcon} />
            <a href={`tel:${admin.contactNo}`} className={styles.contactLink}>{admin.contactNo}</a>
          </div>
        )}
        {admin.isRevoked && (
          <p className={styles.honorNote}>Thank you for your service to the platform.</p>
        )}
      </div>
    </motion.div>
  )

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <motion.div
          className={styles.heroInner}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={styles.heroTitle}>Our Admins</h1>
          <p className={styles.heroSub}>
            Meet the dedicated administrators who moderate U.N.I.T. and ensure quality resources for Kashmiri students.
          </p>

          {/* Search */}
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by name or university…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </motion.div>
      </section>

      <div className={styles.container}>
        {loading ? (
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        ) : (
          <>
            {/* Current Admins */}
            <section>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Current Admins</h2>
                <span className={styles.sectionCount}>{current.length}</span>
              </div>
              {current.length === 0 ? (
                <p className={styles.empty}>No active admins found{search ? ' matching your search' : ''}.</p>
              ) : (
                <div className={styles.grid}>
                  {current.map((a) => <AdminCard key={a.id} admin={a} />)}
                </div>
              )}
            </section>

            {/* Past Admins — honorary section */}
            {past.length > 0 && (
              <section className={styles.pastSection}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Past Admins</h2>
                  <span className={styles.sectionCount} style={{ opacity: 0.6 }}>{past.length}</span>
                </div>
                <p className={styles.pastNote}>
                  We honor those who have served and contributed to the growth of U.N.I.T.
                </p>
                <div className={styles.grid}>
                  {past.map((a) => <AdminCard key={a.id} admin={a} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
