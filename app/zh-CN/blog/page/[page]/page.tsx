import ListLayout from '@/layouts/ListLayoutWithTags'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { localizedBlogs } from '@/lib/blogI18n'
import siteMetadata from '@/data/siteMetadata'

const POSTS_PER_PAGE = 5

export const generateStaticParams = async () => {
  const totalPages = Math.ceil(localizedBlogs(allBlogs, 'zh-CN').length / POSTS_PER_PAGE)
  return Array.from({ length: totalPages }, (_, index) => ({ page: String(index + 1) }))
}

export async function generateMetadata(props: { params: Promise<{ page: string }> }) {
  const { page } = await props.params
  const canonical = `${siteMetadata.siteUrl}/zh-CN/blog/page/${page}/`
  return {
    title: `博客 · 第 ${page} 页`,
    alternates: {
      canonical,
      languages: {
        en: `${siteMetadata.siteUrl}/blog/page/${page}/`,
        'zh-CN': canonical,
      },
    },
  }
}

export default async function ChineseBlogPage(props: { params: Promise<{ page: string }> }) {
  const params = await props.params
  const posts = allCoreContent(sortPosts(localizedBlogs(allBlogs, 'zh-CN')))
  const pageNumber = Math.max(1, Number.parseInt(params.page, 10) || 1)
  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={posts.slice(
        POSTS_PER_PAGE * (pageNumber - 1),
        POSTS_PER_PAGE * pageNumber
      )}
      pagination={{ currentPage: pageNumber, totalPages: Math.ceil(posts.length / POSTS_PER_PAGE) }}
      title="全部文章"
      locale="zh-CN"
    />
  )
}
