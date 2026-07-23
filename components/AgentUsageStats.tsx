'use client'

/* The Tokscale endpoint is a live SVG, so it cannot use Next's image optimizer. */
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'

const embedUrl =
  'https://tokscale.ai/api/embed/GarfieldZHU/svg?template=graph&color=YlGnBu&rank=percent&tokens=full&cost=full'
const profileUrl = 'https://tokscale.ai/GarfieldZHU'

export default function AgentUsageStats() {
  const [version, setVersion] = useState(0)

  return (
    <section className="not-prose mt-10 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_24px_75px_-52px_rgba(17,24,39,0.7)] dark:border-gray-700 dark:bg-[#17191c]">
      <div className="flex flex-col gap-5 border-b border-gray-200 bg-gradient-to-r from-emerald-50 via-white to-sky-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700 dark:from-emerald-400/10 dark:via-[#17191c] dark:to-sky-400/10">
        <div>
          <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-emerald-700 uppercase dark:text-emerald-300">
            Live usage signal
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            The agent&apos;s token ledger
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-300">
            A public, continuously refreshed view of the tokens and cost behind the work.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setVersion((current) => current + 1)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-white/15 dark:bg-white/5 dark:text-gray-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
          >
            Refresh signal
          </button>
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:bg-white dark:text-gray-950 dark:hover:bg-emerald-200"
          >
            Open Tokscale <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_180px] lg:p-7">
        <a
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          className="group block overflow-hidden rounded-xl border border-gray-200 bg-[#f7faf9] p-3 transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-lg dark:border-white/10 dark:bg-black/20"
          aria-label="Open GarfieldZHU token statistics on Tokscale"
        >
          <img
            key={version}
            src={`${embedUrl}&v=${version}`}
            alt="GarfieldZHU token statistics: graph, percentile rank, total tokens, and cost"
            className="h-auto w-full transition duration-300 group-hover:scale-[1.01]"
          />
        </a>
        <aside className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-black/20">
          <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-gray-400 uppercase">
            Reading it
          </p>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-gray-500 dark:text-gray-400">What&apos;s visible</dt>
              <dd className="mt-1 font-semibold text-gray-900 dark:text-white">
                Tokens, cost &amp; percentile
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Source</dt>
              <dd className="mt-1 font-semibold text-gray-900 dark:text-white">
                Tokscale public embed
              </dd>
            </div>
            <div className="border-t border-gray-200 pt-4 text-xs leading-5 text-gray-500 dark:border-white/10 dark:text-gray-400">
              Tap the graph for the full, current breakdown. The signal refreshes without leaving
              this page.
            </div>
          </dl>
        </aside>
      </div>
    </section>
  )
}
