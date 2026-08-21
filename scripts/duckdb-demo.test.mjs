import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createInitialBenchmarkState,
  getEngineDisplayMs,
  reduceBenchmarkState,
} from '../components/duckdb-demo/lib/benchmarkState.ts'
import {
  BENCHMARK_QUERY_DESC,
  generateTradesAsync,
  SQLITE_QUERY_DESC,
} from '../components/duckdb-demo/lib/data.ts'

const initial = createInitialBenchmarkState(200_000)

test('freezes a completed engine at its measured duration', () => {
  const racing = reduceBenchmarkState(initial, { type: 'race-start', startedAt: 100 })
  assert.deepEqual(
    Object.values(racing.results).map((status) => status.state),
    ['idle', 'idle', 'idle']
  )
  const running = reduceBenchmarkState(
    { ...racing, elapsed: 250 },
    { type: 'engine-running', key: 'indexeddb' }
  )
  assert.equal(getEngineDisplayMs(running.results.indexeddb, 1_250), 1_000)
  const completed = reduceBenchmarkState(running, {
    type: 'engine-complete',
    key: 'indexeddb',
    ms: 7_200,
  })

  assert.equal(getEngineDisplayMs(completed.results.indexeddb, 12_000), 7_200)
  assert.equal(completed.results.indexeddb.state, 'done')
})

test('changing the dataset clears the previous chart before the next run', () => {
  const racing = reduceBenchmarkState(initial, { type: 'race-start', startedAt: 100 })
  const completed = reduceBenchmarkState(racing, {
    type: 'engine-complete',
    key: 'duckdb',
    ms: 32.1,
  })
  const changed = reduceBenchmarkState(completed, { type: 'dataset-change', rowCount: 50_000 })

  assert.equal(changed.phase, 'idle')
  assert.equal(changed.rowCount, 50_000)
  assert.deepEqual(changed.results, {})
  assert.equal(changed.datasetReady, false)
})

test('uses a selective full-year top-N query that exercises analytical work', () => {
  assert.match(BENCHMARK_QUERY_DESC, /WHERE t\.date >= '2024-01-01'/)
  assert.match(BENCHMARK_QUERY_DESC, /date < '2025-01-01'/)
  assert.match(BENCHMARK_QUERY_DESC, /SUBSTR\(t\.date, 1, 7\) AS month/)
  assert.match(BENCHMARK_QUERY_DESC, /GROUP BY month, region, product/)
  assert.match(BENCHMARK_QUERY_DESC, /SUM\(amount \* \(1 - discount\) \* weight\)/)
  assert.match(BENCHMARK_QUERY_DESC, /COUNT\(DISTINCT campaign_id\)/)
  assert.match(BENCHMARK_QUERY_DESC, /QUANTILE_DISC\(latency_ms, 0\.95\)/)
  assert.match(SQLITE_QUERY_DESC, /ROW_NUMBER\(\) OVER \(PARTITION BY month, region, product/)
  assert.match(BENCHMARK_QUERY_DESC, /COUNT\(\*\)/)
  assert.match(BENCHMARK_QUERY_DESC, /ROW_NUMBER\(\) OVER \(PARTITION BY region, product/)
  assert.match(BENCHMARK_QUERY_DESC, /product_rank <= 3/)
  assert.match(BENCHMARK_QUERY_DESC, /LIMIT 20/)
})

test('generates large datasets in browser-visible chunks', async () => {
  const progress = []
  const rows = await generateTradesAsync(25_000, 42, (value) => progress.push(value))

  assert.equal(rows.length, 25_000)
  assert.ok(progress.length > 1)
  assert.equal(progress.at(-1), 1)
  assert.ok(progress.every((value, index) => index === 0 || value >= progress[index - 1]))
})

test('tracks generation progress without showing a stale result chart', () => {
  const started = reduceBenchmarkState(initial, { type: 'run-start' })
  const halfway = reduceBenchmarkState(started, { type: 'generation-progress', progress: 0.5 })
  const ready = reduceBenchmarkState(halfway, { type: 'dataset-ready' })

  assert.equal(halfway.generationProgress, 0.5)
  assert.equal(halfway.datasetReady, false)
  assert.equal(ready.generationProgress, 1)
  assert.deepEqual(ready.results, {})
})
