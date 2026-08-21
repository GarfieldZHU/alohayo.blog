import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'

const { GAME_CATALOG, getEmbedCode, getGameCopy } = await import('../app/game/gameCatalog.ts')
const launcherSource = await fs.readFile(
  new URL('../app/game/GameLauncher.tsx', import.meta.url),
  'utf8'
)

test('keeps the four approved games in the requested order', () => {
  assert.deepEqual(
    GAME_CATALOG.map((game) => game.id),
    ['alohayo-world', 'uno-2026', 'red-alert-2', 'battle-city']
  )
})

test('uses the requested Chinese tags and play modes', () => {
  assert.deepEqual(getGameCopy(GAME_CATALOG[0], 'zh-CN').tags, ['自制', '开发中'])
  assert.deepEqual(getGameCopy(GAME_CATALOG[1], 'zh-CN').tags, ['自制', '复刻'])
  assert.deepEqual(getGameCopy(GAME_CATALOG[2], 'zh-CN').tags, ['RTS', '即时战略', '原版', '纯净'])
  assert.deepEqual(getGameCopy(GAME_CATALOG[3], 'zh-CN').tags, ['复刻'])
  assert.equal(GAME_CATALOG[0].playMode, 'alohayo')
  assert.equal(GAME_CATALOG[1].playMode, 'iframe')
  assert.equal(GAME_CATALOG[2].playMode, 'external')
  assert.equal(GAME_CATALOG[3].playMode, 'iframe')
})

test('generates a copyable iframe snippet for the selected locale', () => {
  const game = GAME_CATALOG[1]
  const snippet = getEmbedCode(game, 'zh-CN')

  assert.match(snippet, /<iframe/)
  assert.match(snippet, /https:\/\/uno-2026\.vercel\.app\//)
  assert.match(snippet, /title="UNO 2026"/)
  assert.match(snippet, /allow="autoplay; fullscreen; gamepad; pointer-lock"/)
})

test('keeps the library surface focused on games and compact controls', () => {
  assert.doesNotMatch(launcherSource, /一架安静的好游戏。/)
  assert.doesNotMatch(launcherSource, /四个浏览器游戏，留在博客里，想玩时随时打开。/)
  assert.doesNotMatch(launcherSource, /\{copy\.subtitle\}/)
  assert.doesNotMatch(launcherSource, /\{copy\.description\}/)
  assert.match(launcherSource, /gameViewportRef/)
  assert.match(launcherSource, /messages\.fullScreen/)
  assert.match(launcherSource, /messages\.copyEmbed/)
})
