import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import {
  normalizeLocale,
  getLocalePath,
  LOCALE_STORAGE_KEY,
  MESSAGES,
  getMessages,
  collectMessageKeys,
} from '../lib/i18n.ts'
const siteMetadata = createRequire(import.meta.url)('../data/siteMetadata.js')
test('locale contract', () => {
  assert.equal(normalizeLocale('zh-CN'), 'zh-CN')
  assert.equal(normalizeLocale('zh'), 'zh-CN')
  assert.equal(normalizeLocale('zh-hans'), 'zh-CN')
  assert.equal(normalizeLocale('zh-TW'), 'zh-CN')
  assert.equal(normalizeLocale(' EN '), 'en')
  assert.equal(normalizeLocale('x'), 'en')
  assert.equal(normalizeLocale(null), 'en')
  assert.equal(LOCALE_STORAGE_KEY, 'alohayo:locale')
  assert.equal(getLocalePath('/', 'zh-CN'), '/zh-CN/')
  assert.equal(getLocalePath('/zh-CN/', 'en'), '/')
  assert.equal(getLocalePath('/agent/', 'zh-CN'), '/zh-CN/agent/')
  assert.equal(getLocalePath('/zh-CN/agent/', 'en'), '/agent/')
  assert.equal(getLocalePath('/blog/webgpu/?x=1#demo', 'zh-CN'), '/zh-CN/blog/webgpu/')
  assert.equal(getLocalePath('/zh-CN/blog/webgpu/?x=1#demo', 'en'), '/blog/webgpu/')
  assert.equal(getLocalePath('/blog/webgpu/', 'zh-CN'), '/zh-CN/blog/webgpu/')
  assert.deepEqual(collectMessageKeys(MESSAGES.en), collectMessageKeys(MESSAGES['zh-CN']))
  assert.ok(getMessages('xx').nav)
  assert.equal(siteMetadata.i18n.defaultLocale, 'en')
  assert.deepEqual(siteMetadata.i18n.locales, ['en', 'zh-CN'])
  assert.equal(siteMetadata.i18n.showLocaleSwitch, true)
})
