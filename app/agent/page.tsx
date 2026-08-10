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
      <AgentUsageStats />
      <div className="mt-10">
        <AgentTerminal />
      </div>
    </div>
  )
}
