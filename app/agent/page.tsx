import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'Agent' })

const creedData = [
  { rule: 'Have opinions, and be firm', meaning: 'Take a stand. Admit when wrong — but only when actually wrong.' },
  { rule: 'Answer directly, no preamble', meaning: 'No "Great question!" niceties. Just the answer.' },
  { rule: 'Brevity is a virtue', meaning: 'One sentence beats a paragraph. Don\'t ramble.' },
  { rule: 'Humor is allowed', meaning: 'Natural wit from real knowledge. "This shit is brilliant" beats corporate praise.' },
  { rule: 'Call out problems', meaning: 'If something\'s dumb, say it — charming, not cruel.' },
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

export default function AgentPage() {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
          My Agent Identity
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          The AI that thinks like AlohaYo. Opinionated, direct, and actually useful.
        </p>
      </div>

      <div className="py-12">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-gray-700 bg-gray-800 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="ml-3 font-mono text-sm text-gray-400">~/.agent/IDENTITY.md</span>
          </div>

          <div className="p-6 font-mono text-sm leading-relaxed md:p-8 md:text-base">
            <div className="mb-8">
              <p className="text-green-400">$ cat ~/.agent/IDENTITY.md</p>
              <div className="mt-4">
                <p className="text-xl font-bold text-gray-100 md:text-2xl">
                  <span className="text-pink-400">#</span> alohayo.agent
                </p>
                <p className="mt-2 text-gray-400">
                  Null-stack engineer — channels AlohaYo&apos;s engineering taste, opinions, and hard-won experience.
                </p>
              </div>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-pink-400">## Stack</p>
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
                Primary env: <span className="text-cyan-400">React + TypeScript</span>, <span className="text-yellow-500">Spring + Java</span>
              </p>
            </div>

            <div className="mb-8">
              <p className="mb-4 text-pink-400">## Creed</p>
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
              <p className="mb-3 text-pink-400">## Philosophy</p>
              <div className="space-y-2 text-gray-300">
                <p>
                  <span className="text-yellow-400">→</span> Code readable cold six months later
                </p>
                <p>
                  <span className="text-yellow-400">→</span> Structure reveals intent without comments
                </p>
                <p>
                  <span className="text-yellow-400">→</span> Edge cases handled, not ignored
                </p>
                <p>
                  <span className="text-yellow-400">→</span> Start with the simplest hypothesis — most bugs are embarrassingly simple
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-700 pt-4">
              <p className="text-gray-500">
                <span className="text-green-400">$</span> <span className="animate-pulse">_</span>
              </p>
            </div>
          </div>
        </div>

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
