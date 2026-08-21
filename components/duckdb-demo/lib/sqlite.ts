/**
 * SQLite-Wasm 执行器。
 * 难点：@sqlite.org/sqlite-wasm 的 ESM 入口是一个异步 init 函数（sqlite3InitModule），
 *       需要调用后得到带 oo1 API 的模块。wasm 文件路径需显式指定（bundler-friendly）。
 * 方案：动态 import default 导出 → 传入 locateFile 指向 node_modules 里的 sqlite3.wasm → oo1 API。
 */
import type { TradeRow } from './data'
import { BENCHMARK_QUERY_DESC } from './data'

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

export async function sqliteBenchmark(rows: TradeRow[]): Promise<{
  ms: number
  top: { region: string; product: string; total: number }[]
}> {
  const t0 = performance.now()
  const sqlite = await loadSqliteModule()
  const db = new sqlite.oo1.DB()

  db.exec('CREATE TABLE trades (id INTEGER, date TEXT, region TEXT, product TEXT, amount REAL)')

  // 计时范围：初始化、插入 + 查询（公平对比，因为三个引擎都从函数入口计时）

  // 批量插入：用一条 INSERT 多值语句提速（SQLite 单条 prepared 逐行 insert 100 万行会非常慢）
  const BATCH = 10_000
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH)
    const values = slice
      .map((r) => `(${r.id}, '${r.date}', '${r.region}', '${r.product}', ${r.amount})`)
      .join(',')
    db.exec(`INSERT INTO trades VALUES ${values}`)
  }

  // 基准查询
  const stmt = db.prepare(BENCHMARK_QUERY_DESC)
  const top: { region: string; product: string; total: number }[] = []
  let count = 0
  while (stmt.step()) {
    if (count < 5) {
      top.push({
        region: String(stmt.get(0)),
        product: String(stmt.get(1)),
        total: Number(stmt.get(2)),
      })
    }
    count++
  }
  stmt.finalize()
  db.close()
  const elapsed = performance.now() - t0

  return { ms: elapsed, top }
}
