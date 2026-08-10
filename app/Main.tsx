import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import NewsletterForm from 'pliny/ui/NewsletterForm'
import HomeTerminal from '@/components/HomeTerminal'
import { getMessages, type LocaleCode } from '@/lib/i18n'

const MAX_DISPLAY = 5

interface HomePost {
  slug: string
  date: string
  title: string
  summary?: string
  tags: string[]
}

export default function Home({ posts, locale = 'en' }: { posts: HomePost[]; locale?: LocaleCode }) {
  const messages = getMessages(locale)
  const prefix = locale === 'zh-CN' ? '/zh-CN' : ''
  return (
    <>
      <HomeTerminal posts={posts} locale={locale} />

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            {messages.home.latest}
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            {locale === 'zh-CN' ? messages.home.description : siteMetadata.description}
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && messages.home.noPosts}
          {posts.slice(0, MAX_DISPLAY).map((post) => {
            const { slug, date, title, summary, tags } = post
            return (
              <li key={slug} className="py-12">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl>
                      <dt className="sr-only">{messages.home.publishedOn}</dt>
                      <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                        <time dateTime={date}>
                          {formatDate(date, locale === 'zh-CN' ? 'zh-CN' : siteMetadata.locale)}
                        </time>
                      </dd>
                    </dl>
                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl leading-8 font-bold tracking-tight">
                            <Link
                              href={`${prefix}/blog/${slug}`}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags.map((tag) => (
                              <Tag key={tag} text={tag} locale={locale} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                      <div className="text-base leading-6 font-medium">
                        <Link
                          href={`${prefix}/blog/${slug}`}
                          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                          aria-label={`${messages.home.readMore}: "${title}"`}
                        >
                          {messages.home.readMore} &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base leading-6 font-medium">
          <Link
            href={`${prefix}/blog`}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label={messages.home.allPosts}
          >
            {messages.home.allPosts} &rarr;
          </Link>
        </div>
      )}
      {siteMetadata.newsletter?.provider && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )}
    </>
  )
}
