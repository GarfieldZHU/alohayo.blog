import test from 'node:test'
import assert from 'node:assert/strict'
import {
  canonicalBlogs,
  findLocalizedBlog,
  getLocalizedBlogHref,
  isChineseBlog,
  localizedBlogs,
} from '../lib/blogI18n.ts'
test('resolver', () => {
  const en = { slug: 'foo', translationKey: 'blog/foo', translationTest: false, title: 'Foo' }
  const cn = {
    slug: 'foo_cn',
    locale: 'zh-CN',
    localizedSlug: 'foo',
    translationKey: 'blog/foo',
    title: '中文 Foo',
  }
  assert.equal(isChineseBlog(cn), true)
  assert.deepEqual(canonicalBlogs([en, cn, { slug: 'x', translationTest: true }]), [en])
  assert.equal(findLocalizedBlog([en, cn], 'zh-CN', 'foo'), cn)
  assert.equal(getLocalizedBlogHref([en, cn], 'zh-CN', 'foo'), '/zh-CN/blog/foo/')
  assert.equal(getLocalizedBlogHref([en], 'zh-CN', 'foo'), '/blog/foo/')
  assert.deepEqual(localizedBlogs([en, cn], 'zh-CN'), [cn])
  assert.deepEqual(localizedBlogs([en], 'zh-CN'), [en])
})
