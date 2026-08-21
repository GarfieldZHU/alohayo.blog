/**
 * DuckDB-Wasm 执行器。
 * 难点：duckdb-wasm 需要 .wasm 二进制 + worker 文件，且站点 CSP 的 worker-src 限制为 'self' blob:。
 * 方案：把 wasm + worker 自托管到 public/vendor/duckdb-wasm/，从同源加载，
 *       既满足 CSP 又避免运行时依赖 CDN（更稳、更快）。
 * 注意：必须在浏览器端动态 import —— SSR 预渲染时 Node 环境没有 Worker，
 *       静态 import 会在构建期就炸（ReferenceError: Worker is not defined）。
 */
import type { PreparedBenchmark, TradeRow } from './data'
import { BENCHMARK_QUERY_DESC, campaignInsertValues, yieldToBrowser } from './data'

const WASM_BASE = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/vendor/duckdb-wasm`

type DuckDBConnection = {
  insertArrowTable: (t: unknown, o: { name: string; create?: boolean }) => Promise<void>
  query: (sql: string) => Promise<{
    numRows: number
    getChildAt: (i: number) => { get: (row: number) => unknown } | null
  }>
  close: () => Promise<void>
}

type DuckDBInstance = {
  connect: () => Promise<DuckDBConnection>
}

// 只缓存 duckdb 实例；每次 benchmark 新开一个 connection（旧 conn 已 close）
let duckdbInstancePromise: Promise<DuckDBInstance> | null = null

async function getDuckDBInstance(): Promise<DuckDBInstance> {
  if (!duckdbInstancePromise) {
    duckdbInstancePromise = (async () => {
      // 动态 import，只在浏览器端执行（SSR 不会走到这里）
      const duckdb = await import('@duckdb/duckdb-wasm/dist/duckdb-browser.mjs')
      const MANUAL_BUNDLES = {
        mvp: {
          mainModule: `${WASM_BASE}/duckdb-mvp.wasm`,
          mainWorker: `${WASM_BASE}/duckdb-browser-mvp.worker.js`,
        },
        eh: {
          mainModule: `${WASM_BASE}/duckdb-eh.wasm`,
          mainWorker: `${WASM_BASE}/duckdb-browser-eh.worker.js`,
        },
        coi: {
          mainModule: `${WASM_BASE}/duckdb-coi.wasm`,
          mainWorker: `${WASM_BASE}/duckdb-browser-coi.worker.js`,
          pthreadWorker: `${WASM_BASE}/duckdb-browser-coi.pthread.worker.js`,
        },
      }
      const bundle = await duckdb.selectBundle(MANUAL_BUNDLES)
      const worker = new Worker(bundle.mainWorker!)
      const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING)
      const db = new duckdb.AsyncDuckDB(logger, worker)
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker)
      return { connect: () => db.connect() }
    })()
  }
  const instance = await duckdbInstancePromise
  return instance
}

/** Load the wasm/worker. The demo calls this inside the engine's end-to-end timer. */
export async function prewarmDuckDB(): Promise<void> {
  await getDuckDBInstance()
}

export async function getDuckDB(): Promise<{
  conn: DuckDBConnection
}> {
  const instance = await getDuckDBInstance()
  return { conn: await instance.connect() }
}

async function rowsToArrowTable(rows: TradeRow[]) {
  const columns: Record<string, unknown[]> = {
    id: new Array(rows.length),
    date: new Array(rows.length),
    region: new Array(rows.length),
    product: new Array(rows.length),
    channel: new Array(rows.length),
    device: new Array(rows.length),
    payload: new Array(rows.length),
    campaign_id: new Array(rows.length),
    amount: new Array(rows.length),
    units: new Array(rows.length),
    discount: new Array(rows.length),
    latency_ms: new Array(rows.length),
  }

  for (let start = 0; start < rows.length; start += 10_000) {
    const end = Math.min(rows.length, start + 10_000)
    for (let i = start; i < end; i++) {
      const row = rows[i]
      columns.id[i] = row.id
      columns.date[i] = row.date
      columns.region[i] = row.region
      columns.product[i] = row.product
      columns.channel[i] = row.channel
      columns.device[i] = row.device
      columns.payload[i] = row.payload
      columns.campaign_id[i] = row.campaignId
      columns.amount[i] = row.amount
      columns.units[i] = row.units
      columns.discount[i] = row.discount
      columns.latency_ms[i] = row.latencyMs
    }
    if (end < rows.length) await yieldToBrowser()
  }

  const arrow = await import('apache-arrow')
  return arrow.tableFromArrays(columns)
}

function readTop(result: {
  numRows: number
  getChildAt: (i: number) => { get: (row: number) => unknown } | null
}) {
  const top: { region: string; product: string; total: number }[] = []
  for (let i = 0; i < Math.min(5, result.numRows); i++) {
    top.push({
      region: String(result.getChildAt(1)?.get(i) ?? ''),
      product: String(result.getChildAt(2)?.get(i) ?? ''),
      total: Number(result.getChildAt(6)?.get(i) ?? 0),
    })
  }
  return top
}

/** Prepare storage, then return a query-only timer for the result comparison. */
export async function prepareDuckDB(rows: TradeRow[]): Promise<PreparedBenchmark> {
  const { conn } = await getDuckDB()
  try {
    const table = await rowsToArrowTable(rows)
    await conn.query('DROP TABLE IF EXISTS trades')
    await conn.query('DROP TABLE IF EXISTS campaigns')
    await conn.insertArrowTable(table, { name: 'trades', create: true })
    await conn.query('CREATE TABLE campaigns (id INTEGER, segment VARCHAR, weight DOUBLE)')
    await conn.query(`INSERT INTO campaigns VALUES ${campaignInsertValues()}`)
  } catch (error) {
    await conn.close()
    throw error
  }

  return {
    runQuery: async () => {
      await yieldToBrowser()
      const t0 = performance.now()
      const result = await conn.query(BENCHMARK_QUERY_DESC)
      const top = readTop(result)
      return { ms: performance.now() - t0, top }
    },
    close: () => conn.close(),
  }
}

/** Backwards-compatible one-shot runner for callers outside the demo. */
export async function duckdbBenchmark(rows: TradeRow[]) {
  const prepared = await prepareDuckDB(rows)
  try {
    return await prepared.runQuery()
  } finally {
    await prepared.close()
  }
}
