/**
 * 生成模拟交易数据，用于三引擎性能对比。
 * 数据结构：date, region, product, channel, device, payload, campaignId, amount, units, discount, latencyMs
 * 生成的数组可同时被 DuckDB / SQLite / IndexedDB 使用。
 */

export interface TradeRow {
  id: number
  date: string
  region: string
  product: string
  channel: string
  device: string
  payload: string
  campaignId: number
  amount: number
  units: number
  discount: number
  latencyMs: number
}

const REGIONS = ['East', 'West', 'North', 'South', 'Central']
const PRODUCTS = ['Widget', 'Gadget', 'Gizmo', 'Doohickey', 'Thingamajig', 'Whatchamacallit']
const CHANNELS = ['Web', 'Mobile', 'Partner', 'API']
const DEVICES = ['Desktop', 'Phone', 'Tablet', 'Bot']
const PAYLOAD_CONTEXT =
  'ua=Mozilla/5.0;locale=en-US;experiment=checkout-v2;trace=7f0a1c9d;flags=a17,b04,c11;'.repeat(3)
const PAYLOADS = [
  '{"experiment":"control","source":"ads","route":"checkout","context":"' + PAYLOAD_CONTEXT + '"}',
  '{"experiment":"variant-a","source":"organic","route":"search","context":"' +
    PAYLOAD_CONTEXT +
    '"}',
  '{"experiment":"variant-b","source":"partner","route":"detail","context":"' +
    PAYLOAD_CONTEXT +
    '"}',
  '{"experiment":"control","source":"email","route":"home","context":"' + PAYLOAD_CONTEXT + '"}',
]
const CAMPAIGN_SEGMENTS = [
  'Growth',
  'Retention',
  'Enterprise',
  'Marketplace',
  'Gaming',
  'Education',
]
export const CAMPAIGN_COUNT = 20_000
const DAY_MS = 86400000
const START_UTC = Date.UTC(2024, 0, 1)
const DATE_STRINGS = Array.from({ length: 365 }, (_, dayOffset) =>
  new Date(START_UTC + dayOffset * DAY_MS).toISOString().slice(0, 10)
)
const GENERATION_CHUNK_SIZE = 10_000

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
  for (let i = 0; i < rowCount; i++) {
    const dayOffset = Math.floor(rand() * 365) // 一年内的随机日期
    rows[i] = {
      id: i + 1,
      date: DATE_STRINGS[dayOffset],
      region: REGIONS[Math.floor(rand() * REGIONS.length)],
      product: PRODUCTS[Math.floor(rand() * PRODUCTS.length)],
      channel: CHANNELS[Math.floor(rand() * CHANNELS.length)],
      device: DEVICES[Math.floor(rand() * DEVICES.length)],
      payload: PAYLOADS[Math.floor(rand() * PAYLOADS.length)],
      campaignId: 1 + Math.floor(rand() * CAMPAIGN_COUNT),
      amount: Math.round(rand() * 10000) / 100,
      units: 1 + Math.floor(rand() * 8),
      discount: Math.round(rand() * 30) / 100,
      latencyMs: 20 + Math.floor(rand() * 480),
    }
  }
  return rows
}

/**
 * Yield once so a long preparation step gives the browser a chance to paint.
 * The fallback keeps the helper usable in tests and non-visual environments.
 */
export function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve())
    } else {
      setTimeout(resolve, 0)
    }
  })
}

/** Generate rows in chunks so progress can be painted before a large run ends. */
export async function generateTradesAsync(
  rowCount: number,
  seed = 42,
  onProgress?: (progress: number) => void
): Promise<TradeRow[]> {
  const rand = mulberry32(seed)
  const rows: TradeRow[] = new Array(rowCount)
  onProgress?.(0)

  for (let start = 0; start < rowCount; start += GENERATION_CHUNK_SIZE) {
    const end = Math.min(rowCount, start + GENERATION_CHUNK_SIZE)
    for (let i = start; i < end; i++) {
      const dayOffset = Math.floor(rand() * 365)
      rows[i] = {
        id: i + 1,
        date: DATE_STRINGS[dayOffset],
        region: REGIONS[Math.floor(rand() * REGIONS.length)],
        product: PRODUCTS[Math.floor(rand() * PRODUCTS.length)],
        channel: CHANNELS[Math.floor(rand() * CHANNELS.length)],
        device: DEVICES[Math.floor(rand() * DEVICES.length)],
        payload: PAYLOADS[Math.floor(rand() * PAYLOADS.length)],
        campaignId: 1 + Math.floor(rand() * CAMPAIGN_COUNT),
        amount: Math.round(rand() * 10000) / 100,
        units: 1 + Math.floor(rand() * 8),
        discount: Math.round(rand() * 30) / 100,
        latencyMs: 20 + Math.floor(rand() * 480),
      }
    }
    onProgress?.(end / Math.max(1, rowCount))
    if (end < rowCount) await yieldToBrowser()
  }

  onProgress?.(1)
  return rows
}

export function getCampaignDimension(campaignId: number): { segment: string; weight: number } {
  const index = Math.max(0, campaignId - 1)
  return {
    segment: CAMPAIGN_SEGMENTS[index % CAMPAIGN_SEGMENTS.length],
    weight: 0.85 + ((index * 17) % 31) / 100,
  }
}

export function campaignInsertValues(): string {
  return Array.from({ length: CAMPAIGN_COUNT }, (_, index) => {
    const campaignId = index + 1
    const { segment, weight } = getCampaignDimension(campaignId)
    return `(${campaignId}, '${segment}', ${weight.toFixed(2)})`
  }).join(',')
}

/** DuckDB 基准查询：宽表筛选 + 星型维表连接 + 月度聚合 + P95 + 分区窗口排名。 */
export const BENCHMARK_QUERY_DESC =
  "WITH full_year AS (SELECT SUBSTR(t.date, 1, 7) AS month, t.region, t.product, t.channel, t.device, c.segment, c.weight, t.campaign_id, t.amount, t.units, t.discount, t.latency_ms FROM trades AS t JOIN campaigns AS c ON c.id = t.campaign_id WHERE t.date >= '2024-01-01' AND t.date < '2025-01-01'), monthly AS (SELECT month, region, product, channel, device, segment, SUM(amount * (1 - discount) * weight) AS total, SUM(units) AS units, AVG(latency_ms) AS avg_latency_ms, QUANTILE_DISC(latency_ms, 0.95) AS p95_latency_ms, COUNT(*) AS cnt, COUNT(DISTINCT campaign_id) AS campaign_count FROM full_year GROUP BY month, region, product, channel, device, segment), ranked AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY region, product ORDER BY total DESC) AS product_rank, RANK() OVER (PARTITION BY segment ORDER BY total DESC) AS segment_rank, SUM(total) OVER (PARTITION BY month, region) AS region_month_total FROM monthly) SELECT month, region, product, channel, device, segment, total, units, avg_latency_ms, p95_latency_ms, cnt, campaign_count FROM ranked WHERE product_rank <= 3 ORDER BY total DESC LIMIT 20"

/** SQLite equivalent: emulate discrete P95 with a partitioned row number. */
export const SQLITE_QUERY_DESC =
  "WITH full_year AS (SELECT SUBSTR(t.date, 1, 7) AS month, t.region, t.product, t.channel, t.device, c.segment, c.weight, t.campaign_id, t.amount, t.units, t.discount, t.latency_ms FROM trades AS t JOIN campaigns AS c ON c.id = t.campaign_id WHERE t.date >= '2024-01-01' AND t.date < '2025-01-01'), ordered AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY month, region, product, channel, device, segment ORDER BY latency_ms) AS latency_rank, COUNT(*) OVER (PARTITION BY month, region, product, channel, device, segment) AS latency_count FROM full_year), monthly AS (SELECT month, region, product, channel, device, segment, SUM(amount * (1 - discount) * weight) AS total, SUM(units) AS units, AVG(latency_ms) AS avg_latency_ms, MAX(CASE WHEN latency_rank = ((latency_count * 95 + 99) / 100) THEN latency_ms END) AS p95_latency_ms, COUNT(*) AS cnt, COUNT(DISTINCT campaign_id) AS campaign_count FROM ordered GROUP BY month, region, product, channel, device, segment), ranked AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY region, product ORDER BY total DESC) AS product_rank, RANK() OVER (PARTITION BY segment ORDER BY total DESC) AS segment_rank, SUM(total) OVER (PARTITION BY month, region) AS region_month_total FROM monthly) SELECT month, region, product, channel, device, segment, total, units, avg_latency_ms, p95_latency_ms, cnt, campaign_count FROM ranked WHERE product_rank <= 3 ORDER BY total DESC LIMIT 20"

export interface BenchmarkTop {
  region: string
  product: string
  total: number
}

export interface BenchmarkResult {
  engine: string
  rows: number
  ms: number
  top?: BenchmarkTop[]
  error?: string
}

export interface PreparedBenchmark {
  runQuery: () => Promise<{ ms: number; top: BenchmarkTop[] }>
  close: () => Promise<void>
}
