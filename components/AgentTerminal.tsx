'use client'

import React, { useState, useEffect, useRef } from 'react'

function renderMd(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    if (match[2]) {
      parts.push(
        <span key={match.index} className="font-bold text-white">
          {match[2]}
        </span>
      )
    } else if (match[3]) {
      parts.push(
        <span key={match.index} className="rounded bg-gray-700/60 px-1 font-mono text-yellow-300">
          {match[3]}
        </span>
      )
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  return parts
}

const exchanges = [
  {
    user: 'What kind of engineer are you?',
    agent:
      "**Null-stack.** Java, C++, Python, TypeScript, Go, Rust — genuinely skilled, not resume-padding. Primary environment is `React` + `TypeScript` at MicroStrategy. I have opinions and I'll share them whether you ask or not.",
  },
  {
    user: 'How do you approach debugging?',
    agent:
      "Start with the **simplest hypothesis**. Most bugs are embarrassingly simple — a typo, a stale cache, a wrong import. Don't reach for the distributed tracing dashboard when `console.log` would've found it in 30 seconds.",
  },
  {
    user: "What's your code philosophy?",
    agent:
      'Code readable cold **six months later**. Structure that reveals intent without comments. Edge cases handled, not ignored. If your function needs a comment to explain what it does, **rename the function**.',
  },
  {
    user: 'Will you sugarcoat feedback?',
    agent:
      'No. If something\'s dumb, I\'ll say it — charming, not cruel. `"This shit is brilliant"` beats `"Great job!"` because one is real and the other is corporate autopilot. **Brevity is a virtue.** One sentence beats a paragraph.',
  },
]

const creedData = [
  {
    rule: 'Have opinions, and be firm',
    meaning: 'Take a stand. Admit when wrong — but only when actually wrong.',
  },
  {
    rule: 'Answer directly, no preamble',
    meaning: 'No "Great question!" niceties. Just the answer.',
  },
  { rule: 'Brevity is a virtue', meaning: "One sentence beats a paragraph. Don't ramble." },
  {
    rule: 'Humor is allowed',
    meaning: 'Natural wit from real knowledge. "This shit is brilliant" beats corporate praise.',
  },
  { rule: 'Call out problems', meaning: "If something's dumb, say it — charming, not cruel." },
  { rule: 'Swearing is allowed', meaning: 'Sparingly, for emphasis. Not performance.' },
]

const techStack = [
  { label: 'TypeScript', color: 'text-blue-400' },
  { label: 'Java', color: 'text-red-400' },
  { label: 'Rust', color: 'text-orange-400' },
  { label: 'Python', color: 'text-yellow-400' },
  { label: 'Go', color: 'text-sky-300' },
  { label: 'C++', color: 'text-purple-400' },
]

const splashScreens: Record<ThemeName, { cmd: string; banner: string[] }> = {
  opencode: {
    cmd: '$ opencode',
    banner: [
      '',
      '  ⠀                                ▄',
      '  █▀▀█ █▀▀█ █▀▀█ █▀▀▄ █▀▀▀ █▀▀█ █▀▀█ █▀▀█',
      '  █  █ █  █ █▀▀▀ █  █ █    █  █ █  █ █▀▀▀',
      '  ▀▀▀▀ █▀▀▀ ▀▀▀▀ ▀  ▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀',
      '',
      '  cwd: ~/Dev/alohayo.blog',
      '  model: claude-sonnet-4-20250514',
      '',
      '  > Fix a TODO in the codebase',
      '',
    ],
  },
  'claude-code': {
    cmd: '$ claude',
    banner: [
      '',
      '  ╭──────────────────────────────────────────────╮',
      '  │ Claude Code                                  │',
      '  │                                              │',
      '  │ /help for available commands                 │',
      '  │ /plan for read-only mode                    │',
      '  │                                              │',
      '  │ cwd: ~/Dev/alohayo.blog                     │',
      '  │ model: claude-sonnet-4-20250514             │',
      '  ╰──────────────────────────────────────────────╯',
      '',
      '  >',
      '',
    ],
  },
  openclaw: {
    cmd: '$ openclaw',
    banner: [
      '',
      '  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄',
      '  ██░▄▄▄░██░▄▄░██░▄▄▄██░▀██░██░▄▄▀██░████░▄▄▀██░███░██',
      '  ██░███░██░▀▀░██░▄▄▄██░█░█░██░█████░████░▀▀░██░█░█░██',
      '  ██░▀▀▀░██░█████░▀▀▀██░██▄░██░▀▀▄██░▀▀░█░██░██▄▀▄▀▄██',
      '  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀',
      '                    🦞 OPENCLAW 🦞',
      '',
      '  🦞 OpenClaw 2.4.0 (a1b2c3d) — Your AI, your rules',
      '',
      '  >',
      '',
    ],
  },
}

type ThemeName = 'opencode' | 'claude-code' | 'openclaw'

const themes = {
  opencode: {
    bg: 'bg-[#212121]',
    text: 'text-[#e0e0e0]',
    titleBar: 'bg-[#2a2a2a]',
    titleText: 'Open Code- Sisyphus',
    titleColor: 'text-[#7b7f87]',
    userMsg: 'border-l-4 border-[#5c9cf5] pl-3 py-1',
    userBg: '',
    userColor: 'text-[#e0e0e0]',
    agentMsg: 'border-l-4 border-[#fab283] pl-3 py-1',
    agentColor: 'text-[#e0e0e0]',
    userPrefix: '❯',
    userPrefixColor: 'text-[#5c9cf5]',
    agentPrefix: '⌬',
    agentPrefixColor: 'text-[#fab283]',
    footerText: 'claude-sonnet-4-20250514',
    footerColor: 'text-[#7b7f87]',
    primaryColor: 'text-pink-400',
  },
  'claude-code': {
    bg: 'bg-[#1a1a2e]',
    text: 'text-[#e0e0e0]',
    titleBar: 'bg-[#16162a]',
    titleText: 'Claude-Code',
    titleColor: 'text-[#7b7f87]',
    userMsg: 'py-1',
    userBg: '',
    userColor: 'text-[#e0e0e0]',
    agentMsg: 'py-1',
    agentColor: 'text-[#e0e0e0]',
    userPrefix: '❯',
    userPrefixColor: 'text-[#fab283]',
    agentPrefix: '⚡',
    agentPrefixColor: 'text-[#fab283]',
    footerText: 'claude-sonnet-4-20250514',
    footerColor: 'text-[#7b7f87]',
    primaryColor: 'text-pink-400',
  },
  openclaw: {
    bg: 'bg-[#1e1e2e]',
    text: 'text-[#E8E3D5]',
    titleBar: 'bg-[#181825]',
    titleText: 'OpenClaw',
    titleColor: 'text-[#7B7F87]',
    userMsg: 'p-2 rounded mt-1 mb-2',
    userBg: 'bg-[#2B2F36]',
    userColor: 'text-[#F3EEE0]',
    agentMsg: 'py-1',
    agentColor: 'text-[#E8E3D5]',
    userPrefix: '→',
    userPrefixColor: 'text-[#F6C453]',
    agentPrefix: '⚡',
    agentPrefixColor: 'text-[#F6C453]',
    footerText: 'claude-sonnet-4-20250514',
    footerColor: 'text-[#7B7F87]',
    primaryColor: 'text-pink-400',
  },
}

export default function AgentTerminal() {
  const [activeTab, setActiveTab] = useState<'session' | 'identity'>('session')
  const [activeTheme, setActiveTheme] = useState<ThemeName>('opencode')

  const [exchangeIdx, setExchangeIdx] = useState(0)
  const [typingState, setTypingState] = useState<
    | 'typing-cmd'
    | 'showing-splash'
    | 'typing-user'
    | 'pausing-user'
    | 'typing-agent'
    | 'pausing-agent'
  >('typing-cmd')
  const [typedUser, setTypedUser] = useState('')
  const [typedAgent, setTypedAgent] = useState('')
  const [typedCmd, setTypedCmd] = useState('')
  const [splashVisible, setSplashVisible] = useState(false)
  const [completedExchanges, setCompletedExchanges] = useState<
    Array<{ user: string; agent: string }>
  >([])

  const [idState, setIdState] = useState<'typing-cmd' | 'revealed'>('typing-cmd')
  const [typedIdCmd, setTypedIdCmd] = useState('')

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const charIdxRef = useRef(0)

  const clearTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  useEffect(() => {
    return clearTimers
  }, [])

  useEffect(() => {
    if (activeTab !== 'session') return

    const splash = splashScreens[activeTheme]

    if (typingState === 'typing-cmd') {
      const cmd = splash.cmd
      if (charIdxRef.current < cmd.length) {
        timeoutRef.current = setTimeout(() => {
          setTypedCmd(cmd.slice(0, charIdxRef.current + 1))
          charIdxRef.current++
        }, 50)
      } else {
        timeoutRef.current = setTimeout(() => {
          setSplashVisible(true)
          setTypingState('showing-splash')
          charIdxRef.current = 0
        }, 400)
      }
    } else if (typingState === 'showing-splash') {
      timeoutRef.current = setTimeout(() => {
        setTypingState('typing-user')
      }, 2000)
    } else if (typingState === 'typing-user') {
      const currentExchange = exchanges[exchangeIdx]
      const text = currentExchange.user
      if (charIdxRef.current < text.length) {
        timeoutRef.current = setTimeout(() => {
          setTypedUser(text.slice(0, charIdxRef.current + 1))
          charIdxRef.current++
        }, 30)
      } else {
        timeoutRef.current = setTimeout(() => {
          setTypingState('pausing-user')
        }, 500)
      }
    } else if (typingState === 'pausing-user') {
      timeoutRef.current = setTimeout(() => {
        setTypingState('typing-agent')
        charIdxRef.current = 0
      }, 50)
    } else if (typingState === 'typing-agent') {
      const currentExchange = exchanges[exchangeIdx]
      const text = currentExchange.agent
      if (charIdxRef.current < text.length) {
        timeoutRef.current = setTimeout(() => {
          setTypedAgent(text.slice(0, charIdxRef.current + 1))
          charIdxRef.current++
        }, 15)
      } else {
        timeoutRef.current = setTimeout(() => {
          setTypingState('pausing-agent')
        }, 1500)
      }
    } else if (typingState === 'pausing-agent') {
      timeoutRef.current = setTimeout(() => {
        const currentExchange = exchanges[exchangeIdx]
        setCompletedExchanges((prev) => [...prev, currentExchange])
        const nextIdx = exchangeIdx + 1
        if (nextIdx >= exchanges.length) {
          setCompletedExchanges([])
          setExchangeIdx(0)
        } else {
          setExchangeIdx(nextIdx)
        }
        setTypedUser('')
        setTypedAgent('')
        setTypingState('typing-user')
        charIdxRef.current = 0
      }, 50)
    }
  }, [activeTab, activeTheme, exchangeIdx, typingState, typedUser, typedAgent, typedCmd])

  useEffect(() => {
    if (activeTab !== 'identity') return

    const targetCmd = '$ cat ~/.agent/IDENTITY.md'

    if (idState === 'typing-cmd') {
      if (charIdxRef.current < targetCmd.length) {
        timeoutRef.current = setTimeout(() => {
          setTypedIdCmd(targetCmd.slice(0, charIdxRef.current + 1))
          charIdxRef.current++
        }, 40)
      } else {
        timeoutRef.current = setTimeout(() => {
          setIdState('revealed')
        }, 600)
      }
    }
  }, [activeTab, idState, typedIdCmd])

  const handleTabSwitch = (tab: 'session' | 'identity') => {
    if (tab === activeTab) return
    clearTimers()
    setActiveTab(tab)
    charIdxRef.current = 0
    if (tab === 'session') {
      setExchangeIdx(0)
      setCompletedExchanges([])
      setTypedUser('')
      setTypedAgent('')
      setTypedCmd('')
      setSplashVisible(false)
      setTypingState('typing-cmd')
    } else {
      setTypedIdCmd('')
      setIdState('typing-cmd')
    }
  }

  const handleThemeSwitch = (theme: ThemeName) => {
    if (theme === activeTheme) return
    clearTimers()
    setActiveTheme(theme)
    charIdxRef.current = 0
    setExchangeIdx(0)
    setCompletedExchanges([])
    setTypedUser('')
    setTypedAgent('')
    setTypedCmd('')
    setSplashVisible(false)
    setTypingState('typing-cmd')
  }

  const t = themes[activeTheme]

  return (
    <div className="mx-auto w-full max-w-4xl font-mono text-sm md:text-base">
      <div className="mb-4 flex gap-2 font-mono text-sm">
        <button
          className={`border border-gray-600 px-4 py-1 transition-colors ${activeTab === 'session' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
          onClick={() => handleTabSwitch('session')}
        >
          Agent TUI
        </button>
        <button
          className={`border border-gray-600 px-4 py-1 transition-colors ${activeTab === 'identity' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
          onClick={() => handleTabSwitch('identity')}
        >
          Identity.md
        </button>
      </div>

      <div
        className={`overflow-hidden rounded-lg border border-gray-700 shadow-2xl transition-colors duration-300 ${t.bg} ${t.text}`}
      >
        <div
          className={`flex items-center justify-between border-b border-gray-700 ${t.titleBar} px-4 py-3 transition-colors duration-300`}
        >
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className={`ml-3 ${t.titleColor}`}>
              {activeTab === 'session' ? t.titleText : '~/.agent/IDENTITY.md'}
            </span>
          </div>
          {activeTab === 'session' && (
            <div className="flex items-center gap-2 text-xs">
              {(Object.keys(themes) as ThemeName[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeSwitch(theme)}
                  className={`rounded border px-2 py-0.5 transition-colors ${activeTheme === theme ? 'border-gray-400 bg-gray-700/50 text-gray-200' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                  {theme}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="min-h-[400px] p-6 md:p-8">
          {activeTab === 'session' && (
            <div className="flex flex-col gap-6">
              {(typingState === 'typing-cmd' || splashVisible) && (
                <div className="text-green-400">
                  <p>
                    {typedCmd}
                    {typingState === 'typing-cmd' && <span className="animate-pulse">_</span>}
                  </p>
                  {splashVisible && (
                    <pre className="mt-2 text-xs leading-tight opacity-80 md:text-sm">
                      {splashScreens[activeTheme].banner.join('\n')}
                    </pre>
                  )}
                </div>
              )}

              {typingState !== 'typing-cmd' && typingState !== 'showing-splash' && (
                <>
                  {completedExchanges.map((ex, i) => (
                    <div key={i} className="flex flex-col gap-4">
                      <div className={`${t.userMsg} ${t.userBg} ${t.userColor}`}>
                        <span className={`mr-2 ${t.userPrefixColor}`}>{t.userPrefix}</span>
                        {ex.user}
                      </div>
                      <div className={`${t.agentMsg} ${t.agentColor}`}>
                        <span className={`mr-2 ${t.agentPrefixColor}`}>{t.agentPrefix}</span>
                        {renderMd(ex.agent)}
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-col gap-4">
                    {typedUser.length > 0 && (
                      <div className={`${t.userMsg} ${t.userBg} ${t.userColor}`}>
                        <span className={`mr-2 ${t.userPrefixColor}`}>{t.userPrefix}</span>
                        {typedUser}
                        {(typingState === 'typing-user' || typingState === 'pausing-user') && (
                          <span className="animate-pulse">_</span>
                        )}
                      </div>
                    )}
                    {typingState !== 'typing-user' && typingState !== 'pausing-user' && (
                      <div className={`${t.agentMsg} ${t.agentColor}`}>
                        <span className={`mr-2 ${t.agentPrefixColor}`}>{t.agentPrefix}</span>
                        {renderMd(typedAgent)}
                        {typingState === 'typing-agent' && <span className="animate-pulse">_</span>}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'identity' && (
            <div className="font-mono text-sm leading-relaxed md:text-base">
              <div className="mb-8">
                <p className="text-green-400">
                  {typedIdCmd}
                  {idState === 'typing-cmd' && <span className="animate-pulse">_</span>}
                </p>

                {idState === 'revealed' && (
                  <div className="mt-4">
                    <p className="text-xl font-bold md:text-2xl">
                      <span className={t.primaryColor}>#</span> alohayo.agent
                    </p>
                    <p className="mt-2 text-gray-400">
                      Null-stack engineer — channels AlohaYo&apos;s engineering taste, opinions, and
                      hard-won experience.
                    </p>

                    <div className="my-8">
                      <p className={`mb-3 ${t.primaryColor}`}>## Stack</p>
                      <div className="flex flex-wrap gap-2">
                        {techStack.map((tech) => (
                          <span
                            key={tech.label}
                            className={`rounded border border-gray-600 px-2 py-1 text-xs ${tech.color}`}
                          >
                            {tech.label}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-gray-400">
                        Primary env: <span className="text-cyan-400">React + TypeScript</span>,{' '}
                        <span className="text-yellow-500">Spring + Java</span>
                      </p>
                    </div>

                    <div className="mb-8">
                      <p className={`mb-4 ${t.primaryColor}`}>## Creed</p>
                      <div className="space-y-3">
                        {creedData.map((item, i) => (
                          <div key={i} className="border-l-2 border-gray-600 pl-4">
                            <p className="text-green-300">{item.rule}</p>
                            <p className="text-gray-500">{item.meaning}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-8">
                      <p className={`mb-3 ${t.primaryColor}`}>## Philosophy</p>
                      <div className="space-y-2 text-gray-300">
                        <p>
                          <span className="text-yellow-400">→</span> Code readable cold six months
                          later
                        </p>
                        <p>
                          <span className="text-yellow-400">→</span> Structure reveals intent
                          without comments
                        </p>
                        <p>
                          <span className="text-yellow-400">→</span> Edge cases handled, not ignored
                        </p>
                        <p>
                          <span className="text-yellow-400">→</span> Start with the simplest
                          hypothesis — most bugs are embarrassingly simple
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 border-t border-gray-700 pt-4">
                      <p className="text-gray-500">
                        <span className="text-green-400">$</span>{' '}
                        <span className="animate-pulse">_</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {activeTab === 'session' && (
          <div className={`border-t border-gray-700 px-4 py-2 text-xs ${t.footerColor}`}>
            {t.footerText}
          </div>
        )}
      </div>
    </div>
  )
}
