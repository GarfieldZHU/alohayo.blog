'use client'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import DarkLogo from '@/data/logo-circle-dark.svg'
import LightLogo from '@/data/logo-circle-light.svg'

const Logo = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return null
  }
  return mounted && (theme === 'dark' || resolvedTheme === 'dark') ? <DarkLogo /> : <LightLogo />
}

export default Logo
