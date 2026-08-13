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
        className="site-language-switch site-header__icon-button"
      >
        {/*
          Adapted from Wikimedia OOjs UI's language icon.
          Copyright 2011-2025 OOUI Team and other contributors; licensed under MIT.
          https://github.com/wikimedia/oojs-ui/blob/master/LICENSE-MIT
        */}
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="m17.835 19-1.248-3h-4.174l-1.248 3.001H9l4.577-11.005h1.846L20 19zm-4.59-5h2.51L14.5 10.982zM7.618 3H12v2H9.991a8.5 8.5 0 0 1-1.423 4.02q-.24.358-.528.707.634.367 1.379.711l.908.42-.839 1.816-.907-.42a18 18 0 0 1-2.026-1.09c-1.255.979-2.912 1.8-5.076 2.31l-.973.228-.458-1.946.973-.23c1.631-.383 2.885-.954 3.85-1.608C3.29 8.527 2.317 6.884 2.065 5H0V3h5.382l-.724-1.447 1.79-.895L7.617 3ZM4.094 5c.243 1.282.974 2.489 2.29 3.586A6.54 6.54 0 0 0 7.98 5z" />
        </svg>
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
