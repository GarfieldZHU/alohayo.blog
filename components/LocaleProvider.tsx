'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  getMessages,
  LOCALE_STORAGE_KEY,
  normalizeLocale,
  type SiteMessages,
  type LocaleCode,
} from '@/lib/i18n'

type LocaleContextValue = {
  locale: LocaleCode
  setLocale: (locale: LocaleCode) => void
  messages: SiteMessages
}

const Ctx = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>('en')
  const [hydrated, setHydrated] = useState(false)
  const hydratedRef = useRef(false)
  const pathname = usePathname() ?? '/'

  useEffect(() => {
    if (hydratedRef.current) return
    const fromPath = pathname.startsWith('/zh-CN')
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    setLocaleState(fromPath ? 'zh-CN' : normalizeLocale(saved))
    hydratedRef.current = true
    setHydrated(true)
  }, [pathname])

  const setLocale = (value: LocaleCode) => setLocaleState(normalizeLocale(value))

  useEffect(() => {
    if (!hydrated) return
    document.documentElement.lang = locale
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    window.dispatchEvent(new CustomEvent('alohayo:locale-change', { detail: { locale } }))
  }, [hydrated, locale])

  return (
    <Ctx.Provider value={{ locale, setLocale, messages: getMessages(locale) }}>
      {children}
    </Ctx.Provider>
  )
}

export const useLocale = (): LocaleContextValue => {
  const context = useContext(Ctx)
  if (!context) throw new Error('useLocale must be used within LocaleProvider')
  return context
}
