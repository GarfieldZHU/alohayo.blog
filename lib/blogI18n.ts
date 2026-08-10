import type { LocaleCode } from './i18n'

export type BlogLike = {
  slug: string
  locale?: string
  translationKey?: string
  localizedSlug?: string
  translationTest?: boolean
  tags?: string[]
  [key: string]: unknown
}

const cleanSlug = (value: string) => value.replace(/^\/+|\/+$/g, '')

export const isChineseBlog = (post: BlogLike | undefined) =>
  post?.locale === 'zh-CN' || /_cn$/.test(post?.slug || '')

export const canonicalBlogs = <T extends BlogLike>(allBlogs: T[]) =>
  allBlogs.filter((post) => !isChineseBlog(post) && post.translationTest !== true)

export const findLocalizedBlog = <T extends BlogLike>(
  allBlogs: T[],
  locale: LocaleCode,
  localizedSlug: string
) => {
  const slug = cleanSlug(localizedSlug)
  if (locale === 'zh-CN') {
    return allBlogs.find(
      (post) => isChineseBlog(post) && (post.localizedSlug || post.slug) === slug
    )
  }
  return allBlogs.find((post) => !isChineseBlog(post) && post.slug === slug)
}

export const findTranslation = <T extends BlogLike>(allBlogs: T[], post: T) => {
  if (isChineseBlog(post)) return post
  return allBlogs.find(
    (candidate) =>
      isChineseBlog(candidate) &&
      candidate.translationTest !== true &&
      candidate.translationKey === post.translationKey
  )
}

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
