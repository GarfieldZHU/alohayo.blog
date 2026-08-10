import Link from '@/components/Link'
import Tag from '@/components/Tag'
import { slug } from 'github-slugger'
import { genPageMetadata } from 'app/seo'
import { allBlogs } from 'contentlayer/generated'
import { localizedBlogs } from '@/lib/blogI18n'

export const metadata = genPageMetadata({ title: '标签', description: '我写过的主题' })

export default function ChineseTagsPage() {
  const tagCounts: Record<string, number> = {}
  localizedBlogs(allBlogs, 'zh-CN').forEach((post) =>
    post.tags?.forEach((tag) => {
      const key = slug(tag)
      tagCounts[key] = (tagCounts[key] || 0) + 1
    })
  )
  const tagKeys = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])
  return (
    <div className="flex flex-col items-start justify-start divide-y divide-gray-200 md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6 md:divide-y-0 dark:divide-gray-700">
      <div className="space-x-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl md:border-r-2 md:px-6 md:text-6xl dark:text-gray-100">
          标签
        </h1>
      </div>
      <div className="flex max-w-lg flex-wrap">
        {tagKeys.length === 0 && '还没有标签。'}
        {tagKeys.map((tag) => (
          <div key={tag} className="mt-2 mr-5 mb-2">
            <Tag text={tag} locale="zh-CN" />
            <Link
              href={`/zh-CN/tags/${tag}`}
              className="-ml-2 text-sm font-semibold text-gray-600 uppercase dark:text-gray-300"
              aria-label={`查看 ${tag} 标签下的文章`}
            >
              {` (${tagCounts[tag]})`}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
