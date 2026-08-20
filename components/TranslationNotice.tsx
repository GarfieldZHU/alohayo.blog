import Link from '@/components/Link'
import { getMessages, type LocaleCode } from '@/lib/i18n'
import type { TranslationSource } from '@/lib/blogI18n'

interface TranslationNoticeProps {
  locale: LocaleCode
  source: TranslationSource
}

export default function TranslationNotice({ locale, source }: TranslationNoticeProps) {
  const messages = getMessages(locale)
  const fromChinese = source.locale === 'zh-CN'
  const label = fromChinese
    ? messages.blog.aiTranslationFromChinese
    : messages.blog.aiTranslationFromEnglish
  const originalLink = fromChinese
    ? messages.blog.readOriginalInChinese
    : messages.blog.readOriginalInEnglish

  return (
    <p
      className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400"
      role="note"
      aria-label={`${label}. ${originalLink}`}
    >
      <span>{label}</span>
      <span aria-hidden="true">·</span>
      <Link
        href={source.href}
        className="text-primary-500 decoration-primary-300 hover:text-primary-600 dark:text-primary-400 dark:decoration-primary-700 dark:hover:text-primary-300 underline underline-offset-2"
      >
        {originalLink}
      </Link>
    </p>
  )
}
