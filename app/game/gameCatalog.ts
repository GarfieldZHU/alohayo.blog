export type LocaleCode = 'en' | 'zh-CN'
export type GamePlayMode = 'alohayo' | 'iframe' | 'external'

export interface GameCopy {
  title: string
  subtitle: string
  description: string
  tags: readonly string[]
}

export interface GameCatalogItem {
  id: string
  url: string
  embedUrl?: string
  github?: string
  cover: string
  emoji: string
  embeddable: boolean
  playMode: GamePlayMode
  copy: Record<LocaleCode, GameCopy>
}

export const GAME_CATALOG: readonly GameCatalogItem[] = [
  {
    id: 'alohayo-world',
    url: 'https://garfieldzhu.github.io/alohayo-world/',
    github: 'https://github.com/GarfieldZHU/alohayo-world',
    cover: '/static/images/game-library/alohayo-world.png',
    emoji: '🌍',
    embeddable: true,
    playMode: 'alohayo',
    copy: {
      en: {
        title: 'AlohaYo World',
        subtitle: 'Map-first world explorer',
        description:
          'A self-built TypeScript + PixiJS + Rust/Wasm world explorer. The map-first system is still in development.',
        tags: ['Self-made', 'In development'],
      },
      'zh-CN': {
        title: 'AlohaYo World',
        subtitle: '数据驱动地图优先世界探索器',
        description:
          '自制的「地图优先」Web 游戏系统与世界探索器，TypeScript + PixiJS + Rust/Wasm 构建，持续开发中。',
        tags: ['自制', '开发中'],
      },
    },
  },
  {
    id: 'uno-2026',
    url: 'https://uno-2026.vercel.app/',
    github: 'https://github.com/GarfieldZHU/Uno-2026',
    cover: '/static/images/game-library/uno-2026.png',
    emoji: '🃏',
    embeddable: true,
    playMode: 'iframe',
    copy: {
      en: {
        title: 'UNO 2026',
        subtitle: 'Rust + WebAssembly card table',
        description:
          'A self-built Rust + WebAssembly UNO table: an offline-first remake that opens directly in the browser.',
        tags: ['Self-made', 'Remake'],
      },
      'zh-CN': {
        title: 'UNO 2026',
        subtitle: 'Rust + WebAssembly 卡牌桌',
        description:
          '自制的 Rust + WebAssembly UNO 卡牌桌，离线优先的浏览器复刻作品，打开即可游玩。',
        tags: ['自制', '复刻'],
      },
    },
  },
  {
    id: 'red-alert-2',
    url: 'https://game.chronodivide.com/',
    cover: '/static/images/game-library/red-alert-2.png',
    emoji: '⚔️',
    embeddable: false,
    playMode: 'external',
    copy: {
      en: {
        title: 'Red Alert 2',
        subtitle: 'Chrono Divide · clean original remake',
        description:
          'A close browser remake of the original Red Alert 2. The source site blocks iframe framing, so launch it in a new window.',
        tags: ['RTS', 'Real-time strategy', 'Original', 'Clean'],
      },
      'zh-CN': {
        title: '红色警戒 2 原版',
        subtitle: 'Chrono Divide · 纯净原版复刻',
        description:
          '最接近原版《红色警戒 2》的网页复刻。该站点禁止 iframe 嵌入，请在新窗口开始游戏。',
        tags: ['RTS', '即时战略', '原版', '纯净'],
      },
    },
  },
  {
    id: 'battle-city',
    url: 'https://battle-city.js.org/',
    github: 'https://github.com/shinima/battle-city',
    cover: '/static/images/game-library/battle-city.png',
    emoji: '🪖',
    embeddable: true,
    playMode: 'iframe',
    copy: {
      en: {
        title: 'Battle City',
        subtitle: 'Battle City',
        description:
          'A vector pixel-style Battle City remake with custom level editing and a browser-friendly interface.',
        tags: ['Remake'],
      },
      'zh-CN': {
        title: '坦克大战',
        subtitle: 'Battle City',
        description: 'SVG 矢量像素风格复刻的 FC 坦克大战，支持自定义关卡编辑与网页游玩。',
        tags: ['复刻'],
      },
    },
  },
] as const

export function getGameCopy(game: GameCatalogItem, locale: LocaleCode): GameCopy {
  return game.copy[locale]
}

function escapeAttribute(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const escaped: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return escaped[character]
  })
}

export function getEmbedCode(game: GameCatalogItem, locale: LocaleCode): string {
  const copy = getGameCopy(game, locale)
  const source = game.embedUrl ?? game.url

  return `<iframe src="${escapeAttribute(source)}" title="${escapeAttribute(copy.title)}" width="100%" height="600" allow="autoplay; fullscreen; gamepad; pointer-lock" loading="lazy" allowfullscreen></iframe>`
}
