'use client'
import { usePathname, useRouter } from 'next/navigation'
import siteMetadata from '@/data/siteMetadata'
import { getLocalePath } from '@/lib/i18n'
import { useLocale } from './LocaleProvider'
export default function LanguageSwitch() {
  const { locale, setLocale, messages } = useLocale()
  const router = useRouter()
  const pathname = usePathname() || '/'
  if (siteMetadata.i18n?.showLocaleSwitch === false) return null
  const next = locale === 'en' ? 'zh-CN' : 'en'
  return (
    <button
      type="button"
      aria-label={messages.accessibility.languageSwitch}
      aria-pressed={locale === 'zh-CN'}
      onClick={() => {
        setLocale(next)
        router.push(getLocalePath(pathname, next))
      }}
      className="site-language-switch"
    >
      文/A
    </button>
  )
}
