import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const usageStatsSource = await readFile(
  new URL('../components/AgentUsageStats.tsx', import.meta.url),
  'utf8'
)

test('links Agent usage stats to the GarfieldZHU Tokscale profile', () => {
  assert.match(usageStatsSource, /const profileUrl = 'https:\/\/tokscale\.ai\/u\/GarfieldZHU'/)
  assert.doesNotMatch(usageStatsSource, /https:\/\/tokscale\.ai\/GarfieldZHU['"`]/)
})
