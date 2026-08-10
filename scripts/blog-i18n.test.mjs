import test from 'node:test'
import assert from 'node:assert/strict'
import { canonicalBlogs, isChineseBlog, getLocalizedBlogHref } from '../lib/blogI18n.ts'
test('resolver', () => {
  const en = { slug: 'foo', translationTest: false }
  const cn = { slug: 'foo_cn', locale: 'zh-CN', localizedSlug: 'foo_cn' }
  assert.equal(isChineseBlog(cn), true)
  assert.deepEqual(canonicalBlogs([en, cn, { slug: 'x', translationTest: true }]), [en])
  assert.equal(getLocalizedBlogHref([en, cn], 'zh-CN', 'foo_cn'), '/zh-CN/blog/foo_cn/')
  assert.equal(getLocalizedBlogHref([en], 'zh-CN', 'foo'), '/blog/foo/')
})
