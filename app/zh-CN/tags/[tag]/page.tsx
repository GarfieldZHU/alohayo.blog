import { slug } from 'github-slugger'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { localizedBlogs } from '@/lib/blogI18n'
import { genPageMetadata } from 'app/seo'

export async function generateMetadata(props: { params: Promise<{ tag: string }> }) {
  const { tag } = await props.params
  return genPageMetadata({
    title: decodeURI(tag),
    description: `中文博客中关于 ${decodeURI(tag)} 的文章`,
  })
}

export default async function ChineseTagPage(props: { params: Promise<{ tag: string }> }) {
  const { tag: rawTag } = await props.params
  const tag = decodeURI(rawTag)
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)
  const posts = localizedBlogs(allBlogs, 'zh-CN').filter((post) =>
    post.tags?.map((item) => slug(item)).includes(tag)
  )
  return <ListLayout posts={allCoreContent(sortPosts(posts))} title={title} locale="zh-CN" />
}
