'use client'

import { useState } from 'react'

type Surface = 'app' | 'cli'
type Terminal = 'codex' | 'opencode' | 'openclaw'

const threads = [
  {
    title: 'Refresh the Agent page',
    state: 'Review ready',
    tone: 'bg-emerald-400',
    detail: '2 files · build passed',
    goal: 'Update the Agent page with current knowledge and a richer interactive story.',
    answer:
      'The page is now a working model of the collaboration: a concrete project view, task states, and a terminal switcher.',
    steps: [
      'Read current page + conventions',
      'Research primary sources',
      'Implement the interaction model',
      'Build and inspect the diff',
    ],
    changed: ['app/agent/page.tsx', 'components/AgentTerminal.tsx'],
    status: 'Ready for your review',
  },
  {
    title: 'Trace the deploy regression',
    state: 'Investigating',
    tone: 'bg-amber-400',
    detail: 'logs + last deploy · 4m',
    goal: 'Find why the production deploy slowed down without changing user-visible behavior.',
    answer:
      'I am correlating the deployment log with the last two commits before proposing a fix. No production action has been taken.',
    steps: [
      'Capture the failing deployment',
      'Compare changed dependencies',
      'Reproduce locally',
      'Propose the narrowest fix',
    ],
    changed: ['read-only investigation'],
    status: 'Waiting on evidence',
  },
  {
    title: 'Extract release notes',
    state: 'Working',
    tone: 'bg-sky-400',
    detail: 'git history + docs · 2m',
    goal: 'Turn the shipped changes into a short, human release note.',
    answer:
      'I am grouping commits by user outcome, leaving out internal churn, and linking any upgrade notes that need action.',
    steps: [
      'Read merged commits',
      'Group by user outcome',
      'Draft the release note',
      'Check claims against diffs',
    ],
    changed: ['notes/release-draft.md'],
    status: 'Drafting the summary',
  },
  {
    title: 'Review the API boundary',
    state: 'Queued',
    tone: 'bg-slate-400',
    detail: 'security pass · queued',
    goal: 'Map the request path and spot unsafe trust boundaries before a feature expands it.',
    answer:
      'This thread is queued behind the current work. It will begin as an audit, not a rewrite.',
    steps: [
      'Map entry points',
      'List trust transitions',
      'Validate findings',
      'Recommend scoped hardening',
    ],
    changed: ['no files yet'],
    status: 'Queued with bounded scope',
  },
  {
    title: 'Prototype the reading mode',
    state: 'Needs direction',
    tone: 'bg-violet-400',
    detail: 'design decision · paused',
    goal: 'Explore a calmer reading experience for long technical posts.',
    answer:
      'There are two valid visual directions. I stopped before inventing product taste and left a concise decision request.',
    steps: [
      'Inspect existing typography',
      'Sketch two directions',
      'Ask for a preference',
      'Implement the chosen route',
    ],
    changed: ['research only'],
    status: 'Needs a human choice',
  },
]

const terminalViews = {
  codex: {
    label: 'Codex CLI',
    command: 'codex',
    accent: 'text-sky-400',
    prompt: 'alohayo:~/code/alohayo.blog$',
    lines: [
      ['›', 'Inspect the architecture before proposing a change.'],
      ['↳', 'Found app/agent/page.tsx and one focused interactive surface.'],
      ['›', 'Make the agent story current, personal, and verifiable.'],
      ['↳', 'I’ll update the page, run the build, and leave the judgment call visible.'],
    ],
    note: 'A tight loop for one repo, one task, and evidence on demand.',
  },
  opencode: {
    label: 'OpenCode TUI',
    command: 'opencode --skill alohayo',
    accent: 'text-orange-300',
    prompt: 'AlohaYo@blog ~/agent',
    lines: [
      ['❯', 'Read the page, then propose a stronger structure.'],
      [
        '⌬',
        'I found a static terminal demo. I’ll keep the character and make its task state useful.',
      ],
      ['❯', 'Show the app workflow too.'],
      ['⌬', 'Done: project threads above, direct terminal craft below.'],
    ],
    note: 'A dense, keyboard-first conversation when you want the work close to the code.',
  },
  openclaw: {
    label: 'OpenClaw',
    command: 'openclaw',
    accent: 'text-amber-300',
    prompt: 'openclaw ~/code/alohayo.blog',
    lines: [
      ['→', 'What should I verify before you call this complete?'],
      [
        '⚡',
        'The route renders, the interactions switch state, and the production build is green.',
      ],
      ['→', 'What is still my call?'],
      ['⚡', 'Whether the story feels like you. I can show options; taste remains yours.'],
    ],
    note: 'A conversational, visible handoff: the agent reports what it did and where judgment remains.',
  },
}

export default function AgentTerminal() {
  const [surface, setSurface] = useState<Surface>('app')
  const [selectedThread, setSelectedThread] = useState(0)
  const [terminal, setTerminal] = useState<Terminal>('codex')
  const thread = threads[selectedThread]
  const activeTerminal = terminalViews[terminal]

  return (
    <section className="not-prose relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-[#f7f7f5] p-2 shadow-[0_30px_90px_-42px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-[#111315]">
      <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.13),transparent_68%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_68%)]" />

      <div className="relative overflow-hidden rounded-[1.55rem] border border-white/80 bg-white/90 dark:border-white/10 dark:bg-[#17191c]">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-black text-white shadow-lg shadow-sky-500/25">
              C
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                Agent control room
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                threads for altitude · terminals for flow
              </p>
            </div>
          </div>
          <div className="inline-flex w-fit rounded-xl bg-slate-100 p-1 text-xs font-semibold dark:bg-white/5">
            {(['app', 'cli'] as Surface[]).map((item) => (
              <button
                key={item}
                onClick={() => setSurface(item)}
                className={`rounded-lg px-3 py-2 transition ${surface === item ? 'bg-white text-slate-950 shadow-sm dark:bg-white/15 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                aria-pressed={surface === item}
              >
                {item === 'app' ? 'Codex desktop app' : 'Terminal rooms'}
              </button>
            ))}
          </div>
        </div>

        {surface === 'app' ? (
          <div className="grid min-h-[510px] md:grid-cols-[225px_1fr]">
            <aside className="border-b border-slate-200 bg-slate-50 p-3 md:border-r md:border-b-0 dark:border-white/10 dark:bg-[#121416]">
              <div className="mb-5 flex items-center justify-between px-2 text-[11px] font-bold tracking-[0.16em] text-slate-400 uppercase">
                <span>Project</span>
                <span className="text-sky-500">+</span>
              </div>
              <div className="mb-5 rounded-xl bg-slate-900 px-3 py-3 text-xs text-slate-300 shadow-lg dark:bg-black/35">
                <p className="font-semibold text-white">alohayo.blog</p>
                <p className="mt-1 font-mono text-[10px] text-slate-500">main · local workspace</p>
              </div>
              <p className="mb-2 px-2 text-[11px] font-bold tracking-[0.16em] text-slate-400 uppercase">
                Threads · {threads.length}
              </p>
              <div className="max-h-[340px] space-y-1 overflow-y-auto pr-1">
                {threads.map((item, index) => (
                  <button
                    key={item.title}
                    onClick={() => setSelectedThread(index)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left transition ${selectedThread === index ? 'bg-sky-100 text-slate-950 shadow-sm dark:bg-sky-400/15 dark:text-white' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'}`}
                    aria-pressed={selectedThread === index}
                  >
                    <span className="block truncate text-xs font-medium">{item.title}</span>
                    <span className="mt-1 flex items-center gap-1.5 text-[10px] opacity-70">
                      <i className={`h-1.5 w-1.5 rounded-full ${item.tone}`} />
                      {item.state}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="flex min-w-0 flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-white/10">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                    {thread.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {thread.detail}
                  </p>
                </div>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
                  LOCAL · SANDBOXED
                </span>
              </div>
              <div className="grid flex-1 gap-5 p-5 lg:grid-cols-[1fr_205px]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-black/15">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className="grid h-6 w-6 place-items-center rounded-lg bg-sky-100 text-[10px] font-bold text-sky-600 dark:bg-sky-400/15 dark:text-sky-300">
                        YOU
                      </span>
                      Goal + constraints
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">
                      {thread.goal}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-sky-200/80 bg-sky-50/70 p-4 dark:border-sky-400/20 dark:bg-sky-400/5">
                    <div className="flex items-center gap-2 text-xs font-medium text-sky-700 dark:text-sky-300">
                      <span className="grid h-6 w-6 place-items-center rounded-lg bg-sky-500 text-[10px] font-bold text-white">
                        CX
                      </span>
                      {thread.status}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">
                      {thread.answer}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {thread.changed.map((file) => (
                        <span
                          key={file}
                          className="rounded-md bg-white/70 px-2 py-1 font-mono text-[10px] text-sky-700 dark:bg-white/10 dark:text-sky-300"
                        >
                          {file}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['source grounded', 'bounded tools', 'reviewable diff', 'human approval'].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-500 dark:border-white/10 dark:text-slate-400"
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-950 p-4 font-mono text-[11px] text-slate-300 shadow-xl">
                  <p className="mb-4 text-[10px] font-bold tracking-[0.14em] text-slate-500 uppercase">
                    Run log
                  </p>
                  <div className="space-y-4">
                    {thread.steps.map((step, index) => (
                      <div key={step} className="flex gap-3">
                        <span className={index < 2 ? 'text-emerald-400' : 'text-sky-400'}>
                          {index < 2 ? '✓' : `0${index + 1}`}
                        </span>
                        <span className="leading-4">{step}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 border-t border-white/10 pt-3 text-amber-300">
                    Human: review the diff
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-[510px] bg-[#0c1014] px-5 py-6 font-mono text-[13px] leading-6 text-slate-300 sm:px-8 sm:py-9">
            <div className="mb-7 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(terminalViews) as Terminal[]).map((item) => (
                  <button
                    key={item}
                    onClick={() => setTerminal(item)}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] transition ${terminal === item ? 'border-white/25 bg-white/10 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    aria-pressed={terminal === item}
                  >
                    {terminalViews[item].label}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-emerald-400">● ready</span>
            </div>
            <p>
              <span className={activeTerminal.accent}>{activeTerminal.prompt}</span>{' '}
              <span className="text-slate-600">$</span> {activeTerminal.command}
            </p>
            <p className="mt-2 text-slate-500">
              Choose a surface; keep the contract: goal, visible work, verification, handoff.
            </p>
            <div className="mt-7 space-y-5 border-l border-white/10 pl-4 sm:pl-6">
              {activeTerminal.lines.map(([mark, copy], index) => (
                <p key={index} className={index % 2 === 0 ? 'text-slate-100' : 'text-slate-400'}>
                  <span
                    className={
                      index % 2 === 0 ? `mr-3 ${activeTerminal.accent}` : 'mr-3 text-emerald-400'
                    }
                  >
                    {mark}
                  </span>
                  {copy}
                </p>
              ))}
            </div>
            <div className="mt-9 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-400">
              <p className={activeTerminal.accent}>{activeTerminal.label}</p>
              <p className="mt-2 leading-5">{activeTerminal.note}</p>
            </div>
            <p className="mt-7">
              <span className={activeTerminal.accent}>{activeTerminal.prompt}</span>{' '}
              <span className="text-slate-600">$</span>{' '}
              <span className="animate-pulse text-slate-300">▋</span>
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
