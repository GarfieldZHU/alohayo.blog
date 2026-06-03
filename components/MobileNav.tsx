'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from './Link'
import headerNavLinks from '@/data/headerNavLinks'

const MobileNav = () => {
  const [mounted, setMounted] = useState(false)
  const [navShow, setNavShow] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    document.body.style.overflow = navShow ? 'hidden' : 'auto'

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [navShow])

  const onToggleNav = () => {
    setNavShow((status) => !status)
  }

  return (
    <>
      <button aria-label="Toggle Menu" onClick={onToggleNav} className="sm:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-8 w-8 text-gray-900 dark:text-gray-100"
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
            className={`fixed inset-0 z-[100] sm:hidden ${
              navShow ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
          >
            <button
              aria-label="Close Menu Backdrop"
              className={`absolute inset-0 bg-gray-950/40 transition-opacity duration-300 dark:bg-black/60 ${
                navShow ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={onToggleNav}
            />
            <div
              className={`absolute top-0 right-0 flex h-dvh w-[min(20rem,85vw)] flex-col border-l border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-950 ${
                navShow ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="flex items-center justify-end border-b border-gray-100 px-5 py-5 dark:border-gray-800">
                <button className="h-8 w-8" aria-label="Toggle Menu" onClick={onToggleNav}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="text-gray-900 dark:text-gray-100"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
                {headerNavLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className="rounded-xl px-4 py-3 text-lg font-semibold tracking-wide text-gray-900 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-900"
                    onClick={onToggleNav}
                  >
                    {link.title}
                  </Link>
                ))}
              </nav>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

export default MobileNav
