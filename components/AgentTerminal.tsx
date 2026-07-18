'use client'

import { useState } from 'react'

type Surface = 'app' | 'cli'
type Panel = 'brief' | 'work' | 'note'
type Terminal = 'codex' | 'opencode' | 'openclaw'

const threads = [
  {
    title: 'Refresh the Agent page',
    state: 'Review ready',
    tone: 'bg-emerald-400',
    detail: '2 files · build passed',
    goal: 'Update this page with current agent knowledge and a richer, blog-native interactive story.',
    answer:
      'The page is now a working model of the collaboration: a project view, task states, and terminal rooms that describe the work instead of merely decorating it.',
    files: ['app/agent/page.tsx', 'components/AgentTerminal.tsx'],
    steps: [
      'Read the existing page + local conventions',
      'Research primary sources',
      'Build the interaction model',
      'Run the build and inspect the diff',
    ],
  },
  {
    title: 'Trace the deploy regression',
    state: 'Investigating',
    tone: 'bg-amber-400',
    detail: 'logs + last deploy · 4m',
    goal: 'Find why the production deploy slowed down without changing visible behavior.',
    answer:
      'I am correlating deployment logs with the last two commits before proposing a fix. No production action has been taken.',
    files: ['read-only investigation'],
    steps: [
      'Capture the failing deployment',
      'Compare changed dependencies',
      'Reproduce locally',
      'Propose the narrowest fix',
    ],
  },
  {
    title: 'Extract release notes',
    state: 'Working',
    tone: 'bg-sky-400',
    detail: 'git history + docs · 2m',
    goal: 'Turn the shipped changes into a short, human release note.',
    answer: 'I am grouping commits by user outcome and leaving out internal churn.',
    files: ['notes/release-draft.md'],
    steps: [
      'Read merged commits',
      'Group by user outcome',
      'Draft the release note',
      'Check claims against diffs',
    ],
  },
  {
    title: 'Review the API boundary',
    state: 'Queued',
    tone: 'bg-gray-400',
    detail: 'security pass · queued',
    goal: 'Map the request path and spot unsafe trust boundaries before a feature expands it.',
    answer:
      'This thread is queued behind the current work. It will begin as an audit, not a rewrite.',
    files: ['no files yet'],
    steps: [
      'Map entry points',
      'List trust transitions',
      'Validate findings',
      'Recommend scoped hardening',
    ],
  },
  {
    title: 'Prototype the reading mode',
    state: 'Needs direction',
    tone: 'bg-violet-400',
    detail: 'design decision · paused',
    goal: 'Explore a calmer reading experience for long technical posts.',
    answer:
      'There are two valid directions. I stopped before inventing product taste and left a concise decision request.',
    files: ['research only'],
    steps: [
      'Inspect existing typography',
      'Sketch two directions',
      'Ask for a preference',
      'Implement the chosen route',
    ],
  },
]

const terminalViews = {
  codex: {
    label: 'Codex CLI',
    command: 'codex',
    accent: 'text-sky-400',
    prompt: 'alohayo:~/code/alohayo.blog',
    note: 'A tight loop for one repo, one task, and evidence on demand.',
    lines: [
      ['›', 'Inspect the architecture before proposing a change.'],
      ['↳', 'Found a focused page and one interactive surface.'],
      ['›', 'Make the agent story current, personal, and verifiable.'],
      ['↳', 'I’ll update the page, run the build, and leave the judgment call visible.'],
    ],
  },
  opencode: {
    label: 'OpenCode TUI',
    command: 'opencode --skill alohayo',
    accent: 'text-orange-300',
    prompt: 'AlohaYo@blog ~/agent',
    note: 'A dense, keyboard-first conversation when you want the work close to the code.',
    lines: [
      ['❯', 'Read the page, then propose a stronger structure.'],
      ['⌬', 'I found a static demo. I’ll keep the character and make its task state useful.'],
      ['❯', 'Show the app workflow too.'],
      ['⌬', 'Done: project threads above, direct terminal craft below.'],
    ],
  },
  openclaw: {
    label: 'OpenClaw',
    command: 'openclaw',
    accent: 'text-amber-300',
    prompt: 'openclaw ~/code/alohayo.blog',
    note: 'A conversational, visible handoff: what changed, what was checked, and what remains your call.',
    lines: [
      ['→', 'What should I verify before you call this complete?'],
      ['⚡', 'The route renders, interactions switch state, and the production build is green.'],
      ['→', 'What is still my call?'],
      ['⚡', 'Whether the story feels like you. I can show options; taste remains yours.'],
    ],
  },
}

const notes = [
  'The best agent work feels less like asking for code and more like handing a thoughtful teammate a well-shaped problem.',
  'A task is ready to delegate when the outcome, constraints, and proof are clear enough for someone else to own the middle.',
  'The useful status update is not “done.” It is what changed, what was checked, and where a human choice still matters.',
]

export default function AgentTerminal() {
  const [surface, setSurface] = useState<Surface>('app')
  const [panel, setPanel] = useState<Panel>('brief')
  const [selectedThread, setSelectedThread] = useState(0)
  const [terminal, setTerminal] = useState<Terminal>('codex')
  const thread = threads[selectedThread]
  const terminalView = terminalViews[terminal]

  return (
    <section className="not-prose mx-auto max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_24px_75px_-45px_rgba(17,24,39,0.65)] dark:border-gray-700 dark:bg-[#17191c]">
      <header className="flex flex-col gap-4 border-b border-gray-200 bg-gray-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700 dark:bg-[#121416]">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full border border-sky-200 bg-sky-50 font-mono text-sm font-bold text-sky-700 dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-sky-300">
            C
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-gray-900 dark:text-white">
              Agent control room
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              a working field note from the blog
            </p>
          </div>
        </div>
        <div className="inline-flex w-fit rounded-lg bg-gray-200/70 p-1 text-xs font-semibold dark:bg-white/5">
          {(['app', 'cli'] as Surface[]).map((item) => (
            <button
              key={item}
              onClick={() => setSurface(item)}
              className={`rounded-md px-3 py-2 transition ${surface === item ? 'bg-white text-gray-950 shadow-sm dark:bg-white/15 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
              aria-pressed={surface === item}
            >
              {item === 'app' ? 'Codex desktop app' : 'Terminal rooms'}
            </button>
          ))}
        </div>
      </header>

      {surface === 'app' ? (
        <div className="grid min-h-[540px] md:grid-cols-[225px_1fr]">
          <aside className="border-b border-gray-200 bg-gray-50/70 p-3 md:border-r md:border-b-0 dark:border-gray-700 dark:bg-[#121416]">
            <div className="mb-5 flex items-center justify-between px-2 font-mono text-[10px] font-bold tracking-[0.16em] text-gray-400 uppercase">
              <span>Project</span>
              <span className="text-sky-500">+</span>
            </div>
            <div className="mb-5 rounded-xl border border-gray-200 bg-white px-3 py-3 text-xs text-gray-500 dark:border-white/10 dark:bg-black/35">
              <p className="font-semibold text-gray-900 dark:text-white">alohayo.blog</p>
              <p className="mt-1 font-mono text-[10px] text-gray-400">main · local workspace</p>
            </div>
            <p className="mb-2 px-2 font-mono text-[10px] font-bold tracking-[0.16em] text-gray-400 uppercase">
              Threads · {threads.length}
            </p>
            <div className="max-h-[340px] space-y-1 overflow-y-auto pr-1">
              {threads.map((item, index) => (
                <button
                  key={item.title}
                  onClick={() => {
                    setSelectedThread(index)
                    setPanel('brief')
                  }}
                  className={`w-full rounded-xl px-3 py-2.5 text-left transition ${selectedThread === index ? 'bg-sky-100 text-gray-950 shadow-sm dark:bg-sky-400/15 dark:text-white' : 'text-gray-500 hover:bg-white dark:text-gray-400 dark:hover:bg-white/5'}`}
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
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-700">
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {thread.title}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{thread.detail}</p>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
                LOCAL · SANDBOXED
              </span>
            </div>
            <div className="border-b border-gray-200 px-5 pt-3 dark:border-gray-700">
              <div className="flex gap-4 text-xs font-semibold">
                {(['brief', 'work', 'note'] as Panel[]).map((item) => (
                  <button
                    key={item}
                    onClick={() => setPanel(item)}
                    className={`border-b-2 pb-3 transition ${panel === item ? 'border-sky-500 text-sky-700 dark:text-sky-300' : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    aria-pressed={panel === item}
                  >
                    {item === 'brief' ? 'Brief' : item === 'work' ? 'Run log' : 'Field note'}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-5">
              {panel === 'brief' && (
                <div className="grid gap-5 lg:grid-cols-[1fr_190px]">
                  <div className="space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-black/15">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <span className="grid h-6 w-6 place-items-center rounded-lg bg-sky-100 text-[10px] font-bold text-sky-600 dark:bg-sky-400/15 dark:text-sky-300">
                          YOU
                        </span>
                        Goal + constraints
                      </div>
                      <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-slate-200">
                        {thread.goal}
                      </p>
                    </div>
                    <div className="rounded-xl border border-sky-200/80 bg-sky-50/70 p-5 dark:border-sky-400/20 dark:bg-sky-400/5">
                      <p className="text-xs font-medium text-sky-700 dark:text-sky-300">
                        Codex · {thread.state}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-slate-200">
                        {thread.answer}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {thread.files.map((file) => (
                          <span
                            key={file}
                            className="rounded-md bg-white/70 px-2 py-1 font-mono text-[10px] text-sky-700 dark:bg-white/10 dark:text-sky-300"
                          >
                            {file}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <aside className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs leading-5 text-gray-600 dark:border-white/10 dark:bg-black/20 dark:text-gray-300">
                    <p className="font-mono text-[10px] font-bold tracking-[0.14em] text-gray-400 uppercase">
                      Guardrails
                    </p>
                    <p className="mt-4">• scoped workspace</p>
                    <p>• explicit approvals</p>
                    <p>• reviewable diff</p>
                    <p>• proof before handoff</p>
                  </aside>
                </div>
              )}
              {panel === 'work' && (
                <div className="rounded-xl bg-[#111315] p-5 font-mono text-xs text-slate-300">
                  <p className="mb-6 text-[10px] font-bold tracking-[0.14em] text-slate-500 uppercase">
                    Run log · {thread.state}
                  </p>
                  <div className="space-y-5">
                    {thread.steps.map((step, index) => (
                      <div key={step} className="flex gap-4">
                        <span className={index < 2 ? 'text-emerald-400' : 'text-sky-400'}>
                          {index < 2 ? '✓' : `0${index + 1}`}
                        </span>
                        <div>
                          <p>{step}</p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {index < 2
                              ? 'Evidence captured in the thread.'
                              : index === 2
                                ? 'In progress — changes remain isolated.'
                                : 'Human review required before completion.'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-8 border-t border-white/10 pt-4 text-amber-300">
                    Next handoff: {thread.state}
                  </p>
                </div>
              )}
              {panel === 'note' && (
                <article className="max-w-2xl">
                  <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-sky-600 uppercase dark:text-sky-400">
                    Field note · {String(selectedThread + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    The work should leave a readable trail.
                  </h3>
                  <div className="mt-6 space-y-5 text-[15px] leading-7 text-gray-600 dark:text-gray-300">
                    {notes.map((note, index) => (
                      <p
                        key={note}
                        className={
                          index === selectedThread % notes.length
                            ? 'font-medium text-gray-900 dark:text-white'
                            : ''
                        }
                      >
                        {note}
                      </p>
                    ))}
                  </div>
                  <blockquote className="mt-8 border-l-2 border-sky-500 pl-4 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    This thread is a sketch of how I want agent work to feel: useful, inspectable,
                    and still obviously mine.
                  </blockquote>
                </article>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-[540px] bg-[#0c1014] px-5 py-6 font-mono text-[13px] leading-6 text-slate-300 sm:px-8 sm:py-9">
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
            <span className={terminalView.accent}>{terminalView.prompt}</span>{' '}
            <span className="text-slate-600">$</span> {terminalView.command}
          </p>
          <p className="mt-2 text-slate-500">
            Choose a surface; keep the contract: goal, visible work, verification, handoff.
          </p>
          <div className="mt-7 space-y-5 border-l border-white/10 pl-4 sm:pl-6">
            {terminalView.lines.map(([mark, copy], index) => (
              <p key={index} className={index % 2 === 0 ? 'text-slate-100' : 'text-slate-400'}>
                <span
                  className={
                    index % 2 === 0 ? `mr-3 ${terminalView.accent}` : 'mr-3 text-emerald-400'
                  }
                >
                  {mark}
                </span>
                {copy}
              </p>
            ))}
          </div>
          <div className="mt-9 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-400">
            <p className={terminalView.accent}>{terminalView.label}</p>
            <p className="mt-2 leading-5">{terminalView.note}</p>
          </div>
          <p className="mt-7">
            <span className={terminalView.accent}>{terminalView.prompt}</span>{' '}
            <span className="text-slate-600">$</span>{' '}
            <span className="animate-pulse text-slate-300">▋</span>
          </p>
        </div>
      )}
    </section>
  )
}
