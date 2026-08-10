import { allBlogs } from 'contentlayer/generated'
import Main from '../Main'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { localizedBlogs } from '@/lib/blogI18n'
export default function Page() {
  return (
    <Main posts={allCoreContent(sortPosts(localizedBlogs(allBlogs, 'zh-CN')))} locale="zh-CN" />
  )
}
