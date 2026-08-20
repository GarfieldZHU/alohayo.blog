/**
 * DuckDB-Wasm 执行器。
 * 难点：duckdb-wasm 需要 .wasm 二进制 + worker 文件，且站点 CSP 的 worker-src 限制为 'self' blob:。
 * 方案：把 wasm + worker 自托管到 public/vendor/duckdb-wasm/，从同源加载，
 *       既满足 CSP 又避免运行时依赖 CDN（更稳、更快）。
 * 注意：必须在浏览器端动态 import —— SSR 预渲染时 Node 环境没有 Worker，
 *       静态 import 会在构建期就炸（ReferenceError: Worker is not defined）。
 */
import type { TradeRow } from './data'
import { BENCHMARK_QUERY_DESC } from './data'

const WASM_BASE = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/vendor/duckdb-wasm`

let dbPromise: Promise<{
  conn: {
    insertArrowTable: (t: unknown, o: { name: string; create?: boolean }) => Promise<void>
    query: (sql: string) => Promise<{
      numRows: number
      getChildAt: (i: number) => { get: (row: number) => unknown } | null
    }>
    close: () => Promise<void>
  }
}> | null = null

export async function getDuckDB(): Promise<{
  conn: {
    insertArrowTable: (t: unknown, o: { name: string; create?: boolean }) => Promise<void>
    query: (sql: string) => Promise<{
      numRows: number
      getChildAt: (i: number) => { get: (row: number) => unknown } | null
    }>
    close: () => Promise<void>
  }
}> {
  if (dbPromise) return dbPromise
  dbPromise = (async () => {
    // 动态 import，只在浏览器端执行（SSR 不会走到这里）
    const duckdb = await import('@duckdb/duckdb-wasm/dist/duckdb-browser.mjs')
    const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
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
    return db.connect()
  })()
  return dbPromise
}

export async function duckdbBenchmark(rows: TradeRow[]): Promise<{
  ms: number
  top: { region: string; product: string; total: number }[]
}> {
  const conn = await getDuckDB()

  // 把 JS 数组转成 Arrow Table（列式，正好展示 DuckDB 的强项）
  const arrow = await import('apache-arrow')
  const table = arrow.tableFromJSON(rows as unknown as Record<string, unknown>[])
  await conn.insertArrowTable(table, { name: 'trades', create: true })

  // 计时执行基准查询
  const t0 = performance.now()
  const result = await conn.query(BENCHMARK_QUERY_DESC)
  const elapsed = performance.now() - t0

  // 读回 top 结果用于展示
  const top: { region: string; product: string; total: number }[] = []
  for (let i = 0; i < Math.min(5, result.numRows); i++) {
    top.push({
      region: String(result.getChildAt(0)?.get(i) ?? ''),
      product: String(result.getChildAt(1)?.get(i) ?? ''),
      total: Number(result.getChildAt(2)?.get(i) ?? 0),
    })
  }

  await conn.close()
  return { ms: elapsed, top }
}
