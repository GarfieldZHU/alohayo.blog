'use client'

import { useCallback, useEffect, useReducer, useState } from 'react'
import {
  BENCHMARK_QUERY_DESC,
  generateTradesAsync,
  yieldToBrowser,
  type TradeRow,
} from './lib/data'
import { prepareDuckDB, prewarmDuckDB } from './lib/duckdb'
import { prepareSqlite, prewarmSqlite } from './lib/sqlite'
import { prepareIndexedDb, prewarmIndexedDb } from './lib/indexeddb'
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
    generating: string
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
      'rows of deterministic mock trades. All three engines measure the same analytical question:',
    datasetLabel: 'Dataset:',
    start: '▶ Run benchmark',
    warmingButton: '🔌 Warming engines…',
    runningButton: '🔄 Running…',
    generating: 'Preparing dataset…',
    warming: '🔌 Loading engines. Once warm, each query runs in turn to avoid CPU contention…',
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
      '⚠️ Larger datasets make DuckDB’s columnar advantage more obvious. Queries run one at a time so workers do not steal CPU from each other. Bars show measured elapsed time; completed bars stay put. Full scale is an estimate. Environment: ',
    generated: 'Generated with DeepSeek V4 Flash.',
    cores: ' cores',
  },
  'zh-CN': {
    title: '⚡ 三引擎性能对比 Demo',
    introBeforeRows: '生成',
    introAfterRows: '行确定性模拟交易数据，三个引擎轮流回答同一个分析问题（各自实现）：',
    datasetLabel: '数据量：',
    start: '▶ 开始跑分',
    warmingButton: '🔌 预热引擎…',
    runningButton: '🔄 跑分中…',
    generating: '准备数据中…',
    warming: '🔌 加载引擎，完成后依次跑查询，避免引擎互相抢 CPU…',
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
      '⚠️ 数据量越大，DuckDB 的列式优势越明显。查询会依次执行，避免引擎互相抢 CPU；柱子显示真实耗时，完成后会固定在实测位置；满格时间轴是预估值。当前环境：',
    generated: 'DeepSeek V4 Flash 生成。',
    cores: ' 核',
  },
}

/**
 * 计时柱满格对应的毫秒数 = 最慢引擎的预估耗时。
 * 这是视觉刻度，不会覆盖引擎自己的实测耗时。
 */
function estimateMs(rows: number): number {
  if (rows <= 50_000) return 750
  if (rows <= 200_000) return 3_000
  return 12_000
}

const fmt = (ms: number) => (ms < 1000 ? `${ms.toFixed(1)} ms` : `${(ms / 1000).toFixed(2)} s`)
const fmtLive = (ms: number) => (ms < 1000 ? `${ms.toFixed(0)} ms` : `${(ms / 1000).toFixed(2)} s`)

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function DuckDbBenchmarkDemo({ locale = 'en' }: { locale?: DemoLocale }) {
  const [state, dispatch] = useReducer(reduceBenchmarkState, createInitialBenchmarkState(200_000))
  const [cpuCount, setCpuCount] = useState<number | null>(null)
  const copy = COPY[locale]

  useEffect(() => {
    setCpuCount(typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency ?? null) : null)
  }, [])

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
      rows = await generateTradesAsync(rowCount, 42, (progress) => {
        dispatch({ type: 'generation-progress', progress })
      })
    } catch (error) {
      dispatch({ type: 'engine-error', key: 'duckdb', error: errorMessage(error) })
      dispatch({ type: 'finish' })
      return
    }
    dispatch({ type: 'dataset-ready' })

    // One-time wasm/worker cost is deliberately outside the measured queries.
    await Promise.allSettled([prewarmDuckDB(), prewarmSqlite(), prewarmIndexedDb()])

    // Finish all storage work before the chart appears. This makes the bars a
    // query-only comparison instead of a noisy mix of loading and ingestion.
    const preparedResults = await Promise.allSettled([
      prepareDuckDB(rows),
      prepareSqlite(rows),
      prepareIndexedDb(rows),
    ])

    const startedAt = performance.now()
    dispatch({ type: 'race-start', startedAt })
    // Let React paint the waiting bars before the first query starts.
    await yieldToBrowser()

    const prepared: { key: EngineKey; value: Awaited<ReturnType<typeof prepareDuckDB>> }[] = []
    const keys: EngineKey[] = ['duckdb', 'sqlite', 'indexeddb']
    preparedResults.forEach((result, index) => {
      const key = keys[index]
      if (result.status === 'fulfilled') {
        prepared.push({ key, value: result.value })
      } else {
        dispatch({ type: 'engine-error', key, error: errorMessage(result.reason) })
      }
    })

    const runEngine = async ({ key, value }: (typeof prepared)[number]) => {
      dispatch({ type: 'engine-running', key })
      // Paint the running state before a synchronous WASM/JS step begins.
      await yieldToBrowser()
      try {
        const result = await value.runQuery()
        dispatch({ type: 'engine-complete', key, ms: result.ms })
      } catch (error) {
        dispatch({ type: 'engine-error', key, error: errorMessage(error) })
      }
    }

    for (const engine of prepared) {
      await runEngine(engine)
    }
    await Promise.allSettled(prepared.map(({ value }) => value.close()))

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
    <div className="my-8 rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <h3 className="mb-1 text-lg font-bold">{copy.title}</h3>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        {copy.introBeforeRows}{' '}
        <strong className="text-amber-600 dark:text-amber-300">
          {state.rowCount.toLocaleString()}
        </strong>{' '}
        {copy.introAfterRows}
        <code className="mt-1 block rounded bg-slate-100 px-2 py-1 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
          {BENCHMARK_QUERY_DESC}
        </code>
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-700 dark:text-slate-300">{copy.datasetLabel}</span>
        {ROW_OPTIONS.map((rowCount) => (
          <button
            key={rowCount}
            onClick={() => dispatch({ type: 'dataset-change', rowCount })}
            disabled={busy}
            className={`rounded px-3 py-1 text-sm font-medium transition ${
              state.rowCount === rowCount
                ? 'bg-amber-500 text-slate-900'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
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
              ? 'cursor-wait bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
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
        <p className="mb-3 text-xs text-emerald-600 dark:text-emerald-400">
          ✓ {state.rowCount.toLocaleString()} {copy.ready}
        </p>
      )}
      {state.phase === 'warming' && (
        <p className="mb-3 animate-pulse text-xs text-amber-600 dark:text-amber-300">
          {state.generationProgress < 1
            ? `${copy.generating} ${Math.round(state.generationProgress * 100)}%`
            : copy.warming}
        </p>
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
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {names[locale]}
                    <span className="ml-2 text-[11px] font-normal text-slate-500 dark:text-slate-400">
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
                <div className="relative h-6 overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-300 ring-inset dark:bg-slate-800/80 dark:ring-slate-700">
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
        <div className="mt-4 rounded-lg border border-emerald-700/50 bg-emerald-50 p-4 text-sm dark:bg-emerald-900/20">
          <span className="font-bold text-emerald-700 dark:text-emerald-300">
            {copy.conclusion}
          </span>
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

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {copy.footer}
        {`${cpuCount ?? '?'}${copy.cores}`}
      </p>
      <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-500">{copy.generated}</p>
    </div>
  )
}
