import Link from 'next/link'
import { genPageMetadata } from 'app/seo'
import AgentTerminal from '@/components/AgentTerminal'

export const metadata = genPageMetadata({
  title: 'Agent',
  description:
    'How AlohaYo uses modern coding agents: clear context, bounded autonomy, and accountable verification.',
})

const principles = [
  [
    '01',
    'Start with the smallest useful shape',
    'A prompt is often enough. Add a workflow only when the job truly needs loops, branching, or another pair of hands.',
  ],
  [
    '02',
    'Context is a product surface',
    'Good agents are grounded in the repo, the task, the conventions, and the definition of done—not a giant system prompt.',
  ],
  [
    '03',
    'Autonomy earns its radius',
    'Let the agent read, reason, and make reversible changes. Put explicit approval gates around network, credentials, and irreversible actions.',
  ],
  [
    '04',
    'Verification is part of the answer',
    'A plausible diff is not a result. Run the checks, inspect the change, and say plainly what was verified and what remains judgment.',
  ],
]

const habits = [
  [
    'Be specific about outcomes',
    'Ask for the user-visible result, constraints, and proof—not merely a file edit.',
  ],
  [
    'Explore before committing',
    'Use agents to map an unfamiliar codebase and compare paths before locking into one.',
  ],
  [
    'Delegate bounded work',
    'Parallelize independent investigations or small implementations; keep one owner for integration.',
  ],
  [
    'Keep taste human',
    'The agent can produce options and do the labor. The call on product quality, trade-offs, and “is this us?” stays mine.',
  ],
]

export default function AgentPage() {
  return (
    <div className="pb-16">
      <section className="relative overflow-hidden pt-14 pb-16 sm:pt-20 sm:pb-20">
        <div className="pointer-events-none absolute -top-28 right-[-18rem] h-[36rem] w-[36rem] rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-400/10" />
        <div className="relative max-w-4xl">
          <p className="mb-5 font-mono text-xs font-bold tracking-[0.22em] text-sky-600 uppercase dark:text-sky-400">
            Field notes · 2026
          </p>
          <h1 className="max-w-4xl text-4xl leading-[1.04] font-black tracking-[-0.055em] text-slate-950 sm:text-6xl md:text-7xl dark:text-white">
            The agent is not the product.{' '}
            <span className="text-sky-600 dark:text-sky-400">The collaboration is.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">
            I use coding agents as energetic teammates: they explore, build, test, and surface
            trade-offs. I provide context, taste, boundaries, and the final yes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 font-mono text-xs">
            {['context over clever prompts', 'permissions by design', 'verify before victory'].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-300 bg-white/60 px-3 py-2 text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      <AgentTerminal />

      <section className="grid gap-12 border-b border-slate-200 py-18 lg:grid-cols-[0.82fr_1.18fr] dark:border-white/10">
        <div>
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-sky-600 uppercase dark:text-sky-400">
            The operating model
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            Modern agents need a job description.
          </h2>
          <p className="mt-5 max-w-md leading-7 text-slate-600 dark:text-slate-300">
            The useful shift is not “more autonomy at all costs.” It is structured agency: clear
            context, tools with a narrow purpose, observable work, and authority that expands only
            when it is earned.
          </p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 dark:border-white/10 dark:bg-white/10">
          {principles.map(([number, title, detail]) => (
            <article key={number} className="bg-white p-6 dark:bg-[#111315]">
              <p className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">{number}</p>
              <h3 className="mt-8 text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-12 py-18 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-sky-600 uppercase dark:text-sky-400">
            My Codex habits, compressed
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            Fast loops. Firm opinions. Receipts.
          </h2>
          <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200 dark:divide-white/10 dark:border-white/10">
            {habits.map(([title, detail], index) => (
              <div key={title} className="grid grid-cols-[2rem_1fr] gap-3 py-5">
                <span className="font-mono text-xs text-sky-600 dark:text-sky-400">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-950 dark:text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <aside className="self-start rounded-3xl bg-slate-950 p-7 text-slate-300 shadow-2xl sm:p-9">
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-sky-300 uppercase">
            A practical split
          </p>
          <div className="mt-8 space-y-7">
            <div>
              <p className="text-lg font-semibold text-white">Terminal CLI</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                My close-range tool: one repo, one task, a dense feedback loop. Perfect for
                debugging, refactors, and asking “show me the evidence.”
              </p>
            </div>
            <div className="h-px bg-white/10" />
            <div>
              <p className="text-lg font-semibold text-white">Codex desktop app</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                The command center: threads, projects, worktrees, diffs, skills, and several agents
                moving independently without becoming a coordination mess.
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-8 sm:px-9 dark:border-white/10 dark:bg-white/[0.03]">
        <p className="font-mono text-xs font-bold tracking-[0.2em] text-sky-600 uppercase dark:text-sky-400">
          Further reading
        </p>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600 dark:text-slate-300">
          This page is informed by current primary guidance on agent architecture, controllable
          tools, and Codex&apos;s evolving app-and-CLI workflow. Technology changes quickly; the
          durable practice is to make the work inspectable.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-sky-700 dark:text-sky-300">
          <Link
            href="https://openai.com/index/introducing-the-codex-app/"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            Introducing the Codex app ↗
          </Link>
          <Link
            href="https://help.openai.com/en/articles/11096431"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            Codex CLI: getting started ↗
          </Link>
          <Link
            href="https://modelcontextprotocol.io/docs/learn/architecture"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            MCP architecture ↗
          </Link>
          <Link
            href="https://resources.anthropic.com/building-effective-ai-agents"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            Agent architecture patterns ↗
          </Link>
        </div>
      </section>
    </div>
  )
}
