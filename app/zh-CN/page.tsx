import { allBlogs } from 'contentlayer/generated'
import Main from '../Main'
export default function Page() {
  return <Main posts={allBlogs} locale="zh-CN" />
}
