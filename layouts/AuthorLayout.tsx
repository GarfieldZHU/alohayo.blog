import { ReactNode } from 'react'
import type { Authors } from 'contentlayer/generated'
import SocialIcon from '@/components/social-icons'
import QuantumAvatar from '@/components/QuantumAvatar'
import { getMessages, type LocaleCode } from '@/lib/i18n'

interface Props {
  children: ReactNode
  content: Omit<Authors, '_id' | '_raw' | 'body'>
  locale?: LocaleCode
}

export default function AuthorLayout({ children, content, locale = 'en' }: Props) {
  const messages = getMessages(locale)
  const { name, avatar, occupation, company, email, twitter, linkedin, github } = content

  return (
    <div className="pb-16 sm:pb-24">
      <div className="items-start gap-10 pt-8 sm:pt-12 xl:grid xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="author-card rounded-3xl border p-6 text-center xl:sticky xl:top-24">
          {avatar && <QuantumAvatar src={avatar} alt={`${name} avatar`} />}
          <p className="text-primary-600 dark:text-primary-300 mt-6 font-mono text-[10px] font-bold tracking-[0.18em] uppercase">
            {messages.about.hello}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {name}
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{occupation}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{company}</p>
          <div className="mt-6 flex justify-center gap-3 border-t border-gray-200 pt-5 dark:border-white/10">
            <SocialIcon kind="mail" href={`mailto:${email}`} />
            <SocialIcon kind="github" href={github} />
            <SocialIcon kind="linkedin" href={linkedin} />
            <SocialIcon kind="twitter" href={twitter} />
          </div>
        </aside>
        <article className="prose prose-lg dark:prose-invert mt-8 max-w-none xl:mt-0">
          {children}
        </article>
      </div>
    </div>
  )
}
