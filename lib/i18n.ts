export type LocaleCode = 'en' | 'zh-CN'
export const LOCALE_STORAGE_KEY = 'alohayo:locale'
export const normalizeLocale = (value: unknown): LocaleCode => {
  if (typeof value !== 'string') return 'en'
  const normalized = value.trim().toLowerCase()
  return normalized === 'zh' || normalized.startsWith('zh-') ? 'zh-CN' : 'en'
}
export const getLocalePath = (pathname: string, locale: LocaleCode) => {
  const clean = (pathname || '/').split(/[?#]/)[0] || '/'
  const unprefixed = clean.replace(/^\/zh-CN(?=\/|$)/, '') || '/'
  return locale === 'zh-CN' ? (unprefixed === '/' ? '/zh-CN/' : `/zh-CN${unprefixed}`) : unprefixed
}
export type MessageSection = Record<string, string>
export interface SiteMessages {
  nav: MessageSection
  shell: MessageSection
  home: MessageSection
  terminal: MessageSection
  agent: MessageSection
  blog: MessageSection
  tags: MessageSection
  projects: MessageSection
  about: MessageSection
  game: MessageSection
  errors: MessageSection
  search: MessageSection
  accessibility: MessageSection
}
export const collectMessageKeys = (obj: SiteMessages | MessageSection, prefix = ''): string[] =>
  Object.keys(obj)
    .sort()
    .flatMap((key) => {
      const value = obj[key]
      return typeof value === 'object'
        ? collectMessageKeys(value, `${prefix}${key}.`)
        : [`${prefix}${key}`]
    })
export { MESSAGES, getMessages } from './i18nMessages.ts'
