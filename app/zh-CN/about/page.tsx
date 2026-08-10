import { Authors, allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'app/seo'
import { components } from '@/components/MDXComponents'

export const metadata = genPageMetadata({ title: '关于' })

export default function ChineseAboutPage() {
  const author =
    (allAuthors.find((item) => item.slug === 'default_cn') as Authors | undefined) ||
    (allAuthors.find((item) => item.slug === 'default') as Authors)
  const mainContent = coreContent(author)
  return (
    <AuthorLayout content={mainContent} locale="zh-CN">
      <MDXLayoutRenderer code={author.body.code} components={components} />
    </AuthorLayout>
  )
}
