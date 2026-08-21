export type EngineKey = 'duckdb' | 'sqlite' | 'indexeddb'
export type EngineState = 'idle' | 'running' | 'done' | 'error'
export type BenchmarkPhase = 'idle' | 'warming' | 'racing' | 'done'

export interface EngineStatus {
  state: EngineState
  ms?: number
  error?: string
}

export interface BenchmarkState {
  rowCount: number
  phase: BenchmarkPhase
  results: Partial<Record<EngineKey, EngineStatus>>
  datasetReady: boolean
  elapsed: number
  startedAt?: number
}

export type BenchmarkAction =
  | { type: 'dataset-change'; rowCount: number }
  | { type: 'run-start' }
  | { type: 'dataset-ready' }
  | { type: 'race-start'; startedAt: number }
  | { type: 'engine-running'; key: EngineKey }
  | { type: 'engine-complete'; key: EngineKey; ms: number }
  | { type: 'engine-error'; key: EngineKey; error: string }
  | { type: 'tick'; elapsed: number }
  | { type: 'finish' }

const ENGINE_KEYS: EngineKey[] = ['duckdb', 'sqlite', 'indexeddb']

export function createInitialBenchmarkState(rowCount: number): BenchmarkState {
  return {
    rowCount,
    phase: 'idle',
    results: {},
    datasetReady: false,
    elapsed: 0,
  }
}

function withEngineStatus(
  state: BenchmarkState,
  key: EngineKey,
  status: EngineStatus
): BenchmarkState {
  return {
    ...state,
    results: { ...state.results, [key]: status },
  }
}

export function reduceBenchmarkState(
  state: BenchmarkState,
  action: BenchmarkAction
): BenchmarkState {
  switch (action.type) {
    case 'dataset-change':
      return {
        ...createInitialBenchmarkState(action.rowCount),
      }
    case 'run-start':
      return {
        ...state,
        phase: 'warming',
        results: {},
        datasetReady: false,
        elapsed: 0,
        startedAt: undefined,
      }
    case 'dataset-ready':
      return { ...state, datasetReady: true }
    case 'race-start':
      return {
        ...state,
        phase: 'racing',
        results: Object.fromEntries(ENGINE_KEYS.map((key) => [key, { state: 'running' as const }])),
        elapsed: 0,
        startedAt: action.startedAt,
      }
    case 'engine-running':
      return withEngineStatus(state, action.key, { state: 'running' })
    case 'engine-complete':
      return withEngineStatus(state, action.key, {
        state: 'done',
        // The measured duration is immutable once the engine has completed.
        ms: Math.max(0, action.ms),
      })
    case 'engine-error':
      return withEngineStatus(state, action.key, { state: 'error', error: action.error })
    case 'tick':
      return state.phase === 'racing' ? { ...state, elapsed: Math.max(0, action.elapsed) } : state
    case 'finish':
      return { ...state, phase: 'done' }
  }
}

/**
 * Return the number shown beside a bar. Completed engines never read the
 * shared live clock again, so a late React render cannot make a 7.2s result
 * appear to run for 12s before jumping back.
 */
export function getEngineDisplayMs(status: EngineStatus | undefined, elapsed: number): number {
  if (status?.state === 'done' && status.ms !== undefined) return status.ms
  if (status?.state === 'running') return Math.max(0, elapsed)
  return 0
}
