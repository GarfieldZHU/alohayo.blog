import { genPageMetadata } from 'app/seo'
import AgentTerminal from '@/components/AgentTerminal'
import AgentUsageStats from '@/components/AgentUsageStats'

export const metadata = genPageMetadata({
  title: 'Agent',
  description: 'A working field note on how AlohaYo collaborates with coding agents.',
})

export default function AgentPage() {
  return (
    <div className="pb-16">
      <section className="pt-12 pb-10 sm:pt-16 sm:pb-12">
        <p className="text-primary-500 font-mono text-xs font-bold tracking-[0.2em] uppercase">
          Field notes · 2026
        </p>
        <h1 className="mt-4 text-4xl leading-tight font-extrabold tracking-tight text-gray-900 sm:text-5xl dark:text-gray-100">
          AlohaYo Agent
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-500 dark:text-gray-400">
          A small, living record of how I use agents to read, build, test, and hand work back with
          the important parts still visible.
        </p>
      </section>

      <AgentTerminal />
      <AgentUsageStats />
    </div>
  )
}
