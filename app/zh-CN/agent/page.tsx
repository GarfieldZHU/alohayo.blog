import AgentTerminal from '@/components/AgentTerminal'
import AgentUsageStats from '@/components/AgentUsageStats'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: '智能体',
  description: 'AlohaYo 如何与编码智能体协作的一份现场笔记。',
})

export default function ChineseAgentPage() {
  return (
    <div className="pb-20">
      <AgentUsageStats />
      <div className="mt-10">
        <AgentTerminal />
      </div>
    </div>
  )
}
