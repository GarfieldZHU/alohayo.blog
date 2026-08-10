import test from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeLocale,
  getLocalePath,
  LOCALE_STORAGE_KEY,
  MESSAGES,
  getMessages,
  collectMessageKeys,
} from '../lib/i18n.ts'
test('locale contract', () => {
  assert.equal(normalizeLocale('zh-CN'), 'zh-CN')
  assert.equal(normalizeLocale('x'), 'en')
  assert.equal(LOCALE_STORAGE_KEY, 'alohayo:locale')
  for (const p of ['/', '/agent/', '/blog/webgpu/', '/zh-CN/', '/zh-CN/blog/webgpu/'])
    assert.ok(!getLocalePath(p, 'en').includes('?'))
  assert.equal(getLocalePath('/blog/webgpu/', 'zh-CN'), '/zh-CN/blog/webgpu/')
  assert.deepEqual(collectMessageKeys(MESSAGES.en), collectMessageKeys(MESSAGES['zh-CN']))
  assert.ok(getMessages('xx').nav)
})
