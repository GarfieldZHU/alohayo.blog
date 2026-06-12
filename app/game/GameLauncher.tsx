'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'

const GAME_MODULE_URL = 'https://garfieldzhu.github.io/alohayo-world/embed/bootstrap.js?v=eb563dd'

interface GameHandle {
  pause(): void
  resume(): void
  destroy(): Promise<void>
}

interface GameModule {
  mountGame(options: {
    container: HTMLElement
    assetBaseUrl?: string
    initialWorld?: { seed?: string; width?: number; height?: number }
  }): Promise<GameHandle>
}

const importRemoteModule = new Function('url', 'return import(url)') as (
  url: string
) => Promise<GameModule>

type LauncherState = 'idle' | 'loading' | 'running' | 'error'
const sizePresets = [
  { name: 'Large', width: 256, height: 192 },
  { name: 'Huge', width: 320, height: 240 },
  { name: 'Continental', width: 384, height: 288 },
] as const

export default function GameLauncher() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<GameHandle | null>(null)
  const [seed, setSeed] = useState('alohayo')
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

  const startGame = async (event: FormEvent) => {
    event.preventDefault()
    if (!containerRef.current) return

    setState('loading')
    setError('')
    await gameRef.current?.destroy()
    gameRef.current = null

    try {
      const gameModule = await importRemoteModule(GAME_MODULE_URL)
      gameRef.current = await gameModule.mountGame({
        container: containerRef.current,
        assetBaseUrl: 'https://garfieldzhu.github.io/alohayo-world/',
        initialWorld: {
          seed: seed.trim() || 'alohayo',
          width: sizePresets[sizeIndex].width,
          height: sizePresets[sizeIndex].height,
        },
      })
      setState('running')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The world could not be started.')
      setState('error')
    }
  }

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
          cell. The game is single-player, stores preferences locally, and loads no engine or map
          resources until you enter.
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
            onClick={() => setSizeIndex((current) => Math.min(current + 1, sizePresets.length - 1))}
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
              ? 'Generating...'
              : state === 'running'
                ? 'Regenerate'
                : 'Enter the world'}
          </button>
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
        <span>Ocean, lakes, mainland, islands, and highlands</span>
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
        WASD or arrows walk. Hold Shift to run. E or Space acts. Drag pans the camera; scroll zooms
        toward the pointer.
      </p>
    </div>
  )
}
