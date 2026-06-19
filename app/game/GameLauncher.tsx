'use client'

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'

const GAME_MODULE_URL = 'https://garfieldzhu.github.io/alohayo-world/embed/bootstrap.js?v=ff3d298'

interface GameHandle {
  pause(): void
  resume(): void
  setDevMode?(enabled: boolean): void
  destroy(): Promise<void>
}

interface GameModule {
  mountGame(options: {
    container: HTMLElement
    assetBaseUrl?: string
    devMode?: boolean
    initialWorld?: {
      seed?: string
      width?: number
      height?: number
      chunkRadius?: number
      retainChunkRadius?: number
      minimapChunkRadius?: number
    }
  }): Promise<GameHandle>
}

const importRemoteModule = new Function('url', 'return import(url)') as (
  url: string
) => Promise<GameModule>

type LauncherState = 'idle' | 'loading' | 'running' | 'error'
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
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<GameHandle | null>(null)
  const mountedDevModeRef = useRef<boolean | null>(null)
  const [seed, setSeed] = useState('alohayo')
  const [devMode, setDevMode] = useState(false)
  const [state, setState] = useState<LauncherState>('idle')
  const [error, setError] = useState('')
  const [hasWebGL2, setHasWebGL2] = useState<boolean | null>(null)
  const [sizeIndex, setSizeIndex] = useState(0)

  useEffect(() => {
    setSeed(window.localStorage.getItem('alohayo-world:last-seed') || 'alohayo')
    const canvas = document.createElement('canvas')
    setHasWebGL2(Boolean(canvas.getContext('webgl2')))

    return () => {
      void gameRef.current?.destroy()
      gameRef.current = null
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
          assetBaseUrl: 'https://garfieldzhu.github.io/alohayo-world/',
          devMode,
          initialWorld: {
            seed: seed.trim() || 'alohayo',
            width: preset.width,
            height: preset.height,
            chunkRadius: preset.chunkRadius,
            retainChunkRadius: preset.retainChunkRadius,
            minimapChunkRadius: preset.minimapChunkRadius,
          },
        })
        mountedDevModeRef.current = devMode
        setState('running')
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'The world could not be started.')
        setState('error')
      }
    },
    [devMode, seed]
  )

  const startGame = async (event: FormEvent) => {
    event.preventDefault()
    await mountWithPreset(sizeIndex)
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

  return (
    <div className="py-8 sm:py-12">
      <div className="mb-8 max-w-3xl">
        <p className="font-mono text-sm tracking-[0.18em] text-cyan-600 uppercase dark:text-cyan-400">
          Alohayo World / v0.1.0-demo
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl dark:text-gray-100">
          A vivid world from one small seed.
        </h1>
        <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-300">
          Generate a geography atlas, explore its biomes, and inspect the climate beneath every
          cell. The world streams in chunk by chunk, stores preferences locally, and loads no engine
          or map resources until you enter. Game mode keeps the camera centered on the explorer; dev
          mode unlocks survey controls.
        </p>
      </div>

      <form onSubmit={startGame} className="mb-5">
        <label htmlFor="world-seed" className="mb-2 block font-mono text-sm font-medium">
          World seed
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
            className="cursor-pointer rounded-lg border border-cyan-800 bg-cyan-950 px-5 py-3 font-mono text-sm font-bold text-cyan-100 transition hover:bg-cyan-900 disabled:cursor-default disabled:opacity-60"
          >
            {sizePresets[sizeIndex].name} · {sizePresets[sizeIndex].width}×
            {sizePresets[sizeIndex].height}
            {sizeIndex < sizePresets.length - 1 ? ' / Enlarge' : ' / Maximum'}
          </button>
          <button
            type="submit"
            disabled={state === 'loading'}
            className="cursor-pointer rounded-lg bg-cyan-700 px-6 py-3 font-bold text-white transition hover:bg-cyan-600 disabled:cursor-wait disabled:opacity-60"
          >
            {state === 'loading'
              ? 'Surveying...'
              : state === 'running'
                ? 'Resurvey'
                : 'Enter the world'}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs text-gray-500 dark:text-gray-400">
          <label className="inline-flex items-center gap-2 rounded-lg border border-cyan-800/30 bg-cyan-950/40 px-3 py-2 text-cyan-100">
            <input
              type="checkbox"
              checked={devMode}
              onChange={(event) => setDevMode(event.target.checked)}
              className="h-4 w-4 accent-cyan-500"
            />
            Dev mode
          </label>
          {devMode && (
            <span>
              Battle shadow, fast move, shift-click teleport, free camera, zoom, and equipment
              testing are enabled.
            </span>
          )}
        </div>
      </form>

      <div className="mb-3 flex flex-wrap gap-3 font-mono text-xs text-gray-500 dark:text-gray-400">
        <span>
          {hasWebGL2 === null
            ? 'Checking renderer...'
            : hasWebGL2
              ? 'WebGL2 ready'
              : 'Canvas fallback'}
        </span>
        <span>Local-only data</span>
        <span>On-demand loading</span>
        <span>Infinite chunks, minimap, and discovery</span>
        {devMode && <span>Developer tooling enabled</span>}
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
        ref={containerRef}
        className="relative h-[68vh] min-h-[480px] overflow-hidden rounded-xl border border-gray-200 bg-[#07111f] shadow-2xl dark:border-gray-700"
        aria-live="polite"
      >
        {state === 'idle' && (
          <div className="grid h-full place-items-center p-8 text-center font-mono text-sm text-slate-400">
            PixiJS, the generation worker, content definitions, and terrain resources are waiting
            behind the button.
          </div>
        )}
      </div>

      <p className="mt-4 font-mono text-xs text-gray-500 dark:text-gray-400">
        WASD or arrows walk. Hold Shift to run. E or Space acts. In game mode, the camera follows
        the explorer and zoom stays locked. The minimap fills as you discover the world.
        {devMode &&
          ' In dev mode, drag pans the camera, scroll zooms, press F for fast move, shift-click teleports, and the in-game panel exposes equipment overrides.'}
      </p>
    </div>
  )
}
