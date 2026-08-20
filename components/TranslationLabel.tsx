import { getMessages, type LocaleCode } from '@/lib/i18n'

interface TranslationLabelProps {
  locale: LocaleCode
  sourceLocale: LocaleCode
  variant?: 'plain' | 'compact'
  className?: string
}

export default function TranslationLabel({
  locale,
  sourceLocale,
  variant = 'plain',
  className = '',
}: TranslationLabelProps) {
  const messages = getMessages(locale)
  const label =
    sourceLocale === 'zh-CN'
      ? messages.blog.aiTranslationFromChinese
      : messages.blog.aiTranslationFromEnglish

  const variantClassName =
    variant === 'compact'
      ? 'inline-flex rounded-full border border-gray-200 px-2 py-0.5 text-xs font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400'
      : ''
  const combinedClassName = [variantClassName, className].filter(Boolean).join(' ')

  return <span className={combinedClassName}>{label}</span>
}
