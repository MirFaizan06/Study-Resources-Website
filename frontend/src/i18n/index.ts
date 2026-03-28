import en from './locales/en'

export type Locale = typeof en
export type LocaleCode = 'en' | 'ur' | 'ks' | 'hi' | 'pa' | 'doi'

export const SUPPORTED_LOCALES: LocaleCode[] = ['en', 'ur', 'ks', 'hi', 'pa', 'doi']
export const DEFAULT_LOCALE: LocaleCode = 'en'

const loadedLocales: Partial<Record<LocaleCode, Locale>> = { en }

export async function loadLocale(code: LocaleCode): Promise<Locale> {
  if (loadedLocales[code]) return loadedLocales[code]!

  try {
    // Dynamically import locale file when dropped in
    const module = await import(`./locales/${code}.ts`)
    loadedLocales[code] = module.default as Locale
    return module.default as Locale
  } catch {
    console.warn(`Locale "${code}" not found, falling back to English.`)
    return en
  }
}

export function getLocaleFromPath(pathname: string): LocaleCode {
  const segment = pathname.split('/')[1]
  if (SUPPORTED_LOCALES.includes(segment as LocaleCode)) {
    return segment as LocaleCode
  }
  return DEFAULT_LOCALE
}

export function stripLocaleFromPath(pathname: string): string {
  const segment = pathname.split('/')[1]
  if (SUPPORTED_LOCALES.includes(segment as LocaleCode)) {
    return pathname.slice(segment.length + 1) || '/'
  }
  return pathname
}

export function addLocaleToPath(pathname: string, locale: LocaleCode): string {
  const stripped = stripLocaleFromPath(pathname)
  return `/${locale}${stripped === '/' ? '' : stripped}`
}

export { en as defaultLocale }
