import { genPageMetadata } from 'app/seo'
import AgentTerminal from '@/components/AgentTerminal'

export const metadata = genPageMetadata({ title: 'Agent' })

export default function AgentPage() {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          AlohaYo Agent
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          The AI that thinks like AlohaYo. Opinionated, direct, and actually useful.
        </p>
      </div>

      <div className="py-12">
        <AgentTerminal />

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Built with{' '}
          <a
            href="https://github.com/opencode-ai/opencode"
            className="text-primary-500 hover:text-primary-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenCode
          </a>
          . Not a chatbot — a collaborator.
        </p>
      </div>
    </div>
  )
}
