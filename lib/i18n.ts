export type LocaleCode = 'en' | 'zh-CN'
export const LOCALE_STORAGE_KEY = 'alohayo:locale'
export const normalizeLocale = (value: unknown): LocaleCode => (value === 'zh-CN' ? 'zh-CN' : 'en')
export const getLocalePath = (pathname: string, locale: LocaleCode) => {
  const clean = (pathname || '/').split(/[?#]/)[0] || '/'
  const unprefixed = clean.replace(/^\/zh-CN(?=\/|$)/, '') || '/'
  return locale === 'zh-CN' ? (unprefixed === '/' ? '/zh-CN/' : `/zh-CN${unprefixed}`) : unprefixed
}
export type SiteMessages = Record<string, any>
export const collectMessageKeys = (obj: any, prefix = ''): string[] =>
  Object.keys(obj)
    .sort()
    .flatMap((k) =>
      typeof obj[k] === 'object' ? collectMessageKeys(obj[k], `${prefix}${k}.`) : [`${prefix}${k}`]
    )
export { MESSAGES, getMessages } from './i18nMessages.ts'
