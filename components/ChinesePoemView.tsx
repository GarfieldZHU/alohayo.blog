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

type PoetryTheme = {
  className: string
  seal: string
}

const DYNASTY_THEMES: Array<{ match: string; theme: PoetryTheme }> = [
  { match: '唐', theme: { className: 'poetry-paper--tang', seal: '唐' } },
  { match: '宋', theme: { className: 'poetry-paper--song', seal: '宋' } },
  { match: '元', theme: { className: 'poetry-paper--yuan', seal: '元' } },
  { match: '明', theme: { className: 'poetry-paper--ming', seal: '明' } },
  { match: '清', theme: { className: 'poetry-paper--qing', seal: '清' } },
]

function getPoetryTheme(dynasty: string): PoetryTheme {
  return (
    DYNASTY_THEMES.find(({ match }) => dynasty.includes(match))?.theme ?? {
      className: 'poetry-paper--default',
      seal: '詩',
    }
  )
}

export default function ChinesePoemView({
  poem,
  loading,
  error,
  onReroll,
  goBack,
}: ChinesePoemViewProps) {
  const { messages } = useLocale()
  const theme = getPoetryTheme(poem?.dynasty ?? '')

  return (
    <div className="space-y-4">
      <p className="text-gray-500">
        <span className="mr-2 text-blue-500 dark:text-[#5c9cf5]">❯</span>
        {messages.terminal.quotes}
      </p>

      <article
        className={`poetry-paper ${theme.className} relative mx-auto w-full max-w-3xl overflow-hidden rounded-sm border px-5 py-6 shadow-xl sm:px-8 sm:py-8`}
      >
        <div className="poetry-paper__edge pointer-events-none absolute inset-3 rounded-sm border" />
        <div className="relative">
          <div className="mb-8 flex items-start justify-between gap-4">
            <span className="poetry-paper__seal" aria-hidden="true">
              {theme.seal}
            </span>
            <div className="flex flex-col items-end gap-2">
              {!loading && poem?.type && <span className="poetry-paper__type">{poem.type}</span>}
              <span className="poetry-paper__source">{messages.terminal.poemSource}</span>
            </div>
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
              <h2 className="poetry-paper__title mx-auto max-w-2xl text-balance break-words">
                {poem.title}
              </h2>
              <p className="poetry-paper__author">
                {poem.dynasty} · {poem.author}
              </p>
              <div className="poetry-paper__body poetry-paper__body-scroll mt-8 space-y-2 text-center">
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
