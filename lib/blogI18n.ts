import type { LocaleCode } from './i18n'

export type TranslationKind = 'original' | 'ai-translation' | 'bilingual'

export type BlogLike = {
  slug: string
  locale?: string
  translationKey?: string
  translationKind?: string
  translationSourceLocale?: string
  localizedSlug?: string
  translationTest?: boolean
  tags?: string[]
  [key: string]: unknown
}

export type TranslationSource = {
  href: string
  locale: LocaleCode
}

const cleanSlug = (value: string) => value.replace(/^\/+|\/+$/g, '')

export const getBlogLocale = (post: BlogLike | undefined): LocaleCode => {
  if (post?.locale === 'zh-CN') return 'zh-CN'
  if (post?.locale === 'en') return 'en'
  return /_cn$/.test(post?.slug || '') ? 'zh-CN' : 'en'
}

export const getTranslationKey = (post: BlogLike | undefined) => {
  const explicitKey = typeof post?.translationKey === 'string' ? post.translationKey.trim() : ''
  return explicitKey || (post?.slug || '').replace(/_cn$/, '')
}

export const getTranslationKind = (post: BlogLike | undefined): TranslationKind => {
  if (post?.translationKind === 'ai-translation') return 'ai-translation'
  if (post?.translationKind === 'bilingual') return 'bilingual'
  return 'original'
}

export const isAiTranslatedBlog = (post: BlogLike | undefined) =>
  getTranslationKind(post) === 'ai-translation'

export const isBilingualBlog = (post: BlogLike | undefined) =>
  getTranslationKind(post) === 'bilingual'

export const isChineseBlog = (post: BlogLike | undefined) => getBlogLocale(post) === 'zh-CN'

export const getTranslationSourceLocale = (post: BlogLike | undefined): LocaleCode | undefined => {
  const sourceLocale = post?.translationSourceLocale
  if (sourceLocale === 'en' || sourceLocale === 'zh-CN') return sourceLocale
  return undefined
}

export const canonicalBlogs = <T extends BlogLike>(allBlogs: T[]) =>
  allBlogs.filter((post) => !isChineseBlog(post) && post.translationTest !== true)

export const findLocalizedBlog = <T extends BlogLike>(
  allBlogs: T[],
  locale: LocaleCode,
  localizedSlug: string
) => {
  const slug = cleanSlug(localizedSlug)
  return allBlogs.find(
    (post) =>
      post.translationTest !== true &&
      getBlogLocale(post) === locale &&
      (locale === 'zh-CN' ? (post.localizedSlug || post.slug) === slug : post.slug === slug)
  )
}

export const findTranslation = <T extends BlogLike>(allBlogs: T[], post: T) => {
  const candidates = allBlogs.filter(
    (candidate) =>
      candidate !== post &&
      candidate.translationTest !== true &&
      getTranslationKey(candidate) === getTranslationKey(post) &&
      getBlogLocale(candidate) !== getBlogLocale(post)
  )
  return (
    candidates.find((candidate) => getTranslationKind(candidate) === 'original') || candidates[0]
  )
}

export const findTranslationSource = <T extends BlogLike>(allBlogs: T[], post: T) => {
  if (!isAiTranslatedBlog(post)) return undefined
  const sourceLocale = getTranslationSourceLocale(post)
  if (!sourceLocale) return undefined
  return allBlogs.find(
    (candidate) =>
      candidate !== post &&
      candidate.translationTest !== true &&
      getBlogLocale(candidate) === sourceLocale &&
      getTranslationKey(candidate) === getTranslationKey(post)
  )
}

export const getBlogHref = (post: BlogLike, locale = getBlogLocale(post)) =>
  locale === 'zh-CN' ? `/zh-CN/blog/${post.localizedSlug || post.slug}/` : `/blog/${post.slug}/`

export const localizedBlogs = <T extends BlogLike>(allBlogs: T[], locale: LocaleCode) => {
  const canonical = canonicalBlogs(allBlogs)
  if (locale === 'en') return canonical
  return canonical.map((post) => findTranslation(allBlogs, post) || post)
}

export const getLocalizedBlogHref = (
  allBlogs: BlogLike[],
  locale: LocaleCode,
  localizedSlug: string
) => {
  const found = findLocalizedBlog(allBlogs, locale, localizedSlug)
  if (locale === 'zh-CN' && found) return `/zh-CN/blog/${found.localizedSlug || found.slug}/`
  return `/blog/${found?.slug || cleanSlug(localizedSlug)}/`
}
