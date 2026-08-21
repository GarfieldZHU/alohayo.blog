'use client'

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useLocale as useSiteLocale } from '@/components/LocaleProvider'
import {
  GAME_CATALOG,
  getEmbedCode,
  getGameCopy,
  type GameCatalogItem,
  type LocaleCode,
} from './gameCatalog'

// Keep this hash aligned with the verified alohayo-world Pages commit.
const GAME_MODULE_URL = 'https://garfieldzhu.github.io/alohayo-world/embed/bootstrap.js?v=5428a94'
const LOCALE_STORAGE_KEY = 'alohayo-world:locale'

type LauncherState = 'idle' | 'loading' | 'running' | 'error'

const LANGUAGE_OPTIONS: Array<{ code: LocaleCode; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'zh-CN', label: '中文' },
]

const MESSAGES = {
  en: {
    eyebrow: 'Alohayo World',
    title: 'Where the map ends.',
    description: 'Take a first step. The rest of the world will meet you on the way.',
    fieldManual: 'Field manual',
    playerGuide: 'Move with WASD or arrows. Hold Shift to run. E or Space interacts.',
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
    placeholder: 'The horizon is waiting.',
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
    eyebrow: 'Alohayo World',
    title: '地图尽头，世界才开始。',
    description: '迈出第一步，剩下的路会在眼前展开。',
    fieldManual: '旅途手册',
    playerGuide: 'WASD 或方向键移动，按住 Shift 奔跑，E 或空格互动。',
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
    placeholder: '地平线正在等待。',
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

function AlohaYoWorldEmbed({ embeddedInModal = false }: { embeddedInModal?: boolean }) {
  const TOP_RIGHT_HIDE_DELAY_MS = 3000
  const TOP_RIGHT_CLEARANCE_PX = 64
  const { resolvedTheme } = useTheme()
  const { locale: siteLocale, setLocale: setSiteLocale } = useSiteLocale()
  const shellRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayHideTimerRef = useRef<number | null>(null)
  const gameRef = useRef<GameHandle | null>(null)
  const mountedDevModeRef = useRef<boolean | null>(null)
  const mountedTerrainShowcaseRef = useRef<boolean | null>(null)
  const mountedLocaleRef = useRef<LocaleCode | null>(null)
  const mountedThemeRef = useRef<'light' | 'dark' | null>(null)
  const [seed, setSeed] = useState('alohayo')
  const [devMode, setDevMode] = useState(false)
  const [terrainShowcase, setTerrainShowcase] = useState(false)
  const [locale, setLocale] = useState<LocaleCode>(siteLocale)
  const [state, setState] = useState<LauncherState>('idle')
  const [error, setError] = useState('')
  const [hasWebGL2, setHasWebGL2] = useState<boolean | null>(null)
  const [sizeIndex, setSizeIndex] = useState(0)
  const [fullWindow, setFullWindow] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [topRightControlsVisible, setTopRightControlsVisible] = useState(false)
  const effectiveTheme = resolvedTheme === 'dark' ? 'dark' : 'light'
  const activeTerrainShowcase = devMode && terrainShowcase
  const messages = MESSAGES[locale]

  useEffect(() => {
    setLocale(siteLocale)
  }, [siteLocale])
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
    if (embeddedInModal) return
    if (!fullWindow && !isFullscreen) {
      document.body.style.overflow = ''
      return
    }
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [embeddedInModal, fullWindow, isFullscreen])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'))
    })
    return () => window.cancelAnimationFrame(frame)
  }, [fullWindow, isFullscreen])

  const clearOverlayHideTimer = useCallback(() => {
    if (overlayHideTimerRef.current !== null) {
      window.clearTimeout(overlayHideTimerRef.current)
      overlayHideTimerRef.current = null
    }
  }, [])

  const scheduleOverlayHide = useCallback(() => {
    clearOverlayHideTimer()
    overlayHideTimerRef.current = window.setTimeout(() => {
      setTopRightControlsVisible(false)
      overlayHideTimerRef.current = null
    }, TOP_RIGHT_HIDE_DELAY_MS)
  }, [clearOverlayHideTimer, TOP_RIGHT_HIDE_DELAY_MS])

  const revealTopRightControls = useCallback(() => {
    setTopRightControlsVisible(true)
    scheduleOverlayHide()
  }, [scheduleOverlayHide])

  useEffect(() => {
    if (!fullWindow && !isFullscreen) {
      clearOverlayHideTimer()
      setTopRightControlsVisible(false)
      return
    }

    revealTopRightControls()
    return () => {
      clearOverlayHideTimer()
    }
  }, [clearOverlayHideTimer, fullWindow, isFullscreen, revealTopRightControls])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.style.setProperty(
      '--alohayo-top-right-clearance',
      topRightControlsVisible ? `${TOP_RIGHT_CLEARANCE_PX}px` : '0px'
    )
    container.style.setProperty('--alohayo-minimap-toolbar-top', '44px')
    return () => {
      container.style.removeProperty('--alohayo-top-right-clearance')
      container.style.removeProperty('--alohayo-minimap-toolbar-top')
    }
  }, [TOP_RIGHT_CLEARANCE_PX, topRightControlsVisible])

  useEffect(() => {
    const shouldHide = fullWindow || isFullscreen || state === 'loading' || state === 'running'
    const previousDisplays = new Map<HTMLElement, string>()
    const syncDecorativeCanvases = () => {
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>(
          '#waifu, #waifu-tool, #live2d-widget, [id^="waifu-"]'
        )
      )
      for (const node of nodes) {
        if (!previousDisplays.has(node)) previousDisplays.set(node, node.style.display)
        node.style.display = shouldHide ? 'none' : ''
      }
    }
    syncDecorativeCanvases()
    const observer = new MutationObserver(syncDecorativeCanvases)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      for (const [node, display] of previousDisplays) node.style.display = display
    }
  }, [fullWindow, isFullscreen, state])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const onLifecycle = (event: Event) => {
      const lifecycle = (event as CustomEvent<{ state?: string }>).detail?.state
      if (lifecycle) container.dataset.alohayoWorldLifecycle = lifecycle
    }
    container.addEventListener('alohayo-world:lifecycle', onLifecycle)
    return () => {
      container.removeEventListener('alohayo-world:lifecycle', onLifecycle)
      delete container.dataset.alohayoWorldLifecycle
    }
  }, [])

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
          assetBaseUrl: 'https://garfieldzhu.github.io/alohayo-world/embed/',
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
      <form onSubmit={startGame}>
        {devMode && (
          <section className="mb-4 rounded-xl border border-cyan-900/30 bg-slate-950/55 p-4 shadow-sm dark:bg-slate-950/70">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="world-seed"
                  className="mb-2 block font-mono text-xs font-medium text-cyan-200"
                >
                  {messages.seedLabel}
                </label>
                <input
                  id="world-seed"
                  value={seed}
                  onChange={(event) => setSeed(event.target.value)}
                  maxLength={64}
                  className="w-full rounded-lg border border-cyan-800/50 bg-slate-900 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>
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
              <button type="submit" disabled={state === 'loading'} className={secondaryButtonClass}>
                {state === 'loading'
                  ? messages.surveying
                  : state === 'running'
                    ? messages.resurvey
                    : messages.enterWorld}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs text-slate-400">
              <div className="inline-flex rounded-lg border border-cyan-800/30 bg-slate-900/80 p-1">
                {LANGUAGE_OPTIONS.map((option) => {
                  const selected = locale === option.code
                  return (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => {
                        setLocale(option.code)
                        setSiteLocale(option.code)
                      }}
                      aria-pressed={selected}
                      className={selected ? selectedLanguageClass : idleLanguageClass}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
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
            </div>
          </section>
        )}

        <div
          ref={shellRef}
          className={
            fullWindow
              ? 'fixed inset-0 z-50 h-[100dvh] w-[100dvw] overflow-hidden bg-slate-100 shadow-2xl dark:bg-[#07111f]'
              : 'relative'
          }
        >
          {(fullWindow || isFullscreen) && (
            <>
              <div
                className="absolute top-0 right-0 z-20 h-24 w-[min(24rem,100%)]"
                onMouseEnter={revealTopRightControls}
                onMouseMove={revealTopRightControls}
                aria-hidden="true"
              />
              <div className="pointer-events-none absolute inset-x-3 top-3 z-30 flex justify-end sm:inset-x-5 sm:top-5">
                <div
                  className={`pointer-events-auto flex max-w-full flex-wrap items-center justify-end gap-2 rounded-2xl border border-slate-200/90 bg-white/95 p-2.5 shadow-[0_18px_50px_rgba(15,23,42,0.24)] backdrop-blur transition-all duration-300 dark:border-cyan-800/40 dark:bg-slate-950/90 ${
                    topRightControlsVisible
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-4 opacity-0'
                  }`}
                  onMouseEnter={revealTopRightControls}
                  onMouseLeave={scheduleOverlayHide}
                  onFocus={revealTopRightControls}
                  onBlur={scheduleOverlayHide}
                >
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
            </>
          )}
          <div
            ref={containerRef}
            className={
              fullWindow
                ? 'relative h-full min-h-0 w-full overflow-hidden bg-slate-100 dark:bg-[#07111f]'
                : 'relative h-[68vh] min-h-[480px] overflow-hidden rounded-xl border border-gray-200 bg-slate-100 shadow-2xl dark:border-gray-700 dark:bg-[#07111f]'
            }
            aria-live="polite"
          >
            {state === 'idle' && (
              <div className="relative grid h-full place-items-center overflow-hidden p-8 text-center">
                <div className="max-w-lg">
                  <p className="font-mono text-xs font-medium tracking-[0.2em] text-cyan-300 uppercase">
                    {messages.eyebrow}
                  </p>
                  <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
                    {messages.title}
                  </h1>
                  <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                    {messages.description}
                  </p>
                  <button
                    type="submit"
                    className="mt-8 cursor-pointer rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 shadow-[0_12px_32px_rgba(34,211,238,0.24)] transition hover:-translate-y-0.5 hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-60"
                  >
                    {messages.enterWorld}
                  </button>
                </div>
                <aside className="absolute right-4 bottom-4 max-w-[15rem] rounded-lg border border-white/10 bg-slate-950/65 px-3 py-2.5 text-left backdrop-blur-sm sm:right-5 sm:bottom-5">
                  <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-cyan-300 uppercase">
                    {messages.fieldManual}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{messages.playerGuide}</p>
                </aside>
              </div>
            )}
            <label className="absolute top-3 right-3 z-20 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-white/10 bg-slate-950/55 px-2 py-1 font-mono text-[10px] tracking-[0.12em] text-slate-400 backdrop-blur-sm transition hover:border-cyan-400/40 hover:text-cyan-200">
              <input
                type="checkbox"
                checked={devMode}
                onChange={(event) => setDevMode(event.target.checked)}
                className="h-3 w-3 accent-cyan-400"
              />
              {messages.devMode}
            </label>
          </div>
        </div>
        {state === 'error' && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </p>
        )}
        {devMode && (
          <>
            <div className="mt-3 flex flex-wrap gap-3 font-mono text-xs text-slate-500 dark:text-slate-400">
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
              <span>{messages.developerToolingEnabled}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
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
            <p className="mt-4 font-mono text-xs text-gray-500 dark:text-gray-400">
              {messages.footerDev}
            </p>
          </>
        )}
      </form>
    </div>
  )
}

const LIBRARY_MESSAGES = {
  en: {
    eyebrow: 'Game library',
    title: 'A small shelf for good games.',
    description: 'Four browser games, kept close to the blog and ready when you are.',
    open: 'Open game',
    close: 'Close',
    playOnline: 'Play online',
    newWindow: 'New window',
    fullScreen: 'Fullscreen',
    exitFullScreen: 'Exit fullscreen',
    embedded: 'Play inside this page',
    externalOnly: 'This game opens in a new window because its site blocks iframe embedding.',
    copyEmbed: 'Copy embed code',
    copied: 'Embed code copied',
    copyFailed: 'Copy failed — select the code manually',
    embedNote: 'Use this snippet to place the game in another page.',
    aLohaEmbedNote: 'In this page, AlohaYo World keeps the blog’s existing embedded launcher.',
  },
  'zh-CN': {
    eyebrow: '游戏库',
    title: '一架安静的好游戏。',
    description: '四个浏览器游戏，留在博客里，想玩时随时打开。',
    open: '打开游戏',
    close: '关闭',
    playOnline: '线上游玩',
    newWindow: '新窗口',
    fullScreen: '全屏',
    exitFullScreen: '退出全屏',
    embedded: '在页面内游玩',
    externalOnly: '该站点禁止 iframe 嵌入，将在新窗口打开。',
    copyEmbed: '复制嵌入代码',
    copied: '嵌入代码已复制',
    copyFailed: '复制失败，请手动选择代码',
    embedNote: '复制这段代码，即可把游戏放入其他页面。',
    aLohaEmbedNote: '在本页中，AlohaYo World 继续使用博客现有的嵌入式启动器。',
  },
} as const

type CopyStatus = 'idle' | 'copied' | 'error'

function GameModal({
  game,
  locale,
  onClose,
}: {
  game: GameCatalogItem
  locale: LocaleCode
  onClose: () => void
}) {
  const messages = LIBRARY_MESSAGES[locale]
  const copy = getGameCopy(game, locale)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('fullscreenchange', onFullscreenChange)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }, [onClose])

  useEffect(() => {
    setCopyStatus('idle')
    setIsFullscreen(false)
  }, [game.id, locale])

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }
    await frameRef.current?.requestFullscreen()
  }

  const copyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(getEmbedCode(game, locale))
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }

  const content =
    game.playMode === 'alohayo' ? (
      <div className="max-h-[min(72vh,52rem)] overflow-auto rounded-xl border border-slate-200 bg-[#070d18] dark:border-slate-700">
        <AlohaYoWorldEmbed embeddedInModal />
      </div>
    ) : game.playMode === 'iframe' ? (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-900/90 px-4 py-3 text-xs text-slate-300">
          <span>{messages.embedded}</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              className="rounded-md border border-white/15 px-3 py-1.5 transition hover:border-cyan-300 hover:text-cyan-100"
            >
              {isFullscreen ? messages.exitFullScreen : messages.fullScreen}
            </button>
            <a
              href={game.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-white/15 px-3 py-1.5 transition hover:border-cyan-300 hover:text-cyan-100"
            >
              {messages.newWindow}
            </a>
          </div>
        </div>
        <iframe
          ref={frameRef}
          title={copy.title}
          src={game.url}
          loading="lazy"
          allow="autoplay; fullscreen; gamepad; pointer-lock"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock allow-downloads"
          className="h-[min(68vh,42rem)] min-h-[25rem] w-full border-0 bg-white"
        />
      </div>
    ) : (
      <div className="grid min-h-[22rem] place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-950/50">
        <div className="max-w-md">
          <div className="text-4xl" aria-hidden="true">
            {game.emoji}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {messages.externalOnly}
          </p>
        </div>
      </div>
    )

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6">
      <button
        type="button"
        aria-label={messages.close}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div
        className="relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] dark:border-slate-700 dark:bg-[#10141b]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`game-title-${game.id}`}
        aria-describedby={`game-description-${game.id}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6 dark:border-slate-700">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-cyan-600 uppercase dark:text-cyan-300">
              {messages.eyebrow}
            </p>
            <h2
              id={`game-title-${game.id}`}
              className="mt-1 truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white"
            >
              <span aria-hidden="true">{game.emoji} </span>
              {copy.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{copy.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={messages.close}
            className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
          >
            ✕
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-5">
          {content}
          <p
            id={`game-description-${game.id}`}
            className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300"
          >
            {copy.description}
          </p>
          {game.playMode === 'alohayo' && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {messages.aLohaEmbedNote}
            </p>
          )}
        </div>

        <footer className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            {copy.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void copyEmbed()}
              className="rounded-lg border border-cyan-700/30 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-800 transition hover:border-cyan-600 hover:bg-cyan-100 dark:border-cyan-400/30 dark:bg-cyan-950/40 dark:text-cyan-100 dark:hover:bg-cyan-900/60"
            >
              {copyStatus === 'copied' ? messages.copied : messages.copyEmbed}
            </button>
            <a
              href={game.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200"
            >
              {messages.playOnline} ↗
            </a>
          </div>
        </footer>
        {copyStatus === 'error' && (
          <p className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            {messages.copyFailed}. {messages.embedNote}
          </p>
        )}
      </div>
    </div>
  )
}

export default function GameLauncher() {
  const { locale } = useSiteLocale()
  const messages = LIBRARY_MESSAGES[locale]
  const [selectedGame, setSelectedGame] = useState<GameCatalogItem | null>(null)

  return (
    <div className="pt-8 pb-20 sm:pt-12">
      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-700">
        <p className="font-mono text-xs font-semibold tracking-[0.2em] text-cyan-600 uppercase dark:text-cyan-300">
          {messages.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {messages.title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
          {messages.description}
        </p>
      </header>

      <section aria-label={messages.eyebrow} className="grid gap-4 sm:grid-cols-2">
        {GAME_CATALOG.map((game) => {
          const copy = getGameCopy(game, locale)
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => setSelectedGame(game)}
              className="group flex min-h-36 w-full items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-500/50 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-slate-700 dark:bg-[#10141b] dark:hover:border-cyan-400/60 dark:focus-visible:ring-offset-[#070d18]"
            >
              <div className="relative w-32 shrink-0 overflow-hidden bg-slate-900 sm:w-36">
                <Image
                  src={game.cover}
                  alt=""
                  loading="lazy"
                  fill
                  sizes="(min-width: 640px) 144px, 128px"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <span className="absolute top-2 left-2 rounded-md bg-slate-950/75 px-2 py-1 text-xs text-white backdrop-blur-sm">
                  {game.emoji}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-4">
                <div>
                  <h2 className="truncate text-lg font-semibold text-slate-900 dark:text-white">
                    {copy.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
                    {copy.subtitle}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {copy.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 px-2 py-0.5 font-mono text-[10px] text-slate-500 dark:border-slate-700 dark:text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="ml-auto text-xs font-semibold text-cyan-700 transition group-hover:translate-x-0.5 dark:text-cyan-300">
                    {messages.open} ↗
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </section>

      {selectedGame && (
        <GameModal game={selectedGame} locale={locale} onClose={() => setSelectedGame(null)} />
      )}
    </div>
  )
}
