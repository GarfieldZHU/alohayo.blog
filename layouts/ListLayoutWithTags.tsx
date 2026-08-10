/* eslint-disable jsx-a11y/anchor-is-valid */
'use client'

import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import tagData from 'app/tag-data.json'
import { getMessages, type LocaleCode } from '@/lib/i18n'

interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
  locale?: LocaleCode
}

function Pagination({
  totalPages,
  currentPage,
  locale = 'en',
}: PaginationProps & { locale?: LocaleCode }) {
  const prefix = locale === 'zh-CN' ? '/zh-CN' : ''
  const previousLabel = locale === 'zh-CN' ? '上一篇' : 'Previous'
  const nextLabel = locale === 'zh-CN' ? '下一篇' : 'Next'
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            {previousLabel}
          </button>
        )}
        {prevPage && (
          <Link
            href={
              currentPage - 1 === 1 ? `${prefix}/blog/` : `${prefix}/blog/page/${currentPage - 1}`
            }
            rel="prev"
          >
            {previousLabel}
          </Link>
        )}
        <span>
          {currentPage} / {totalPages}
        </span>
        {!nextPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            {nextLabel}
          </button>
        )}
        {nextPage && (
          <Link href={`${prefix}/blog/page/${currentPage + 1}`} rel="next">
            {nextLabel}
          </Link>
        )}
      </nav>
    </div>
  )
}

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
  locale = 'en',
}: ListLayoutProps) {
  const pathname = usePathname() || '/'
  const messages = getMessages(locale)
  const prefix = locale === 'zh-CN' ? '/zh-CN' : ''
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])
  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  return (
    <>
      <div>
        <div className="pt-6 pb-6">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:hidden sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            {title}
          </h1>
        </div>
        <div className="flex sm:space-x-24">
          <div className="hidden h-full max-h-screen max-w-[280px] min-w-[280px] flex-wrap overflow-auto rounded bg-gray-50 pt-5 shadow-md sm:flex dark:bg-gray-900/70 dark:shadow-gray-800/40">
            <div className="px-6 py-4">
              {pathname.includes('/blog') ? (
                <h3 className="text-primary-500 font-bold uppercase">{messages.blog.allPosts}</h3>
              ) : (
                <Link
                  href={`${prefix}/blog`}
                  className="hover:text-primary-500 dark:hover:text-primary-500 font-bold text-gray-700 uppercase dark:text-gray-300"
                >
                  {messages.blog.allPosts}
                </Link>
              )}
              <ul>
                {sortedTags.map((tag) => (
                  <li key={tag} className="my-3">
                    {pathname.split('/tags/')[1] === slug(tag) ? (
                      <h3 className="text-primary-500 inline px-3 py-2 text-sm font-bold uppercase">
                        {`${tag} (${tagCounts[tag]})`}
                      </h3>
                    ) : (
                      <Link
                        href={`${prefix}/tags/${slug(tag)}`}
                        className="hover:text-primary-500 dark:hover:text-primary-500 px-3 py-2 text-sm font-medium text-gray-500 uppercase dark:text-gray-300"
                        aria-label={`${messages.tags.viewPostsTagged} ${tag}`}
                      >
                        {`${tag} (${tagCounts[tag]})`}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <ul>
              {displayPosts.map((post) => {
                const { path, date, title: postTitle, summary, tags } = post
                const localizedSlug = (post as Blog & { localizedSlug?: string }).localizedSlug
                const href =
                  locale === 'zh-CN' && localizedSlug ? `/zh-CN/blog/${localizedSlug}` : `/${path}`
                return (
                  <li key={path} className="py-5">
                    <article className="flex flex-col space-y-2 xl:space-y-0">
                      <dl>
                        <dt className="sr-only">{messages.blog.publishedOn}</dt>
                        <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                          <time dateTime={date}>
                            {formatDate(date, locale === 'zh-CN' ? 'zh-CN' : siteMetadata.locale)}
                          </time>
                        </dd>
                      </dl>
                      <div className="space-y-3">
                        <div>
                          <h2 className="text-2xl leading-8 font-bold tracking-tight">
                            <Link href={href} className="text-gray-900 dark:text-gray-100">
                              {postTitle}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags?.map((tag) => (
                              <Tag key={tag} text={tag} locale={locale} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                locale={locale}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
