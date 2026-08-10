import type { SiteMessages, LocaleCode } from './i18n'
const en = {
  nav: {
    home: 'Home',
    agent: 'Agent',
    blog: 'Blog',
    tags: 'Tags',
    projects: 'Projects',
    about: 'About',
    game: 'Game',
  },
  shell: { language: 'Language' },
  home: { title: 'AlohaYo Blog' },
  terminal: { prompt: 'garfield@alohayo' },
  agent: { title: 'Agent' },
  blog: { title: 'Blog' },
  tags: { title: 'Tags' },
  projects: { title: 'Projects' },
  about: { title: 'About' },
  game: { title: 'Game' },
  errors: { notFound: 'Not found' },
  search: { placeholder: 'Search' },
  accessibility: { languageSwitch: 'Switch language' },
}
const zh = {
  nav: {
    home: '首页',
    agent: '智能体',
    blog: '博客',
    tags: '标签',
    projects: '项目',
    about: '关于',
    game: '游戏',
  },
  shell: { language: '语言' },
  home: { title: 'AlohaYo 博客' },
  terminal: { prompt: 'garfield@alohayo' },
  agent: { title: '智能体' },
  blog: { title: '博客' },
  tags: { title: '标签' },
  projects: { title: '项目' },
  about: { title: '关于' },
  game: { title: '游戏' },
  errors: { notFound: '未找到' },
  search: { placeholder: '搜索' },
  accessibility: { languageSwitch: '切换语言' },
}
export const MESSAGES: Record<LocaleCode, SiteMessages> = { en, 'zh-CN': zh }
export const getMessages = (locale: LocaleCode): SiteMessages => MESSAGES[locale] || MESSAGES.en
