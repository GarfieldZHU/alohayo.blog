'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { opencodeSplash } from '@/data/splashes/opencode'
import { quotes } from '@/data/quotes'

// --- Data ---

const introLines = [
  "Hey, I'm AlohaYo — a full-stack engineer based in the Hangzhou.",
  'I build things with TypeScript, Java, Rust, and whatever else gets the job done.',
  'I have opinions about code, and I share them whether you ask or not.',
  "This blog is where I document the good, the bad, and the 'why did I think that was a good idea'.",
]

type MenuOption = { id: string; label: string; description: string; hidden?: boolean }

const menuOptions: MenuOption[] = [
  { id: 'introduce', label: 'Introduce AlohaYo', description: 'click to learn about me' },
  { id: 'recommend', label: 'Recommend the blog', description: 'click to discover random posts' },
  { id: 'quotes', label: 'Roll a quotes', description: 'click to get a quote' },
  { id: 'pokemon', label: 'Roll a Pokemon today', description: 'click to catch a random Pokemon' },
  // TODO: "play AlohaYo game" — links to /projects game page
]

const CAROUSEL_INTERVAL = 3000

const typeColors: Record<string, string> = {
  normal: 'bg-[#A8A77A] text-white',
  fire: 'bg-[#EE8130] text-white',
  water: 'bg-[#6390F0] text-white',
  electric: 'bg-[#F7D02C] text-gray-900',
  grass: 'bg-[#7AC74C] text-white',
  ice: 'bg-[#96D9D6] text-gray-900',
  fighting: 'bg-[#C22E28] text-white',
  poison: 'bg-[#A33EA1] text-white',
  ground: 'bg-[#E2BF65] text-gray-900',
  flying: 'bg-[#A98FF3] text-white',
  psychic: 'bg-[#F95587] text-white',
  bug: 'bg-[#A6B91A] text-white',
  rock: 'bg-[#B6A136] text-white',
  ghost: 'bg-[#735797] text-white',
  dragon: 'bg-[#6F35FC] text-white',
  dark: 'bg-[#705746] text-white',
  steel: 'bg-[#B7B7CE] text-gray-900',
  fairy: 'bg-[#D685AD] text-white',
}

function getStatColor(value: number): string {
  const clamped = Math.max(30, Math.min(180, value))
  const ratio = (clamped - 30) / 150
  const level = Math.min(Math.floor(ratio * 10), 9)
  const colors = [
    '#22c55e', // 0 - green
    '#4ade80',
    '#a3e635',
    '#d9f99d',
    '#fef08a',
    '#fde047',
    '#fbbf24',
    '#f97316',
    '#ef4444',
    '#dc2626', // 9 - red
  ]
  return colors[level]
}

// --- Pokemon Modal ---

interface PokemonData {
  name: string
  id: number
  sprite: string
  types: string[]
  stats: { name: string; value: number }[]
  height: number
  weight: number
  abilities: string[]
}

function PokemonModal({
  pokemon,
  onClose,
  onReroll,
  loading,
}: {
  pokemon: PokemonData | null
  onClose: () => void
  onReroll: () => void
  loading: boolean
}) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        role="document"
        className="relative mx-4 w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-[#1e1e2e]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 cursor-pointer text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
        >
          ✕
        </button>

        {loading && (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
          </div>
        )}

        {!loading && pokemon && (
          <div className="text-center">
            <img
              src={pokemon.sprite}
              alt={pokemon.name}
              className="pixelated mx-auto h-32 w-32"
              style={{ imageRendering: 'pixelated' }}
            />
            <h3 className="mt-2 text-xl font-bold text-gray-900 capitalize dark:text-white">
              {pokemon.name}
              <span className="ml-2 text-sm font-normal text-gray-400">#{pokemon.id}</span>
            </h3>
            <div className="mt-2 flex justify-center gap-2">
              {pokemon.types.map((type) => (
                <span
                  key={type}
                  className={`rounded-full px-3 py-0.5 text-xs font-medium capitalize ${typeColors[type] || 'bg-gray-400 text-white'}`}
                >
                  {type}
                </span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-left text-sm">
              <div className="text-gray-500 dark:text-gray-400">
                Height:{' '}
                <span className="text-gray-900 dark:text-gray-200">{pokemon.height / 10}m</span>
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                Weight:{' '}
                <span className="text-gray-900 dark:text-gray-200">{pokemon.weight / 10}kg</span>
              </div>
            </div>
            <div className="mt-3 text-left">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Abilities</p>
              <p className="text-sm text-gray-700 capitalize dark:text-gray-300">
                {pokemon.abilities.join(', ')}
              </p>
            </div>
            <div className="mt-3 space-y-1 text-left">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Stats</p>
              {pokemon.stats.map((stat) => (
                <div key={stat.name} className="flex items-center gap-2">
                  <span className="w-16 text-xs text-gray-500 capitalize dark:text-gray-400">
                    {stat.name.replace('special-', 'sp.')}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (stat.value / 255) * 100)}%`,
                        backgroundColor: getStatColor(stat.value),
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-gray-600 dark:text-gray-300">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={onReroll}
                className="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-600"
              >
                🎲 Catch another!
              </button>
              <a
                href={`https://wiki.52poke.com/wiki/${pokemon.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                📖 Wiki
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// --- Feature Views ---

function IntroduceView({
  introLines,
  introLineIdx,
  introCharIdx,
  introComplete,
  goBack,
}: {
  introLines: string[]
  introLineIdx: number
  introCharIdx: number
  introComplete: boolean
  goBack: () => void
}) {
  return (
    <div className="space-y-3">
      <p className="mb-4 text-gray-500">
        <span className="mr-2 text-blue-500 dark:text-[#5c9cf5]">❯</span>Introduce AlohaYo
      </p>
      <div className="space-y-2 border-l-4 border-orange-400 pl-3 dark:border-[#fab283]">
        {introLines.slice(0, introLineIdx + 1).map((line, i) => (
          <p key={i} className="text-gray-800 dark:text-[#e0e0e0]">
            <span className="mr-2 text-orange-500 dark:text-[#fab283]">•</span>
            {i < introLineIdx ? line : i === introLineIdx ? line.slice(0, introCharIdx) : ''}
            {i === introLineIdx && !introComplete && <span className="animate-pulse">_</span>}
          </p>
        ))}
      </div>
      {introComplete && (
        <button
          onClick={goBack}
          className="mt-4 cursor-pointer text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
        >
          ← back
        </button>
      )}
    </div>
  )
}

function RecommendView({
  posts,
  onShuffle,
  goBack,
}: {
  posts: Array<{ slug: string; title: string; summary?: string; tags: string[] }>
  onShuffle: () => void
  goBack: () => void
}) {
  return (
    <div className="space-y-3">
      <p className="mb-4 text-gray-500">
        <span className="mr-2 text-blue-500 dark:text-[#5c9cf5]">❯</span>Recommend the blog
      </p>
      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded border border-gray-200 px-4 py-3 transition-colors hover:border-blue-400 hover:bg-gray-100 dark:border-gray-700 dark:hover:border-[#5c9cf5] dark:hover:bg-[#2a2a2a]"
          >
            <p className="text-blue-600 dark:text-[#5c9cf5]">{post.title}</p>
            {post.tags.length > 0 && (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {post.tags.join(' · ')}
              </p>
            )}
          </Link>
        ))}
      </div>
      <div className="mt-4 flex gap-4">
        <button
          onClick={onShuffle}
          className="cursor-pointer text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
        >
          🔄 recommend others
        </button>
        <button
          onClick={goBack}
          className="cursor-pointer text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
        >
          ← back
        </button>
      </div>
    </div>
  )
}

function QuotesView({
  quote,
  onReroll,
  goBack,
}: {
  quote: { text: string; author: string; explanation: string }
  onReroll: () => void
  goBack: () => void
}) {
  return (
    <div className="space-y-3">
      <p className="mb-4 text-gray-500">
        <span className="mr-2 text-blue-500 dark:text-[#5c9cf5]">❯</span>Roll a quotes
      </p>
      <blockquote className="border-l-4 border-cyan-500 py-2 pl-4 text-gray-700 italic dark:text-gray-200">
        &ldquo;{quote.text}&rdquo;
      </blockquote>
      <p className="text-sm font-bold text-orange-600 dark:text-[#fab283]">— {quote.author}</p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{quote.explanation}</p>
      <div className="mt-4 flex gap-4">
        <button
          onClick={onReroll}
          className="cursor-pointer text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
        >
          🎲 roll again
        </button>
        <button
          onClick={goBack}
          className="cursor-pointer text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
        >
          ← back
        </button>
      </div>
    </div>
  )
}

// --- Component ---

type AppState = 'splash' | 'menu' | 'introduce' | 'recommend' | 'quotes'

interface HomeTerminalProps {
  posts: Array<{ slug: string; title: string; summary?: string; tags: string[] }>
}

export default function HomeTerminal({ posts }: HomeTerminalProps) {
  const [appState, setAppState] = useState<AppState>('splash')
  const [splashStage, setSplashStage] = useState<'typing-cmd' | 'showing' | 'done'>('typing-cmd')
  const [typedCmd, setTypedCmd] = useState('')
  const [activeOption, setActiveOption] = useState(0)
  const [menuPromptTyped, setMenuPromptTyped] = useState('')

  const [introLineIdx, setIntroLineIdx] = useState(0)
  const [introCharIdx, setIntroCharIdx] = useState(0)
  const [introComplete, setIntroComplete] = useState(false)

  const [recommendedPosts, setRecommendedPosts] = useState<typeof posts>([])
  const [currentQuote, setCurrentQuote] = useState(quotes[0])

  const [pokemonModalOpen, setPokemonModalOpen] = useState(false)
  const [pokemonData, setPokemonData] = useState<PokemonData | null>(null)
  const [pokemonLoading, setPokemonLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [collapsed, setCollapsed] = useState(false)
  const lastScrollY = useRef(0)
  const [carouselProgress, setCarouselProgress] = useState(0)
  const carouselPaused = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current) return
      const scrollingDown = window.scrollY > lastScrollY.current
      lastScrollY.current = window.scrollY

      if (scrollingDown && window.scrollY > 10) {
        setCollapsed(true)
      } else if (!scrollingDown && window.scrollY < 50) {
        setCollapsed(false)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (appState !== 'menu' || menuPromptTyped !== menuPrompt) return
    const t = setInterval(() => {
      if (carouselPaused.current) return
      setCarouselProgress((p) => {
        if (p >= 100) {
          setActiveOption((o) => (o + 1) % menuOptions.length)
          return 0
        }
        return p + 100 / (CAROUSEL_INTERVAL / 50)
      })
    }, 50)
    return () => clearInterval(t)
  }, [appState, menuPromptTyped])

  // --- Splash animation ---
  useEffect(() => {
    if (appState !== 'splash') return
    const cmd = opencodeSplash.cmd
    if (splashStage === 'typing-cmd') {
      if (typedCmd.length < cmd.length) {
        const t = setTimeout(() => setTypedCmd(cmd.slice(0, typedCmd.length + 1)), 40)
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => setSplashStage('showing'), 300)
        return () => clearTimeout(t)
      }
    }
    if (splashStage === 'showing') {
      const t = setTimeout(() => setSplashStage('done'), 3500)
      return () => clearTimeout(t)
    }
    if (splashStage === 'done') {
      const t = setTimeout(() => setAppState('menu'), 200)
      return () => clearTimeout(t)
    }
  }, [appState, splashStage, typedCmd])

  // --- Menu prompt typing ---
  const menuPrompt = "I'm AlohaYo skill, what would you like me to do?"
  useEffect(() => {
    if (appState !== 'menu') return
    if (menuPromptTyped.length < menuPrompt.length) {
      const t = setTimeout(
        () => setMenuPromptTyped(menuPrompt.slice(0, menuPromptTyped.length + 1)),
        20
      )
      return () => clearTimeout(t)
    }
  }, [appState, menuPromptTyped])

  // --- Introduce typing ---
  useEffect(() => {
    if (appState !== 'introduce' || introComplete) return
    const line = introLines[introLineIdx]
    if (!line) {
      setIntroComplete(true)
      return
    }
    if (introCharIdx < line.length) {
      const t = setTimeout(() => setIntroCharIdx((c) => c + 1), 25)
      return () => clearTimeout(t)
    } else {
      if (introLineIdx < introLines.length - 1) {
        const t = setTimeout(() => {
          setIntroLineIdx((i) => i + 1)
          setIntroCharIdx(0)
        }, 400)
        return () => clearTimeout(t)
      } else {
        setIntroComplete(true)
      }
    }
  }, [appState, introLineIdx, introCharIdx, introComplete])

  // --- Handlers ---
  const pickRandomPosts = useCallback(() => {
    const shuffled = [...posts].sort(() => Math.random() - 0.5)
    setRecommendedPosts(shuffled.slice(0, 3))
  }, [posts])

  const pickRandomQuote = useCallback(() => {
    const q = quotes[Math.floor(Math.random() * quotes.length)]
    setCurrentQuote(q)
  }, [])

  const fetchRandomPokemon = useCallback(async () => {
    setPokemonLoading(true)
    try {
      const id = Math.floor(Math.random() * 898) + 1
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      const data = await res.json()
      setPokemonData({
        name: data.name,
        id: data.id,
        sprite: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
        types: data.types.map((t: { type: { name: string } }) => t.type.name),
        stats: data.stats.map((s: { stat: { name: string }; base_stat: number }) => ({
          name: s.stat.name,
          value: s.base_stat,
        })),
        height: data.height,
        weight: data.weight,
        abilities: data.abilities.map((a: { ability: { name: string } }) => a.ability.name),
      })
    } catch {
      setPokemonData(null)
    } finally {
      setPokemonLoading(false)
    }
  }, [])

  const selectOption = useCallback(
    (id: string) => {
      if (id === 'introduce') {
        setIntroLineIdx(0)
        setIntroCharIdx(0)
        setIntroComplete(false)
        setAppState('introduce')
      } else if (id === 'recommend') {
        pickRandomPosts()
        setAppState('recommend')
      } else if (id === 'quotes') {
        pickRandomQuote()
        setAppState('quotes')
      } else if (id === 'pokemon') {
        setPokemonModalOpen(true)
        fetchRandomPokemon()
      }
    },
    [pickRandomPosts, pickRandomQuote, fetchRandomPokemon]
  )

  const goBack = useCallback(() => {
    setMenuPromptTyped(menuPrompt)
    setActiveOption(0)
    setAppState('menu')
  }, [])

  // --- Keyboard nav for menu ---
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (appState !== 'menu') return
      carouselPaused.current = true
      setCarouselProgress(0)
      if (e.key === 'ArrowDown' || e.key === 'Tab') {
        e.preventDefault()
        setActiveOption((o) => (o + 1) % menuOptions.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveOption((o) => (o - 1 + menuOptions.length) % menuOptions.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        selectOption(menuOptions[activeOption].id)
      }
    },
    [appState, activeOption, selectOption]
  )

  useEffect(() => {
    if (appState === 'menu' && menuPromptTyped === menuPrompt) {
      containerRef.current?.focus()
    }
  }, [appState, menuPromptTyped])

  return (
    <>
      <div ref={wrapperRef} className="mb-8">
        <div
          ref={containerRef}
          role="toolbar"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          style={{
            maxHeight: collapsed ? '0px' : '600px',
            opacity: collapsed ? 0 : 1,
            marginBottom: collapsed ? 0 : undefined,
          }}
          className="mx-auto w-full max-w-4xl overflow-hidden font-mono text-sm transition-all duration-500 ease-in-out outline-none md:text-base"
        >
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-gray-800 shadow-lg dark:border-gray-700 dark:bg-[#212121] dark:text-[#e0e0e0] dark:shadow-2xl">
            {/* Title bar */}
            <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-100 px-4 py-3 dark:border-gray-700 dark:bg-[#2a2a2a]">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-3 text-gray-500 dark:text-[#7b7f87]">AlohaYo Terminal</span>
            </div>

            {/* Content */}
            <div className="min-h-[320px] p-6 md:min-h-[360px] md:p-8">
              {/* Splash */}
              {appState === 'splash' && (
                <div className="text-green-600 dark:text-green-400">
                  <p>
                    {typedCmd}
                    {splashStage === 'typing-cmd' && <span className="animate-pulse">_</span>}
                  </p>
                  {splashStage !== 'typing-cmd' && (
                    <>
                      <pre className="mt-2 text-xs leading-relaxed md:text-sm">
                        {opencodeSplash.lines.map((line, i) => (
                          <span key={i} className={line.color}>
                            {line.text}
                            {'\n'}
                          </span>
                        ))}
                      </pre>
                      <div className="mt-4 flex items-center gap-3">
                        <span className="inline-flex gap-1">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-green-500 [animation-delay:0ms]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-green-500 [animation-delay:150ms]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-green-500 [animation-delay:300ms]" />
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Loading skill alohayo...
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Menu */}
              {appState === 'menu' && (
                <div className="space-y-4">
                  <p className="text-cyan-600 dark:text-cyan-400">
                    <span className="mr-2 text-orange-500 dark:text-[#fab283]">⌬</span>
                    {menuPromptTyped}
                    {menuPromptTyped.length < menuPrompt.length && (
                      <span className="animate-pulse">_</span>
                    )}
                  </p>
                  {menuPromptTyped === menuPrompt && (
                    <div className="mt-4 space-y-1">
                      {menuOptions.map((opt, i) => (
                        <button
                          key={opt.id}
                          ref={(el) => {
                            optionRefs.current[i] = el
                          }}
                          className={`relative block w-full cursor-pointer rounded px-3 py-2 text-left transition-all ${
                            i === activeOption
                              ? 'bg-gray-200 text-blue-600 dark:bg-[#333] dark:text-[#5c9cf5]'
                              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                          }`}
                          onMouseEnter={() => {
                            carouselPaused.current = true
                            setCarouselProgress(0)
                            setActiveOption(i)
                          }}
                          onMouseLeave={() => {
                            carouselPaused.current = false
                          }}
                          onClick={() => selectOption(opt.id)}
                        >
                          <span className="mr-2">{i === activeOption ? '👉' : '  '}</span>
                          {opt.label}
                          {i === activeOption && (
                            <span className="ml-3 text-xs text-gray-400/70 italic dark:text-gray-500/70">
                              {opt.description}
                            </span>
                          )}
                          {i === activeOption && !carouselPaused.current && (
                            <div
                              className="absolute bottom-0 left-0 h-0.5 bg-blue-400/40 transition-all duration-75 dark:bg-[#5c9cf5]/40"
                              style={{ width: `${carouselProgress}%` }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Introduce */}
              {appState === 'introduce' && (
                <IntroduceView
                  introLines={introLines}
                  introLineIdx={introLineIdx}
                  introCharIdx={introCharIdx}
                  introComplete={introComplete}
                  goBack={goBack}
                />
              )}

              {/* Recommend */}
              {appState === 'recommend' && (
                <RecommendView
                  posts={recommendedPosts}
                  onShuffle={pickRandomPosts}
                  goBack={goBack}
                />
              )}

              {/* Quotes */}
              {appState === 'quotes' && (
                <QuotesView quote={currentQuote} onReroll={pickRandomQuote} goBack={goBack} />
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-400 dark:border-gray-700 dark:text-[#7b7f87]">
              claude-sonnet-4-20250514
            </div>
          </div>
        </div>
      </div>

      {pokemonModalOpen && (
        <PokemonModal
          pokemon={pokemonData}
          loading={pokemonLoading}
          onClose={() => setPokemonModalOpen(false)}
          onReroll={fetchRandomPokemon}
        />
      )}
    </>
  )
}
