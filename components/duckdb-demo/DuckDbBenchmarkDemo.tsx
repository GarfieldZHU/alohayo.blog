'use client'

import { useCallback, useEffect, useReducer } from 'react'
import { generateTrades, type TradeRow } from './lib/data'
import { duckdbBenchmark, prewarmDuckDB } from './lib/duckdb'
import { sqliteBenchmark, prewarmSqlite } from './lib/sqlite'
import { indexedDbBenchmark, prewarmIndexedDb } from './lib/indexeddb'
import {
  createInitialBenchmarkState,
  getEngineDisplayMs,
  reduceBenchmarkState,
  type EngineKey,
  type EngineStatus,
} from './lib/benchmarkState'
import { QuerySource } from './QuerySource'

const ROW_OPTIONS = [50_000, 200_000, 1_000_000] as const
type DemoLocale = 'en' | 'zh-CN'

const ENGINE_META: {
  key: EngineKey
  names: Record<DemoLocale, string>
  descriptions: Record<DemoLocale, string>
  bar: string
}[] = [
  {
    key: 'duckdb',
    names: { en: 'DuckDB-Wasm', 'zh-CN': 'DuckDB-Wasm' },
    descriptions: { en: 'Columnar + vectorized SQL', 'zh-CN': '列式 + 向量化 SQL' },
    bar: 'bg-gradient-to-r from-sky-500 to-cyan-400',
  },
  {
    key: 'sqlite',
    names: { en: 'SQLite-Wasm', 'zh-CN': 'SQLite-Wasm' },
    descriptions: { en: 'Row-oriented transactional DB', 'zh-CN': '行式事务数据库' },
    bar: 'bg-gradient-to-r from-violet-500 to-fuchsia-400',
  },
  {
    key: 'indexeddb',
    names: { en: 'IndexedDB + JS', 'zh-CN': 'IndexedDB + JS' },
    descriptions: {
      en: 'Browser storage + handwritten aggregation',
      'zh-CN': '浏览器原生存储 + JS 手写聚合',
    },
    bar: 'bg-gradient-to-r from-rose-500 to-orange-400',
  },
]

const COPY: Record<
  DemoLocale,
  {
    title: string
    introBeforeRows: string
    introAfterRows: string
    datasetLabel: string
    start: string
    warmingButton: string
    runningButton: string
    warming: string
    ready: string
    waiting: string
    error: string
    conclusion: string
    fastest: Record<EngineKey, string>
    duckdbFasterBeforeRatio: string
    duckdbFasterAfterRatio: string
    footer: string
    generated: string
    cores: string
  }
> = {
  en: {
    title: '⚡ Three-engine benchmark',
    introBeforeRows: 'Generate',
    introAfterRows:
      'rows of deterministic mock trades. All three engines start together with the same query:',
    datasetLabel: 'Dataset:',
    start: '▶ Run benchmark',
    warmingButton: '🔌 Warming engines…',
    runningButton: '🔄 Running…',
    warming: '🔌 Loading engines. Once warm, all three start together…',
    ready: 'rows generated (deterministic seed)',
    waiting: 'Waiting',
    error: 'Error',
    conclusion: '🏆 Result:',
    fastest: {
      duckdb: 'DuckDB is fastest',
      sqlite: 'SQLite is fastest',
      indexeddb: 'IndexedDB is fastest',
    },
    duckdbFasterBeforeRatio: 'DuckDB is',
    duckdbFasterAfterRatio: 'x faster than IndexedDB',
    footer:
      '⚠️ Larger datasets make DuckDB’s columnar advantage more obvious. Bars show measured elapsed time; completed bars stay put. Full scale is an estimate. Environment: ',
    generated: 'Demo copy and implementation generated with DeepSeek V4 Flash.',
    cores: ' cores',
  },
  'zh-CN': {
    title: '⚡ 三引擎性能对比 Demo',
    introBeforeRows: '生成',
    introAfterRows: '行确定性模拟交易数据，三个引擎同时起跑执行相同查询：',
    datasetLabel: '数据量：',
    start: '▶ 开始跑分',
    warmingButton: '🔌 预热引擎…',
    runningButton: '🔄 跑分中…',
    warming: '🔌 加载引擎，完成后让三个引擎同时起跑…',
    ready: '行数据已生成（确定性种子）',
    waiting: '等待',
    error: '错误',
    conclusion: '🏆 结论：',
    fastest: {
      duckdb: 'DuckDB 最快',
      sqlite: 'SQLite 最快',
      indexeddb: 'IndexedDB 最快',
    },
    duckdbFasterBeforeRatio: 'DuckDB 比 IndexedDB 快',
    duckdbFasterAfterRatio: 'x',
    footer:
      '⚠️ 数据量越大，DuckDB 的列式优势越明显。柱子显示真实耗时，完成后会固定在实测位置；满格时间轴是预估值。当前环境：',
    generated: 'Demo 文案与实现：DeepSeek V4 Flash 生成。',
    cores: ' 核',
  },
}

/**
 * 计时柱满格对应的毫秒数 = 最慢引擎的预估耗时。
 * 这是视觉刻度，不会覆盖引擎自己的实测耗时。
 */
function estimateMs(rows: number): number {
  if (rows <= 50_000) return 3_000
  if (rows <= 200_000) return 15_000
  return 60_000
}

const fmt = (ms: number) => (ms < 1000 ? `${ms.toFixed(1)} ms` : `${(ms / 1000).toFixed(2)} s`)
const fmtLive = (ms: number) => (ms < 1000 ? `${ms.toFixed(0)} ms` : `${(ms / 1000).toFixed(2)} s`)

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function DuckDbBenchmarkDemo({ locale = 'en' }: { locale?: DemoLocale }) {
  const [state, dispatch] = useReducer(reduceBenchmarkState, createInitialBenchmarkState(200_000))
  const copy = COPY[locale]

  // One shared live clock while work is running. Completed rows use their own
  // measured duration from the reducer and therefore cannot jump backwards.
  useEffect(() => {
    if (state.phase !== 'racing' || state.startedAt === undefined) return
    let raf = 0
    const loop = (now: number) => {
      dispatch({ type: 'tick', elapsed: now - state.startedAt! })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [state.phase, state.startedAt])

  const runBenchmark = useCallback(async () => {
    const rowCount = state.rowCount
    dispatch({ type: 'run-start' })

    let rows: TradeRow[]
    try {
      rows = generateTrades(rowCount)
    } catch (error) {
      dispatch({ type: 'engine-error', key: 'duckdb', error: errorMessage(error) })
      dispatch({ type: 'finish' })
      return
    }
    dispatch({ type: 'dataset-ready' })

    // One-time wasm/worker cost is deliberately outside the race.
    await Promise.allSettled([prewarmDuckDB(), prewarmSqlite(), prewarmIndexedDb()])

    const startedAt = performance.now()
    // Initialising every row as running makes the chart appear once, without
    // a blank frame while the three async functions are being scheduled.
    dispatch({ type: 'race-start', startedAt })

    const runEngine = async (
      key: EngineKey,
      benchmark: (input: TradeRow[]) => Promise<{ ms: number }>
    ) => {
      try {
        const result = await benchmark(rows)
        dispatch({ type: 'engine-complete', key, ms: result.ms })
      } catch (error) {
        dispatch({ type: 'engine-error', key, error: errorMessage(error) })
      }
    }

    await Promise.allSettled([
      runEngine('duckdb', duckdbBenchmark),
      runEngine('sqlite', sqliteBenchmark),
      runEngine('indexeddb', indexedDbBenchmark),
    ])

    dispatch({ type: 'finish' })
  }, [state.rowCount])

  const busy = state.phase === 'warming' || state.phase === 'racing'
  const scale = estimateMs(state.rowCount)
  const allDone =
    state.phase === 'done' &&
    (['duckdb', 'sqlite', 'indexeddb'] as EngineKey[]).every(
      (key) => state.results[key]?.state === 'done'
    )
  const raceActive = state.phase === 'racing' || (state.phase === 'done' && state.datasetReady)

  return (
    <div className="my-8 rounded-xl border border-slate-700 bg-slate-900 p-5 text-slate-100">
      <h3 className="mb-1 text-lg font-bold">{copy.title}</h3>
      <p className="mb-4 text-sm text-slate-400">
        {copy.introBeforeRows}{' '}
        <strong className="text-amber-300">{state.rowCount.toLocaleString()}</strong>{' '}
        {copy.introAfterRows}
        <code className="mt-1 block rounded bg-slate-800 px-2 py-1 text-xs">
          SELECT region, product, SUM(amount) AS total, COUNT(*) AS cnt FROM trades GROUP BY region,
          product ORDER BY total DESC
        </code>
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-300">{copy.datasetLabel}</span>
        {ROW_OPTIONS.map((rowCount) => (
          <button
            key={rowCount}
            onClick={() => dispatch({ type: 'dataset-change', rowCount })}
            disabled={busy}
            className={`rounded px-3 py-1 text-sm font-medium transition ${
              state.rowCount === rowCount
                ? 'bg-amber-500 text-slate-900'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            } ${busy ? 'opacity-50' : ''}`}
          >
            {rowCount >= 1_000_000 ? `${rowCount / 1_000_000}M` : `${rowCount / 1_000}K`}
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
          {state.phase === 'warming'
            ? copy.warmingButton
            : state.phase === 'racing'
              ? copy.runningButton
              : copy.start}
        </button>
      </div>

      {state.datasetReady && (
        <p className="mb-3 text-xs text-emerald-400">
          ✓ {state.rowCount.toLocaleString()} {copy.ready}
        </p>
      )}
      {state.phase === 'warming' && (
        <p className="mb-3 animate-pulse text-xs text-amber-300">{copy.warming}</p>
      )}

      {raceActive && (
        <div className="space-y-3">
          {ENGINE_META.map(({ key, names, descriptions, bar }) => {
            const status: EngineStatus | undefined = state.results[key]
            const running = status?.state === 'running'
            const done = status?.state === 'done'
            const displayMs = getEngineDisplayMs(status, state.elapsed)
            const width = Math.min(100, (displayMs / scale) * 100)
            return (
              <div key={key}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-slate-200">
                    {names[locale]}
                    <span className="ml-2 text-[11px] font-normal text-slate-500">
                      {descriptions[locale]}
                    </span>
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
                    {done
                      ? `✓ ${fmt(displayMs)}`
                      : running
                        ? fmtLive(displayMs)
                        : status?.state === 'error'
                          ? copy.error
                          : copy.waiting}
                  </span>
                </div>
                <div className="relative h-6 overflow-hidden rounded-md bg-slate-800/80 ring-1 ring-slate-700 ring-inset">
                  <div
                    className={`h-full rounded-md ${bar}`}
                    style={{ width: `${Math.max(width, width > 0 ? 0.6 : 0)}%` }}
                  />
                </div>
                {status?.state === 'error' && (
                  <div className="mt-1 text-xs break-all text-red-400">{status.error}</div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {allDone && (
        <div className="mt-4 rounded-lg border border-emerald-700/50 bg-emerald-900/20 p-4 text-sm">
          <span className="font-bold text-emerald-300">{copy.conclusion}</span>
          {(() => {
            const durations = {
              duckdb: state.results.duckdb?.ms ?? 0,
              sqlite: state.results.sqlite?.ms ?? 0,
              indexeddb: state.results.indexeddb?.ms ?? 0,
            }
            const fastest = (Object.keys(durations) as EngineKey[]).reduce((key, candidate) =>
              durations[candidate] < durations[key] ? candidate : key
            )
            const ratio = Math.max(
              1,
              Math.round(durations.indexeddb / Math.max(1, durations.duckdb))
            )
            return (
              <>
                {copy.fastest[fastest]} · {copy.duckdbFasterBeforeRatio}{' '}
                <strong>
                  {ratio}
                  {copy.duckdbFasterAfterRatio}
                </strong>
              </>
            )
          })()}
        </div>
      )}

      <QuerySource locale={locale} />

      <p className="mt-3 text-xs text-slate-500">
        {copy.footer}
        {typeof navigator !== 'undefined'
          ? `${navigator.hardwareConcurrency ?? '?'}${copy.cores}`
          : '?'}
      </p>
      <p className="mt-2 text-[11px] text-slate-600">{copy.generated}</p>
    </div>
  )
}
