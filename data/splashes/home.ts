import { opencodeSplash } from './opencode'

export interface SplashLine {
  text: string
  color: string
}

export interface HomeSplash {
  id: string
  label: string
  cmd: string
  lines: SplashLine[]
  loadingText: string
  hidden?: boolean
}

export const homeSplashes: HomeSplash[] = [
  {
    id: 'alohayo',
    label: 'AlohaYo',
    cmd: '$ alohayo --mood sunrise --skill terminal',
    loadingText: 'Warming up the terminal breeze...',
    lines: [
      { text: '', color: '' },
      { text: '      _    _       _                 __   __', color: 'text-cyan-500' },
      { text: '     / \\  | | ___ | |__   __ _ _   _ \\ \\ / /__', color: 'text-cyan-400' },
      { text: "    / _ \\ | |/ _ \\| '_ \\ / _` | | | | \\ V / _ \\", color: 'text-sky-400' },
      { text: '   / ___ \\| | (_) | | | | (_| | |_| |  | | (_) |', color: 'text-blue-400' },
      { text: '  /_/   \\_\\_|\\___/|_| |_|\\__,_|\\__, |  |_|\\___/', color: 'text-indigo-400' },
      { text: '                               |___/', color: 'text-indigo-300' },
      { text: '', color: '' },
      { text: '                 Aloha, ohayoo~  ☀︎  ✦  ✿', color: 'text-orange-400' },
      { text: '', color: '' },
      { text: '  cwd   ~/Home/Code/alohayo.blog', color: 'text-gray-500' },
      { text: '  mode  programmer × animation lover × world builder', color: 'text-cyan-400' },
      { text: '', color: '' },
      { text: '  > Brew a latte and boot the terminal', color: 'text-gray-600' },
      { text: '', color: '' },
    ],
  },
  {
    id: 'ohayoo-wave',
    label: 'Ohayoo Wave',
    cmd: '$ alohayo --banner wave --greet',
    loadingText: 'Tuning the morning waveform...',
    lines: [
      { text: '', color: '' },
      { text: '  ╭──────────────────────────────────────────────╮', color: 'text-cyan-500' },
      { text: '  │   _   _       _                _             │', color: 'text-cyan-400' },
      { text: '  │  /_\\ | | ___ | |__   __ _ _  _| | ___        │', color: 'text-sky-400' },
      { text: "  │ / _ \\| |/ _ \\| '_ \\ / _` | || | |/ _ \\       │", color: 'text-blue-400' },
      {
        text: '  │/_/ \\_\\_|\\___/|_.__/ \\__,_|\\_, |_|\\___/       │',
        color: 'text-indigo-400',
      },
      { text: '  │                           |__/               │', color: 'text-indigo-300' },
      { text: '  ╰──────────────────────────────────────────────╯', color: 'text-cyan-500' },
      { text: '', color: '' },
      { text: '                ~  Aloha, ohayoo~  ~', color: 'text-pink-400' },
      { text: '', color: '' },
      { text: '  cwd   ~/Home/Code/alohayo.blog', color: 'text-gray-500' },
      { text: '  scene code, games, anime glow, and a calm morning shell', color: 'text-cyan-400' },
      { text: '', color: '' },
      { text: '  > Roll into the day with style', color: 'text-gray-600' },
      { text: '', color: '' },
    ],
  },
  {
    id: 'opencode',
    label: 'OpenCode',
    hidden: true,
    cmd: opencodeSplash.cmd,
    loadingText: 'Loading skill alohayo...',
    lines: opencodeSplash.lines,
  },
]

export const DEFAULT_HOME_SPLASH_ID = 'alohayo'

export function getHomeSplashById(id: string) {
  return homeSplashes.find((splash) => splash.id === id)
}

export const visibleHomeSplashes = homeSplashes.filter((splash) => !splash.hidden)
