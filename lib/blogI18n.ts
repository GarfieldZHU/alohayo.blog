import type { LocaleCode } from './i18n'
export const isChineseBlog = (post: any) =>
  post?.locale === 'zh-CN' || /_cn$/.test(post?.slug || post?._raw?.flattenedPath || '')
export const canonicalBlogs = (allBlogs: any[]) =>
  allBlogs.filter((p) => !isChineseBlog(p) && p.translationTest !== true)
export const findLocalizedBlog = (allBlogs: any[], locale: LocaleCode, localizedSlug: string) => {
  const slug = localizedSlug.replace(/^\/+|\/+$/g, '')
  if (locale === 'zh-CN')
    return allBlogs.find((p) => isChineseBlog(p) && (p.localizedSlug || p.slug) === slug)
  return allBlogs.find((p) => !isChineseBlog(p) && p.slug === slug)
}
export const getLocalizedBlogHref = (
  allBlogs: any[],
  locale: LocaleCode,
  localizedSlug: string
) => {
  const found = findLocalizedBlog(allBlogs, locale, localizedSlug)
  if (locale === 'zh-CN' && found) return `/zh-CN/blog/${found.localizedSlug || found.slug}/`
  return `/blog/${found?.slug || localizedSlug}/`
}
