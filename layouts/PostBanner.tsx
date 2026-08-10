import { ReactNode } from 'react'
import Image from '@/components/Image'
import Bleed from 'pliny/ui/Bleed'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import { getMessages, type LocaleCode } from '@/lib/i18n'

interface LayoutProps {
  content: CoreContent<Blog>
  children: ReactNode
  next?: { path: string; title: string; localizedSlug?: string }
  prev?: { path: string; title: string; localizedSlug?: string }
  locale?: LocaleCode
}

export default function PostMinimal({ content, next, prev, children, locale = 'en' }: LayoutProps) {
  const messages = getMessages(locale)
  const { slug, title, images } = content
  const localizedSlug = content.localizedSlug || slug
  const displayImage =
    images && images.length > 0 ? images[0] : 'https://picsum.photos/seed/picsum/800/400'

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        <div>
          <div className="space-y-1 pb-10 text-center dark:border-gray-700">
            <div className="w-full">
              <Bleed>
                <div className="relative aspect-[2/1] w-full">
                  <Image src={displayImage} alt={title} fill className="object-cover" />
                </div>
              </Bleed>
            </div>
            <div className="relative pt-10">
              <PageTitle>{title}</PageTitle>
            </div>
          </div>
          <div className="prose dark:prose-invert max-w-none py-4">{children}</div>
          {siteMetadata.comments && (
            <div className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300" id="comment">
              <Comments slug={localizedSlug} />
            </div>
          )}
          <footer>
            <div className="flex flex-col text-sm font-medium sm:flex-row sm:justify-between sm:text-base">
              {prev && prev.path && (
                <div className="pt-4 xl:pt-8">
                  <Link
                    href={
                      locale === 'zh-CN' && prev.localizedSlug
                        ? `/zh-CN/blog/${prev.localizedSlug}`
                        : `/${prev.path}`
                    }
                    className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                    aria-label={`${messages.blog.previous}: ${prev.title}`}
                  >
                    &larr; {prev.title}
                  </Link>
                </div>
              )}
              {next && next.path && (
                <div className="pt-4 xl:pt-8">
                  <Link
                    href={
                      locale === 'zh-CN' && next.localizedSlug
                        ? `/zh-CN/blog/${next.localizedSlug}`
                        : `/${next.path}`
                    }
                    className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                    aria-label={`${messages.blog.next}: ${next.title}`}
                  >
                    {next.title} &rarr;
                  </Link>
                </div>
              )}
            </div>
          </footer>
        </div>
      </article>
    </SectionContainer>
  )
}
