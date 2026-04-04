import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, CheckCircle, AlertCircle, FileText, X } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useHead } from '@/hooks/useHead'
import { api } from '@/services/api'
import { Button } from '@/components/ui/Button'
import type { Institution, Program, Subject, ResourceType, CreateResourcePayload } from '@/types'
import styles from './Upload.module.css'

const RESOURCE_TYPES: Array<{ value: ResourceType; label: string }> = [
  { value: 'NOTE', label: 'Notes' },
  { value: 'PYQ', label: 'Past Papers (PYQ)' },
  { value: 'SYLLABUS', label: 'Syllabus' },
  { value: 'GUESS_PAPER', label: 'Guess Paper' },
]

interface FormState {
  institutionId: string
  programId: string
  subjectId: string
  title: string
  type: ResourceType | ''
  year: string
  isAiGenerated: boolean
}

export default function AdminUpload(): React.ReactElement {
  const { t } = useLocale()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>({
    institutionId: '',
    programId: '',
    subjectId: '',
    title: '',
    type: '',
    year: '',
    isAiGenerated: false,
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])

  useHead({
    title: 'Upload Resource - Admin',
    description: 'Upload a new resource.',
  })

  useEffect(() => {
    api.institutions.getAll().then(setInstitutions).catch(console.error)
  }, [])

  const handleInstitutionChange = (id: string) => {
    setForm((p) => ({ ...p, institutionId: id, programId: '', subjectId: '' }))
    setPrograms([])
    setSubjects([])
    const inst = institutions.find((i) => i.id === id)
    if (inst?.programs) setPrograms(inst.programs)
  }

  const handleProgramChange = (id: string) => {
    setForm((p) => ({ ...p, programId: id, subjectId: '' }))
    setSubjects([])
    api.institutions.getProgram(id).then((prog) => setSubjects(prog.subjects ?? [])).catch(console.error)
  }

  const update = (key: keyof FormState, value: string | boolean) =>
    setForm((p) => ({ ...p, [key]: value }))

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrorMessage('Only PDF files are accepted.')
        return
      }
      if (file.size > 50 * 1024 * 1024) {
        setErrorMessage('File size must not exceed 50MB.')
        return
      }
      setSelectedFile(file)
      setErrorMessage('')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file?.type === 'application/pdf') {
      setSelectedFile(file)
      setErrorMessage('')
    } else {
      setErrorMessage('Only PDF files are accepted.')
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.subjectId || !form.title || !form.type || !selectedFile) {
      setErrorMessage('Please fill all required fields and select a PDF file.')
      return
    }

    setUploadState('uploading')
    setUploadProgress(0)
    setErrorMessage('')

    try {
      // Step 1: Get presigned URL
      const { uploadUrl, fileUrl } = await api.admin.requestUploadUrl(
        selectedFile.name,
        selectedFile.type
      )
      setUploadProgress(20)

      // Step 2: Upload to S3 via XHR for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 70) + 20
            setUploadProgress(progress)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`))
          }
        }

        xhr.onerror = () => reject(new Error('Network error during upload.'))

        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', selectedFile.type)
        xhr.send(selectedFile)
      })

      setUploadProgress(90)

      // Step 3: Create resource record
      const payload: CreateResourcePayload = {
        title: form.title.trim(),
        type: form.type as ResourceType,
        fileUrl,
        subjectId: form.subjectId,
        year: form.year ? parseInt(form.year) : undefined,
        isAiGenerated: form.isAiGenerated,
      }

      await api.admin.createResource(payload)
      setUploadProgress(100)
      setUploadState('success')
    } catch (err) {
      setUploadState('error')
      setErrorMessage(err instanceof Error ? err.message : t.admin.upload.form.error)
    }
  }

  const handleReset = () => {
    setForm({
      institutionId: '',
      programId: '',
      subjectId: '',
      title: '',
      type: '',
      year: '',
      isAiGenerated: false,
    })
    setSelectedFile(null)
    setUploadState('idle')
    setUploadProgress(0)
    setErrorMessage('')
    setPrograms([])
    setSubjects([])
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t.admin.upload.title}</h1>
        <p className={styles.pageSubtitle}>{t.admin.upload.subtitle}</p>
      </div>

      {uploadState === 'success' ? (
        <motion.div
          className={styles.successState}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className={styles.successIcon}>
            <CheckCircle size={48} />
          </div>
          <h2 className={styles.successTitle}>Upload Successful!</h2>
          <p className={styles.successDesc}>{t.admin.upload.form.success}</p>
          <Button onClick={handleReset}>Upload Another</Button>
        </motion.div>
      ) : (
        <form className={styles.form} onSubmit={handleUpload} noValidate>
          <div className={styles.formGrid}>
            {/* Left: Subject selection */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legendTitle}>Select Subject</legend>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="institution">
                  Institution <span className={styles.req}>*</span>
                </label>
                <select
                  id="institution"
                  className={styles.select}
                  value={form.institutionId}
                  onChange={(e) => handleInstitutionChange(e.target.value)}
                >
                  <option value="">Select institution...</option>
                  {institutions.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="program">
                  Program <span className={styles.req}>*</span>
                </label>
                <select
                  id="program"
                  className={styles.select}
                  value={form.programId}
                  onChange={(e) => handleProgramChange(e.target.value)}
                  disabled={!form.institutionId}
                >
                  <option value="">Select program...</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="subject">
                  Subject <span className={styles.req}>*</span>
                </label>
                <select
                  id="subject"
                  className={styles.select}
                  value={form.subjectId}
                  onChange={(e) => update('subjectId', e.target.value)}
                  disabled={!form.programId}
                >
                  <option value="">Select subject...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Sem {s.semester})
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>

            {/* Right: Resource details */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legendTitle}>Resource Details</legend>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="title">
                  {t.admin.upload.form.title} <span className={styles.req}>*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  className={styles.input}
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="e.g. Data Structures Notes Unit 1"
                />
              </div>

              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="type">
                    {t.admin.upload.form.type} <span className={styles.req}>*</span>
                  </label>
                  <select
                    id="type"
                    className={styles.select}
                    value={form.type}
                    onChange={(e) => update('type', e.target.value)}
                  >
                    <option value="">Select type...</option>
                    {RESOURCE_TYPES.map((rt) => (
                      <option key={rt.value} value={rt.value}>{rt.label}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="year">
                    {t.admin.upload.form.year}
                  </label>
                  <input
                    id="year"
                    type="number"
                    className={styles.input}
                    value={form.year}
                    onChange={(e) => update('year', e.target.value)}
                    placeholder="2024"
                    min="2000"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>

              <div className={styles.checkboxGroup}>
                <input
                  id="isAiGenerated"
                  type="checkbox"
                  className={styles.checkbox}
                  checked={form.isAiGenerated}
                  onChange={(e) => update('isAiGenerated', e.target.checked)}
                />
                <label className={styles.checkboxLabel} htmlFor="isAiGenerated">
                  {t.admin.upload.form.isAiGenerated}
                </label>
              </div>
            </fieldset>
          </div>

          {/* File drop zone */}
          <div
            className={[styles.dropZone, selectedFile ? styles.dropZoneHasFile : ''].join(' ')}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Select PDF file"
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className={styles.fileInput}
              onChange={handleFileSelect}
              aria-label="Select PDF file"
            />

            {selectedFile ? (
              <div className={styles.filePreview}>
                <FileText size={32} className={styles.fileIcon} aria-hidden="true" />
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>{selectedFile.name}</span>
                  <span className={styles.fileSize}>
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.fileRemove}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedFile(null)
                  }}
                  aria-label="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className={styles.dropPlaceholder}>
                <Upload size={40} className={styles.dropIcon} aria-hidden="true" />
                <p className={styles.dropTitle}>{t.admin.upload.form.selectFile}</p>
                <p className={styles.dropSubtitle}>{t.admin.upload.form.dragDrop}</p>
                <p className={styles.dropHelp}>{t.admin.upload.form.fileHelp}</p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {uploadState === 'uploading' && (
            <div className={styles.progressWrap}>
              <div className={styles.progressLabel}>
                <span>{t.admin.upload.form.uploadProgress}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className={styles.progressBar}>
                <motion.div
                  className={styles.progressFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {errorMessage && (
            <div className={styles.errorMsg} role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              {errorMessage}
            </div>
          )}

          <div className={styles.submitRow}>
            <Button
              type="submit"
              isLoading={uploadState === 'uploading'}
              leftIcon={<Upload size={16} />}
            >
              {uploadState === 'uploading'
                ? t.admin.upload.form.uploading
                : t.admin.upload.form.upload}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
