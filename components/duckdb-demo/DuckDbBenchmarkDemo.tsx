'use client'

import { useCallback, useState } from 'react'
import { generateTrades, type BenchmarkResult, type TradeRow } from './lib/data'
import { duckdbBenchmark } from './lib/duckdb'
import { sqliteBenchmark } from './lib/sqlite'
import { indexedDbBenchmark, clearIndexedDb } from './lib/indexeddb'

const ROW_OPTIONS = [50_000, 200_000, 1_000_000] as const

type EngineState = 'idle' | 'running' | 'done' | 'error'

interface EngineStatus {
  state: EngineState
  ms?: number
  error?: string
}

export function DuckDbBenchmarkDemo() {
  const [rowCount, setRowCount] = useState<number>(200_000)
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<
    Partial<Record<'duckdb' | 'sqlite' | 'indexeddb', EngineStatus>>
  >({})
  const [datasetReady, setDatasetReady] = useState(false)

  const runBenchmark = useCallback(async () => {
    setRunning(true)
    setResults({})
    setDatasetReady(false)

    // 1. 生成数据
    let rows: TradeRow[]
    try {
      rows = generateTrades(rowCount)
    } catch (e) {
      setResults({ duckdb: { state: 'error', error: String(e) } })
      setRunning(false)
      return
    }
    setDatasetReady(true)

    const update = (engine: 'duckdb' | 'sqlite' | 'indexeddb', status: EngineStatus) =>
      setResults((prev) => ({ ...prev, [engine]: status }))

    // 2. 三个引擎并行跑（互相独立）
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

    setRunning(false)
  }, [rowCount])

  const allDone = ['duckdb', 'sqlite', 'indexeddb'].every(
    (k) => results[k as keyof typeof results]?.state === 'done'
  )

  const fmt = (ms?: number) =>
    ms === undefined ? '—' : ms < 1000 ? `${ms.toFixed(1)} ms` : `${(ms / 1000).toFixed(2)} s`

  const engineMeta: { key: 'duckdb' | 'sqlite' | 'indexeddb'; name: string; desc: string }[] = [
    { key: 'duckdb', name: 'DuckDB-Wasm', desc: '列式 + 向量化 SQL 引擎' },
    { key: 'sqlite', name: 'SQLite-Wasm', desc: '行式事务数据库' },
    { key: 'indexeddb', name: 'IndexedDB + JS', desc: '浏览器原生存储 + 手动聚合' },
  ]

  return (
    <div className="my-8 rounded-xl border border-slate-700 bg-slate-900 p-5 text-slate-100">
      <h3 className="mb-1 text-lg font-bold">⚡ 三引擎性能对比 Demo</h3>
      <p className="mb-4 text-sm text-slate-400">
        生成 <strong className="text-amber-300">{rowCount.toLocaleString()}</strong>{' '}
        行模拟交易数据，执行相同查询：
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
            disabled={running}
            className={`rounded px-3 py-1 text-sm font-medium transition ${
              rowCount === n
                ? 'bg-amber-500 text-slate-900'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            } ${running ? 'opacity-50' : ''}`}
          >
            {n >= 1000000 ? `${n / 1000000}M` : `${n / 1000}K`}
          </button>
        ))}
        <button
          onClick={runBenchmark}
          disabled={running}
          className={`ml-auto rounded px-4 py-2 font-bold transition ${
            running
              ? 'cursor-wait bg-slate-700 text-slate-400'
              : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400'
          }`}
        >
          {running ? '🔄 跑分中…' : '▶ 开始跑分'}
        </button>
      </div>

      {datasetReady && (
        <p className="mb-3 text-xs text-emerald-400">
          ✓ {rowCount.toLocaleString()} 行数据已生成（确定性种子）
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {engineMeta.map(({ key, name, desc }) => {
          const st = results[key]
          return (
            <div key={key} className="rounded-lg border border-slate-700 bg-slate-800 p-4">
              <div className="text-sm font-bold">{name}</div>
              <div className="mb-2 text-xs text-slate-400">{desc}</div>
              {st?.state === 'running' && (
                <div className="animate-pulse text-sm text-amber-300">运行中…</div>
              )}
              {st?.state === 'done' && (
                <div className="text-2xl font-extrabold text-emerald-400">{fmt(st.ms)}</div>
              )}
              {st?.state === 'error' && (
                <div className="text-xs break-all text-red-400">{st.error}</div>
              )}
              {st?.state === 'idle' && <div className="text-sm text-slate-500">等待运行</div>}
            </div>
          )
        })}
      </div>

      {allDone && (
        <div className="mt-4 rounded-lg border border-emerald-700/50 bg-emerald-900/20 p-4 text-sm">
          <span className="font-bold text-emerald-300">🏆 结论：</span>
          {(() => {
            const r = results
            const d = r.duckdb?.ms ?? 0
            const s = r.sqlite?.ms ?? 0
            const i = r.indexeddb?.ms ?? 0
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

      <p className="mt-3 text-xs text-slate-500">
        ⚠️ 数据量越大，DuckDB 的列式优势越明显。首次运行需加载本地 wasm（约 5MB）。当前环境：
        {typeof navigator !== 'undefined' ? `${navigator.hardwareConcurrency ?? '?'} 核` : '?'}
      </p>
    </div>
  )
}
