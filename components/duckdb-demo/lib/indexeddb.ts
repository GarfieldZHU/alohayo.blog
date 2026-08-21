/**
 * IndexedDB 执行器。
 * 难点：IndexedDB 没有 SQL，聚合必须把全部记录读进内存用 JS 算——这正是它"慢"的本质原因。
 * 方案：真实模拟应用场景——先把数据批量写入 IndexedDB，再全量读出 + JS 分组聚合。
 */
import type { TradeRow } from './data'

const DB_NAME = 'duckdb-demo'
const STORE = 'trades'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function clearIndexedDb(): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).clear()
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => reject(tx.error)
  })
}

async function writeRows(db: IDBDatabase, rows: TradeRow[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    for (const r of rows) store.put(r)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function readAll(db: IDBDatabase): Promise<TradeRow[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result as TradeRow[])
    req.onerror = () => reject(req.error)
  })
}

/** 预热：打开 IndexedDB（首次会触发浏览器初始化，不计入跑分计时） */
export async function prewarmIndexedDb(): Promise<void> {
  const db = await openDb()
  db.close()
}

export async function indexedDbBenchmark(rows: TradeRow[]): Promise<{
  ms: number
  top: { region: string; product: string; total: number }[]
}> {
  const t0 = performance.now()
  // Clear stale rows inside the measured window so every run starts from the
  // same dataset and the chart reflects the complete IndexedDB workload.
  await clearIndexedDb()
  const db = await openDb()
  await writeRows(db, rows)
  const all = await readAll(db)
  db.close()

  // JS 分组聚合（模拟 IndexedDB 没有 SQL，只能把数据捞出来自己算）
  const map = new Map<string, number>()
  const cntMap = new Map<string, number>()
  for (const r of all) {
    const key = `${r.region}|${r.product}`
    map.set(key, (map.get(key) ?? 0) + r.amount)
    cntMap.set(key, (cntMap.get(key) ?? 0) + 1)
  }
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1])
  const elapsed = performance.now() - t0

  const top = sorted.slice(0, 5).map(([k, total]) => {
    const [region, product] = k.split('|')
    return { region, product, total }
  })
  void cntMap
  return { ms: elapsed, top }
}
