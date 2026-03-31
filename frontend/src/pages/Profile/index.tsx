import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Camera, Save } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { useAuth } from '@/contexts/AuthContext'
import { api, ApiError } from '@/services/api'
import styles from './Profile.module.scss'

const SEMESTERS = Array.from({ length: 10 }, (_, i) => i + 1)
const ACCEPTED_IMG = ['image/jpeg', 'image/png', 'image/webp']

export default function ProfilePage(): React.ReactElement {
  const { t, locale } = useLocale()
  const { user, refreshUser, logout } = useAuth()
  const navigate = useNavigate()

  useHead({ title: t.board.profile.title + ' — U.N.I.T.', description: '' })

  if (!user) {
    navigate(`/${locale}/login`, { replace: true })
    return <></>
  }

  const [name, setName] = useState(user.name)
  const [university, setUniversity] = useState(user.university ?? '')
  const [college, setCollege] = useState(user.college ?? '')
  const [semester, setSemester] = useState(user.semester ?? 1)
  const [nameIsPublic, setNameIsPublic] = useState(user.nameIsPublic ?? true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.auth.updateProfile({ name, university, college, semester, nameIsPublic })
      await refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.common.error)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (file: File) => {
    if (!ACCEPTED_IMG.includes(file.type)) return
    setAvatarUploading(true)
    try {
      const { uploadUrl, fileUrl } = await api.auth.requestProfilePicUrl(file.name, file.type)
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      await api.auth.updateProfile({ profilePicUrl: fileUrl })
      await refreshUser()
    } catch {
      setError(t.common.error)
    } finally {
      setAvatarUploading(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className={styles.title}>{t.board.profile.title}</h1>

          {/* Avatar */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrap}>
              {user.profilePicUrl ? (
                <img src={user.profilePicUrl} alt={user.name} className={styles.avatar} />
              ) : (
                <div className={styles.avatarFallback}>
                  <User size={32} />
                </div>
              )}
              <button
                className={styles.avatarBtn}
                onClick={() => fileRef.current?.click()}
                disabled={avatarUploading}
                title={t.board.profile.changePhoto}
              >
                {avatarUploading ? <span className={styles.spinnerSm} /> : <Camera size={14} />}
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED_IMG.join(',')}
              onChange={(e) => e.target.files?.[0] && handleAvatarChange(e.target.files[0])}
              className={styles.hidden}
            />
            <div>
              <p className={styles.userName}>{user.name}</p>
              <p className={styles.userEmail}>{user.email}</p>
            </div>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}
          {saved && <p className={styles.successMsg}>{t.board.profile.saved}</p>}

          <form onSubmit={handleSave} className={styles.form} noValidate>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="p-name">{t.board.auth.fullName}</label>
                <input
                  id="p-name"
                  type="text"
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="p-semester">{t.board.auth.semester}</label>
                <select
                  id="p-semester"
                  className={styles.input}
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                >
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>{t.common.semester} {s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="p-university">{t.board.auth.university}</label>
              <input
                id="p-university"
                type="text"
                className={styles.input}
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="p-college">{t.board.auth.college}</label>
              <input
                id="p-college"
                type="text"
                className={styles.input}
                value={college}
                onChange={(e) => setCollege(e.target.value)}
              />
            </div>

            {/* Name visibility */}
            <div className={styles.field}>
              <span className={styles.label}>{t.profile.nameVisibility}</span>
              <p className={styles.visibilityHelp}>{t.profile.nameVisibilityHelp}</p>
              <div className={styles.visibilityOptions}>
                <label className={styles.visibilityOption}>
                  <input
                    type="radio"
                    name="nameVisibility"
                    checked={nameIsPublic}
                    onChange={() => setNameIsPublic(true)}
                    className={styles.visibilityRadio}
                  />
                  <span>{t.profile.namePublic}</span>
                </label>
                <label className={styles.visibilityOption}>
                  <input
                    type="radio"
                    name="nameVisibility"
                    checked={!nameIsPublic}
                    onChange={() => setNameIsPublic(false)}
                    className={styles.visibilityRadio}
                  />
                  <span>{t.profile.namePrivate}</span>
                </label>
              </div>
            </div>

            <div className={styles.actions}>
              <button type="submit" className={styles.saveBtn} disabled={saving}>
                {saving ? <span className={styles.spinnerSm} /> : <Save size={15} />}
                {saving ? t.common.loading : t.board.profile.save}
              </button>
              <button
                type="button"
                className={styles.logoutBtn}
                onClick={() => { logout(); navigate(`/${locale}/`) }}
              >
                {t.board.profile.logout}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </main>
  )
}
