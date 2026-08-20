import 'css/prism.css'
import 'katex/dist/katex.css'

import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { sortPosts, coreContent, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs, allAuthors } from 'contentlayer/generated'
import type { Authors, Blog } from 'contentlayer/generated'
import PostSimple from '@/layouts/PostSimple'
import PostLayout from '@/layouts/PostLayout'
import PostBanner from '@/layouts/PostBanner'
import type { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { notFound, redirect } from 'next/navigation'
import {
  findLocalizedBlog,
  findTranslation,
  findTranslationSource,
  getBlogHref,
  getBlogLocale,
  isChineseBlog,
  localizedBlogs,
} from '@/lib/blogI18n'

const defaultLayout = 'PostLayout'
const layouts = { PostSimple, PostLayout, PostBanner }

const getSlug = (params: { slug: string[] }) => decodeURI(params.slug.join('/'))

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const slug = getSlug(params)
  const post = findLocalizedBlog(allBlogs, 'zh-CN', slug)
  if (!post) return
  const english = findTranslation(allBlogs, post)
  const publishedAt = new Date(post.date).toISOString()
  const modifiedAt = new Date(post.lastmod || post.date).toISOString()
  const imageList = post.images
    ? typeof post.images === 'string'
      ? [post.images]
      : post.images
    : [siteMetadata.socialBanner]
  const authorList = post.authors || ['default']
  const authors = authorList
    .map((author) => allAuthors.find((item) => item.slug === author)?.name)
    .filter(Boolean) as string[]
  const canonical = `${siteMetadata.siteUrl}/zh-CN/blog/${post.localizedSlug || slug}/`
  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical,
      languages: {
        en: english ? `${siteMetadata.siteUrl}/blog/${english.slug}/` : undefined,
        'zh-CN': canonical,
      },
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: 'zh_CN',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: canonical,
      images: imageList.map((image) => ({
        url: image.includes('http') ? image : siteMetadata.siteUrl + image,
      })),
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: imageList,
    },
  }
}

export const generateStaticParams = async () =>
  allBlogs
    .filter((post) => isChineseBlog(post) && post.translationTest !== true)
    .map((post) => ({ slug: (post.localizedSlug || post.slug).split('/') }))

export default async function ChineseBlogPost(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params
  const slug = getSlug(params)
  const post = findLocalizedBlog(allBlogs, 'zh-CN', slug) as Blog | undefined
  if (!post) {
    const english = findLocalizedBlog(allBlogs, 'en', slug)
    if (english) redirect(`/blog/${english.slug}/`)
    notFound()
  }
  const translatedPosts = allCoreContent(sortPosts(localizedBlogs(allBlogs, 'zh-CN')))
  const postIndex = translatedPosts.findIndex((item) => item.slug === post.slug)
  const prev = translatedPosts[postIndex + 1]
  const next = translatedPosts[postIndex - 1]
  const authorDetails = (post.authors || ['default']).map((author) =>
    coreContent(allAuthors.find((item) => item.slug === author) as Authors)
  )
  const mainContent = coreContent(post)
  const jsonLd = {
    ...post.structuredData,
    url: `${siteMetadata.siteUrl}/zh-CN/blog/${post.localizedSlug || slug}/`,
  }
  jsonLd.author = authorDetails.map((author) => ({ '@type': 'Person', name: author.name }))
  const Layout = layouts[post.layout || defaultLayout]
  const translationSource = findTranslationSource(allBlogs, post)
  const translationSourceNotice = translationSource
    ? { href: getBlogHref(translationSource), locale: getBlogLocale(translationSource) }
    : undefined
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Layout
        content={mainContent}
        authorDetails={authorDetails}
        next={next}
        prev={prev}
        locale="zh-CN"
        translationSource={translationSourceNotice}
      >
        <MDXLayoutRenderer code={post.body.code} components={components} toc={post.toc} />
      </Layout>
    </>
  )
}
