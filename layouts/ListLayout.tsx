'use client'

import { useState } from 'react'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { getMessages, type LocaleCode } from '@/lib/i18n'
import TranslationLabel from '@/components/TranslationLabel'
import { getTranslationSourceLocale, isAiTranslatedBlog } from '@/lib/blogI18n'

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
  const previous = locale === 'zh-CN' ? '上一篇' : 'Previous'
  const next = locale === 'zh-CN' ? '下一篇' : 'Next'
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages
  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && <button disabled>{previous}</button>}
        {prevPage && (
          <Link
            href={
              currentPage - 1 === 1 ? `${prefix}/blog/` : `${prefix}/blog/page/${currentPage - 1}`
            }
            rel="prev"
          >
            {previous}
          </Link>
        )}
        <span>
          {currentPage} / {totalPages}
        </span>
        {!nextPage && <button disabled>{next}</button>}
        {nextPage && (
          <Link href={`${prefix}/blog/page/${currentPage + 1}`} rel="next">
            {next}
          </Link>
        )}
      </nav>
    </div>
  )
}

export default function ListLayout({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
  locale = 'en',
}: ListLayoutProps) {
  const [searchValue, setSearchValue] = useState('')
  const messages = getMessages(locale)
  const prefix = locale === 'zh-CN' ? '/zh-CN' : ''
  const filteredBlogPosts = posts.filter((post) => {
    const searchContent = post.title + post.summary + post.tags?.join(' ')
    return searchContent.toLowerCase().includes(searchValue.toLowerCase())
  })
  const displayPosts =
    initialDisplayPosts.length > 0 && !searchValue ? initialDisplayPosts : filteredBlogPosts

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            {title}
          </h1>
          <div className="relative max-w-lg">
            <label>
              <span className="sr-only">{messages.blog.searchArticles}</span>
              <input
                aria-label={messages.blog.searchArticles}
                type="text"
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={messages.blog.searchArticles}
                className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-900 dark:bg-gray-800 dark:text-gray-100"
              />
            </label>
            <svg
              className="absolute top-3 right-3 h-5 w-5 text-gray-400 dark:text-gray-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <ul>
          {!filteredBlogPosts.length && messages.blog.noPosts}
          {displayPosts.map((post) => {
            const { path, date, title: postTitle, summary, tags } = post
            const translationSourceLocale = isAiTranslatedBlog(post)
              ? getTranslationSourceLocale(post)
              : undefined
            return (
              <li key={path} className="py-4">
                <article className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                  <dl>
                    <dt className="sr-only">{messages.blog.publishedOn}</dt>
                    <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                      <time dateTime={date}>
                        {formatDate(date, locale === 'zh-CN' ? 'zh-CN' : siteMetadata.locale)}
                      </time>
                    </dd>
                  </dl>
                  <div className="space-y-3 xl:col-span-3">
                    <div>
                      <h3 className="text-2xl leading-8 font-bold tracking-tight">
                        <Link
                          href={locale === 'zh-CN' ? `${prefix}/${path}` : `/${path}`}
                          className="text-gray-900 dark:text-gray-100"
                        >
                          {postTitle}
                        </Link>
                      </h3>
                      {translationSourceLocale && (
                        <div className="mt-2">
                          <TranslationLabel
                            locale={locale}
                            sourceLocale={translationSourceLocale}
                            variant="compact"
                          />
                        </div>
                      )}
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
      </div>
      {pagination && pagination.totalPages > 1 && !searchValue && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          locale={locale}
        />
      )}
    </>
  )
}
