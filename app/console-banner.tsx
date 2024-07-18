'use client'

import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import siteMetadata from '@/data/siteMetadata'


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

const CUSTOM_PAINITING = String.raw``


/**
 * My custom banner printed to the console.
 */
export function AlohaYoConsoleBanner() {
  useEffect(() => {
    console.log(DOMAIN_BANNER)
    console.log(CUSTOM_PAINITING)
  }, [])

  return <div className="alohayo_banner" />
}
