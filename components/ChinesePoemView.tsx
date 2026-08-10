'use client'

import type { ChinesePoem } from '@/lib/poetry'
import { useLocale } from './LocaleProvider'

interface ChinesePoemViewProps {
  poem: ChinesePoem | null
  loading: boolean
  error: boolean
  onReroll: () => void
  goBack: () => void
}

export default function ChinesePoemView({
  poem,
  loading,
  error,
  onReroll,
  goBack,
}: ChinesePoemViewProps) {
  const { messages } = useLocale()

  return (
    <div className="space-y-4">
      <p className="text-gray-500">
        <span className="mr-2 text-blue-500 dark:text-[#5c9cf5]">❯</span>
        {messages.terminal.quotes}
      </p>

      <article className="poetry-paper relative overflow-hidden rounded-sm border px-6 py-8 shadow-xl sm:px-10">
        <div className="poetry-paper__edge pointer-events-none absolute inset-3 rounded-sm border" />
        <div className="relative">
          <div className="mb-8 flex items-center justify-between gap-4">
            <span className="poetry-paper__seal" aria-hidden="true">
              詩
            </span>
            <span className="poetry-paper__source">{messages.terminal.poemSource}</span>
          </div>

          {loading && (
            <div className="space-y-3 py-8 text-center" aria-live="polite">
              <div className="poetry-paper__loading-mark" aria-hidden="true">
                ◌
              </div>
              <p className="poetry-paper__body">{messages.terminal.poemLoading}</p>
            </div>
          )}

          {!loading && error && (
            <div className="space-y-3 py-8 text-center" role="alert">
              <p className="poetry-paper__body">{messages.terminal.poemError}</p>
              <button type="button" onClick={onReroll} className="poetry-paper__action">
                🎲 {messages.terminal.poemRetry}
              </button>
            </div>
          )}

          {!loading && !error && poem && (
            <div aria-live="polite">
              <h2 className="poetry-paper__title">{poem.title}</h2>
              <p className="poetry-paper__author">
                {poem.dynasty} · {poem.author}
                {poem.type ? ` · ${poem.type}` : ''}
              </p>
              <div className="poetry-paper__body mt-8 space-y-2 text-center">
                {poem.content.map((line, index) => (
                  <p key={`${line}-${index}`}>{line}</p>
                ))}
              </div>
              <a
                className="poetry-paper__link mt-8 inline-block"
                href="https://poetry.palemoky.com/"
                target="_blank"
                rel="noreferrer"
              >
                poetry.palemoky.com ↗
              </a>
            </div>
          )}
        </div>
      </article>

      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={onReroll}
          className="cursor-pointer text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
        >
          🎲 {messages.terminal.poemRetry}
        </button>
        <button
          type="button"
          onClick={goBack}
          className="cursor-pointer text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
        >
          ← {messages.terminal.back}
        </button>
      </div>
    </div>
  )
}
