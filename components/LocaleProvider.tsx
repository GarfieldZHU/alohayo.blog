'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import {
  getMessages,
  getLocalePath,
  LOCALE_STORAGE_KEY,
  normalizeLocale,
  type LocaleCode,
} from '@/lib/i18n'
const Ctx = createContext<any>(null)
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>('en')
  const pathname = typeof window === 'undefined' ? '' : window.location.pathname
  useEffect(() => {
    const fromPath = pathname.startsWith('/zh-CN')
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    setLocaleState(fromPath ? 'zh-CN' : normalizeLocale(saved))
  }, [])
  const setLocale = (v: LocaleCode) => setLocaleState(normalizeLocale(v))
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.lang = locale
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    window.dispatchEvent(new CustomEvent('alohayo:locale-change', { detail: { locale } }))
  }, [locale])
  return (
    <Ctx.Provider value={{ locale, setLocale, messages: getMessages(locale) }}>
      {children}
    </Ctx.Provider>
  )
}
export const useLocale = () => useContext(Ctx)
