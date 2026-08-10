'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from './LocaleProvider'

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
    eyebrow: 'Steam library',
    title: 'A shelf worth lingering at.',
    detail: 'A little serious about achievements. Entirely unserious about bedtime.',
    stats: [
      ['200', 'games'],
      ['783', 'achievements'],
      ['1', 'perfect run'],
      ['31%', 'completion'],
    ],
    href: 'https://steamcommunity.com/profiles/76561198092274492',
    action: 'Browse the library',
    highlights: [
      {
        name: 'Cyberpunk 2077',
        href: 'https://steamcommunity.com/app/1091500',
        image:
          'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/590e0988a2fb79f44d3e31e41fd4949eb76abc41/capsule_184x69.jpg?t=1784714077',
      },
      {
        name: "Baldur's Gate 3",
        href: 'https://steamcommunity.com/app/1086940',
        image:
          'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/3dd81008e9c385caf68152450c22353f6a8abec9/capsule_184x69.jpg?t=1777363040',
      },
      {
        name: 'Sekiro: Shadows Die Twice',
        href: 'https://steamcommunity.com/app/814380',
        image:
          'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/capsule_184x69.jpg?t=1762888662',
      },
      {
        name: 'Sid Meier’s Civilization VI',
        href: 'https://steamcommunity.com/app/289070',
        image:
          'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/289070/capsule_184x69.jpg?t=1784651829',
      },
    ],
  },
  {
    id: 'psn',
    eyebrow: 'PSN trophy vault',
    title: 'Bonfires rested. Bosses negotiated.',
    detail: 'Follow AlohaYo_Z’s trophy trail. Controller throws remain strictly unconfirmed.',
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
    detail: 'SW-7050-4176-3344. Bring snacks, a co-op game, and a suspicious amount of free time.',
    stats: [
      ['SW', 'friend code'],
      ['✓', 'co-op ready'],
    ],
    href: 'https://www.nintendo.com/',
    action: 'Open Nintendo',
  },
]

const OPEN_DELAY_MS = 260
const CLOSE_DELAY_MS = 420

export function GamingPlatforms() {
  const { messages } = useLocale()
  const copy = messages.about
  const [isOpen, setIsOpen] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [activeId, setActiveId] = useState('steam')
  const openTimer = useRef<number | null>(null)
  const closeTimer = useRef<number | null>(null)

  const clearOpenTimer = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current)
    openTimer.current = null
  }

  const clearCloseTimer = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = null
  }

  const scheduleOpen = (id: string) => {
    clearOpenTimer()
    clearCloseTimer()
    setIsPinned(false)
    if (isOpen) {
      setActiveId(id)
      return
    }
    openTimer.current = window.setTimeout(() => {
      setActiveId(id)
      setIsOpen(true)
    }, OPEN_DELAY_MS)
  }

  const scheduleClose = () => {
    clearOpenTimer()
    clearCloseTimer()
    if (isPinned) return
    closeTimer.current = window.setTimeout(() => setIsOpen(false), CLOSE_DELAY_MS)
  }

  useEffect(
    () => () => {
      clearOpenTimer()
      clearCloseTimer()
    },
    []
  )

  const activeDossier = dossiers.find((dossier) => dossier.id === activeId) ?? dossiers[0]
  const dossierText = {
    steam: {
      eyebrow: copy.steamEyebrow,
      title: copy.steamTitle,
      detail: copy.steamDetail,
      action: copy.steamAction,
      stats: {
        games: copy.games,
        achievements: copy.achievements,
        'perfect run': copy.perfectRun,
        completion: copy.completion,
      },
    },
    psn: {
      eyebrow: copy.psnEyebrow,
      title: copy.psnTitle,
      detail: copy.psnDetail,
      action: copy.psnAction,
      stats: { 'sun praised': copy.sunPraised },
    },
    switch: {
      eyebrow: copy.switchEyebrow,
      title: copy.switchTitle,
      detail: copy.switchDetail,
      action: copy.switchAction,
      stats: { 'friend code': copy.friendCode, 'co-op ready': copy.coOpReady },
    },
  }[activeDossier.id] ?? {
    eyebrow: copy.steamEyebrow,
    title: copy.steamTitle,
    detail: copy.steamDetail,
    action: copy.steamAction,
    stats: {},
  }
  const localizedStats = dossierText.stats as Record<string, string>
  const highlights = 'highlights' in activeDossier ? activeDossier.highlights : []

  return (
    <div className="not-prose my-9">
      <div
        className="relative inline-flex max-w-full flex-nowrap items-center gap-1.5"
        onPointerEnter={clearCloseTimer}
        onPointerLeave={scheduleClose}
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
          aria-label={copy.dossierButton}
          aria-expanded={isOpen}
          onClick={() => {
            clearOpenTimer()
            clearCloseTimer()
            if (isPinned) {
              setIsPinned(false)
              setIsOpen(false)
              return
            }
            setIsPinned(true)
            setIsOpen(true)
          }}
          onFocus={() => {
            clearOpenTimer()
            clearCloseTimer()
            setIsOpen(true)
          }}
          className="mb-2 shrink-0 rounded-full border border-slate-300 bg-white px-2 py-1 font-mono text-[10px] font-bold tracking-[0.13em] text-slate-500 transition hover:border-cyan-500 hover:text-cyan-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-cyan-400 dark:hover:text-cyan-200"
        >
          STATS +
        </button>

        <div
          className={`absolute top-full right-0 z-30 w-[min(34rem,calc(100vw-2.5rem))] pt-2 transition duration-200 ${
            isOpen
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-1 opacity-0'
          }`}
        >
          <section
            aria-live="polite"
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.2)] backdrop-blur dark:border-cyan-900/50 dark:bg-slate-950/95"
            onPointerEnter={clearCloseTimer}
            onPointerLeave={scheduleClose}
          >
            <div className="border-b border-slate-100 px-4 pt-4 pb-3 dark:border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-cyan-700 uppercase dark:text-cyan-300">
                    {dossierText.eyebrow}
                  </p>
                  <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                    {dossierText.title}
                  </h3>
                </div>
                <span className="mt-0.5 inline-flex h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]" />
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {dossierText.detail}
              </p>
            </div>
            <div className="px-4 py-3">
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {activeDossier.stats.map(([value, label]) => (
                  <span key={`${value}-${label}`} className="inline-flex items-baseline gap-1.5">
                    <strong className="font-mono text-sm text-slate-900 dark:text-white">
                      {value}
                    </strong>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      {localizedStats[label] || label}
                    </span>
                  </span>
                ))}
              </div>
              {'highlights' in activeDossier && (
                <div className="mt-4">
                  <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.14em] text-slate-400 uppercase dark:text-slate-500">
                    {copy.pinnedShelf}
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {highlights.map((game) => (
                      <a
                        key={game.href}
                        href={game.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={game.name}
                        className="group/game relative overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shadow-sm dark:border-slate-800"
                      >
                        {/* Steam's public profile supplies these featured-library capsule images. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={game.image}
                          alt=""
                          className="aspect-[184/69] w-full object-cover opacity-90 transition duration-200 group-hover/game:scale-105 group-hover/game:opacity-100"
                        />
                        <span className="absolute inset-x-0 bottom-0 bg-slate-950/80 px-1.5 py-1 font-mono text-[9px] text-white opacity-0 transition group-hover/game:opacity-100">
                          {game.name}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 flex items-center justify-between gap-3">
                <a
                  href={activeDossier.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs font-bold text-cyan-700 transition hover:gap-2 hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-100"
                >
                  {dossierText.action} <span aria-hidden="true">↗</span>
                </a>
                {activeDossier.id === 'steam' && (
                  <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                    26 Jul 2026
                  </span>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
