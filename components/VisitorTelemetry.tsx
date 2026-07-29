'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

const badgeUrls = {
  light:
    'https://hits.sh/alohayo.me.svg?view=total&style=flat-square&label=Visitors&color=ff4d8d&labelColor=22c7f3',
  dark:
    'https://hits.sh/alohayo.me.svg?view=total&style=flat-square&label=Visitors&color=0f766e&labelColor=172554',
}

export default function VisitorTelemetry() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="mb-2 h-5" aria-hidden="true" />
  }

  const counterUrl = resolvedTheme === 'dark' ? badgeUrls.dark : badgeUrls.light

  return (
    <div className="mb-2 flex justify-center">
      <a href="https://hits.sh/alohayo.me/" aria-label="Open alohayo.me view statistics">
        <img
          alt="Total views for alohayo.me"
          className="h-5 w-auto opacity-95 transition-opacity hover:opacity-100"
          src={counterUrl}
          height={20}
        />
      </a>
    </div>
  )
}
