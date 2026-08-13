'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'
import Link from './Link'
import headerNavLinks from '@/data/headerNavLinks'
import siteMetadata from '@/data/siteMetadata'
import { useLocale } from './LocaleProvider'

const MobileNav = () => {
  const [mounted, setMounted] = useState(false)
  const [navShow, setNavShow] = useState(false)
  const pathname = usePathname() ?? '/'
  const { locale, messages } = useLocale()
  const prefix = locale === 'zh-CN' ? '/zh-CN' : ''
  const pathLabel = pathname === '/' ? '~/' : `~${pathname}`

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = navShow ? 'hidden' : originalOverflow

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [navShow])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNavShow(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const onToggleNav = () => {
    setNavShow((status) => !status)
  }

  return (
    <>
      <button
        aria-label={messages.shell.toggleMenu}
        aria-controls="mobile-navigation-drawer"
        aria-expanded={navShow}
        onClick={onToggleNav}
        className="site-mobile-nav__trigger site-header__icon-button xl:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path
            fillRule="evenodd"
            d="M2 3.5A1.5 1.5 0 013.5 2h13a1.5 1.5 0 010 3h-13A1.5 1.5 0 012 3.5zm0 6.5a1.5 1.5 0 011.5-1.5h13a1.5 1.5 0 010 3h-13A1.5 1.5 0 012 10zm0 6.5A1.5 1.5 0 013.5 15h13a1.5 1.5 0 010 3h-13A1.5 1.5 0 012 16.5z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {mounted &&
        createPortal(
          <div
            className={`site-mobile-nav fixed inset-0 z-[100] xl:hidden ${
              navShow ? 'site-mobile-nav--open pointer-events-auto' : 'pointer-events-none'
            }`}
          >
            <button
              aria-label={messages.shell.closeBackdrop}
              className="site-mobile-nav__backdrop absolute inset-0"
              onClick={onToggleNav}
            />
            <div
              id="mobile-navigation-drawer"
              role="dialog"
              aria-modal="true"
              aria-label={messages.shell.mobileNavigation}
              data-open={navShow}
              className="site-mobile-nav__drawer absolute"
            >
              <div className="site-mobile-nav__header">
                <Link
                  href={`${prefix}/`}
                  aria-label={siteMetadata.headerTitle}
                  className="site-mobile-nav__identity"
                  onClick={onToggleNav}
                >
                  <span className="site-mobile-nav__context">
                    <span className="site-mobile-nav__eyebrow">{messages.shell.siteMap}</span>
                    <span className="site-mobile-nav__wordmark">{siteMetadata.headerTitle}</span>
                    <span className="site-mobile-nav__path">{pathLabel}</span>
                  </span>
                </Link>
                <button
                  className="site-mobile-nav__close"
                  aria-label={messages.shell.closeMenu}
                  onClick={onToggleNav}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <nav className="site-mobile-nav__links" aria-label={messages.shell.mobileNavigation}>
                {headerNavLinks.map((link) => {
                  const href = link.href === '/' ? `${prefix}/` : `${prefix}${link.href}`
                  const isCurrent = pathname === href || pathname.startsWith(`${href}/`)
                  const routeLabel = href === '/' ? '~/' : `~${href}/`

                  return (
                    <Link
                      key={link.title}
                      href={href}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={`site-mobile-nav__link ${isCurrent ? 'site-mobile-nav__link--current' : ''}`}
                      onClick={onToggleNav}
                    >
                      <span className="site-mobile-nav__title">
                        {messages.nav[link.title.toLowerCase()] || link.title}
                      </span>
                      <span className="site-mobile-nav__route">{routeLabel}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

export default MobileNav
