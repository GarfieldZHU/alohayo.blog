import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Main from './Main'
import { canonicalBlogs } from '@/lib/blogI18n'

export default async function Page() {
  const sortedPosts = sortPosts(canonicalBlogs(allBlogs))
  const posts = allCoreContent(sortedPosts)
  return <Main posts={posts} />
}
