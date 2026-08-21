/**
 * IndexedDB 执行器。
 * 难点：IndexedDB 没有 SQL，聚合必须把全部记录读进内存用 JS 算——这正是它"慢"的本质原因。
 * 方案：真实模拟应用场景——先把数据批量写入 IndexedDB，再全量读出 + JS 分组聚合。
 */
import type { PreparedBenchmark, TradeRow } from './data'
import { getCampaignDimension, yieldToBrowser } from './data'

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
  const BATCH = 5_000
  for (let start = 0; start < rows.length; start += BATCH) {
    const end = Math.min(rows.length, start + BATCH)
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const store = tx.objectStore(STORE)
      for (let i = start; i < end; i++) store.put(rows[i])
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    if (end < rows.length) await yieldToBrowser()
  }
}

async function readAll(db: IDBDatabase): Promise<TradeRow[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result as TradeRow[])
    req.onerror = () => reject(req.error)
  })
}

/** Open IndexedDB. The demo calls this inside the engine's end-to-end timer. */
export async function prewarmIndexedDb(): Promise<void> {
  const db = await openDb()
  db.close()
}

/** Prepare the browser store, then return a query-only timer for reading and aggregation. */
export async function prepareIndexedDb(rows: TradeRow[]): Promise<PreparedBenchmark> {
  await clearIndexedDb()
  const db = await openDb()
  try {
    await writeRows(db, rows)
  } catch (error) {
    db.close()
    throw error
  }

  let closed = false
  return {
    runQuery: async () => {
      await yieldToBrowser()
      const t0 = performance.now()
      const all = await readAll(db)
      const groups = new Map<
        string,
        {
          month: string
          region: string
          product: string
          channel: string
          total: number
          units: number
          latencyTotal: number
          latencies: number[]
          p95Latency: number
          campaignIds: Set<number>
          count: number
        }
      >()

      for (const row of all) {
        if (row.date < '2024-01-01' || row.date >= '2025-01-01') continue
        const dimension = getCampaignDimension(row.campaignId)
        const month = row.date.slice(0, 7)
        const key = `${month}|${row.region}|${row.product}|${row.channel}|${row.device}|${dimension.segment}`
        const group = groups.get(key)
        if (group) {
          group.total += row.amount * (1 - row.discount) * dimension.weight
          group.units += row.units
          group.latencyTotal += row.latencyMs
          group.latencies.push(row.latencyMs)
          group.campaignIds.add(row.campaignId)
          group.count += 1
        } else {
          groups.set(key, {
            month,
            region: row.region,
            product: row.product,
            channel: row.channel,
            total: row.amount * (1 - row.discount) * dimension.weight,
            units: row.units,
            latencyTotal: row.latencyMs,
            latencies: [row.latencyMs],
            p95Latency: row.latencyMs,
            campaignIds: new Set([row.campaignId]),
            count: 1,
          })
        }
      }

      for (const group of groups.values()) {
        group.latencies.sort((a, b) => a - b)
        group.p95Latency =
          group.latencies[Math.max(0, Math.ceil(group.latencies.length * 0.95) - 1)]
      }

      const partitionRanks = new Map<string, number>()
      const ranked = [...groups.values()]
        .sort((a, b) => {
          const partition = `${a.region}|${a.product}`
          const otherPartition = `${b.region}|${b.product}`
          return partition === otherPartition
            ? b.total - a.total
            : partition.localeCompare(otherPartition)
        })
        .filter((group) => {
          const partition = `${group.region}|${group.product}`
          const rank = (partitionRanks.get(partition) ?? 0) + 1
          partitionRanks.set(partition, rank)
          return rank <= 3
        })

      const top = ranked
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
        .map(({ region, product, total }) => ({ region, product, total }))
      return { ms: performance.now() - t0, top }
    },
    close: async () => {
      if (!closed) {
        closed = true
        db.close()
      }
    },
  }
}

/** Backwards-compatible one-shot runner for callers outside the demo. */
export async function indexedDbBenchmark(rows: TradeRow[]) {
  const prepared = await prepareIndexedDb(rows)
  try {
    return await prepared.runQuery()
  } finally {
    await prepared.close()
  }
}
