'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { generateTrades, type TradeRow } from './lib/data'
import { duckdbBenchmark, prewarmDuckDB } from './lib/duckdb'
import { sqliteBenchmark, prewarmSqlite } from './lib/sqlite'
import { indexedDbBenchmark, clearIndexedDb, prewarmIndexedDb } from './lib/indexeddb'
import { QuerySource } from './QuerySource'

const ROW_OPTIONS = [50_000, 200_000, 1_000_000] as const

type EngineState = 'idle' | 'running' | 'done' | 'error'
type Phase = 'idle' | 'warming' | 'racing' | 'done'
type EngineKey = 'duckdb' | 'sqlite' | 'indexeddb'

interface EngineStatus {
  state: EngineState
  ms?: number
  error?: string
}

const ENGINE_META: { key: EngineKey; name: string; desc: string; bar: string }[] = [
  {
    key: 'duckdb',
    name: 'DuckDB-Wasm',
    desc: '列式 + 向量化 SQL',
    bar: 'bg-gradient-to-r from-sky-500 to-cyan-400',
  },
  {
    key: 'sqlite',
    name: 'SQLite-Wasm',
    desc: '行式事务数据库',
    bar: 'bg-gradient-to-r from-violet-500 to-fuchsia-400',
  },
  {
    key: 'indexeddb',
    name: 'IndexedDB + JS',
    desc: '浏览器原生存储 + JS 手写聚合',
    bar: 'bg-gradient-to-r from-rose-500 to-orange-400',
  },
]

/**
 * 计时柱满格对应的毫秒数 = 最慢引擎（IndexedDB）的预估耗时。
 * 所有柱子共用这一个时间轴，柱长 = 真实耗时占比 ——
 * 快的引擎柱子短得几乎看不见，慢的引擎慢慢爬满，差距一眼可见。
 */
function estimateMs(rows: number): number {
  if (rows <= 50_000) return 3_000
  if (rows <= 200_000) return 15_000
  return 60_000
}

const fmt = (ms: number) => (ms < 1000 ? `${ms.toFixed(1)} ms` : `${(ms / 1000).toFixed(2)} s`)
const fmtLive = (ms: number) => (ms < 1000 ? `${ms.toFixed(0)} ms` : `${(ms / 1000).toFixed(2)} s`)

export function DuckDbBenchmarkDemo() {
  const [rowCount, setRowCount] = useState<number>(200_000)
  const [phase, setPhase] = useState<Phase>('idle')
  const [results, setResults] = useState<Partial<Record<EngineKey, EngineStatus>>>({})
  const [datasetReady, setDatasetReady] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const raceStartRef = useRef(0)

  // racing 阶段：rAF 驱动统一计时时钟（所有柱子的宽度都从这里来）
  useEffect(() => {
    if (phase !== 'racing') return
    let raf = 0
    const loop = () => {
      setElapsed(performance.now() - raceStartRef.current)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  const runBenchmark = useCallback(async () => {
    setPhase('warming')
    setResults({})
    setDatasetReady(false)
    setElapsed(0)

    let rows: TradeRow[]
    try {
      rows = generateTrades(rowCount)
    } catch (e) {
      setResults({ duckdb: { state: 'error', error: String(e) } })
      setPhase('done')
      return
    }
    setDatasetReady(true)

    // 预热：加载 wasm/worker（一次性成本，不计入计时）
    await Promise.allSettled([prewarmDuckDB(), prewarmSqlite(), prewarmIndexedDb()])

    // 三引擎同时起跑，共享同一时间轴
    raceStartRef.current = performance.now()
    setPhase('racing')

    const update = (key: EngineKey, status: EngineStatus) =>
      setResults((prev) => ({ ...prev, [key]: status }))

    await Promise.allSettled([
      (async () => {
        update('duckdb', { state: 'running' })
        try {
          const r = await duckdbBenchmark(rows)
          update('duckdb', { state: 'done', ms: r.ms })
        } catch (e) {
          update('duckdb', { state: 'error', error: String(e) })
        }
      })(),
      (async () => {
        update('sqlite', { state: 'running' })
        try {
          const r = await sqliteBenchmark(rows)
          update('sqlite', { state: 'done', ms: r.ms })
        } catch (e) {
          update('sqlite', { state: 'error', error: String(e) })
        }
      })(),
      (async () => {
        update('indexeddb', { state: 'running' })
        try {
          await clearIndexedDb()
          const r = await indexedDbBenchmark(rows)
          update('indexeddb', { state: 'done', ms: r.ms })
        } catch (e) {
          update('indexeddb', { state: 'error', error: String(e) })
        }
      })(),
    ])

    setPhase('done')
  }, [rowCount])

  const busy = phase === 'warming' || phase === 'racing'
  const scale = estimateMs(rowCount)
  const allDone =
    phase === 'done' &&
    (['duckdb', 'sqlite', 'indexeddb'] as EngineKey[]).every((k) => results[k]?.state === 'done')

  const raceActive = phase === 'racing' || phase === 'done'

  return (
    <div className="my-8 rounded-xl border border-slate-700 bg-slate-900 p-5 text-slate-100">
      <h3 className="mb-1 text-lg font-bold">⚡ 三引擎性能对比 Demo</h3>
      <p className="mb-4 text-sm text-slate-400">
        生成 <strong className="text-amber-300">{rowCount.toLocaleString()}</strong>{' '}
        行模拟交易数据，三个引擎<strong className="text-slate-200">同时起跑</strong>执行相同查询：
        <code className="mt-1 block rounded bg-slate-800 px-2 py-1 text-xs">
          SELECT region, product, SUM(amount) FROM trades GROUP BY region, product
        </code>
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-300">数据量：</span>
        {ROW_OPTIONS.map((n) => (
          <button
            key={n}
            onClick={() => setRowCount(n)}
            disabled={busy}
            className={`rounded px-3 py-1 text-sm font-medium transition ${
              rowCount === n
                ? 'bg-amber-500 text-slate-900'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            } ${busy ? 'opacity-50' : ''}`}
          >
            {n >= 1000000 ? `${n / 1000000}M` : `${n / 1000}K`}
          </button>
        ))}
        <button
          onClick={runBenchmark}
          disabled={busy}
          className={`ml-auto rounded px-4 py-2 font-bold transition ${
            busy
              ? 'cursor-wait bg-slate-700 text-slate-400'
              : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400'
          }`}
        >
          {phase === 'warming' ? '🔌 预热引擎…' : phase === 'racing' ? '🔄 跑分中…' : '▶ 开始跑分'}
        </button>
      </div>

      {datasetReady && (
        <p className="mb-3 text-xs text-emerald-400">
          ✓ {rowCount.toLocaleString()} 行数据已生成（确定性种子）
        </p>
      )}
      {phase === 'warming' && (
        <p className="mb-3 animate-pulse text-xs text-amber-300">
          🔌 加载引擎（首次需下载 wasm ~5MB），加载完成后三引擎同时起跑…
        </p>
      )}

      {raceActive && (
        <div className="space-y-3">
          {ENGINE_META.map(({ key, name, desc, bar }) => {
            const st = results[key]
            const running = st?.state === 'running'
            const done = st?.state === 'done'
            const width = done
              ? Math.min(100, ((st.ms ?? 0) / scale) * 100)
              : running
                ? Math.min(100, (elapsed / scale) * 100)
                : 0
            return (
              <div key={key}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-slate-200">
                    {name}
                    <span className="ml-2 text-[11px] font-normal text-slate-500">{desc}</span>
                  </span>
                  <span
                    className={`font-mono text-sm ${
                      done
                        ? 'font-bold text-emerald-400'
                        : running
                          ? 'text-amber-300'
                          : 'text-slate-500'
                    }`}
                  >
                    {done ? `✓ ${fmt(st.ms!)}` : running ? fmtLive(elapsed) : '等待'}
                  </span>
                </div>
                <div className="relative h-6 overflow-hidden rounded-md bg-slate-800/80 ring-1 ring-slate-700 ring-inset">
                  <div
                    className={`h-full rounded-md ${bar} ${running ? 'animate-pulse' : ''}`}
                    style={{ width: `${Math.max(width, width > 0 ? 0.6 : 0)}%` }}
                  />
                </div>
                {st?.state === 'error' && (
                  <div className="mt-1 text-xs break-all text-red-400">{st.error}</div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {allDone && (
        <div className="mt-4 rounded-lg border border-emerald-700/50 bg-emerald-900/20 p-4 text-sm">
          <span className="font-bold text-emerald-300">🏆 结论：</span>
          {(() => {
            const d = results.duckdb?.ms ?? 0
            const s = results.sqlite?.ms ?? 0
            const i = results.indexeddb?.ms ?? 0
            const fastest = Math.min(d, s, i)
            if (fastest === d) return 'DuckDB 最快'
            if (fastest === s) return 'SQLite 最快'
            return 'IndexedDB 最快'
          })()}{' '}
          · DuckDB 比 IndexedDB 快{' '}
          <strong>
            {Math.max(
              1,
              Math.round((results.indexeddb?.ms ?? 1) / Math.max(1, results.duckdb?.ms ?? 1))
            )}
            x
          </strong>
        </div>
      )}

      <QuerySource />

      <p className="mt-3 text-xs text-slate-500">
        ⚠️ 数据量越大，DuckDB 的列式优势越明显。柱子是真实耗时比例，满格 = 最慢引擎约 3s / 15s /
        60s。首次运行需加载本地 wasm（约 5MB）。当前环境：
        {typeof navigator !== 'undefined' ? `${navigator.hardwareConcurrency ?? '?'} 核` : '?'}
      </p>
    </div>
  )
}
