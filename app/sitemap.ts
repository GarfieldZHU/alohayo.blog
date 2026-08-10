import { MetadataRoute } from 'next'
import { allBlogs } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'
import { canonicalBlogs, isChineseBlog } from '@/lib/blogI18n'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl
  const blogRoutes = canonicalBlogs(allBlogs).map((post) => ({
    url: `${siteUrl}/${post.path}`,
    lastModified: post.lastmod || post.date,
  }))

  const routes = ['', 'blog', 'projects', 'tags'].map((route) => ({
    url: `${siteUrl}/${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  const chineseRoutes = ['', 'blog', 'projects', 'tags', 'about', 'agent', 'game'].map((route) => ({
    url: `${siteUrl}/zh-CN/${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  const chineseBlogRoutes = allBlogs
    .filter((post) => isChineseBlog(post) && post.translationTest !== true)
    .map((post) => ({
      url: `${siteUrl}/zh-CN/blog/${post.localizedSlug || post.slug}/`,
      lastModified: post.lastmod || post.date,
    }))

  return [...routes, ...chineseRoutes, ...blogRoutes, ...chineseBlogRoutes]
}
