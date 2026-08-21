import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createInitialBenchmarkState,
  getEngineDisplayMs,
  reduceBenchmarkState,
} from '../components/duckdb-demo/lib/benchmarkState.ts'

const initial = createInitialBenchmarkState(200_000)

test('freezes a completed engine at its measured duration', () => {
  const racing = reduceBenchmarkState(initial, { type: 'race-start', startedAt: 100 })
  assert.deepEqual(
    Object.values(racing.results).map((status) => status.state),
    ['running', 'running', 'running']
  )
  const running = reduceBenchmarkState(racing, { type: 'engine-running', key: 'indexeddb' })
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
