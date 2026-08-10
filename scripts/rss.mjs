import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { slug } from 'github-slugger'
import { escape } from 'pliny/utils/htmlEscaper.js'
import siteMetadata from '../data/siteMetadata.js'
import tagData from '../app/tag-data.json' with { type: 'json' }
import { allBlogs } from '../.contentlayer/generated/index.mjs'
import { sortPosts } from 'pliny/utils/contentlayer.js'
import { canonicalBlogs, localizedBlogs } from '../lib/blogI18n.ts'

const outputFolder = process.env.EXPORT ? 'out' : 'public'

const generateRssItem = (config, post, locale = 'en') => {
  const prefix = locale === 'zh-CN' ? '/zh-CN' : ''
  const slug = locale === 'zh-CN' ? post.localizedSlug || post.slug : post.slug
  return `
  <item>
    <guid>${config.siteUrl}${prefix}/blog/${slug}</guid>
    <title>${escape(post.title)}</title>
    <link>${config.siteUrl}${prefix}/blog/${slug}</link>
    ${post.summary && `<description>${escape(post.summary)}</description>`}
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <author>${config.email} (${config.author})</author>
    ${post.tags && post.tags.map((t) => `<category>${t}</category>`).join('')}
  </item>
`
}

const generateRss = (config, posts, page = 'feed.xml', locale = 'en') => {
  const prefix = locale === 'zh-CN' ? '/zh-CN' : ''
  return `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${escape(config.title)}</title>
      <link>${config.siteUrl}${prefix}/blog</link>
      <description>${escape(config.description)}</description>
      <language>${locale === 'zh-CN' ? 'zh-CN' : config.language}</language>
      <managingEditor>${config.email} (${config.author})</managingEditor>
      <webMaster>${config.email} (${config.author})</webMaster>
      <lastBuildDate>${new Date(posts[0].date).toUTCString()}</lastBuildDate>
      <atom:link href="${config.siteUrl}/${page}" rel="self" type="application/rss+xml"/>
      ${posts.map((post) => generateRssItem(config, post, locale)).join('')}
    </channel>
  </rss>
`
}

async function generateRSS(config, allBlogs, page = 'feed.xml') {
  const publishPosts = canonicalBlogs(allBlogs).filter((post) => post.draft !== true)
  // RSS for blog post
  if (publishPosts.length > 0) {
    const rss = generateRss(config, sortPosts(publishPosts), page, 'en')
    writeFileSync(`./${outputFolder}/${page}`, rss)
  }

  const chinesePosts = localizedBlogs(allBlogs, 'zh-CN').filter((post) => post.draft !== true)
  if (chinesePosts.length > 0) {
    const rss = generateRss(config, sortPosts(chinesePosts), 'zh-CN/feed.xml', 'zh-CN')
    mkdirSync(path.join(outputFolder, 'zh-CN'), { recursive: true })
    writeFileSync(path.join(outputFolder, 'zh-CN', 'feed.xml'), rss)
  }

  if (publishPosts.length > 0) {
    for (const tag of Object.keys(tagData)) {
      const filteredPosts = publishPosts.filter((post) =>
        post.tags.map((t) => slug(t)).includes(tag)
      )
      const rss = generateRss(config, filteredPosts, `tags/${tag}/${page}`, 'en')
      const rssPath = path.join(outputFolder, 'tags', tag)
      mkdirSync(rssPath, { recursive: true })
      writeFileSync(path.join(rssPath, page), rss)
    }
  }
}

const rss = () => {
  generateRSS(siteMetadata, allBlogs)
  console.log('RSS feed generated...')
}
export default rss
