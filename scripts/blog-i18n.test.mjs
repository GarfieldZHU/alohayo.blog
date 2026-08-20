import test from 'node:test'
import assert from 'node:assert/strict'
import {
  canonicalBlogs,
  findLocalizedBlog,
  findTranslation,
  getLocalizedBlogHref,
  findTranslationSource,
  getBlogLocale,
  getBlogHref,
  getTranslationKey,
  getTranslationKind,
  isAiTranslatedBlog,
  isBilingualBlog,
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

test('explicit translation metadata supports a Chinese original and an English AI translation', () => {
  const zhOriginal = {
    slug: 'webgpu-cn',
    locale: 'zh-CN',
    localizedSlug: 'webgpu',
    translationKey: 'webgpu',
    translationKind: 'original',
    title: '中文 WebGPU',
  }
  const enTranslation = {
    slug: 'webgpu-in-english',
    locale: 'en',
    translationKey: 'webgpu',
    translationKind: 'ai-translation',
    translationSourceLocale: 'zh-CN',
    title: 'English WebGPU',
  }

  assert.equal(getBlogLocale(zhOriginal), 'zh-CN')
  assert.equal(getTranslationKey(enTranslation), 'webgpu')
  assert.equal(getTranslationKind(enTranslation), 'ai-translation')
  assert.equal(isAiTranslatedBlog(enTranslation), true)
  assert.equal(getBlogHref(zhOriginal), '/zh-CN/blog/webgpu/')
  assert.equal(getBlogHref(enTranslation), '/blog/webgpu-in-english/')
  assert.equal(findLocalizedBlog([zhOriginal], 'zh-CN', 'webgpu'), zhOriginal)
  assert.equal(findTranslation([zhOriginal, enTranslation], zhOriginal), enTranslation)
  assert.equal(findTranslationSource([zhOriginal, enTranslation], enTranslation), zhOriginal)
  assert.deepEqual(localizedBlogs([zhOriginal, enTranslation], 'zh-CN'), [zhOriginal])
})

test('bilingual and legacy posts never become AI translation notices', () => {
  assert.equal(getTranslationKind({ slug: 'dual' }), 'original')
  assert.equal(isBilingualBlog({ slug: 'dual', translationKind: 'bilingual' }), true)
  assert.equal(isAiTranslatedBlog({ slug: 'dual', translationKind: 'bilingual' }), false)
  assert.equal(isAiTranslatedBlog({ slug: 'legacy_cn' }), false)
  assert.equal(
    findTranslationSource([{ slug: 'dual', translationKind: 'bilingual' }], { slug: 'dual' }),
    undefined
  )
})
