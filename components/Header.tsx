'use client'

import { usePathname } from 'next/navigation'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from './Link'
import Logo from './Logo'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'

const Header = () => {
  const pathname = usePathname() ?? '/'
  const pathLabel = pathname === '/' ? '~/' : `~${pathname}`

  return (
    <header className="site-header sticky top-0 z-40 flex items-center justify-between gap-4 bg-white/90 py-4 backdrop-blur-md sm:py-5 dark:bg-gray-950/90">
      <div className="min-w-0">
        <Link href="/" aria-label={siteMetadata.headerTitle} className="block">
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
      <div className="flex shrink-0 items-center gap-3 leading-5 sm:gap-5 lg:gap-6">
        <nav className="hidden items-center gap-5 sm:flex lg:gap-7" aria-label="Primary navigation">
          {headerNavLinks
            .filter((link) => link.href !== '/')
            .map((link) => {
              const isCurrent = pathname === link.href || pathname.startsWith(`${link.href}/`)

              return (
                <Link
                  key={link.title}
                  href={link.href}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`site-nav-link font-medium ${isCurrent ? 'site-nav-link--current' : ''}`}
                >
                  {link.title}
                </Link>
              )
            })}
        </nav>
        <SearchButton />
        <ThemeSwitch />
        <MobileNav />
      </div>
    </header>
  )
}

export default Header
