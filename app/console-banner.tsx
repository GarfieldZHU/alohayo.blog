'use client'

import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import siteMetadata from '@/data/siteMetadata'

const CUSTOM_PAINITING = String.raw`
░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓██████▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░▓▓██████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▓▓██████████████▓▓░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒████████████████████████░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░████████████████████████████████████████▓▓▓▓▓▓▓▓▓▓▓▓██████████████████████▓▓████████░░░░░░░░░░░░░░
░░░░░░░░░░░░░░██████████████████████████████████████████████████████████████████████████░░░░░░██████▓▓░░░░░░░░░░░░
░░░░░░░░░░░░░░██████████▓▓██████████████████████████████████████████████████████████████░░░░░░████████▒▒░░░░░░░░░░
░░░░░░░░░░░░████████▓▓▓▓▓▓▓▓▓▓▓▓██████████████████████░░░░░░░░▓▓████████████████████████▒▒░░▓▓██████████░░░░░░░░░░
░░░░░░░░░░░░██████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██████████████████░░░░░░░░░░░░▓▓██████████████▒▒░░▓▓██████████▓▓▒▒▓▓██▓▓░░░░░░░░
░░░░░░░░░░████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██████████▓▓▓▓██▓▓░░░░▒▒▒▒▒▒░░░░██▓▓▓▓▓▓████▓▓░░░░░░██████████▒▒▒▒▒▒████░░░░░░░░
░░░░░░░░░░████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██████████▓▓▓▓██▓▓░░░░▒▒▒▒▒▒░░░░████▓▓▓▓██████░░░░▒▒██████████▒▒▒▒▒▒████▓▓░░░░░░
░░░░░░░░▓▓████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓████████████████████░░░░░░░░░░░░▒▒██████████████▓▓▒▒██████████████▓▓████████░░░░░░
░░░░░░░░████████████▓▓▓▓▓▓▓▓▓▓▓▓████████████████████▒▒░░░░░░░░░░████████████████████████▓▓▒▒████████████████░░░░░░
░░░░░░░░██████████████████████████████████████████████░░░░░░░░▓▓████████████████████████▒▒▒▒▒▒██████████████▓▓░░░░
░░░░░░▓▓████████████████████████████████████████████████▓▓▓▓██████████████████████████▓▓▒▒▒▒░░████████████████░░░░
░░░░░░██████████████████████████████▓▓▓▓▓▓▓▓▓▓██████████████████████████████████████████▒▒▒▒▒▒████████████████░░░░
░░░░░░████████████████████████████▓▓▓▓██████▓▓▓▓████████████████████████▓▓▓▓▓▓▓▓██████████▒▒██████████████████░░░░
░░░░▒▒██████████████████████████▓▓▓▓▓▓██████▓▓▓▓▓▓████████████████████▓▓▓▓▓▓▓▓▓▓▓▓████████████████████████████▒▒░░
░░░░████████████████████████████▓▓██████████████▓▓██████████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓██████████████████████████████░░
░░░░██████████████████████████▓▓▓▓██████████████▓▓██████████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓██████████████████████████████░░
░░░░████████████████████████████▓▓██████████████▓▓██████████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓██████████████████████████████░░
░░▓▓████████████████████████████▓▓▓▓▓▓██████▓▓▓▓▓▓██████████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓██████████████████████████████░░
░░████████████████████████████████▓▓▓▓██████▓▓▓▓██████████████████████▓▓▓▓▓▓▓▓▓▓██████████████████████████████████
░░██████████████████████████████████▓▓▓▓▓▓▓▓▓▓██████████████████████████████████████████████████████████████████▓▓
░░██████████████████████████████████████▓▓████████████████████████████████████████████████████████████████████████
░░████████████████████████████████████████████████████████████████████████████████████████████████████████████████
░░████████████████████████████████████████████████████████████████████████████████████████████████████████████████
░░████████████████████████████████████████████████████████████████████████████████████████████████████████████████
░░██████████████████████████████████████████████▒▒░░░░░░░░░░░░░░░░░░░░▒▒▓▓████████████████████████████████████████
░░████████████████████████████████████▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓████████████████████████████████
░░████████████████████████████████▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██████████████████████████████
░░██████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████████████████████████
░░████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████████████████████▓▓
░░██████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████████████████████
░░▒▒████████████████████▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████████████████░░
░░░░██████████████████▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒████████████████░░
░░░░░░██████████▓▓▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒██████████░░░░
`

const DOMAIN_BANNER = String.raw`
   █████████   █████          ███████    █████   █████   █████████   █████ █████    ███████       ██████   ██████ ██████████
  ███░░░░░███ ░░███         ███░░░░░███ ░░███   ░░███   ███░░░░░███ ░░███ ░░███   ███░░░░░███    ░░██████ ██████ ░░███░░░░░█
 ░███    ░███  ░███        ███     ░░███ ░███    ░███  ░███    ░███  ░░███ ███   ███     ░░███    ░███░█████░███  ░███  █ ░ 
 ░███████████  ░███       ░███      ░███ ░███████████  ░███████████   ░░█████   ░███      ░███    ░███░░███ ░███  ░██████   
 ░███░░░░░███  ░███       ░███      ░███ ░███░░░░░███  ░███░░░░░███    ░░███    ░███      ░███    ░███ ░░░  ░███  ░███░░█   
 ░███    ░███  ░███      █░░███     ███  ░███    ░███  ░███    ░███     ░███    ░░███     ███     ░███      ░███  ░███ ░   █
 █████   █████ ███████████ ░░░███████░   █████   █████ █████   █████    █████    ░░░███████░   ██ █████     █████ ██████████
░░░░░   ░░░░░ ░░░░░░░░░░░    ░░░░░░░    ░░░░░   ░░░░░ ░░░░░   ░░░░░    ░░░░░       ░░░░░░░    ░░ ░░░░░     ░░░░░ ░░░░░░░░░░ 
                                                                                                                                                                                                                                                                                                                                                                               
`

const welcomeStyle =
  'background-color: hotpink; color: white; font-family: w3-cursive; font-style: italic; border: 3px dashed; font-size: 2em;'

/**
 * My custom banner printed to the console.
 */
export function AlohaYoConsoleBanner() {
  useEffect(() => {
    console.log(CUSTOM_PAINITING)
    console.log(DOMAIN_BANNER)
    console.log('%c                Welcome to https://alohyo.me ~~~                ', welcomeStyle)
  }, [])

  return <div className="alohayo_banner" />
}
