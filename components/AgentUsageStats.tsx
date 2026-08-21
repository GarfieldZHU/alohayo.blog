'use client'

/* The Tokscale endpoint is a live SVG, so it cannot use Next's image optimizer. */
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import { useLocale } from './LocaleProvider'

const embedUrls = {
  '3d': 'https://tokscale.ai/api/embed/GarfieldZHU/svg?view=3d',
  '2d': 'https://tokscale.ai/api/embed/GarfieldZHU/svg?template=graph&color=YlGnBu&rank=percent&tokens=full&cost=full',
} as const
const graphViews = ['3d', '2d'] as const
type GraphView = (typeof graphViews)[number]
const profileUrl = 'https://tokscale.ai/u/GarfieldZHU'

export default function AgentUsageStats() {
  const { messages } = useLocale()
  const [version, setVersion] = useState(0)
  const [graphView, setGraphView] = useState<GraphView>('3d')

  return (
    <section className="not-prose mt-10 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_24px_75px_-52px_rgba(17,24,39,0.7)] dark:border-gray-700 dark:bg-[#17191c]">
      <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:p-7">
        <a
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          className="group block overflow-hidden rounded-xl border border-gray-200 bg-[#f7faf9] p-3 transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-lg dark:border-white/10 dark:bg-black/20"
          aria-label={`${messages.agent.openTokscale}: GarfieldZHU token statistics`}
        >
          <img
            key={`${graphView}-${version}`}
            src={`${embedUrls[graphView]}&v=${version}`}
            alt={`GarfieldZHU token statistics: ${graphView.toUpperCase()} graph, percentile rank, total tokens, and cost`}
            className="h-auto w-full transition duration-300 group-hover:scale-[1.01]"
          />
        </a>
        <aside className="flex flex-col rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-black/20">
          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-gray-400 uppercase">
              {messages.agent.graphControls}
            </p>
            <div className="mt-4 space-y-2">
              <div
                className="grid grid-cols-2 rounded-lg border border-gray-300 bg-white p-1 dark:border-white/15 dark:bg-white/5"
                role="group"
                aria-label="Graph view"
              >
                {graphViews.map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setGraphView(view)}
                    aria-label={`Show ${view.toUpperCase()} graph`}
                    aria-pressed={graphView === view}
                    className={`rounded-md px-2 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${graphView === view ? 'bg-gray-900 text-white shadow-sm dark:bg-white dark:text-gray-950' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                  >
                    {view.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setVersion((current) => current + 1)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-white/15 dark:bg-white/5 dark:text-gray-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
              >
                {messages.agent.refreshSignal}
              </button>
              <a
                href={profileUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-lg bg-gray-900 px-3 py-2 text-center text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:bg-white dark:text-gray-950 dark:hover:bg-emerald-200"
              >
                {messages.agent.openTokscale} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-200 pt-5 dark:border-white/10">
            <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-gray-400 uppercase">
              {messages.agent.readingIt}
            </p>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">{messages.agent.visible}</dt>
                <dd className="mt-1 font-semibold text-gray-900 dark:text-white">
                  Tokens, cost &amp; percentile
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">{messages.agent.source}</dt>
                <dd className="mt-1 font-semibold text-gray-900 dark:text-white">
                  Tokscale public embed
                </dd>
              </div>
              <div className="border-t border-gray-200 pt-4 text-xs leading-5 text-gray-500 dark:border-white/10 dark:text-gray-400">
                Tap the graph for the full, current breakdown. The signal refreshes without leaving
                this page.
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </section>
  )
}
