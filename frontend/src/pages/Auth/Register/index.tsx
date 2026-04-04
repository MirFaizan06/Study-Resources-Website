import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, Eye, EyeOff, BookOpen, AlertCircle, ShieldCheck } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError, api } from '@/services/api'
import type { Institution } from '@/types'
import styles from './Register.module.css'

const SEMESTERS = Array.from({ length: 12 }, (_, i) => i + 1)

export default function RegisterPage(): React.ReactElement {
  const { locale } = useLocale()
  const { register } = useAuth()
  const navigate = useNavigate()

  useHead({ title: 'Join U.N.I.T. — Create Account', description: 'Join the premier academic network in Kashmir.' })

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    college: '',
    semester: 1,
  })
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loadingInstitutions, setLoadingInstitutions] = useState(true)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: field === 'semester' ? Number(e.target.value) : e.target.value }))

  useEffect(() => {
    let mounted = true
    api.institutions.getAll()
      .then((list) => { if (mounted) setInstitutions(list) })
      .finally(() => { if (mounted) setLoadingInstitutions(false) })
    return () => { mounted = false }
  }, [])

  const downloadDetails = (data: typeof form) => {
    const content = `U.N.I.T. Platform Registration Details\n-----------------------------------------\nFull Name: ${data.name}\nEmail: ${data.email}\nPassword: ${data.password}\nInstitution: ${data.university}\nCollege: ${data.college}\nSemester: ${data.semester}\n-----------------------------------------\nImportant: Your institution and college cannot be changed later. Keep these details safe.\nGenerated on: ${new Date().toLocaleString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'registration_details_UNIT.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await register(form)
      downloadDetails(form)
      // Small delay to ensure download starts before navigation
      setTimeout(() => {
        navigate(`/${locale}/node`, { replace: true })
      }, 500)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.header}>
          <div className={styles.logo}>
            <BookOpen size={20} />
            <span>U.N.I.T.</span>
          </div>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join Kashmir's largest student network.</p>
        </div>

        {/* Account Recovery Warning */}
        <div className={styles.warningBox}>
          <div className={styles.warningTitle}>
            <ShieldCheck size={16} />
            <span>Account Recovery & Stability</span>
          </div>
          <p className={styles.warningText}>
            Please ensure your <strong>Email</strong> and <strong>Password</strong> are correct and remembered. 
            Information regarding your <strong>Institution</strong> and <strong>College</strong> is permanent and 
            cannot be modified after registration for verification integrity.
          </p>
        </div>

        {error && <div className={styles.errorBanner}><AlertCircle size={16} /> {error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Full Name</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="John Doe" required />
            </div>
            <div className={styles.field}>
              <label>Email Address</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="name@email.com" required />
            </div>
          </div>

          <div className={styles.field}>
            <label>Secure Password</label>
            <div className={styles.pwWrap}>
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>

          <div className={styles.field}>
            <label>Institution (Standard)</label>
            <select value={form.university} onChange={set('university')} required>
              <option value="">Select your institution</option>
              {institutions.map((inst) => <option key={inst.id} value={inst.name}>{inst.name}</option>)}
              {!loadingInstitutions && <option value="Other">Other / Not Listed</option>}
            </select>
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label>College / School</label>
              <input type="text" value={form.college} onChange={set('college')} placeholder="e.g. Govt Degree College" required />
            </div>
            <div className={styles.field}>
              <label>Current Semester</label>
              <select value={form.semester} onChange={set('semester')}>
                {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.loader} /> : <><UserPlus size={18} /> Complete Registration</>}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to={`/${locale}/login`}>Sign In</Link>
        </p>
      </motion.div>
    </div>
  )
}
