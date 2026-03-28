import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  type Locale,
  type LocaleCode,
  loadLocale,
  getLocaleFromPath,
  addLocaleToPath,
  defaultLocale,
} from '@/i18n'

interface UseLocaleReturn {
  t: Locale
  locale: LocaleCode
  setLocale: (code: LocaleCode) => void
  isLoading: boolean
}

export function useLocale(): UseLocaleReturn {
  const location = useLocation()
  const navigate = useNavigate()
  const locale = getLocaleFromPath(location.pathname)

  const [t, setT] = useState<Locale>(defaultLocale)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    loadLocale(locale).then((loaded) => {
      if (!cancelled) {
        setT(loaded)
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [locale])

  const setLocale = (code: LocaleCode) => {
    const newPath = addLocaleToPath(location.pathname, code)
    navigate(newPath + location.search + location.hash)
  }

  return { t, locale, setLocale, isLoading }
}
