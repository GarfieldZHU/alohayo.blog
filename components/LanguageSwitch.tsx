'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import siteMetadata from '@/data/siteMetadata'
import { getLocalePath } from '@/lib/i18n'
import { useLocale } from './LocaleProvider'
export default function LanguageSwitch() {
  const { locale, setLocale, messages } = useLocale()
  const router = useRouter()
  const pathname = usePathname() || '/'
  const [open, setOpen] = useState(false)
  const switcherRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const selectLocale = (nextLocale: 'en' | 'zh-CN') => {
    setOpen(false)
    if (nextLocale === locale) return
    setLocale(nextLocale)
    router.push(getLocalePath(pathname, nextLocale))
  }

  if (siteMetadata.i18n?.showLocaleSwitch === false) return null

  return (
    <div ref={switcherRef} className="site-language-switcher">
      <button
        type="button"
        aria-label={messages.accessibility.languageSwitch}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="site-language-switch"
      >
        <span aria-hidden="true">文/A</span>
      </button>
      {open && (
        <div
          className="site-language-popover"
          role="listbox"
          aria-label={messages.accessibility.languageOptions}
        >
          <button
            type="button"
            role="option"
            aria-selected={locale === 'en'}
            className="site-language-option"
            onClick={() => selectLocale('en')}
          >
            <span>{messages.accessibility.languageEnglish}</span>
            <span className="site-language-option__mark" aria-hidden="true">
              {locale === 'en' ? '✓' : 'EN'}
            </span>
          </button>
          <button
            type="button"
            role="option"
            aria-selected={locale === 'zh-CN'}
            className="site-language-option"
            onClick={() => selectLocale('zh-CN')}
          >
            <span>{messages.accessibility.languageChinese}</span>
            <span className="site-language-option__mark" aria-hidden="true">
              {locale === 'zh-CN' ? '✓' : '中'}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
