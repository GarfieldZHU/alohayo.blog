'use client'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import DarkLogo from '@/data/logo-dark.svg'
import LightLogo from '@/data/logo-light.svg'

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return null
  }
  return mounted && (theme === 'dark' || resolvedTheme === 'dark') ? <DarkLogo /> : <LightLogo />
}

export default ThemeSwitch
