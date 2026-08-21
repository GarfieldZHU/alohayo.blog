/**
 * 生成模拟交易数据，用于三引擎性能对比。
 * 数据结构：date, region, product, amount
 * 生成的数组可同时被 DuckDB / SQLite / IndexedDB 使用。
 */

export interface TradeRow {
  id: number
  date: string
  region: string
  product: string
  amount: number
}

const REGIONS = ['East', 'West', 'North', 'South', 'Central']
const PRODUCTS = ['Widget', 'Gadget', 'Gizmo', 'Doohickey', 'Thingamajig', 'Whatchamacallit']

/** 确定性伪随机，保证每次 demo 数据一致、结果可比 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateTrades(rowCount: number, seed = 42): TradeRow[] {
  const rand = mulberry32(seed)
  const rows: TradeRow[] = new Array(rowCount)
  const start = Date.UTC(2024, 0, 1)
  const dayMs = 86400000
  for (let i = 0; i < rowCount; i++) {
    const dayOffset = Math.floor(rand() * 365) // 一年内的随机日期
    rows[i] = {
      id: i + 1,
      date: new Date(start + dayOffset * dayMs).toISOString().slice(0, 10),
      region: REGIONS[Math.floor(rand() * REGIONS.length)],
      product: PRODUCTS[Math.floor(rand() * PRODUCTS.length)],
      amount: Math.round(rand() * 10000) / 100,
    }
  }
  return rows
}

/** 基准查询：按 region+product 分组求和，按金额排序。三种引擎跑同一个语义。 */
export const BENCHMARK_QUERY_DESC =
  'SELECT region, product, SUM(amount) AS total, COUNT(*) AS cnt FROM trades GROUP BY region, product ORDER BY total DESC'

export interface BenchmarkResult {
  engine: string
  rows: number
  ms: number
  top?: { region: string; product: string; total: number }[]
  error?: string
}
