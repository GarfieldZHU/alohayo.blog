import ListLayout from '@/layouts/ListLayoutWithTags'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { localizedBlogs } from '@/lib/blogI18n'
import { genPageMetadata } from 'app/seo'

const POSTS_PER_PAGE = 5

export const metadata = genPageMetadata({
  title: '博客',
  alternates: {
    canonical: 'https://alohayo.me/zh-CN/blog/',
    languages: { en: 'https://alohayo.me/blog/', 'zh-CN': 'https://alohayo.me/zh-CN/blog/' },
  },
})

export default function ChineseBlogPage() {
  const posts = allCoreContent(sortPosts(localizedBlogs(allBlogs, 'zh-CN')))
  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={posts.slice(0, POSTS_PER_PAGE)}
      pagination={{ currentPage: 1, totalPages: Math.ceil(posts.length / POSTS_PER_PAGE) }}
      title="全部文章"
      locale="zh-CN"
    />
  )
}
