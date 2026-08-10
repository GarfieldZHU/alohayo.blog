'use client'
import { usePathname, useRouter } from 'next/navigation'
import siteMetadata from '@/data/siteMetadata'
import { getLocalePath } from '@/lib/i18n'
import { useLocale } from './LocaleProvider'
export default function LanguageSwitch() {
  if (siteMetadata.i18n?.showLocaleSwitch === false) return null
  const { locale, setLocale } = useLocale()
  const router = useRouter()
  const pathname = usePathname() || '/'
  const next = locale === 'en' ? 'zh-CN' : 'en'
  return (
    <button
      type="button"
      aria-label="文/A"
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
