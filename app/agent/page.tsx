import { genPageMetadata } from 'app/seo'
import AgentTerminal from '@/components/AgentTerminal'
import AgentUsageStats from '@/components/AgentUsageStats'

export const metadata = genPageMetadata({
  title: 'Agent',
  description: 'A working field note on how AlohaYo collaborates with coding agents.',
})

export default function AgentPage() {
  return (
    <div className="pb-20">
      <section className="relative overflow-hidden pt-12 pb-10 sm:pt-16 sm:pb-14">
        <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-sky-300/10 blur-3xl dark:bg-sky-400/10" />
        <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-sky-600 uppercase dark:text-sky-300">
              /agent · working notes · session 014
            </p>
            <h1 className="mt-4 text-5xl leading-[0.95] font-extrabold tracking-[-0.06em] text-gray-950 sm:text-7xl dark:text-gray-50">
              Agents,
              <br />
              with receipts.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              A living field guide to using Codex-style workspaces and Claude Code-style terminals
              without losing the context, proof, or human judgment that makes the work trustworthy.
            </p>
          </div>
          <aside className="w-full max-w-xs rounded-2xl border border-gray-200 bg-white/75 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.16em] text-gray-400 uppercase">
              <span>session status</span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-300">
                <i className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> online
              </span>
            </div>
            <p className="mt-3 font-mono text-sm text-gray-900 dark:text-gray-100">
              ~/code/alohayo.blog
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-gray-100 px-3 py-2 dark:bg-white/[0.05]">
                <p className="text-gray-400">threads</p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">05 open</p>
              </div>
              <div className="rounded-lg bg-gray-100 px-3 py-2 dark:bg-white/[0.05]">
                <p className="text-gray-400">mode</p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">reviewable</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <AgentTerminal />

      <section className="mt-14 sm:mt-16">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-sky-600 uppercase dark:text-sky-300">
            the operating model
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-gray-950 sm:text-4xl dark:text-white">
            Delegate the middle. Keep the edges human.
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
            The interface is a reminder of the loop I want from an agent: understand the request, do
            the bounded work, show evidence, and stop where a decision belongs to me.
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [
              '01',
              'Context',
              'Read the relevant files, rules, and current state before making a plan.',
            ],
            [
              '02',
              'Action',
              'Make the smallest useful change inside a named workspace and task boundary.',
            ],
            [
              '03',
              'Proof',
              'Build, test, inspect, or browse until the result has evidence behind it.',
            ],
            [
              '04',
              'Handoff',
              'Explain what changed, what remains uncertain, and what choice is still mine.',
            ],
          ].map(([index, title, copy]) => (
            <article
              key={title}
              className="rounded-2xl border border-gray-200 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.035]"
            >
              <span className="font-mono text-[10px] font-bold tracking-[0.14em] text-sky-600 dark:text-sky-300">
                {index}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-gray-950 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <AgentUsageStats />
    </div>
  )
}
