/**
 * SQLite-Wasm 执行器。
 * 难点：@sqlite.org/sqlite-wasm 的 ESM 入口是一个异步 init 函数（sqlite3InitModule），
 *       需要调用后得到带 oo1 API 的模块。wasm 文件路径需显式指定（bundler-friendly）。
 * 方案：动态 import default 导出 → 传入 locateFile 指向 node_modules 里的 sqlite3.wasm → oo1 API。
 */
import type { PreparedBenchmark, TradeRow } from './data'
import { SQLITE_QUERY_DESC, campaignInsertValues, yieldToBrowser } from './data'

type SqliteDB = {
  exec: (sql: string) => unknown
  prepare: (sql: string) => SqliteStmt
  close: () => void
}
type SqliteStmt = {
  bind: (params: unknown) => void
  step: () => boolean
  get: (col: number) => unknown
  finalize: () => void
}

type SqliteModule = {
  oo1: {
    DB: new () => SqliteDB
  }
}

let sqliteInitPromise: Promise<SqliteModule> | null = null

// 只缓存模块初始化；每次 benchmark 创建新的 DB 实例（旧实例已 close，不能复用）
async function loadSqliteModule(): Promise<SqliteModule> {
  if (sqliteInitPromise) return sqliteInitPromise
  sqliteInitPromise = (async () => {
    // sqlite-wasm 官方 ESM 入口：默认导出 sqlite3InitModule
    const mod = (await import('@sqlite.org/sqlite-wasm')) as unknown as {
      default: (config: { locateFile: (file: string) => string }) => Promise<{
        oo1: {
          DB: new () => SqliteDB
        }
      }>
    }
    const sqlite3 = await mod.default({
      locateFile: (file) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/vendor/sqlite-wasm/${file}`,
    })
    return sqlite3
  })()
  return sqliteInitPromise
}

/** 预热：加载 sqlite3 wasm（一次性成本，不计入跑分计时） */
export async function prewarmSqlite(): Promise<void> {
  await loadSqliteModule()
}

/** Prepare the row store outside the race; only SQL execution is timed. */
export async function prepareSqlite(rows: TradeRow[]): Promise<PreparedBenchmark> {
  const sqlite = await loadSqliteModule()
  const db = new sqlite.oo1.DB()

  try {
    db.exec(
      'CREATE TABLE trades (id INTEGER, date TEXT, region TEXT, product TEXT, channel TEXT, device TEXT, payload TEXT, campaign_id INTEGER, amount REAL, units INTEGER, discount REAL, latency_ms INTEGER)'
    )
    db.exec('CREATE TABLE campaigns (id INTEGER PRIMARY KEY, segment TEXT, weight REAL)')
    db.exec(`INSERT INTO campaigns VALUES ${campaignInsertValues()}`)

    // Keep each synchronous SQL batch small enough to yield a paint between batches.
    const BATCH = 5_000
    for (let i = 0; i < rows.length; i += BATCH) {
      const slice = rows.slice(i, i + BATCH)
      const values = slice
        .map(
          (r) =>
            `(${r.id}, '${r.date}', '${r.region}', '${r.product}', '${r.channel}', '${r.device}', '${r.payload}', ${r.campaignId}, ${r.amount}, ${r.units}, ${r.discount}, ${r.latencyMs})`
        )
        .join(',')
      db.exec(`INSERT INTO trades VALUES ${values}`)
      if (i + BATCH < rows.length) await yieldToBrowser()
    }
  } catch (error) {
    db.close()
    throw error
  }

  return {
    runQuery: async () => {
      await yieldToBrowser()
      const t0 = performance.now()
      const stmt = db.prepare(SQLITE_QUERY_DESC)
      const top: { region: string; product: string; total: number }[] = []
      let count = 0
      while (stmt.step()) {
        if (count < 5) {
          top.push({
            region: String(stmt.get(1)),
            product: String(stmt.get(2)),
            total: Number(stmt.get(6)),
          })
        }
        count++
      }
      stmt.finalize()
      return { ms: performance.now() - t0, top }
    },
    close: async () => {
      db.close()
    },
  }
}

/** Backwards-compatible one-shot runner for callers outside the demo. */
export async function sqliteBenchmark(rows: TradeRow[]) {
  const prepared = await prepareSqlite(rows)
  try {
    return await prepared.runQuery()
  } finally {
    await prepared.close()
  }
}
