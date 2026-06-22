'use client'

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

const GAME_MODULE_URL = 'https://garfieldzhu.github.io/alohayo-world/embed/bootstrap.js?v=f9cc17a'
const LOCALE_STORAGE_KEY = 'alohayo-world:locale'

type LocaleCode = 'en' | 'zh-CN'
type LauncherState = 'idle' | 'loading' | 'running' | 'error'

const LANGUAGE_OPTIONS: Array<{ code: LocaleCode; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'zh-CN', label: '中文' },
]

const MESSAGES = {
  en: {
    eyebrow: 'Alohayo World / v0.1.1',
    title: 'A vivid world from one small seed.',
    description:
      'Generate a geography atlas, explore its biomes, and inspect the climate beneath every cell. The world streams in chunk by chunk, stores preferences locally, and loads no engine or map resources until you enter. Game mode keeps the camera centered on the explorer; dev mode unlocks survey controls.',
    seedLabel: 'World seed',
    enterWorld: 'Enter the world',
    resurvey: 'Resurvey',
    surveying: 'Surveying...',
    enlarge: 'Enlarge',
    maximum: 'Maximum',
    devMode: 'Dev mode',
    devModeEnabled:
      'Battle shadow, fast move, flight, shift-click teleport, free camera, zoom, and equipment testing are enabled.',
    terrainShowcase: 'Terrain showcase',
    terrainShowcaseEnabled: 'Forces every core terrain type near the start for testing.',
    rendererChecking: 'Checking renderer...',
    rendererReady: 'WebGL2 ready',
    rendererFallback: 'Canvas fallback',
    localOnly: 'Local-only data',
    onDemandLoading: 'On-demand loading',
    infiniteWorld: 'Infinite chunks, minimap, and discovery',
    developerToolingEnabled: 'Developer tooling enabled',
    fullWindow: 'Full window',
    exitFullWindow: 'Exit window',
    fullScreen: 'Full screen',
    exitFullScreen: 'Exit full screen',
    returnToEmbed: 'Return to page',
    escapeHint: 'Esc also exits full screen',
    startError: 'The world could not be started.',
    placeholder:
      'PixiJS, the generation worker, content definitions, and terrain resources are waiting behind the button.',
    footer:
      'WASD or arrows walk. Hold Shift to run. E or Space acts. In game mode, the camera follows the explorer and zoom stays locked. The minimap fills as you discover the world.',
    footerDev:
      'In dev mode, drag pans the camera, scroll zooms, press F for fast move, press G for flight, shift-click teleports, and the collapsible in-game panel exposes equipment overrides.',
    sizeNames: {
      Frontier: 'Frontier',
      Expanse: 'Expanse',
      Horizon: 'Horizon',
    },
  },
  'zh-CN': {
    eyebrow: 'Alohayo World / v0.1.1',
    title: '一枚小小种子，展开一整个鲜活世界。',
    description:
      '生成一张地理世界图谱，探索不同生态地貌，并查看每个地格背后的气候数据。世界会按区块持续流式生成，偏好仅保存在本地，而且在你真正进入之前不会加载引擎或地图资源。游戏模式会让镜头跟随主角；开发模式则解锁调试控制。',
    seedLabel: '世界种子',
    enterWorld: '进入世界',
    resurvey: '重新勘测',
    surveying: '勘测中...',
    enlarge: '扩大',
    maximum: '最大',
    devMode: '开发模式',
    devModeEnabled: '已启用战斗阴影、快速移动、飞行、Shift 点击传送、自由镜头、缩放与装备测试。',
    terrainShowcase: '地形展示',
    terrainShowcaseEnabled: '在起点附近强制生成全部核心地形，便于测试。',
    rendererChecking: '正在检查渲染器...',
    rendererReady: 'WebGL2 已就绪',
    rendererFallback: '使用 Canvas 回退',
    localOnly: '数据仅保存在本地',
    onDemandLoading: '按需加载',
    infiniteWorld: '无限区块、小地图与探索迷雾',
    developerToolingEnabled: '开发工具已启用',
    fullWindow: '全窗口',
    exitFullWindow: '退出窗口',
    fullScreen: '全屏',
    exitFullScreen: '退出全屏',
    returnToEmbed: '返回页面',
    escapeHint: '也可以按 Esc 退出全屏',
    startError: '世界启动失败。',
    placeholder: 'PixiJS、生成 Worker、内容定义和地形资源都在按钮后按需等待加载。',
    footer:
      'WASD 或方向键移动，按住 Shift 奔跑，E 或空格执行动作。游戏模式下镜头会跟随主角且缩放锁定。随着探索推进，小地图会逐步点亮。',
    footerDev:
      '开发模式下可拖拽平移镜头、滚轮缩放、按 F 切换快速移动、按 G 切换飞行、Shift 点击传送，并通过可收起的游戏内面板覆盖装备。',
    sizeNames: {
      Frontier: '边疆',
      Expanse: '辽原',
      Horizon: '天际',
    },
  },
} as const

function normalizeLocale(input?: string | null): LocaleCode {
  if (!input) return 'en'
  const normalized = input.trim().toLowerCase()
  if (
    normalized === 'zh' ||
    normalized === 'zh-cn' ||
    normalized === 'zh-hans' ||
    normalized.startsWith('zh-')
  ) {
    return 'zh-CN'
  }
  return 'en'
}

interface GameHandle {
  pause(): void
  resume(): void
  setDevMode?(enabled: boolean): void
  setLocale?(locale: LocaleCode): void
  setTheme?(theme: 'light' | 'dark'): void
  destroy(): Promise<void>
}

interface GameModule {
  mountGame(options: {
    container: HTMLElement
    assetBaseUrl?: string
    devMode?: boolean
    locale?: LocaleCode
    theme?: 'light' | 'dark'
    initialWorld?: {
      seed?: string
      width?: number
      height?: number
      chunkRadius?: number
      retainChunkRadius?: number
      minimapChunkRadius?: number
      mapAreaIds?: string[]
    }
  }): Promise<GameHandle>
}

const importRemoteModule = new Function('url', 'return import(url)') as (
  url: string
) => Promise<GameModule>

const sizePresets = [
  {
    name: 'Frontier',
    width: 512,
    height: 384,
    chunkRadius: 2,
    retainChunkRadius: 3,
    minimapChunkRadius: 6,
  },
  {
    name: 'Expanse',
    width: 768,
    height: 576,
    chunkRadius: 3,
    retainChunkRadius: 4,
    minimapChunkRadius: 8,
  },
  {
    name: 'Horizon',
    width: 1024,
    height: 768,
    chunkRadius: 4,
    retainChunkRadius: 5,
    minimapChunkRadius: 10,
  },
] as const

export default function GameLauncher() {
  const { resolvedTheme } = useTheme()
  const shellRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<GameHandle | null>(null)
  const mountedDevModeRef = useRef<boolean | null>(null)
  const mountedTerrainShowcaseRef = useRef<boolean | null>(null)
  const mountedLocaleRef = useRef<LocaleCode | null>(null)
  const mountedThemeRef = useRef<'light' | 'dark' | null>(null)
  const [seed, setSeed] = useState('alohayo')
  const [devMode, setDevMode] = useState(false)
  const [terrainShowcase, setTerrainShowcase] = useState(false)
  const [locale, setLocale] = useState<LocaleCode>('en')
  const [state, setState] = useState<LauncherState>('idle')
  const [error, setError] = useState('')
  const [hasWebGL2, setHasWebGL2] = useState<boolean | null>(null)
  const [sizeIndex, setSizeIndex] = useState(0)
  const [fullWindow, setFullWindow] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const effectiveTheme = resolvedTheme === 'dark' ? 'dark' : 'light'
  const activeTerrainShowcase = devMode && terrainShowcase
  const messages = MESSAGES[locale]
  const secondaryButtonClass =
    'cursor-pointer rounded-xl border border-slate-300 bg-white/90 px-4 py-2.5 font-mono text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 disabled:cursor-default disabled:opacity-60 dark:border-cyan-800/50 dark:bg-cyan-950/60 dark:text-cyan-100 dark:hover:bg-cyan-900/70'
  const toggleLabelClass =
    'inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/90 px-3 py-2.5 text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-900 dark:border-cyan-800/30 dark:bg-cyan-950/40 dark:text-cyan-100 dark:hover:border-cyan-700 dark:hover:bg-cyan-950/60'
  const selectedLanguageClass =
    'rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm dark:bg-cyan-300 dark:text-slate-950'
  const idleLanguageClass =
    'rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-cyan-950/60 dark:hover:text-cyan-100'

  useEffect(() => {
    setSeed(window.localStorage.getItem('alohayo-world:last-seed') || 'alohayo')
    setLocale(
      normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY) || navigator.language)
    )
    const canvas = document.createElement('canvas')
    setHasWebGL2(Boolean(canvas.getContext('webgl2')))

    return () => {
      void gameRef.current?.destroy()
      gameRef.current = null
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }, [locale])

  useEffect(() => {
    const onFullscreenChange = () => {
      const active = document.fullscreenElement === shellRef.current
      setIsFullscreen(active)
      if (!active) {
        setFullWindow(false)
      }
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    if (!fullWindow && !isFullscreen) {
      document.body.style.overflow = ''
      return
    }
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [fullWindow, isFullscreen])

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('#waifu, #waifu-tool, #live2d-widget, [id^="waifu-"]')
    )
    if (!nodes.length) return

    const shouldHide = fullWindow || isFullscreen
    const previousDisplays = nodes.map((node) => node.style.display)
    for (const node of nodes) {
      node.style.display = shouldHide ? 'none' : ''
    }

    return () => {
      nodes.forEach((node, index) => {
        node.style.display = previousDisplays[index] ?? ''
      })
    }
  }, [fullWindow, isFullscreen])

  const mountWithPreset = useCallback(
    async (presetIndex: number) => {
      if (!containerRef.current) return

      setState('loading')
      setError('')
      await gameRef.current?.destroy()
      gameRef.current = null

      try {
        const gameModule = await importRemoteModule(GAME_MODULE_URL)
        const preset = sizePresets[presetIndex]
        gameRef.current = await gameModule.mountGame({
          container: containerRef.current,
          assetBaseUrl: 'https://garfieldzhu.github.io/alohayo-world/',
          devMode,
          locale,
          theme: effectiveTheme,
          initialWorld: {
            seed: seed.trim() || 'alohayo',
            width: preset.width,
            height: preset.height,
            chunkRadius: preset.chunkRadius,
            retainChunkRadius: preset.retainChunkRadius,
            minimapChunkRadius: preset.minimapChunkRadius,
            mapAreaIds: activeTerrainShowcase ? ['core:terrain-showcase'] : [],
          },
        })
        mountedDevModeRef.current = devMode
        mountedTerrainShowcaseRef.current = activeTerrainShowcase
        mountedLocaleRef.current = locale
        mountedThemeRef.current = effectiveTheme
        setState('running')
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : messages.startError)
        setState('error')
      }
    },
    [activeTerrainShowcase, devMode, effectiveTheme, locale, messages.startError, seed]
  )

  const startGame = async (event: FormEvent) => {
    event.preventDefault()
    await mountWithPreset(sizeIndex)
  }

  const toggleFullWindow = async () => {
    if (isFullscreen && document.fullscreenElement === shellRef.current) {
      await document.exitFullscreen()
      setIsFullscreen(false)
      setFullWindow(false)
      return
    }
    setFullWindow((current) => !current)
  }

  const toggleFullscreen = async () => {
    const shell = shellRef.current
    if (!shell) return
    if (document.fullscreenElement === shell) {
      await document.exitFullscreen()
      setIsFullscreen(false)
      setFullWindow(false)
      return
    }
    setFullWindow(true)
    await shell.requestFullscreen()
  }

  const returnToEmbedded = async () => {
    if (document.fullscreenElement === shellRef.current) {
      await document.exitFullscreen()
    }
    setIsFullscreen(false)
    setFullWindow(false)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const blockCameraInput = (event: Event) => {
      if (devMode) return
      if (!(event.target instanceof HTMLCanvasElement)) return
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
    }

    container.addEventListener('pointerdown', blockCameraInput, { capture: true })
    container.addEventListener('wheel', blockCameraInput, { capture: true, passive: false })

    return () => {
      container.removeEventListener('pointerdown', blockCameraInput, { capture: true })
      container.removeEventListener('wheel', blockCameraInput, { capture: true })
    }
  }, [devMode, state])

  useEffect(() => {
    if (state !== 'running' || !gameRef.current) return
    if (mountedDevModeRef.current === devMode) return

    const handle = gameRef.current
    if (typeof handle.setDevMode === 'function') {
      handle.setDevMode(devMode)
      mountedDevModeRef.current = devMode
      return
    }

    void mountWithPreset(sizeIndex)
  }, [devMode, mountWithPreset, sizeIndex, state])

  useEffect(() => {
    if (state !== 'running' || !gameRef.current) return
    if (mountedTerrainShowcaseRef.current === activeTerrainShowcase) return

    void mountWithPreset(sizeIndex)
  }, [activeTerrainShowcase, mountWithPreset, sizeIndex, state])

  useEffect(() => {
    if (state !== 'running' || !gameRef.current) return
    if (mountedLocaleRef.current === locale) return

    const handle = gameRef.current
    if (typeof handle.setLocale === 'function') {
      handle.setLocale(locale)
      mountedLocaleRef.current = locale
      return
    }

    void mountWithPreset(sizeIndex)
  }, [locale, mountWithPreset, sizeIndex, state])

  useEffect(() => {
    if (state !== 'running' || !gameRef.current) return
    if (mountedThemeRef.current === effectiveTheme) return

    const handle = gameRef.current
    if (typeof handle.setTheme === 'function') {
      handle.setTheme(effectiveTheme)
      mountedThemeRef.current = effectiveTheme
      return
    }

    void mountWithPreset(sizeIndex)
  }, [effectiveTheme, mountWithPreset, sizeIndex, state])

  return (
    <div className="py-8 sm:py-12">
      <div className="mb-8 max-w-3xl">
        <p className="font-mono text-sm tracking-[0.18em] text-cyan-600 uppercase dark:text-cyan-400">
          {messages.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl dark:text-gray-100">
          {messages.title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-300">
          {messages.description}
        </p>
      </div>

      <form onSubmit={startGame} className="mb-5">
        <div className="mb-3 flex flex-wrap items-center gap-3 font-mono text-xs text-gray-500 dark:text-gray-400">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white/80 p-1 shadow-sm dark:border-cyan-800/30 dark:bg-slate-950/60">
            {LANGUAGE_OPTIONS.map((option) => {
              const selected = locale === option.code
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setLocale(option.code)}
                  aria-pressed={selected}
                  className={selected ? selectedLanguageClass : idleLanguageClass}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <label htmlFor="world-seed" className="mb-2 block font-mono text-sm font-medium">
          {messages.seedLabel}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="world-seed"
            value={seed}
            onChange={(event) => setSeed(event.target.value)}
            maxLength={64}
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-gray-900 outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
          <button
            type="button"
            onClick={async () => {
              const nextIndex = Math.min(sizeIndex + 1, sizePresets.length - 1)
              setSizeIndex(nextIndex)
              if (state === 'running') await mountWithPreset(nextIndex)
            }}
            disabled={sizeIndex === sizePresets.length - 1 || state === 'loading'}
            className={secondaryButtonClass}
          >
            {messages.sizeNames[sizePresets[sizeIndex].name]} · {sizePresets[sizeIndex].width}×
            {sizePresets[sizeIndex].height}
            {sizeIndex < sizePresets.length - 1
              ? ` / ${messages.enlarge}`
              : ` / ${messages.maximum}`}
          </button>
          <button
            type="submit"
            disabled={state === 'loading'}
            className="cursor-pointer rounded-xl bg-cyan-600 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-cyan-500 disabled:cursor-wait disabled:opacity-60 dark:bg-cyan-700 dark:hover:bg-cyan-600"
          >
            {state === 'loading'
              ? messages.surveying
              : state === 'running'
                ? messages.resurvey
                : messages.enterWorld}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs text-gray-500 dark:text-gray-400">
          <label className={toggleLabelClass}>
            <input
              type="checkbox"
              checked={devMode}
              onChange={(event) => setDevMode(event.target.checked)}
              className="h-4 w-4 accent-cyan-500"
            />
            {messages.devMode}
          </label>
          {devMode && (
            <>
              <label className={toggleLabelClass}>
                <input
                  type="checkbox"
                  checked={terrainShowcase}
                  onChange={(event) => setTerrainShowcase(event.target.checked)}
                  className="h-4 w-4 accent-cyan-500"
                />
                {messages.terrainShowcase}
              </label>
              <span>
                {messages.devModeEnabled}
                {terrainShowcase ? ` ${messages.terrainShowcaseEnabled}` : ''}
              </span>
            </>
          )}
        </div>
      </form>

      <div className="mb-3 flex flex-wrap gap-3 font-mono text-xs text-gray-500 dark:text-gray-400">
        <span>
          {hasWebGL2 === null
            ? messages.rendererChecking
            : hasWebGL2
              ? messages.rendererReady
              : messages.rendererFallback}
        </span>
        <span>{messages.localOnly}</span>
        <span>{messages.onDemandLoading}</span>
        <span>{messages.infiniteWorld}</span>
        {devMode && <span>{messages.developerToolingEnabled}</span>}
      </div>

      <div className="mb-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void toggleFullWindow()}
          className={secondaryButtonClass}
        >
          {fullWindow ? messages.exitFullWindow : messages.fullWindow}
        </button>
        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          className={secondaryButtonClass}
        >
          {isFullscreen ? messages.exitFullScreen : messages.fullScreen}
        </button>
      </div>

      {state === 'error' && (
        <p
          role="alert"
          className="mb-3 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      )}

      <div
        ref={shellRef}
        className={
          fullWindow
            ? 'fixed inset-3 z-50 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur sm:inset-6 sm:p-5 dark:border-gray-700 dark:bg-slate-950/95'
            : 'relative'
        }
      >
        {(fullWindow || isFullscreen) && (
          <div className="pointer-events-none absolute inset-x-3 top-3 z-30 flex justify-end sm:inset-x-5 sm:top-5">
            <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-end gap-2 rounded-2xl border border-slate-200/90 bg-white/95 p-2.5 shadow-[0_18px_50px_rgba(15,23,42,0.24)] backdrop-blur dark:border-cyan-800/40 dark:bg-slate-950/90">
              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                className={secondaryButtonClass}
              >
                {isFullscreen ? messages.exitFullScreen : messages.fullScreen}
              </button>
              <button
                type="button"
                onClick={() => void returnToEmbedded()}
                className={secondaryButtonClass}
              >
                {messages.returnToEmbed}
              </button>
              {isFullscreen && (
                <span className="px-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {messages.escapeHint}
                </span>
              )}
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className={
            fullWindow
              ? 'relative h-[calc(100vh-2rem)] min-h-[480px] overflow-hidden rounded-xl border border-gray-200 bg-slate-100 shadow-2xl sm:h-[calc(100vh-4rem)] dark:border-gray-700 dark:bg-[#07111f]'
              : 'relative h-[68vh] min-h-[480px] overflow-hidden rounded-xl border border-gray-200 bg-slate-100 shadow-2xl dark:border-gray-700 dark:bg-[#07111f]'
          }
          aria-live="polite"
        >
          {state === 'idle' && (
            <div className="grid h-full place-items-center p-8 text-center font-mono text-sm text-slate-400">
              {messages.placeholder}
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 font-mono text-xs text-gray-500 dark:text-gray-400">
        {messages.footer}
        {devMode && ` ${messages.footerDev}`}
      </p>
    </div>
  )
}
