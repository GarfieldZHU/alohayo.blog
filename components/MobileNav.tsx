'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'
import Link from './Link'
import Logo from './Logo'
import headerNavLinks from '@/data/headerNavLinks'
import siteMetadata from '@/data/siteMetadata'

const MobileNav = () => {
  const [mounted, setMounted] = useState(false)
  const [navShow, setNavShow] = useState(false)
  const pathname = usePathname() ?? '/'
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
        aria-label="Toggle Menu"
        aria-controls="mobile-navigation-drawer"
        aria-expanded={navShow}
        onClick={onToggleNav}
        className="site-mobile-nav__trigger xl:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
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
              aria-label="Close Menu Backdrop"
              className="site-mobile-nav__backdrop absolute inset-0"
              onClick={onToggleNav}
            />
            <div
              id="mobile-navigation-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              data-open={navShow}
              className="site-mobile-nav__drawer absolute"
            >
              <div className="site-mobile-nav__header">
                <Link
                  href="/"
                  aria-label={siteMetadata.headerTitle}
                  className="site-mobile-nav__identity"
                  onClick={onToggleNav}
                >
                  <span className="site-mobile-nav__logo" aria-hidden="true">
                    <Logo />
                  </span>
                  <span className="site-mobile-nav__context">
                    <span className="site-mobile-nav__eyebrow">site map</span>
                    <span className="site-mobile-nav__wordmark">{siteMetadata.headerTitle}</span>
                    <span className="site-mobile-nav__path">{pathLabel}</span>
                  </span>
                </Link>
                <button
                  className="site-mobile-nav__close"
                  aria-label="Close Menu"
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
              <nav className="site-mobile-nav__links" aria-label="Mobile navigation">
                {headerNavLinks.map((link, index) => {
                  const isCurrent =
                    pathname === link.href ||
                    (link.href !== '/' && pathname.startsWith(`${link.href}/`))
                  const routeLabel = link.href === '/' ? '~/' : `~${link.href}/`

                  return (
                    <Link
                      key={link.title}
                      href={link.href}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={`site-mobile-nav__link ${isCurrent ? 'site-mobile-nav__link--current' : ''}`}
                      onClick={onToggleNav}
                    >
                      <span className="site-mobile-nav__index">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="site-mobile-nav__title">{link.title}</span>
                      <span className="site-mobile-nav__route">{routeLabel}</span>
                    </Link>
                  )
                })}
              </nav>
              <div className="site-mobile-nav__footer" aria-hidden="true">
                <span>responsive navigation</span>
                <span>© {new Date().getFullYear()} AlohaYo</span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

export default MobileNav
