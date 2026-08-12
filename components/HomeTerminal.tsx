'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  DEFAULT_HOME_SPLASH_ID,
  getHomeSplashById,
  visibleHomeSplashes,
} from '@/data/splashes/home'
import { quotes } from '@/data/quotes'
import { useLocale } from './LocaleProvider'
import { getLocalePath, getMessages } from '@/lib/i18n'
import ChinesePoemView from './ChinesePoemView'
import { fetchRandomChinesePoem, type ChinesePoem } from '@/lib/poetry'

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

const englishWaifuMenuMessages: Record<string, string[]> = {
  introduce: [
    'Want to know the master? His identity, stack, and life philosophy are hiding here~',
    'Here is the master’s self-introduction—from engineer to gamer, the whole messy bundle!',
    'Go see what kind of person the master is. I promise there are no production bugs inside~',
    'He calls himself a Null-stack engineer… humble, or simply refusing to pick a stack? 🤔',
    'Coffee, code, and Souls games: the master’s little life trilogy ☕',
    'Click in—his story has more twists than the bugs he writes!',
    'The master is quiet in public, but this page has a few secrets~',
    'Want to know why he is called AlohaYo? Come and see! 🌺',
  ],
  recommend: [
    'Want a random article from the master’s shelf?',
    'Let fate choose your reading today~ ✨',
    'These posts are written with care. The occasional typo is also handcrafted.',
    'A blog blind box! Let’s see what comes out~ 📦',
    'Every article is a small piece of the master’s heart. Dramatic, but true.',
    'Try your luck—today’s post might be exactly the one you need! 🎯',
    'He writes with a latte beside him. This is apparently a process requirement~',
    'Random recommendation is live. One click, one tiny treasure hunt ✨',
  ],
  quotes: [
    'Want one of the master’s collected lines? There are technical, philosophical, and game ones!',
    'Quote time! The master keeps a surprisingly large drawer of these~',
    'A different sentence each time, like a tiny quote capsule toy.',
    'A soul question or a little soup for the soul? Luck decides! 🎲',
    'This collection crosses programming, philosophy, and games. It refuses to stay in one genre.',
    'You may finish a quote and suddenly want to code… or play a game 😂',
    'Some lines are the master’s, some belong to people he admires. Guess which is which~',
    'One click for today’s small dose of courage 💪',
  ],
  pokemon: [
    'A Pokémon draw! I hope we get a legendary one! ✨',
    'Pokémon time. The master likes dragons and fire types—what about you?',
    'Try your luck! Rumour says the master once pulled a shiny Charizard 🔥',
    'I want an Eevee too. Please help me catch one~',
    'Master Ball ready? Throw it with feeling! ⚡',
    'Maybe today we meet a rare shiny one! ✨✨✨',
    'The master promised ice cream if we pull a Charizard… please hurry! 🍦',
    'The first generation is classic. I will accept no debate (maybe).',
    'If Pokémon were real, I would raise a Vulpix~ 🦊',
    'Who will be today’s lucky Pokémon? I’m excited, I’m excited!',
  ],
  game: [
    'A whole world is waiting to wake up from a seed. See what the continent looks like today!',
    'The master made this map: mountains, forests, and coasts from one little seed~',
    'Ready to explore? The game resources wait until you press start.',
    'Every seed makes a different world. I wonder which island you will find today?',
  ],
}

function showWaifuMenuHint(menuId: string, locale: 'en' | 'zh-CN' = 'zh-CN') {
  const msgs = (locale === 'en' ? englishWaifuMenuMessages : waifuMenuMessages)[menuId]
  if (!msgs) return
  showWaifuMessage(
    msgs[Math.floor(Math.random() * msgs.length)],
    menuId === 'pokemon' ? 6500 : 4000
  )
}

import { renderNeonText, renderGamerText } from './NeonFlicker'

// --- Data ---

type IntroTopic = { id: string; label: string; lines: string[] }

type IntroContent = { greeting: string; topics: IntroTopic[] }

const introContent: Record<'en' | 'zh-CN', IntroContent> = {
  en: {
    greeting: "Hey, I'm AlohaYo (Garfield Zhu) — a full-stack engineer based in Hangzhou.",
    topics: [
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
    ],
  },
  'zh-CN': {
    greeting: '嗨，我是 AlohaYo（Garfield Zhu）——一个在杭州生活的 full-stack 工程师。',
    topics: [
      {
        id: 'identity',
        label: '身份',
        lines: [
          '我只是 MSTR 里一个普通又有点懒散的软件工程师。',
          '每天靠拿铁和写点新鲜、有趣的代码续命。',
          '下午晒晒太阳，玩游戏，看动画，这些都是快乐。',
          '现在召唤智能体做东西已经是工作和生活的一部分了。不过说真的，我还是更想召唤一只宝可梦。',
        ],
      },
      {
        id: 'gamer',
        label: '作为玩家',
        lines: [
          '我是一个 full-stack 玩家，也是宫崎英高桑和他的魂血狼环的粉丝。',
          '我从 Boletaria 走到 Lands Between，把 Lordran 的火传到 Lothric。',
          '也穿过 Yharnam 的小巷，走到 Ashina Castle 的城墙下。',
          '如果你打通一款魂血狼环，大概会用不一样的眼光拥抱生活。',
          '太阳啊，永远照耀！☀️',
          '“如果你在 GitHub 或 Teams 找不到我，就去游戏世界里找我的脚印。”',
        ],
      },
      {
        id: 'stack',
        label: '作为开发者',
        lines: [
          'TypeScript、Java、Python、Go、Rust、C++——能把事情做完就行。',
          '主力环境：React + TypeScript、Spring + Java、Kubernetes + k9s。',
          '以前也很热衷争论哪个技术栈更好……',
          '现在我发现，我的技术栈意外地很 FULL。',
          'LLM 时代，做软件越来越不像硬邦邦的工程，更像一种手艺，甚至有点艺术。',
          '智能体像 3D 打印机——我画蓝图，它们做东西。不过最后的凿子和打磨，还是得我来。',
        ],
      },
      {
        id: 'attitude',
        label: '作为习惯',
        lines: [
          '要有自己的判断，而且要坚定。错了就承认——前提是真的错。',
          '直接回答，少一点铺垫。简洁是美德。',
          '代码要能让六个月后的自己读懂。',
          '结构应该自己说明意图，边界情况要处理，不要装作不存在。',
          '先从最简单的假设开始——大多数 bug 都简单得有点尴尬。',
          '可以幽默，但要指出问题；可爱一点，不要刻薄。',
        ],
      },
    ],
  },
}

type MenuOption = { id: string; label: string; description: string; hidden?: boolean }

const menuOptions: MenuOption[] = [
  { id: 'introduce', label: 'Introduce AlohaYo', description: 'click to learn about me' },
  { id: 'recommend', label: 'Recommend the blog', description: 'click to discover random posts' },
  { id: 'quotes', label: 'Roll a quotes', description: 'click to get a quote' },
  { id: 'pokemon', label: 'Roll a Pokemon today', description: 'click to catch a random Pokemon' },
  { id: 'game', label: 'Enter the World', description: 'click to generate a world' },
]

const chineseMenuOptions: MenuOption[] = [
  { id: 'introduce', label: '认识 AlohaYo', description: '点这里了解我' },
  { id: 'recommend', label: '推荐博客', description: '随机发现几篇文章' },
  { id: 'quotes', label: '今日随机诗词', description: '从诗泉取一首古诗' },
  { id: 'pokemon', label: '今天抽一只宝可梦', description: '随机抓一只宝可梦' },
  { id: 'game', label: '进入世界', description: '生成一片世界' },
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
  localizedNames: { en: string; zh?: string }
  id: number
  sprite: string
  types: string[]
  stats: { name: string; value: number }[]
  height: number
  weight: number
  abilities: string[]
}

const pokemonSpeciesNameCache = new Map<number, { en: string; zh?: string }>()

async function fetchPokemonNames(id: number, fallback: string) {
  const cached = pokemonSpeciesNameCache.get(id)
  if (cached) return cached

  const fallbackNames = {
    en: fallback.charAt(0).toUpperCase() + fallback.slice(1),
  }

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`)
    if (!response.ok) return fallbackNames
    const species = await response.json()
    const names = Array.isArray(species.names) ? species.names : []
    const english = names.find(
      (entry: { name?: unknown; language?: { name?: unknown } }) =>
        entry.language?.name === 'en' && typeof entry.name === 'string'
    )?.name
    const simplifiedChinese = names.find(
      (entry: { name?: unknown; language?: { name?: unknown } }) =>
        typeof entry.language?.name === 'string' &&
        entry.language.name.toLowerCase() === 'zh-hans' &&
        typeof entry.name === 'string'
    )?.name
    const localizedNames = {
      en: typeof english === 'string' ? english : fallbackNames.en,
      ...(typeof simplifiedChinese === 'string' ? { zh: simplifiedChinese } : {}),
    }
    pokemonSpeciesNameCache.set(id, localizedNames)
    return localizedNames
  } catch {
    return fallbackNames
  }
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
  const { locale, messages } = useLocale()
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const primaryType = pokemon?.types[0]
  const typeStyle = getPokemonTypeStyle(primaryType)
  const displayName = pokemon
    ? locale === 'zh-CN'
      ? pokemon.localizedNames.zh || pokemon.localizedNames.en
      : pokemon.localizedNames.en
    : ''

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
              {messages.terminal.scanGrass}
            </p>
          </div>
        )}

        {!loading && pokemon && (
          <div className="relative grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
            <div className="relative flex min-h-[320px] flex-col justify-between overflow-hidden px-6 py-8 md:px-8">
              <div className="absolute top-6 left-6 rounded-full border border-white/70 bg-white/75 px-3 py-1 font-mono text-[11px] tracking-[0.28em] text-slate-500 uppercase shadow-sm dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300">
                {messages.terminal.dailyCatch}
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8),transparent_58%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_58%)]" />
              <div className="relative flex flex-1 flex-col items-center justify-center">
                <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.15)] dark:border-white/10 dark:bg-slate-900/65">
                  <div className="absolute inset-5 rounded-full border border-dashed border-slate-200 dark:border-slate-700" />
                  <img
                    src={pokemon.sprite}
                    alt={displayName}
                    className="pixelated relative z-10 h-32 w-32 drop-shadow-[0_10px_20px_rgba(15,23,42,0.2)]"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <p className="relative mt-5 font-mono text-xs tracking-[0.24em] text-slate-500 uppercase dark:text-slate-400">
                  {messages.terminal.companion}
                </p>
              </div>
              <div className="relative mt-6 flex flex-wrap items-center justify-start gap-3">
                <button
                  onClick={onReroll}
                  className="cursor-pointer rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-500 hover:to-blue-500"
                >
                  🎲 {messages.terminal.catchAnother}
                </button>
                <a
                  href={`https://wiki.52poke.com/wiki/${pokemon.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-slate-300 bg-white/75 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  📖 {messages.terminal.openWiki}
                </a>
              </div>
            </div>

            <div className="relative border-t border-slate-200/80 px-6 py-6 md:border-t-0 md:border-l md:px-8 dark:border-white/10">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-500 shadow-sm transition hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                aria-label={messages.terminal.closePokemon}
              >
                ✕
              </button>
              <div className="flex items-start justify-between gap-4 pr-12">
                <div className="min-w-0">
                  <h3
                    id="pokemon-modal-title"
                    className="text-3xl font-black text-slate-900 capitalize dark:text-white"
                  >
                    {displayName}
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
                    {messages.terminal.height}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {pokemon.height / 10}m
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="font-mono text-[11px] tracking-[0.18em] text-slate-400 uppercase">
                    {messages.terminal.weight}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {pokemon.weight / 10}kg
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="font-mono text-[11px] tracking-[0.18em] text-slate-400 uppercase">
                  {messages.terminal.abilities}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700 capitalize dark:text-slate-300">
                  {pokemon.abilities.join(', ')}
                </p>
              </div>

              <div className="mt-5 space-y-2">
                <p className="font-mono text-[11px] tracking-[0.18em] text-slate-400 uppercase">
                  {messages.terminal.battleReadout}
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
                  {messages.terminal.backToTerminal}
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

function IntroduceView({ goBack, locale }: { goBack: () => void; locale: 'en' | 'zh-CN' }) {
  const { messages } = useLocale()
  const intro = introContent[locale]
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
        <span className="mr-2 text-blue-500 dark:text-[#5c9cf5]">❯</span>
        {messages.terminal.introduceHeading}
      </p>

      {subState === 'menu' && (
        <>
          <p className="mb-3 text-gray-700 dark:text-gray-300">{renderNeonText(intro.greeting)}</p>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            {messages.terminal.whatToKnow}
          </p>
          <div className="space-y-1">
            {intro.topics.map((topic, i) => (
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
            ← {messages.terminal.back}
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
              ← {messages.terminal.back}
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
  const { messages, locale } = useLocale()
  return (
    <div className="space-y-3">
      <p className="mb-4 text-gray-500">
        <span className="mr-2 text-blue-500 dark:text-[#5c9cf5]">❯</span>
        {messages.terminal.recommend}
      </p>
      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={getLocalePath(`/blog/${post.slug}`, locale)}
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
          🔄 {messages.terminal.recommendOthers}
        </button>
        <button
          onClick={goBack}
          className="cursor-pointer text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
        >
          ← {messages.terminal.back}
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
  const { messages } = useLocale()
  return (
    <div className="space-y-3">
      <p className="mb-4 text-gray-500">
        <span className="mr-2 text-blue-500 dark:text-[#5c9cf5]">❯</span>
        {messages.terminal.quotes}
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
          🎲 {messages.terminal.rollAgain}
        </button>
        <button
          onClick={goBack}
          className="cursor-pointer text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
        >
          ← {messages.terminal.back}
        </button>
      </div>
    </div>
  )
}

// --- Component ---

type AppState = 'splash' | 'menu' | 'introduce' | 'recommend' | 'quotes' | 'poem'

interface HomeTerminalProps {
  posts: Array<{ slug: string; title: string; summary?: string; tags: string[] }>
  locale?: 'en' | 'zh-CN'
}

const HOME_SPLASH_STORAGE_KEY = 'alohayo-home-splash'

export default function HomeTerminal({ posts, locale: requestedLocale }: HomeTerminalProps) {
  const { locale: contextLocale } = useLocale()
  const [localeHydrated, setLocaleHydrated] = useState(false)
  useEffect(() => setLocaleHydrated(true), [])
  const locale = localeHydrated ? contextLocale : requestedLocale || contextLocale
  const messages = getMessages(locale)
  const activeMenuOptions = locale === 'zh-CN' ? chineseMenuOptions : menuOptions
  const menuPrompt = messages.terminal.prompt
  const router = useRouter()
  const [appState, setAppState] = useState<AppState>('splash')
  const [splashStage, setSplashStage] = useState<'typing-cmd' | 'showing' | 'done'>('typing-cmd')
  const [typedCmd, setTypedCmd] = useState('')
  const [activeSplashId, setActiveSplashId] = useState(DEFAULT_HOME_SPLASH_ID)
  const [splashStorageReady, setSplashStorageReady] = useState(false)
  const [activeOption, setActiveOption] = useState(0)
  const [menuPromptTyped, setMenuPromptTyped] = useState('')

  const [recommendedPosts, setRecommendedPosts] = useState<typeof posts>([])
  const [currentQuote, setCurrentQuote] = useState(quotes[0])
  const [currentPoem, setCurrentPoem] = useState<ChinesePoem | null>(null)
  const [poemLoading, setPoemLoading] = useState(false)
  const [poemError, setPoemError] = useState(false)

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
  const activeSplash = getHomeSplashById(activeSplashId) ?? visibleHomeSplashes[0]
  const previousLocale = useRef(locale)

  useEffect(() => {
    if (previousLocale.current === locale) return
    previousLocale.current = locale
    setAppState('menu')
    setMenuPromptTyped(menuPrompt)
    setActiveOption(0)
    setPoemLoading(false)
    setPoemError(false)
  }, [locale, menuPrompt])

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
  }, [locale])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(HOME_SPLASH_STORAGE_KEY)
    const resolved = getHomeSplashById(stored || '')
    if (resolved && !resolved.hidden) setActiveSplashId(resolved.id)
    setSplashStorageReady(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !splashStorageReady) return
    window.localStorage.setItem(HOME_SPLASH_STORAGE_KEY, activeSplash.id)
  }, [activeSplash.id, splashStorageReady])

  useEffect(() => {
    if (appState !== 'menu' || menuPromptTyped !== menuPrompt) return
    const t = setInterval(() => {
      if (carouselPaused.current) return
      setCarouselProgress((p) => {
        if (p >= 100) {
          setActiveOption((o) => (o + 1) % activeMenuOptions.length)
          return 0
        }
        return p + 100 / (CAROUSEL_INTERVAL / 50)
      })
    }, 50)
    return () => clearInterval(t)
  }, [appState, menuPromptTyped, menuPrompt, activeMenuOptions.length])

  // --- Splash animation ---
  useEffect(() => {
    if (appState !== 'splash') return
    const cmd = activeSplash.cmd
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
  }, [appState, splashStage, typedCmd, activeSplash.cmd])

  // --- Menu prompt typing ---
  const replaySplash = useCallback(() => {
    carouselPaused.current = false
    setCarouselProgress(0)
    setTypedCmd('')
    setMenuPromptTyped('')
    setSplashStage('typing-cmd')
    setAppState('splash')
  }, [])

  const cycleSplash = useCallback(() => {
    if (visibleHomeSplashes.length <= 1) return
    const currentIndex = visibleHomeSplashes.findIndex((splash) => splash.id === activeSplash.id)
    const nextSplash =
      visibleHomeSplashes[
        (currentIndex + 1 + visibleHomeSplashes.length) % visibleHomeSplashes.length
      ] ?? visibleHomeSplashes[0]
    setActiveSplashId(nextSplash.id)
    replaySplash()
  }, [activeSplash.id, replaySplash])

  useEffect(() => {
    if (appState !== 'menu') return
    if (menuPromptTyped.length < menuPrompt.length) {
      const t = setTimeout(
        () => setMenuPromptTyped(menuPrompt.slice(0, menuPromptTyped.length + 1)),
        20
      )
      return () => clearTimeout(t)
    }
  }, [appState, menuPromptTyped, menuPrompt])

  // --- Handlers ---
  const pickRandomPosts = useCallback(() => {
    const shuffled = [...posts].sort(() => Math.random() - 0.5)
    setRecommendedPosts(shuffled.slice(0, 3))
  }, [posts])

  const pickRandomQuote = useCallback(() => {
    const q = quotes[Math.floor(Math.random() * quotes.length)]
    setCurrentQuote(q)
  }, [])

  const fetchRandomPoem = useCallback(async () => {
    setPoemLoading(true)
    setPoemError(false)
    try {
      setCurrentPoem(await fetchRandomChinesePoem())
    } catch {
      setCurrentPoem(null)
      setPoemError(true)
    } finally {
      setPoemLoading(false)
    }
  }, [])

  const fetchRandomPokemon = useCallback(async () => {
    setPokemonLoading(true)
    try {
      const id = Math.floor(Math.random() * 898) + 1
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      const data = await res.json()
      const localizedNames = await fetchPokemonNames(data.id, data.name)
      setPokemonData({
        name: data.name,
        localizedNames,
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
      const pokeName =
        locale === 'zh-CN' ? localizedNames.zh || localizedNames.en : localizedNames.en
      const typeStr = data.types.map((t: { type: { name: string } }) => t.type.name).join('/')
      const pokeMsgs =
        locale === 'zh-CN'
          ? [
              `哇！抽到了 <span>${pokeName}</span>！${typeStr} 属性的哦～`,
              `是 <span>${pokeName}</span> 呢！看起来好强的样子！`,
              `<span>${pokeName}</span> 出现了！快用宝可梦球收服它！`,
              `好可爱的 <span>${pokeName}</span>！主人一定很想要这只！`,
            ]
          : [
              `Oh! We got <span>${pokeName}</span> — a ${typeStr} type!`,
              `It's <span>${pokeName}</span>! That one looks surprisingly strong.`,
              `<span>${pokeName}</span> appeared! Throw the Poké Ball!`,
              `What a cute <span>${pokeName}</span>. The boss will absolutely want this one.`,
            ]
      showWaifuMessage(pokeMsgs[Math.floor(Math.random() * pokeMsgs.length)], 8500)
    } catch {
      setPokemonData(null)
    } finally {
      setPokemonLoading(false)
    }
  }, [locale])

  const selectOption = useCallback(
    (id: string) => {
      if (id === 'introduce') {
        setAppState('introduce')
      } else if (id === 'recommend') {
        pickRandomPosts()
        setAppState('recommend')
      } else if (id === 'quotes') {
        if (locale === 'zh-CN') {
          setAppState('poem')
          fetchRandomPoem()
        } else {
          pickRandomQuote()
          setAppState('quotes')
        }
      } else if (id === 'pokemon') {
        setPokemonModalOpen(true)
        fetchRandomPokemon()
      } else if (id === 'game') {
        router.push(getLocalePath('/game', locale))
      }
    },
    [pickRandomPosts, pickRandomQuote, fetchRandomPoem, fetchRandomPokemon, router, locale]
  )

  const goBack = useCallback(() => {
    setMenuPromptTyped(menuPrompt)
    setActiveOption(0)
    setAppState('menu')
  }, [menuPrompt])

  // --- Keyboard nav for menu ---
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (appState !== 'menu') return
      carouselPaused.current = true
      setCarouselProgress(0)
      if (e.key === 'ArrowDown' || e.key === 'Tab') {
        e.preventDefault()
        setActiveOption((o) => (o + 1) % activeMenuOptions.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveOption((o) => (o - 1 + activeMenuOptions.length) % activeMenuOptions.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        selectOption(activeMenuOptions[activeOption].id)
      }
    },
    [appState, activeOption, selectOption, activeMenuOptions]
  )

  useEffect(() => {
    if (appState === 'menu' && menuPromptTyped === menuPrompt) {
      containerRef.current?.focus()
    }
  }, [appState, menuPromptTyped, menuPrompt])

  const poetryOpen = appState === 'poem'

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
              // The poetry reader has variable height. A fixed terminal cap used to
              // cut its paper card in half when a long title or verse arrived.
              maxHeight: isFullscreen ? '100vh' : poetryOpen ? 'none' : collapsed ? '0px' : '600px',
              height: isFullscreen ? '100vh' : 'auto',
              opacity: collapsed && !isFullscreen && !poetryOpen ? 0 : isMinimized ? 0 : 1,
              marginBottom: collapsed && !isFullscreen && !poetryOpen ? '0px' : '2rem',
              transform: isMinimized ? 'scale(0.15) translate(50vw, 50vh)' : 'none',
              transformOrigin: 'bottom right',
            }}
            className={`mx-auto overflow-hidden font-mono text-sm transition-all duration-500 ease-in-out outline-none md:text-base ${
              isFullscreen ? 'h-full w-full max-w-none' : 'w-full max-w-5xl'
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
                <span className="ml-3 text-gray-500 dark:text-[#7b7f87]">
                  {messages.terminal.title}
                </span>
                <button
                  onClick={cycleSplash}
                  className="ml-auto cursor-pointer rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-500 transition hover:border-cyan-300 hover:text-cyan-600 dark:border-gray-700 dark:text-[#7b7f87] dark:hover:border-cyan-700 dark:hover:text-cyan-300"
                  title={`${messages.terminal.switchBanner} (${activeSplash.label})`}
                >
                  {messages.terminal.banner}: {activeSplash.label} ↻
                </button>
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
                          {activeSplash.lines.map((line, i) => (
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
                            {activeSplash.loadingText}
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
                        {activeMenuOptions.map((opt, i) => (
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
                              showWaifuMenuHint(opt.id, locale)
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
                {appState === 'introduce' && <IntroduceView goBack={goBack} locale={locale} />}

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

                {/* Chinese poetry */}
                {appState === 'poem' && (
                  <ChinesePoemView
                    poem={currentPoem}
                    loading={poemLoading}
                    error={poemError}
                    onReroll={fetchRandomPoem}
                    goBack={goBack}
                  />
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-400 dark:border-gray-700 dark:text-[#7b7f87]">
                GPT-5.6 Sol xHigh
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
