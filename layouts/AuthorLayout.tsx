import { ReactNode } from 'react'
import type { Authors } from 'contentlayer/generated'
import SocialIcon from '@/components/social-icons'
import Image from '@/components/Image'

interface Props {
  children: ReactNode
  content: Omit<Authors, '_id' | '_raw' | 'body'>
}

export default function AuthorLayout({ children, content }: Props) {
  const { name, avatar, occupation, company, email, twitter, linkedin, github } = content

  return (
    <div className="pb-16 sm:pb-24">
      <section className="relative isolate mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-rose-50 via-white to-sky-50 px-6 py-10 shadow-[0_28px_75px_-55px_rgba(15,23,42,0.7)] sm:px-10 sm:py-14 dark:border-white/10 dark:from-[#21171c] dark:via-[#17191c] dark:to-[#101b26]">
        <div className="bg-primary-300/25 dark:bg-primary-500/15 absolute -top-16 -right-12 -z-10 h-52 w-52 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 -z-10 h-48 w-48 rounded-full bg-sky-300/25 blur-3xl dark:bg-sky-400/10" />
        <p className="text-primary-600 dark:text-primary-300 font-mono text-[11px] font-bold tracking-[0.2em] uppercase">
          A small introduction
        </p>
        <div className="mt-5 max-w-3xl">
          <h1 className="text-4xl leading-[1.02] font-extrabold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
            Building things with care, curiosity, and a little play.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg dark:text-gray-300">
            A personal corner for code, games, and the small ideas that make a digital life feel
            more human.
          </p>
        </div>
      </section>

      <div className="mt-8 items-start gap-10 xl:grid xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-gray-200 bg-gray-50/70 p-6 text-center shadow-sm xl:sticky xl:top-24 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="relative mx-auto w-fit">
            <div className="from-primary-300 absolute -inset-2 rounded-full bg-gradient-to-br via-amber-200 to-sky-300 opacity-70 blur-sm dark:opacity-40" />
            {avatar && (
              <Image
                src={avatar}
                alt={`${name} avatar`}
                width={192}
                height={192}
                className="relative h-36 w-36 rounded-full border-4 border-white object-cover shadow-lg dark:border-[#17191c]"
              />
            )}
          </div>
          <p className="text-primary-600 dark:text-primary-300 mt-6 font-mono text-[10px] font-bold tracking-[0.18em] uppercase">
            Hello, I&apos;m
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
