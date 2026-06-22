'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { opencodeSplash } from '@/data/splashes/opencode'
import { quotes } from '@/data/quotes'

// --- Live2D interaction helper ---
function showWaifuMessage(text: string, duration = 6000) {
  const tips = document.getElementById('waifu-tips')
  if (!tips) return
  tips.innerHTML = text
  tips.classList.add('waifu-tips-active')
  setTimeout(() => {
    tips.classList.remove('waifu-tips-active')
  }, duration)
}

const waifuMenuMessages: Record<string, string[]> = {
  introduce: [
    '想了解主人吗？点这里可以看到他的身份、技术栈和人生哲学哦！',
    '这里有主人的自我介绍～从工程师到 Gamer，什么都有！',
    '快去看看主人是个什么样的人吧～保证有趣！',
    '主人说他是 null-stack 工程师…到底是谦虚还是摆烂呢？🤔',
    '嘿嘿，主人的人生可精彩了，拿铁、代码、魂系游戏三件套！☕',
    '点进去看看吧～主人的故事比他写的 bug 还多呢！',
    '主人平时很低调的，但是这里藏了好多秘密哦～',
    '想知道主人为什么叫 AlohaYo 吗？点进来就知道啦！🌺',
  ],
  recommend: [
    '想看看主人推荐的文章吗？每次都是随机的惊喜哦！',
    '让命运来决定你今天读什么博客吧～✨',
    '主人的文章可都是精心写的，随便看都不会踩雷！',
    '随机推荐！像开盲盒一样刺激～会抽到什么呢？📦',
    '每篇文章都是主人的心血结晶，随便点一篇都很棒的！',
    '要不要试试手气？说不定今天推荐的文章正好是你需要的！🎯',
    '主人写博客的时候可认真了，边喝拿铁边写的那种～',
    '随机推荐功能上线！点一下就能发现宝藏文章✨',
  ],
  quotes: [
    '想听一句主人收藏的金句吗？有技术的、有哲学的、还有游戏的！',
    '名言名句时间到！主人收集了好多有趣的语录呢～',
    '每次刷新都是不同的句子，就像扭蛋一样有趣！',
    '来一句灵魂拷问？还是来一句心灵鸡汤？全看运气！🎲',
    '主人的语录收藏夹可是跨越了编程、哲学和游戏三界的！',
    '据说看完这些语录会突然想写代码…或者想打游戏 😂',
    '有些句子是主人自己说的，有些是他崇拜的人说的～猜猜看？',
    '点一下就能获得今日份的精神力量！💪',
  ],
  pokemon: [
    '要抽宝可梦了吗！！好激动！希望能抽到传说中的神兽！✨',
    '宝可梦时间！主人最喜欢龙系和火系了～你呢？',
    '快来试试手气吧！据说主人抽到过闪光 Charizard 呢！🔥',
    '我也想要一只伊布！快帮我抽一只吧～',
    '宝可梦大师球准备好了吗？要用力扔哦！⚡',
    '希望今天能遇到稀有宝可梦！闪光的那种！✨✨✨',
    '主人说如果抽到喷火龙就请我吃冰淇淋…快点吧！🍦',
    '据说第一世代的宝可梦最经典！你觉得呢？',
    '如果能在现实中养宝可梦的话，我想养一只六尾～🦊',
    '今天的幸运宝可梦会是谁呢？好期待好期待！',
  ],
  game: [
    '一整个世界正等着从种子里醒来。进去看看今天的大陆长什么样吧！',
    '这是主人新造的地图世界～山脉、森林、海岸都由一个种子生成！',
    '准备好探索了吗？游戏资源只会在你按下开始之后加载哦。',
    '每一个种子都是一张不同的世界地图。今天会遇见怎样的岛屿呢？',
  ],
}

function showWaifuMenuHint(menuId: string) {
  const msgs = waifuMenuMessages[menuId]
  if (!msgs) return
  showWaifuMessage(
    msgs[Math.floor(Math.random() * msgs.length)],
    menuId === 'pokemon' ? 6500 : 4000
  )
}

import { renderNeonText, renderGamerText } from './NeonFlicker'

// --- Data ---

type IntroTopic = { id: string; label: string; lines: string[] }

const introGreeting = "Hey, I'm AlohaYo (Garfield Zhu) — a full-stack engineer based in Hangzhou."

const introTopics: IntroTopic[] = [
  {
    id: 'identity',
    label: 'Identity',
    lines: [
      "I'm an ordinary yet laid-back software engineer at MSTR.",
      'My drive stems from the thrill of crafting fresh and engaging code, fueled by daily lattes.',
      'I find joy in basking in the afternoon sun, exploring video games, and animation.',
      "Nowadays, summoning agents to building stuffs is part of my work and life. But in my heart, I'd love more to summon a Pokemon.",
    ],
  },
  {
    id: 'gamer',
    label: 'As a Gamer',
    lines: [
      "I'm a full-stack gamer and huge fan of Hidetaka Miyazaki.",
      "I've traveled from Boletaria to the Lands Between, linked the fire from Lordran to Lothric.",
      'Strolled through the alleys of Yharnam to beneath the walls of Ashina Castle.',
      "If you conquer a Souls-like game, you'll embrace every moment of life differently.",
      'Long may the sun shine! ☀️',
      '"If you can\'t find me on GitHub or Teams, explore my footsteps in the gaming world."',
    ],
  },
  {
    id: 'stack',
    label: 'As a Developer',
    lines: [
      'TypeScript, Java, Python, Go, Rust, C++ — whatever gets the job done.',
      'Primary env: React + TypeScript, Spring + Java, Kubernetes + k9s',
      'Was passionate about debating which stack is superior...',
      'Now I realize my stack is surprisingly FULL.',
      'In the LLM age, crafting software feels less like engineering and more like art.',
      'Agents are 3D printers — I draw a blueprints, they craft stuffs. Still, my chisel is useful to carve and polish the artifacts.',
    ],
  },
  {
    id: 'attitude',
    label: 'As a Skill',
    lines: [
      'Have opinions, and be firm. Admit when wrong — but only when actually wrong.',
      'Answer directly, no preamble. Brevity is a virtue.',
      'Code should be readable cold six months later.',
      'Structure reveals intent without comments. Edge cases handled, not ignored.',
      'Start with the simplest hypothesis — most bugs are embarrassingly simple.',
      'Humor is allowed. Call out problems — charming, not cruel.',
    ],
  },
]

type MenuOption = { id: string; label: string; description: string; hidden?: boolean }

const menuOptions: MenuOption[] = [
  { id: 'introduce', label: 'Introduce AlohaYo', description: 'click to learn about me' },
  { id: 'recommend', label: 'Recommend the blog', description: 'click to discover random posts' },
  { id: 'quotes', label: 'Roll a quotes', description: 'click to get a quote' },
  { id: 'pokemon', label: 'Roll a Pokemon today', description: 'click to catch a random Pokemon' },
  { id: 'game', label: 'Enter the World', description: 'click to generate a world' },
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

function getPokemonTypeStyle(type?: string) {
  switch (type) {
    case 'fire':
      return {
        glow: 'from-orange-500/25 via-amber-400/10 to-transparent',
        ring: 'ring-orange-300/40 dark:ring-orange-500/30',
      }
    case 'water':
      return {
        glow: 'from-sky-500/25 via-cyan-400/10 to-transparent',
        ring: 'ring-sky-300/40 dark:ring-cyan-500/30',
      }
    case 'electric':
      return {
        glow: 'from-yellow-400/25 via-amber-300/10 to-transparent',
        ring: 'ring-yellow-300/50 dark:ring-yellow-500/30',
      }
    case 'grass':
      return {
        glow: 'from-lime-500/25 via-emerald-400/10 to-transparent',
        ring: 'ring-lime-300/40 dark:ring-emerald-500/30',
      }
    case 'psychic':
      return {
        glow: 'from-pink-500/25 via-fuchsia-400/10 to-transparent',
        ring: 'ring-pink-300/40 dark:ring-fuchsia-500/30',
      }
    case 'ghost':
    case 'dragon':
      return {
        glow: 'from-violet-500/25 via-indigo-400/10 to-transparent',
        ring: 'ring-violet-300/40 dark:ring-violet-500/30',
      }
    default:
      return {
        glow: 'from-cyan-500/20 via-sky-400/10 to-transparent',
        ring: 'ring-slate-300/60 dark:ring-cyan-500/20',
      }
  }
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

  const primaryType = pokemon?.types[0]
  const typeStyle = getPokemonTypeStyle(primaryType)

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pokemon-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-md"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        role="document"
        id="pokemon-modal"
        className={`relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/70 bg-white/92 shadow-[0_30px_90px_rgba(15,23,42,0.24)] ring-1 ${typeStyle.ring} dark:border-white/10 dark:bg-slate-950/92`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${typeStyle.glow}`}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.65),transparent_70%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_70%)]" />
        {loading && (
          <div className="flex h-72 flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500 dark:border-slate-700 dark:border-t-cyan-300" />
            <p className="font-mono text-sm text-slate-500 dark:text-slate-300">
              Scanning tall grass…
            </p>
          </div>
        )}

        {!loading && pokemon && (
          <div className="relative grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
            <div className="relative flex min-h-[320px] flex-col justify-between overflow-hidden px-6 py-8 md:px-8">
              <div className="absolute top-6 left-6 rounded-full border border-white/70 bg-white/75 px-3 py-1 font-mono text-[11px] tracking-[0.28em] text-slate-500 uppercase shadow-sm dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300">
                Daily Catch
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8),transparent_58%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_58%)]" />
              <div className="relative flex flex-1 flex-col items-center justify-center">
                <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.15)] dark:border-white/10 dark:bg-slate-900/65">
                  <div className="absolute inset-5 rounded-full border border-dashed border-slate-200 dark:border-slate-700" />
                  <img
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    className="pixelated relative z-10 h-32 w-32 drop-shadow-[0_10px_20px_rgba(15,23,42,0.2)]"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <p className="relative mt-5 font-mono text-xs tracking-[0.24em] text-slate-500 uppercase dark:text-slate-400">
                  A neat little companion wandered in
                </p>
              </div>
              <div className="relative mt-6 flex flex-wrap items-center justify-start gap-3">
                <button
                  onClick={onReroll}
                  className="cursor-pointer rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-500 hover:to-blue-500"
                >
                  🎲 Catch another
                </button>
                <a
                  href={`https://wiki.52poke.com/wiki/${pokemon.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-slate-300 bg-white/75 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  📖 Open wiki
                </a>
              </div>
            </div>

            <div className="relative border-t border-slate-200/80 px-6 py-6 md:border-t-0 md:border-l md:px-8 dark:border-white/10">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-500 shadow-sm transition hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                aria-label="Close Pokemon dialog"
              >
                ✕
              </button>
              <div className="flex items-start justify-between gap-4 pr-12">
                <div className="min-w-0">
                  <h3
                    id="pokemon-modal-title"
                    className="text-3xl font-black text-slate-900 capitalize dark:text-white"
                  >
                    {pokemon.name}
                  </h3>
                  <p className="mt-1 font-mono text-sm text-slate-400 dark:text-slate-500">
                    #{pokemon.id.toString().padStart(4, '0')}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {pokemon.types.map((type) => (
                      <span
                        key={type}
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase ${typeColors[type] || 'bg-gray-400 text-white'}`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="font-mono text-[11px] tracking-[0.18em] text-slate-400 uppercase">
                    Height
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {pokemon.height / 10}m
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="font-mono text-[11px] tracking-[0.18em] text-slate-400 uppercase">
                    Weight
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {pokemon.weight / 10}kg
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="font-mono text-[11px] tracking-[0.18em] text-slate-400 uppercase">
                  Abilities
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700 capitalize dark:text-slate-300">
                  {pokemon.abilities.join(', ')}
                </p>
              </div>

              <div className="mt-5 space-y-2">
                <p className="font-mono text-[11px] tracking-[0.18em] text-slate-400 uppercase">
                  Battle Readout
                </p>
                {pokemon.stats.map((stat) => (
                  <div
                    key={stat.name}
                    className="rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-2.5 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="text-xs font-medium text-slate-500 capitalize dark:text-slate-400">
                        {stat.name.replace('special-', 'sp.')}
                      </span>
                      <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                        {stat.value}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full transition-[width]"
                        style={{
                          width: `${Math.min(100, (stat.value / 255) * 100)}%`,
                          backgroundColor: getStatColor(stat.value),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={onClose}
                  className="rounded-2xl px-2 py-2 text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Back to terminal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// --- Feature Views ---

function IntroduceView({ goBack }: { goBack: () => void }) {
  const [subState, setSubState] = useState<'menu' | 'detail'>('menu')
  const [activeTopic, setActiveTopic] = useState(0)
  const [selectedTopic, setSelectedTopic] = useState<IntroTopic | null>(null)
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [typingDone, setTypingDone] = useState(false)

  useEffect(() => {
    if (subState !== 'detail' || !selectedTopic || typingDone) return
    const line = selectedTopic.lines[lineIdx]
    if (!line) {
      setTypingDone(true)
      return
    }
    if (charIdx < line.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 20)
      return () => clearTimeout(t)
    } else if (lineIdx < selectedTopic.lines.length - 1) {
      const t = setTimeout(() => {
        setLineIdx((i) => i + 1)
        setCharIdx(0)
      }, 300)
      return () => clearTimeout(t)
    } else {
      setTypingDone(true)
    }
  }, [subState, selectedTopic, lineIdx, charIdx, typingDone])

  const selectTopic = (topic: IntroTopic) => {
    setSelectedTopic(topic)
    setLineIdx(0)
    setCharIdx(0)
    setTypingDone(false)
    setSubState('detail')
  }

  const backToMenu = () => {
    setSubState('menu')
    setSelectedTopic(null)
  }

  return (
    <div className="space-y-3">
      <p className="mb-4 text-gray-500">
        <span className="mr-2 text-blue-500 dark:text-[#5c9cf5]">❯</span>Introduce AlohaYo
      </p>

      {subState === 'menu' && (
        <>
          <p className="mb-3 text-gray-700 dark:text-gray-300">{renderNeonText(introGreeting)}</p>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            What would you like to know?
          </p>
          <div className="space-y-1">
            {introTopics.map((topic, i) => (
              <button
                key={topic.id}
                className="relative block w-full cursor-pointer text-left text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                onMouseEnter={() => setActiveTopic(i)}
                onClick={() => selectTopic(topic)}
              >
                <span className="mr-2">{i === activeTopic ? '👉' : '  '}</span>
                {topic.label}
              </button>
            ))}
          </div>
          <button
            onClick={goBack}
            className="mt-4 cursor-pointer text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
          >
            ← back
          </button>
        </>
      )}

      {subState === 'detail' && selectedTopic && (
        <>
          <p className="mb-2 text-sm text-blue-500 dark:text-[#5c9cf5]">
            {'>'} {selectedTopic.label}
          </p>
          <div className="space-y-2 border-l-4 border-orange-400 pl-3 dark:border-[#fab283]">
            {selectedTopic.lines.slice(0, lineIdx + 1).map((line, i) => (
              <p key={i} className="text-gray-800 dark:text-[#e0e0e0]">
                <span className="mr-2 text-orange-500 dark:text-[#fab283]">•</span>
                {i < lineIdx
                  ? selectedTopic.id === 'gamer'
                    ? renderGamerText(line)
                    : renderNeonText(line)
                  : line.slice(0, charIdx)}
                {i === lineIdx && !typingDone && <span className="animate-pulse">_</span>}
              </p>
            ))}
          </div>
          {typingDone && (
            <button
              onClick={backToMenu}
              className="mt-4 cursor-pointer text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
            >
              ← back
            </button>
          )}
        </>
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
  const router = useRouter()
  const [appState, setAppState] = useState<AppState>('splash')
  const [splashStage, setSplashStage] = useState<'typing-cmd' | 'showing' | 'done'>('typing-cmd')
  const [typedCmd, setTypedCmd] = useState('')
  const [activeOption, setActiveOption] = useState(0)
  const [menuPromptTyped, setMenuPromptTyped] = useState('')

  const [recommendedPosts, setRecommendedPosts] = useState<typeof posts>([])
  const [currentQuote, setCurrentQuote] = useState(quotes[0])

  const [pokemonModalOpen, setPokemonModalOpen] = useState(false)
  const [pokemonData, setPokemonData] = useState<PokemonData | null>(null)
  const [pokemonLoading, setPokemonLoading] = useState(false)

  const [isClosed, setIsClosed] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

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
      const t = setTimeout(() => setSplashStage('done'), 2000)
      return () => clearTimeout(t)
    }
    if (splashStage === 'done') {
      const t = setTimeout(() => setAppState('menu'), 200)
      return () => clearTimeout(t)
    }
  }, [appState, splashStage, typedCmd])

  // --- Menu prompt typing ---
  const menuPrompt = "Hi, I'm AlohaYo. What would you like me to do?"
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
      const pokeName = data.name.charAt(0).toUpperCase() + data.name.slice(1)
      const typeStr = data.types.map((t: { type: { name: string } }) => t.type.name).join('/')
      const pokeMsgs = [
        `哇！抽到了 <span>${pokeName}</span>！${typeStr} 属性的哦～`,
        `是 <span>${pokeName}</span> 呢！看起来好强的样子！`,
        `<span>${pokeName}</span> 出现了！快用宝可梦球收服它！`,
        `好可爱的 <span>${pokeName}</span>！主人一定很想要这只！`,
      ]
      showWaifuMessage(pokeMsgs[Math.floor(Math.random() * pokeMsgs.length)], 8500)
    } catch {
      setPokemonData(null)
    } finally {
      setPokemonLoading(false)
    }
  }, [])

  const selectOption = useCallback(
    (id: string) => {
      if (id === 'introduce') {
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
      } else if (id === 'game') {
        router.push('/game')
      }
    },
    [pickRandomPosts, pickRandomQuote, fetchRandomPokemon, router]
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
      {!isClosed && (
        <div
          ref={wrapperRef}
          className={`my-12 scroll-mt-24 ${
            isFullscreen
              ? 'fixed inset-0 z-50 m-0 bg-white/50 backdrop-blur-sm dark:bg-black/50'
              : ''
          }`}
        >
          <div
            ref={containerRef}
            role="toolbar"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            style={{
              maxHeight: isFullscreen ? '100vh' : collapsed ? '0px' : '600px',
              height: isFullscreen ? '100vh' : 'auto',
              opacity: collapsed && !isFullscreen ? 0 : isMinimized ? 0 : 1,
              marginBottom: collapsed && !isFullscreen ? '0px' : '2rem',
              transform: isMinimized ? 'scale(0.15) translate(50vw, 50vh)' : 'none',
              transformOrigin: 'bottom right',
            }}
            className={`mx-auto overflow-hidden font-mono text-sm transition-all duration-500 ease-in-out outline-none md:text-base ${
              isFullscreen ? 'h-full w-full max-w-none' : 'w-full max-w-4xl'
            } ${isMinimized ? 'pointer-events-none' : ''}`}
          >
            <div
              className={`overflow-hidden border border-gray-200 bg-gray-50 text-gray-800 shadow-lg transition-all duration-500 dark:border-gray-700 dark:bg-[#212121] dark:text-[#e0e0e0] dark:shadow-2xl ${
                isFullscreen ? 'flex h-full flex-col rounded-none' : 'rounded-lg'
              }`}
            >
              {/* Title bar */}
              <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-100 px-4 py-3 dark:border-gray-700 dark:bg-[#2a2a2a]">
                <div className="group flex items-center gap-2">
                  <button
                    onClick={() => setIsClosed(true)}
                    className="flex h-3 w-3 cursor-pointer items-center justify-center rounded-full bg-red-500 transition-colors hover:bg-red-600"
                  >
                    <span className="text-[8px] leading-none font-bold text-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      ×
                    </span>
                  </button>
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="flex h-3 w-3 cursor-pointer items-center justify-center rounded-full bg-yellow-500 transition-colors hover:bg-yellow-600"
                  >
                    <span className="text-[8px] leading-none font-bold text-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      −
                    </span>
                  </button>
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="flex h-3 w-3 cursor-pointer items-center justify-center rounded-full bg-green-500 transition-colors hover:bg-green-600"
                  >
                    <span className="text-[8px] leading-none font-bold text-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      +
                    </span>
                  </button>
                </div>
                <span className="ml-3 text-gray-500 dark:text-[#7b7f87]">AlohaYo Terminal</span>
              </div>

              {/* Content */}
              <div
                className={`p-6 md:p-8 ${isFullscreen ? 'flex-1 overflow-y-auto' : 'min-h-[320px] md:min-h-[360px]'}`}
              >
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
                            data-menu-id={opt.id}
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
                              showWaifuMenuHint(opt.id)
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
                {appState === 'introduce' && <IntroduceView goBack={goBack} />}

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
      )}

      {isMinimized && !isClosed && (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed right-6 bottom-6 z-50 flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-xl transition-transform hover:scale-105 dark:border-gray-700 dark:bg-[#212121] dark:text-[#e0e0e0]"
        >
          <span className="text-orange-500 dark:text-[#fab283]">⌬</span>
          Terminal
        </button>
      )}

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
