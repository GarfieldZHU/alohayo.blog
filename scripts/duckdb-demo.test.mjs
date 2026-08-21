import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createInitialBenchmarkState,
  getEngineDisplayMs,
  reduceBenchmarkState,
  runSequentially,
} from '../components/duckdb-demo/lib/benchmarkState.ts'
import {
  CAMPAIGN_COUNT,
  BENCHMARK_QUERY_DESC,
  generateTradesAsync,
  SQLITE_QUERY_DESC,
} from '../components/duckdb-demo/lib/data.ts'

const initial = createInitialBenchmarkState(200_000)

test('freezes a completed engine at its measured duration', () => {
  const ready = reduceBenchmarkState(initial, { type: 'dataset-ready' })
  assert.deepEqual(
    Object.values(ready.results).map((status) => status.state),
    ['idle', 'idle', 'idle']
  )
  const running = reduceBenchmarkState(ready, {
    type: 'engine-running',
    key: 'indexeddb',
    startedAt: 1_000,
  })
  assert.equal(getEngineDisplayMs(running.results.indexeddb, 1_000), 1_000)
  const completed = reduceBenchmarkState(running, {
    type: 'engine-complete',
    key: 'indexeddb',
    ms: 7_200,
    queryMs: 456.7,
  })

  assert.equal(getEngineDisplayMs(completed.results.indexeddb, 12_000), 7_200)
  assert.equal(completed.results.indexeddb.state, 'done')
  assert.equal(completed.results.indexeddb.queryMs, 456.7)
})

test('changing the dataset clears the previous chart before the next run', () => {
  const racing = reduceBenchmarkState(initial, { type: 'dataset-ready' })
  const completed = reduceBenchmarkState(racing, {
    type: 'engine-complete',
    key: 'duckdb',
    ms: 32.1,
    queryMs: 12.3,
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
  assert.deepEqual(
    Object.values(ready.results).map((status) => status.state),
    ['idle', 'idle', 'idle']
  )
})

test('starts one engine timer immediately after the dataset is ready', () => {
  const ready = reduceBenchmarkState(reduceBenchmarkState(initial, { type: 'run-start' }), {
    type: 'dataset-ready',
  })
  const running = reduceBenchmarkState(ready, {
    type: 'engine-running',
    key: 'duckdb',
    startedAt: 1_000,
  })

  assert.equal(running.phase, 'racing')
  assert.equal(running.activeEngine, 'duckdb')
  assert.equal(getEngineDisplayMs(running.results.duckdb, 250), 250)
  assert.equal(running.results.sqlite.state, 'idle')
  assert.equal(running.results.indexeddb.state, 'idle')
})

test('freezes one engine before the next sequential engine starts', () => {
  const ready = reduceBenchmarkState(reduceBenchmarkState(initial, { type: 'run-start' }), {
    type: 'dataset-ready',
  })
  const duckdbDone = reduceBenchmarkState(
    reduceBenchmarkState(ready, {
      type: 'engine-running',
      key: 'duckdb',
      startedAt: 1_000,
    }),
    { type: 'engine-complete', key: 'duckdb', ms: 321.4, queryMs: 88.8 }
  )
  const sqliteRunning = reduceBenchmarkState(duckdbDone, {
    type: 'engine-running',
    key: 'sqlite',
    startedAt: 2_000,
  })

  assert.equal(getEngineDisplayMs(sqliteRunning.results.duckdb, 9_999), 321.4)
  assert.equal(getEngineDisplayMs(sqliteRunning.results.sqlite, 75), 75)
  assert.equal(sqliteRunning.activeEngine, 'sqlite')
})

test('runs engine tasks one at a time so their work cannot overlap', async () => {
  let active = 0
  let maxActive = 0
  const order = []

  await runSequentially(['duckdb', 'sqlite', 'indexeddb'], async (key) => {
    active += 1
    maxActive = Math.max(maxActive, active)
    order.push(`${key}:start`)
    await new Promise((resolve) => setTimeout(resolve, 0))
    order.push(`${key}:end`)
    active -= 1
  })

  assert.equal(maxActive, 1)
  assert.deepEqual(order, [
    'duckdb:start',
    'duckdb:end',
    'sqlite:start',
    'sqlite:end',
    'indexeddb:start',
    'indexeddb:end',
  ])
})

test('keeps the dimension table small so setup does not dominate the demo', () => {
  assert.ok(CAMPAIGN_COUNT <= 1_024)
})
