'use client'

import { usePathname } from 'next/navigation'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from './Link'
import Logo from './Logo'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'
import LanguageSwitch from './LanguageSwitch'
import { useLocale } from './LocaleProvider'

const Header = () => {
  const pathname = usePathname() ?? '/'
  const { locale, messages } = useLocale()
  const prefix = locale === 'zh-CN' ? '/zh-CN' : ''
  const pathLabel = pathname === '/' ? '~/' : `~${pathname}`

  return (
    <header className="site-header sticky top-0 z-40 flex min-w-0 items-center justify-between gap-4 py-4 sm:py-5">
      <div className="min-w-0">
        <Link href={`${prefix}/`} aria-label={siteMetadata.headerTitle} className="block">
          <div className="site-header__brand">
            <div className="site-header__logo shrink-0">
              <Logo />
            </div>
            {typeof siteMetadata.headerTitle === 'string' ? (
              <div className="min-w-0">
                <div className="site-header__wordmark truncate">{siteMetadata.headerTitle}</div>
                <div className="site-header__path" aria-hidden="true">
                  <span>{pathLabel}</span>
                  <span className="site-header__cursor" />
                </div>
              </div>
            ) : (
              siteMetadata.headerTitle
            )}
          </div>
        </Link>
      </div>
      <div className="site-header__actions">
        <nav
          className="hidden items-center gap-5 xl:flex xl:gap-7"
          aria-label={messages.shell.primaryNavigation}
        >
          {headerNavLinks
            .filter((link) => link.href !== '/')
            .map((link) => {
              const href = link.href === '/' ? `${prefix}/` : `${prefix}${link.href}`
              const isCurrent = pathname === href || pathname.startsWith(`${href}/`)

              return (
                <Link
                  key={link.title}
                  href={href}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`site-nav-link font-medium ${isCurrent ? 'site-nav-link--current' : ''}`}
                >
                  {messages.nav[link.title.toLowerCase()] || link.title}
                </Link>
              )
            })}
        </nav>
        <span className="site-header__divider" aria-hidden="true" />
        <SearchButton />
        <ThemeSwitch />
        <LanguageSwitch />
        <MobileNav />
      </div>
    </header>
  )
}

export default Header
