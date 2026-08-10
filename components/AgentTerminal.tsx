'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useLocale } from './LocaleProvider'

type Surface = 'workspace' | 'terminal'
type Panel = 'overview' | 'run' | 'contract'
type Terminal = 'codex' | 'claude'
type ThreadFilter = 'all' | 'active' | 'review'

type Thread = {
  title: string
  status: string
  tone: string
  detail: string
  objective: string
  response: string
  files: string[]
  steps: { label: string; state: 'done' | 'now' | 'next' }[]
}

type TranscriptLine = {
  kind: 'command' | 'assistant' | 'system'
  text: string
}

const threads: Thread[] = [
  {
    title: 'Polish the Agent page',
    status: 'Review ready',
    tone: 'bg-emerald-400',
    detail: '5 files · build passed',
    objective:
      'Make the page feel like a real, inspectable agent workspace without pretending that a demo is a live model session.',
    response:
      'The route now has a session shell, task threads, a contract view, and a safe command simulator. The useful parts of the work stay visible: scope, actions, proof, and handoff.',
    files: ['app/agent/page.tsx', 'components/AgentTerminal.tsx', 'css/tailwind.css'],
    steps: [
      { label: 'Read the page and local conventions', state: 'done' },
      { label: 'Model the workspace and terminal surfaces', state: 'done' },
      { label: 'Add interactive command previews', state: 'now' },
      { label: 'Build, inspect, and hand off', state: 'next' },
    ],
  },
  {
    title: 'Trace the deploy regression',
    status: 'Investigating',
    tone: 'bg-amber-400',
    detail: 'logs + last deploy · 4m',
    objective: 'Find why a production deploy slowed down without changing visible behavior.',
    response:
      'I am correlating deployment logs with the last two commits before proposing a fix. No production action has been taken.',
    files: ['read-only investigation'],
    steps: [
      { label: 'Capture the failing deployment', state: 'done' },
      { label: 'Compare changed dependencies', state: 'now' },
      { label: 'Reproduce locally', state: 'next' },
      { label: 'Propose the narrowest fix', state: 'next' },
    ],
  },
  {
    title: 'Extract release notes',
    status: 'Working',
    tone: 'bg-sky-400',
    detail: 'git history + docs · 2m',
    objective:
      'Turn shipped changes into a short, human release note and leave out internal churn.',
    response: 'I am grouping commits by user outcome and checking each claim against the diff.',
    files: ['notes/release-draft.md'],
    steps: [
      { label: 'Read merged commits', state: 'done' },
      { label: 'Group by user outcome', state: 'now' },
      { label: 'Draft the release note', state: 'next' },
      { label: 'Check claims against diffs', state: 'next' },
    ],
  },
  {
    title: 'Review the API boundary',
    status: 'Queued',
    tone: 'bg-gray-400',
    detail: 'security pass · queued',
    objective: 'Map request paths and spot unsafe trust boundaries before a feature expands them.',
    response:
      'This thread is queued behind the current work. It will begin as an audit, not a rewrite.',
    files: ['no files yet'],
    steps: [
      { label: 'Map entry points', state: 'next' },
      { label: 'List trust transitions', state: 'next' },
      { label: 'Validate findings', state: 'next' },
      { label: 'Recommend scoped hardening', state: 'next' },
    ],
  },
  {
    title: 'Prototype the reading mode',
    status: 'Needs direction',
    tone: 'bg-violet-400',
    detail: 'design decision · paused',
    objective: 'Explore a calmer reading experience for long technical posts.',
    response:
      'There are two valid directions. I stopped before inventing product taste and left a concise decision request.',
    files: ['research only'],
    steps: [
      { label: 'Inspect existing typography', state: 'done' },
      { label: 'Sketch two directions', state: 'done' },
      { label: 'Ask for a preference', state: 'now' },
      { label: 'Implement the chosen route', state: 'next' },
    ],
  },
]

const terminalViews: Record<
  Terminal,
  {
    label: string
    command: string
    accent: string
    prompt: string
    model: string
    note: string
  }
> = {
  codex: {
    label: 'Codex CLI',
    command: 'codex',
    accent: 'text-sky-300',
    prompt: 'alohayo:~/code/alohayo.blog',
    model: 'reasoning workspace',
    note: 'A tight loop for one repo, one task, and evidence on demand.',
  },
  claude: {
    label: 'Claude Code',
    command: 'claude',
    accent: 'text-orange-300',
    prompt: 'AlohaYo@blog ~/agent',
    model: 'terminal craft',
    note: 'A shell-first conversation: inspect the tree, shape the edit, and keep the diff reviewable.',
  },
}

const initialTranscripts: Record<Terminal, TranscriptLine[]> = {
  codex: [
    { kind: 'system', text: 'workspace loaded · local sandbox · no external actions' },
    { kind: 'command', text: '/plan refresh the agent page' },
    { kind: 'assistant', text: 'Plan: inspect → model → implement → build → handoff.' },
    { kind: 'system', text: 'waiting for a local command' },
  ],
  claude: [
    { kind: 'system', text: 'Claude Code simulation · cwd ~/agent · review mode' },
    { kind: 'command', text: 'read app/agent/page.tsx' },
    {
      kind: 'assistant',
      text: 'I found the page shell. Next I would inspect the interactive surface.',
    },
    { kind: 'system', text: 'nothing has been written' },
  ],
}

const quickCommands = ['/plan', '/review', '/test', '/handoff']

const commandResponses: Record<string, string> = {
  '/plan':
    'Plan drafted: inspect the request, shape the smallest useful change, verify it, then hand off the proof.',
  '/review':
    'Review complete: no blocking findings in this local simulation. Human taste and final approval remain open.',
  '/test':
    'Check queued: route, interaction states, themes, and the production build are the evidence to collect next.',
  '/handoff':
    'Handoff prepared: changed surface, verification status, remaining choice, and next safe action are visible.',
  '/help':
    'Commands: /plan, /review, /test, /handoff. Any other text is echoed as a new task prompt.',
}

const threadMatchesFilter = (thread: Thread, filter: ThreadFilter) => {
  if (filter === 'all') return true
  if (filter === 'active') return ['Investigating', 'Working'].includes(thread.status)
  return ['Review ready', 'Needs direction'].includes(thread.status)
}

export default function AgentTerminal() {
  const { messages } = useLocale()
  const [surface, setSurface] = useState<Surface>('workspace')
  const [panel, setPanel] = useState<Panel>('overview')
  const [selectedThread, setSelectedThread] = useState(0)
  const [threadFilter, setThreadFilter] = useState<ThreadFilter>('all')
  const [terminal, setTerminal] = useState<Terminal>('codex')
  const [command, setCommand] = useState('')
  const [transcripts, setTranscripts] = useState(initialTranscripts)
  const [previewRun, setPreviewRun] = useState(false)

  const thread = threads[selectedThread]
  const terminalView = terminalViews[terminal]
  const visibleThreads = useMemo(
    () => threads.filter((item) => threadMatchesFilter(item, threadFilter)),
    [threadFilter]
  )

  const selectThread = (index: number) => {
    setSelectedThread(index)
    setPanel('overview')
  }

  const changeThreadFilter = (filter: ThreadFilter) => {
    const nextThreads = threads.filter((item) => threadMatchesFilter(item, filter))
    const selectedIsVisible = nextThreads.some((item) => threads.indexOf(item) === selectedThread)

    setThreadFilter(filter)
    if (!selectedIsVisible && nextThreads[0]) {
      setSelectedThread(threads.indexOf(nextThreads[0]))
      setPanel('overview')
    }
  }

  const selectTerminal = (item: Terminal) => {
    setTerminal(item)
    setCommand('')
  }

  const submitCommand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const input = command.trim()
    if (!input) return

    const key = input.toLowerCase().split(' ')[0]
    const response =
      commandResponses[key] ??
      `Task captured: “${input}”. I would clarify the outcome, inspect the workspace, and show proof before calling it done.`

    setTranscripts((current) => ({
      ...current,
      [terminal]: [
        ...current[terminal],
        { kind: 'command', text: input },
        { kind: 'assistant', text: response },
      ],
    }))
    setCommand('')
  }

  const runQuickCommand = (value: string) => {
    setCommand(value)
  }

  return (
    <section className="not-prose overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_30px_90px_-55px_rgba(15,23,42,0.8)] dark:border-white/10 dark:bg-[#10141b]">
      <header className="border-b border-slate-200 bg-slate-50/90 px-4 py-3 sm:px-5 dark:border-white/10 dark:bg-[#0d1118]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex gap-1.5" aria-hidden="true">
              <i className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <i className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <i className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
              alohayo.blog / agent / session-014
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-emerald-600 uppercase dark:text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            local · reviewable
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200 px-4 py-5 sm:px-6 sm:py-6 dark:border-white/10">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-sky-600 uppercase dark:text-sky-300">
              {messages.agent.workbench}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              ['05', messages.agent.threads],
              ['03', messages.agent.surfaces],
              ['01', messages.agent.humanInLoop],
            ].map(([value, label]) => (
              <div
                key={label}
                className="min-w-[82px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <p className="font-mono text-lg font-semibold text-slate-950 dark:text-white">
                  {value}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5 dark:border-white/10 dark:bg-[#10141b]">
        <div className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-white/[0.05]">
          {(['workspace', 'terminal'] as Surface[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSurface(item)}
              aria-pressed={surface === item}
              className={`rounded-md px-3 py-2 text-xs font-semibold transition ${surface === item ? 'bg-white text-slate-950 shadow-sm dark:bg-white/15 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              {item === 'workspace' ? messages.agent.workspace : messages.agent.terminal}
            </button>
          ))}
        </div>
        <p className="font-mono text-[10px] text-slate-400">{messages.agent.stop}</p>
      </div>

      {surface === 'workspace' ? (
        <div className="grid min-h-[690px] xl:grid-cols-[220px_minmax(0,1fr)_230px]">
          <aside className="border-b border-slate-200 bg-slate-50/70 p-4 xl:border-r xl:border-b-0 dark:border-white/10 dark:bg-[#0d1118]">
            <div className="flex items-center justify-between font-mono text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">
              <span>workspace</span>
              <span className="text-sky-500">⌘</span>
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-black/25">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-950 dark:text-white">alohayo.blog</p>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>
              <p className="mt-1 font-mono text-[10px] text-slate-400">main · local workspace</p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">
                threads
              </p>
              <span className="font-mono text-[10px] text-slate-400">{threads.length}</span>
            </div>
            <div className="mt-2 flex gap-1 rounded-lg bg-slate-200/70 p-1 dark:bg-white/[0.04]">
              {(['all', 'active', 'review'] as ThreadFilter[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => changeThreadFilter(item)}
                  aria-pressed={threadFilter === item}
                  className={`flex-1 rounded px-1.5 py-1.5 text-[10px] font-semibold capitalize transition ${threadFilter === item ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-200'}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="mt-3 space-y-1.5">
              {visibleThreads.map((item) => {
                const index = threads.indexOf(item)
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => selectThread(index)}
                    aria-pressed={selectedThread === index}
                    className={`w-full rounded-xl px-3 py-2.5 text-left transition ${selectedThread === index ? 'bg-sky-100 text-slate-950 shadow-sm dark:bg-sky-400/15 dark:text-white' : 'text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-white/[0.04]'}`}
                  >
                    <span className="block truncate text-xs font-medium">{item.title}</span>
                    <span className="mt-1 flex items-center gap-1.5 text-[10px] opacity-75">
                      <i className={`h-1.5 w-1.5 rounded-full ${item.tone}`} />
                      {item.status}
                    </span>
                  </button>
                )
              })}
            </div>
          </aside>

          <main className="min-w-0 bg-white dark:bg-[#10141b]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <div>
                <p className="font-mono text-[10px] tracking-[0.14em] text-slate-400 uppercase">
                  {messages.agent.selectedThread}
                </p>
                <h3 className="mt-1 text-base font-semibold text-slate-950 dark:text-white">
                  {thread.title}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{thread.detail}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewRun((current) => !current)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${previewRun ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600' : 'bg-slate-950 text-white hover:bg-sky-600 dark:bg-white dark:text-slate-950 dark:hover:bg-sky-200'}`}
              >
                {previewRun ? messages.agent.previewRunningStop : messages.agent.previewWorkflow}
              </button>
            </div>
            <div className="border-b border-slate-200 px-5 pt-3 dark:border-white/10">
              <div className="flex gap-5 text-xs font-semibold">
                {(['overview', 'run', 'contract'] as Panel[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPanel(item)}
                    aria-pressed={panel === item}
                    className={`border-b-2 pb-3 capitalize transition ${panel === item ? 'border-sky-500 text-sky-700 dark:text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    {item === 'run' ? messages.agent.runLog : item}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {panel === 'overview' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className="grid h-6 w-6 place-items-center rounded-lg bg-sky-100 text-[9px] font-bold text-sky-700 dark:bg-sky-400/15 dark:text-sky-300">
                        YOU
                      </span>
                      {messages.agent.taskBrief}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">
                      {thread.objective}
                    </p>
                  </div>
                  <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-5 dark:border-sky-400/20 dark:bg-sky-400/[0.06]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-sky-700 dark:text-sky-300">
                        {messages.agent.agentResponse} · {thread.status}
                      </p>
                      {previewRun && (
                        <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-300">
                          ● {messages.agent.livePreview}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">
                      {thread.response}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {thread.files.map((file) => (
                        <span
                          key={file}
                          className="rounded-md bg-white/80 px-2 py-1 font-mono text-[10px] text-sky-700 dark:bg-white/10 dark:text-sky-300"
                        >
                          {file}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-black/15">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">
                        {messages.agent.liveActivity}
                      </p>
                      <span className="font-mono text-[10px] text-slate-400">now</span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {[
                        ['01', 'Context', 'workspace loaded'],
                        ['02', 'Action', previewRun ? 'preview running' : 'awaiting command'],
                        ['03', 'Proof', 'build + review'],
                      ].map(([step, label, detail]) => (
                        <div
                          key={label}
                          className="rounded-lg bg-slate-50 p-3 dark:bg-white/[0.04]"
                        >
                          <span className="font-mono text-[10px] text-sky-600 dark:text-sky-300">
                            {step}
                          </span>
                          <p className="mt-2 text-xs font-semibold text-slate-900 dark:text-white">
                            {label}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            {detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {panel === 'run' && (
                <div className="space-y-5">
                  <div className="rounded-xl bg-[#0b1119] p-5 font-mono text-xs text-slate-300 shadow-inner dark:border dark:border-white/10">
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <span className="text-[10px] font-bold tracking-[0.16em] text-slate-500 uppercase">
                        execution trace
                      </span>
                      <span className={previewRun ? 'text-emerald-300' : 'text-slate-500'}>
                        {previewRun ? 'running' : 'paused'}
                      </span>
                    </div>
                    <div className="mt-5 space-y-5">
                      {thread.steps.map((step, index) => (
                        <div key={step.label} className="flex gap-3">
                          <span
                            className={
                              step.state === 'done'
                                ? 'text-emerald-400'
                                : step.state === 'now'
                                  ? 'text-sky-300'
                                  : 'text-slate-600'
                            }
                          >
                            {step.state === 'done' ? '✓' : step.state === 'now' ? '›' : '·'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap justify-between gap-2">
                              <p
                                className={
                                  step.state === 'next' ? 'text-slate-500' : 'text-slate-100'
                                }
                              >
                                {step.label}
                              </p>
                              <span className="text-[10px] text-slate-600">
                                0{index + 1} / {step.state}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500">
                              {step.state === 'done'
                                ? 'Evidence captured in the thread.'
                                : step.state === 'now'
                                  ? 'Current focus — changes remain isolated.'
                                  : 'Human review required before completion.'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ['Scope', 'local workspace only', 'text-emerald-500'],
                      ['Approval', 'human before side effect', 'text-amber-500'],
                      ['Evidence', 'diff + build + browser', 'text-sky-500'],
                      ['Handoff', 'summary with open choices', 'text-violet-500'],
                    ].map(([label, value, tone]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 dark:border-white/10"
                      >
                        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                        <span className={`text-right text-xs font-semibold ${tone}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {panel === 'contract' && (
                <div className="space-y-5">
                  <div>
                    <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">
                      {messages.agent.workingContract}
                    </p>
                    <h4 className="mt-3 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                      {messages.agent.usefulInspectable}
                    </h4>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                      The model can own the middle of the task. The boundary stays visible so you
                      can interrupt, redirect, or approve without reconstructing what happened.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ['Context', 'Read the relevant files and local rules before editing.'],
                      ['Constraints', 'Keep scope narrow and call out unsafe or external actions.'],
                      ['Proof', 'Run the checks that make the result believable.'],
                      ['Handoff', 'Summarize changes, evidence, and decisions still open.'],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                      >
                        <p className="font-mono text-[10px] font-bold tracking-[0.14em] text-sky-600 uppercase dark:text-sky-300">
                          {label}
                        </p>
                        <p className="mt-2 text-sm leading-5 text-slate-600 dark:text-slate-300">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>

          <aside className="border-t border-slate-200 bg-slate-50/60 p-5 xl:border-t-0 dark:border-white/10 dark:bg-[#0d1118]">
            <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">
              {messages.agent.inspector}
            </p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-black/20">
              <p className="text-xs font-semibold text-slate-950 dark:text-white">
                {messages.agent.currentContract}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {thread.objective}
              </p>
            </div>
            <dl className="mt-5 space-y-4 text-xs">
              <div>
                <dt className="text-slate-400">state</dt>
                <dd className="mt-1 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <i className={`h-1.5 w-1.5 rounded-full ${thread.tone}`} />
                  {thread.status}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">workspace</dt>
                <dd className="mt-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  ~/code/alohayo.blog
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">proof target</dt>
                <dd className="mt-1 font-semibold text-sky-700 dark:text-sky-300">
                  build + browser
                </dd>
              </div>
            </dl>
            <div className="mt-7 border-t border-slate-200 pt-5 dark:border-white/10">
              <p className="font-mono text-[10px] font-bold tracking-[0.14em] text-slate-400 uppercase">
                {messages.agent.handoffChecklist}
              </p>
              <div className="mt-3 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                {[
                  'Changed surface named',
                  'Proof attached',
                  'Open choice called out',
                  'No surprise side effect',
                ].map((item, index) => (
                  <p key={item} className="flex items-center gap-2">
                    <span className={index < 2 ? 'text-emerald-500' : 'text-slate-400'}>
                      {index < 2 ? '✓' : '○'}
                    </span>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="grid min-h-[690px] bg-[#080d14] font-mono text-[13px] leading-6 text-slate-300 lg:grid-cols-[minmax(0,1fr)_235px]">
          <div className="min-w-0 p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(terminalViews) as Terminal[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => selectTerminal(item)}
                    aria-pressed={terminal === item}
                    className={`rounded-lg border px-3 py-1.5 text-[11px] transition ${terminal === item ? 'border-white/25 bg-white/10 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    {terminalViews[item].label}
                  </button>
                ))}
              </div>
              <span className="flex items-center gap-2 text-[10px] text-emerald-300">
                <i className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {messages.agent.ready}
              </span>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[11px]">
              <p>
                <span className={terminalView.accent}>{terminalView.prompt}</span>{' '}
                <span className="text-slate-600">$</span> {terminalView.command}
              </p>
              <span className="text-slate-500">model: {terminalView.model}</span>
            </div>
            <div className="mt-5 min-h-[390px] space-y-4 border-l border-white/10 pl-4 sm:pl-6">
              {transcripts[terminal].map((line, index) => (
                <p
                  key={`${line.text}-${index}`}
                  className={
                    line.kind === 'command'
                      ? 'text-slate-100'
                      : line.kind === 'assistant'
                        ? terminalView.accent
                        : 'text-slate-500'
                  }
                >
                  <span className="mr-3 text-slate-600">
                    {line.kind === 'command' ? '›' : line.kind === 'assistant' ? '↳' : '·'}
                  </span>
                  {line.text}
                </p>
              ))}
            </div>
            <form
              onSubmit={submitCommand}
              className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5"
            >
              <label htmlFor="agent-command" className={`${terminalView.accent} shrink-0`}>
                {terminalView.prompt} $
              </label>
              <input
                id="agent-command"
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                placeholder={messages.agent.placeholder}
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-slate-100 placeholder:text-slate-600 focus:ring-0"
                autoComplete="off"
              />
              <button
                type="submit"
                className="rounded-md bg-white/10 px-2 py-1 text-[10px] text-slate-300 transition hover:bg-sky-400/20 hover:text-sky-200"
              >
                {messages.agent.run}
              </button>
            </form>
          </div>
          <aside className="border-t border-white/10 bg-white/[0.025] p-5 lg:border-t-0 lg:border-l">
            <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-slate-500 uppercase">
              {messages.agent.commandPalette}
            </p>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              Small commands make the work visible without hiding behind a fake full terminal.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 lg:flex-col">
              {quickCommands.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => runQuickCommand(item)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-left text-xs text-slate-300 transition hover:border-sky-300/40 hover:bg-sky-300/10 hover:text-white"
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="mt-7 rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-slate-400">
              <p className={terminalView.accent}>{terminalView.label}</p>
              <p className="mt-2 leading-5">{terminalView.note}</p>
            </div>
            <p className="mt-7 text-[10px] leading-5 text-slate-600">
              This is an interface study, not a connection to Codex or Claude. The command input
              only updates this page.
            </p>
          </aside>
        </div>
      )}
    </section>
  )
}
