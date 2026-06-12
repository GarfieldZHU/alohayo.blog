'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'

const GAME_MODULE_URL = 'https://garfieldzhu.github.io/alohayo-world/embed/bootstrap.js?v=eb563dd'

function showGameWaifuMessage(text: string, duration = 6000) {
  const tips = document.getElementById('waifu-tips')
  if (!tips) return
  tips.innerHTML = text
  tips.classList.add('waifu-tips-active')
  window.setTimeout(() => {
    tips.classList.remove('waifu-tips-active')
  }, duration)
}

const gameWaifuMessages = {
  worldMode: [
    '世界模式已经准备好了～先输入种子，再把大陆和海岸线生成出来吧！',
    '先在 World Mode 里造世界，再决定哪些区域值得变成真正的冒险舞台哦。',
    '想看今天的大陆长什么样？先生成世界，坐标、海岸、高地都会慢慢清晰起来。',
    'World Mode 更像造物台：你负责种子，我来陪你看这片土地苏醒。',
    '先生成地图吧～地貌、湖泊、森林和雪线都会告诉你这个世界适不适合冒险。',
  ],
  gameMode: [
    'Game Mode 的目标是固定镜头跟随主角，让探索更像真正的旅程，而不是纯地图检视。',
    '等 Game Mode 落地后，你会从“看世界”变成“走进世界”。',
    'Game Mode 会把人物状态、动作栏、小地图和地点信息都放进 HUD 里。',
    '未来进入 Game Mode 时，你会以主角视角出发，而不是用自由镜头俯瞰整张图。',
    '这里先把世界造出来，下一步就是在 Game Mode 里真正踏上路途啦。',
  ],
  desert: [
    '沙漠里的生命比看上去更顽强：深根植物会追逐地下水，许多动物则把白天让给高温，把夜晚留给自己。',
    '干旱区的生态很讲节奏，短暂降雨能让种子在几小时内醒来，然后迅速完成发芽与开花。',
    '风塑造了沙丘，也塑造了生物的策略：节水、潜伏、夜行，都是沙漠里常见的生存答案。',
    '别被荒凉骗了，沙漠往往拥有精细的微生境：岩缝、阴坡、盐碱边缘都可能藏着完全不同的群落。',
    '越往腹地走，正式道路就越稀少，生态和交通都会倾向于围绕绿洲、边缘山地和古老水道展开。',
  ],
  snow: [
    '雪地生态看似安静，其实非常讲究能量管理：保温、储脂、群居和季节性迁移都很关键。',
    '在高寒地区，植物的生长期极短，所以它们往往把一年最重要的繁殖窗口压缩到最温暖的那几周。',
    '积雪不只是阻碍，它还是天然保温层；许多小型生物会利用雪下空间躲避致命低温与风暴。',
    '雪线附近的地形会强烈影响生命分布：阳坡、背风坡、冰融水附近往往就是最早恢复活力的地方。',
    '这种区域的道路通常非常克制，主干路线最重要，支路会被天气、雪崩风险和维护成本严格限制。',
  ],
  forest: [
    '森林的生命层次非常丰富：树冠、灌木、地表和地下根系几乎像几层叠起来的世界。',
    '林地里的竞争并不只是“谁长得更高”，还包括谁更会抢光、留水、传播种子，以及和真菌结盟。',
    '在成熟森林里，倒木和腐殖层不是废料，而是新的 habitat，会持续养出昆虫、菌类和幼苗。',
    '森林道路通常会更窄，因为地表起伏、树木密度和湿度都让“修一条宽路”变得昂贵又破坏生态。',
    '如果未来这里进入 Game Mode，林地会很适合做视野受限、声音敏感、分叉路径丰富的探索区域。',
  ],
} as const

function showRandomGameWaifuMessage(
  key: keyof typeof gameWaifuMessages,
  duration = 6000,
  prefix?: string
) {
  const messages = gameWaifuMessages[key]
  const text = messages[Math.floor(Math.random() * messages.length)]
  showGameWaifuMessage(prefix ? `${prefix}${text}` : text, duration)
}

interface GameHandle {
  pause(): void
  resume(): void
  destroy(): Promise<void>
}

interface ActiveBiomeSnapshot {
  biomeId: string
  biomeName: string
  region: string
  x: number
  y: number
  elevation: number
  moisture: number
  temperature: number
  movementCost: number
}

interface GameModule {
  mountGame(options: {
    container: HTMLElement
    assetBaseUrl?: string
    initialWorld?: { seed?: string; width?: number; height?: number }
    onBiomeChange?: (snapshot: ActiveBiomeSnapshot) => void
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

const modeCards = [
  {
    title: 'World Mode',
    status: 'Live now',
    description:
      'Generate the world here first: create a seed, inspect geography, and read the atlas with a free camera.',
    bullets: [
      'Generate a seeded world',
      'Free pan/zoom camera',
      'Terrain, topology, and region inspection',
    ],
  },
  {
    title: 'Game Mode',
    status: 'Planned next',
    description:
      'Then start the journey in Game Mode: fixed-camera exploration with a main character, HUD, settlements, roads, and seeded sites.',
    bullets: [
      'Fixed follow camera',
      'Start from a main-character viewpoint',
      'HUD, minimap, actions, and towns',
    ],
  },
] as const

const worldReadouts = [
  ['Coordinate axes', 'X/Y world position for region reading and future navigation UX'],
  [
    'Z / height band',
    'Readable elevation tier for lowland, highland, snowline, cliffs, and basins',
  ],
  ['Movement profile', 'Current walk/run plus planned swim/fly states for embodied exploration'],
  [
    'Terrain affordance',
    'Surface class, coast identity, and traversal expectation per inspected area',
  ],
] as const

const movementProfiles = [
  ['Walk', 'Baseline exploration speed with precise control in dense terrain and settlements'],
  ['Run', 'Fast overland traversal with higher stamina or condition cost'],
  [
    'Swim',
    'Water traversal with reduced speed, restricted actions, and shoreline transition rules',
  ],
  ['Fly', 'Late or special traversal mode for high-mobility scouting and route planning'],
] as const

const hudPanels = [
  ['Status', 'Health, stamina, condition, and active movement mode'],
  ['Actions', 'Interact, inspect, rest, tool, and context-sensitive commands'],
  ['Minimap', 'Player-facing fixed camera companion with roads, sites, and discovered landmarks'],
  ['World Readout', 'Biome, coordinates, elevation, active road class, and current site'],
] as const

const sitePlans = [
  ['Village', 'One to several roads with houses grouped tightly around the road spine'],
  ['Town', 'A connected local road network with a center, market logic, and district hints'],
  ['City', 'Wide planned main roads, strong forks, dense secondary streets, and clear structure'],
  ['Sites', 'Forts, caves, dungeons, ruins, and wilderness structures seeded into the same world'],
] as const

const roadRules = [
  ['Plains / lowland', 'Richest road network; supports paths, roads, and main routes'],
  [
    'Highland / snowland',
    'Sparse roads; typically only main routes and critical connectors survive',
  ],
  [
    'Deep desert',
    'Very rare interior roads; paths stay near edges, oasis chains, and trade corridors',
  ],
  [
    'Forest / wetland',
    'Mostly small roads and paths; visibility and terrain limit heavy infrastructure',
  ],
  ['Town / city core', 'Dense road hierarchy from narrow lanes to wide main avenues'],
] as const

export default function GameLauncher() {
  const containerRef = useRef<HTMLDivElement>(null)
  const worldModeRef = useRef<HTMLFormElement>(null)
  const gameModePlanRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<GameHandle | null>(null)
  const lastBiomeMessageRef = useRef('')
  const lastBiomeMessageAtRef = useRef(0)
  const [seed, setSeed] = useState('alohayo')
  const [state, setState] = useState<LauncherState>('idle')
  const [error, setError] = useState('')
  const [hasWebGL2, setHasWebGL2] = useState<boolean | null>(null)
  const [sizeIndex, setSizeIndex] = useState(0)

  useEffect(() => {
    setSeed(window.localStorage.getItem('alohayo-world:last-seed') || 'alohayo')
    const canvas = document.createElement('canvas')
    setHasWebGL2(Boolean(canvas.getContext('webgl2')))
    showRandomGameWaifuMessage('worldMode', 6000)

    return () => {
      void gameRef.current?.destroy()
      gameRef.current = null
    }
  }, [])

  const handleBiomeChange = (snapshot: ActiveBiomeSnapshot) => {
    const biomeKey = snapshot.biomeId.split(':')[1] as keyof typeof gameWaifuMessages
    if (!(biomeKey in gameWaifuMessages)) return
    const now = Date.now()
    const signature = `${snapshot.biomeId}:${snapshot.x}:${snapshot.y}`
    if (lastBiomeMessageRef.current === signature || now - lastBiomeMessageAtRef.current < 8000) {
      return
    }
    lastBiomeMessageRef.current = signature
    lastBiomeMessageAtRef.current = now
    showRandomGameWaifuMessage(
      biomeKey,
      7000,
      `<span class="font-mono">[${snapshot.biomeName} @ ${snapshot.x},${snapshot.y} | z:${snapshot.elevation}]</span> `
    )
  }

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
        onBiomeChange: handleBiomeChange,
      })
      showRandomGameWaifuMessage('worldMode', 7000)
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
          Alohayo World / World Mode live · Game Mode planned
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl dark:text-gray-100">
          Generate the world now. Plan the real journey next.
        </h1>
        <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-300">
          World Mode is the current live geography explorer: generate a seeded atlas, inspect
          terrain, and study the shape of the land. Game Mode is the next layer: a fixed-camera,
          character-driven experience with HUD, settlements, roads, and site-based exploration built
          on the same generated world.
        </p>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        {modeCards.map((mode) => (
          <div
            key={mode.title}
            className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70"
            onMouseEnter={() =>
              showRandomGameWaifuMessage(
                mode.title === 'World Mode' ? 'worldMode' : 'gameMode',
                6000
              )
            }
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{mode.title}</h2>
              <span className="rounded-full bg-cyan-100 px-3 py-1 font-mono text-xs text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200">
                {mode.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
              {mode.description}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {mode.bullets.map((bullet) => (
                <li key={bullet}>- {bullet}</li>
              ))}
            </ul>
            <div className="mt-5">
              {mode.title === 'World Mode' ? (
                <button
                  type="button"
                  onClick={() => {
                    worldModeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    showRandomGameWaifuMessage('worldMode', 6000)
                  }}
                  className="cursor-pointer rounded-lg bg-cyan-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-600"
                >
                  Generate a world
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    gameModePlanRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    showRandomGameWaifuMessage('gameMode', 6000)
                  }}
                  className="cursor-pointer rounded-lg border border-cyan-800 bg-cyan-950 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-900"
                >
                  Start with the Game Mode plan
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <form ref={worldModeRef} onSubmit={startGame} className="mb-5">
        <label htmlFor="world-seed" className="mb-2 block font-mono text-sm font-medium">
          World Mode seed
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
            onMouseEnter={() => showRandomGameWaifuMessage('worldMode', 6000)}
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
        <span>World Mode = free camera</span>
        <span>Game Mode = fixed camera plan</span>
        <span>Biome-aware host commentary</span>
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

      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            World Mode readouts to surface
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
            The current explorer remains the creation and inspection mode. The next host pass should
            expose these concepts more directly so the same language carries into Game Mode.
          </p>
          <div className="mt-5 space-y-4">
            {worldReadouts.map(([title, body]) => (
              <div key={title}>
                <h3 className="font-mono text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Movement modes and speed model
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
            World Mode currently demonstrates movement and inspection. Game Mode should promote
            traversal into a clearer state model with explicit mode toggles and terrain-sensitive
            speed.
          </p>
          <div className="mt-5 space-y-4">
            {movementProfiles.map(([title, body]) => (
              <div key={title}>
                <h3 className="font-mono text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          ref={gameModePlanRef}
          className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Game Mode HUD draft
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
            The first playable mode should use a fixed follow camera, a basic explorer character
            model, and a HUD that keeps location, action, and condition readable at all times.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {hudPanels.map(([title, body]) => (
              <div
                key={title}
                className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
              >
                <h3 className="font-mono text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Seeded settlements, sites, and roads
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
            Cities, towns, villages, forts, caves, and dungeons should all emerge as part of the
            same generated world model. Roads are a first-class traversal system, not a visual
            afterthought.
          </p>
          <div className="mt-5 space-y-4">
            {sitePlans.map(([title, body]) => (
              <div key={title}>
                <h3 className="font-mono text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-4 border-t border-gray-200 pt-5 dark:border-gray-800">
            {roadRules.map(([title, body]) => (
              <div key={title}>
                <h3 className="font-mono text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
