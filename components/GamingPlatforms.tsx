'use client'

import { useEffect, useRef, useState } from 'react'

const platforms = [
  {
    id: 'psn',
    name: 'PlayStation Network · AlohaYo_Z',
    href: 'https://psnprofiles.com/alohayo_',
    badge:
      'https://img.shields.io/badge/PSN-AlohaYo__Z-0070D1?style=for-the-badge&logo=playstation&logoColor=white',
  },
  {
    id: 'steam',
    name: 'Steam · AlohaYo',
    href: 'https://steamcommunity.com/profiles/76561198092274492',
    badge:
      'https://img.shields.io/badge/Steam-AlohaYo-000000?style=for-the-badge&logo=steam&logoColor=white',
  },
  {
    id: 'switch',
    name: 'Nintendo Switch · SW-7050-4176-3344',
    href: 'https://www.nintendo.com/',
    badge:
      'https://img.shields.io/badge/Switch-SW--7050--4176--3344-E60012?style=for-the-badge&logo=nintendoswitch&logoColor=white',
  },
]

const dossiers = [
  {
    id: 'steam',
    eyebrow: 'Steam archive',
    title: 'The completionist has logged in.',
    detail:
      'A public shelf of favourites, strange detours, and a suspiciously patient achievement hunt.',
    stats: [
      ['200', 'games'],
      ['783', 'achievements'],
      ['1', 'perfect run'],
      ['31%', 'completion'],
    ],
    href: 'https://steamcommunity.com/profiles/76561198092274492',
    action: 'Browse the library',
  },
  {
    id: 'psn',
    eyebrow: 'PSN trophy vault',
    title: 'Bonfires rested at. Bosses argued with.',
    detail:
      'Follow the trophy trail under AlohaYo_Z — no controller throws were officially recorded.',
    stats: [
      ['PSN', 'AlohaYo_Z'],
      ['☀', 'sun praised'],
    ],
    href: 'https://psnprofiles.com/alohayo_',
    action: 'View trophy trail',
  },
  {
    id: 'switch',
    eyebrow: 'Switch signal',
    title: 'The friend code is the side quest.',
    detail:
      'SW-7050-4176-3344. Add the code, then bring snacks and a game worth losing track of time to.',
    stats: [
      ['SW', 'friend code'],
      ['✓', 'co-op ready'],
    ],
    href: 'https://www.nintendo.com/',
    action: 'Open Nintendo',
  },
]

const OPEN_DELAY_MS = 260

export function GamingPlatforms() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeId, setActiveId] = useState('steam')
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearOpenTimer = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current)
    openTimer.current = null
  }

  const scheduleOpen = (id: string) => {
    clearOpenTimer()
    openTimer.current = window.setTimeout(() => {
      setActiveId(id)
      setIsOpen(true)
    }, OPEN_DELAY_MS)
  }

  useEffect(() => () => clearOpenTimer(), [])

  const activeDossier = dossiers.find((dossier) => dossier.id === activeId) ?? dossiers[0]

  return (
    <div className="not-prose my-9">
      <div
        className="relative inline-flex max-w-full flex-nowrap items-center gap-1.5"
        onPointerLeave={() => {
          clearOpenTimer()
          setIsOpen(false)
        }}
      >
        <div className="no-scrollbar flex max-w-full flex-nowrap items-center gap-1.5 overflow-x-auto pb-2">
          {platforms.map((platform) => (
            <a
              key={platform.id}
              href={platform.href}
              target="_blank"
              rel="noreferrer"
              aria-label={platform.name}
              onPointerEnter={() => scheduleOpen(platform.id)}
              onFocus={() => {
                clearOpenTimer()
                setActiveId(platform.id)
                setIsOpen(true)
              }}
              className="shrink-0 transition duration-200 hover:-translate-y-0.5 hover:brightness-110 focus-visible:rounded-sm"
            >
              {/* Official marks stay in the compact badge form used by the About page. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={platform.badge} alt="" className="h-7 w-auto" />
            </a>
          ))}
        </div>
        <button
          type="button"
          aria-label="Open gamer dossier"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          onFocus={() => {
            clearOpenTimer()
            setIsOpen(true)
          }}
          className="mb-2 shrink-0 rounded-full border border-slate-300 bg-white px-2 py-1 font-mono text-[10px] font-bold tracking-[0.13em] text-slate-500 transition hover:border-cyan-500 hover:text-cyan-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-cyan-400 dark:hover:text-cyan-200"
        >
          STATS +
        </button>

        <section
          aria-live="polite"
          className={`absolute top-[calc(100%+0.45rem)] left-0 z-30 w-[min(34rem,calc(100vw-2.5rem))] origin-top-left rounded-xl border border-slate-200 bg-white/95 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur transition duration-200 dark:border-cyan-900/50 dark:bg-slate-950/95 ${
            isOpen
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-1 opacity-0'
          }`}
          onPointerEnter={clearOpenTimer}
          onPointerLeave={() => setIsOpen(false)}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-cyan-700 uppercase dark:text-cyan-300">
                {activeDossier.eyebrow}
              </p>
              <h3 className="mt-1 text-base font-bold tracking-tight text-slate-900 dark:text-white">
                {activeDossier.title}
              </h3>
            </div>
            <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-1 font-mono text-[9px] font-bold tracking-[0.12em] text-cyan-700 uppercase dark:text-cyan-200">
              Player card
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {activeDossier.detail}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {activeDossier.stats.map(([value, label]) => (
              <span
                key={`${value}-${label}`}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-800 dark:bg-slate-900"
              >
                <strong className="font-mono text-sm text-slate-900 dark:text-white">
                  {value}
                </strong>{' '}
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  {label}
                </span>
              </span>
            ))}
          </div>
          <a
            href={activeDossier.href}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1 font-mono text-xs font-bold text-cyan-700 transition hover:gap-2 hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-100"
          >
            {activeDossier.action} <span aria-hidden="true">↗</span>
          </a>
          {activeDossier.id === 'steam' && (
            <p className="mt-3 font-mono text-[10px] text-slate-400 dark:text-slate-500">
              Public Steam profile snapshot · 26 Jul 2026
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
