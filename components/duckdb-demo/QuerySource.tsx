'use client'

import { useState } from 'react'

type DemoLocale = 'en' | 'zh-CN'
type EngineKey = 'duckdb' | 'sqlite' | 'indexeddb'

interface SourceCopy {
  label: string
  icon: string
  code: string
}

const SOURCES: Record<DemoLocale, Record<EngineKey, SourceCopy>> = {
  en: {
    duckdb: {
      label: 'DuckDB-Wasm',
      icon: '🦆',
      code: [
        '// DuckDB query: columnar storage + vectorized execution',
        '// Turn the data into an Arrow table, then let SQL do the aggregation.',
        "const arrow = await import('apache-arrow')",
        'const table = arrow.tableFromJSON(rows)',
        '',
        "await conn.query('DROP TABLE IF EXISTS trades')",
        "await conn.insertArrowTable(table, { name: 'trades' })",
        '',
        'const result = await conn.query(',
        '  "SELECT region, product, SUM(amount) AS total, COUNT(*) AS cnt" +',
        '   " FROM trades GROUP BY region, product ORDER BY total DESC"',
        ')',
        '',
        '// The engine reads the columns it needs and processes them in batches.',
      ].join('\n'),
    },
    sqlite: {
      label: 'SQLite-Wasm',
      icon: '🗄️',
      code: [
        '// SQLite query: row-oriented storage, but still real SQL',
        "db.exec('CREATE TABLE trades (id INT, date TEXT, region TEXT, product TEXT, amount REAL)')",
        '',
        '// Batch INSERT keeps the setup cost reasonable.',
        'for (let i = 0; i < rows.length; i += 10000) {',
        '  const values = rows.slice(i, i + 10000).map(toSqlValue).join(",")',
        '  db.exec("INSERT INTO trades VALUES " + values)',
        '}',
        '',
        'const stmt = db.prepare(',
        '  "SELECT region, product, SUM(amount) AS total, COUNT(*) AS cnt" +',
        '   " FROM trades GROUP BY region, product ORDER BY total DESC"',
        ')',
        'while (stmt.step()) { /* read rows one by one */ }',
        'stmt.finalize()',
      ].join('\n'),
    },
    indexeddb: {
      label: 'IndexedDB + JS',
      icon: '📂',
      code: [
        '// IndexedDB query: no SQL, so read everything and aggregate in JS',
        'await writeRows(db, rows)          // 1. write every record',
        'const all = await readAll(db)      // 2. bring every record back to JS',
        '',
        '// 3. Handwritten grouping and summing',
        'const map = new Map<string, number>()',
        'for (const r of all) {',
        '  const key = r.region + "|" + r.product',
        '  map.set(key, (map.get(key) ?? 0) + r.amount)',
        '}',
        'const sorted = [...map.entries()].sort((a, b) => b[1] - a[1])',
        '',
        '// No column pruning, no vectorized batches: just a JS loop.',
      ].join('\n'),
    },
  },
  'zh-CN': {
    duckdb: {
      label: 'DuckDB-Wasm',
      icon: '🦆',
      code: [
        '// DuckDB 查询：列式存储 + 向量化执行',
        '// 数据转成 Arrow 列式表，再交给 SQL 做聚合',
        "const arrow = await import('apache-arrow')",
        'const table = arrow.tableFromJSON(rows)',
        '',
        "await conn.query('DROP TABLE IF EXISTS trades')",
        "await conn.insertArrowTable(table, { name: 'trades' })",
        '',
        'const result = await conn.query(',
        '  "SELECT region, product, SUM(amount) AS total, COUNT(*) AS cnt" +',
        '   " FROM trades GROUP BY region, product ORDER BY total DESC"',
        ')',
        '',
        '// 引擎只读需要的列，并按批次处理。',
      ].join('\n'),
    },
    sqlite: {
      label: 'SQLite-Wasm',
      icon: '🗄️',
      code: [
        '// SQLite 查询：行式存储，但仍然是真 SQL',
        "db.exec('CREATE TABLE trades (id INT, date TEXT, region TEXT, product TEXT, amount REAL)')",
        '',
        '// 批量 INSERT，避免逐行写入拖慢准备阶段。',
        'for (let i = 0; i < rows.length; i += 10000) {',
        '  const values = rows.slice(i, i + 10000).map(toSqlValue).join(",")',
        '  db.exec("INSERT INTO trades VALUES " + values)',
        '}',
        '',
        'const stmt = db.prepare(',
        '  "SELECT region, product, SUM(amount) AS total, COUNT(*) AS cnt" +',
        '   " FROM trades GROUP BY region, product ORDER BY total DESC"',
        ')',
        'while (stmt.step()) { /* 逐行读取结果 */ }',
        'stmt.finalize()',
      ].join('\n'),
    },
    indexeddb: {
      label: 'IndexedDB + JS',
      icon: '📂',
      code: [
        '// IndexedDB 查询：没有 SQL，只能全量捞回 JS 聚合',
        'await writeRows(db, rows)          // 1. 逐条写入',
        'const all = await readAll(db)      // 2. 全部记录读回 JS',
        '',
        '// 3. 手写分组求和',
        'const map = new Map<string, number>()',
        'for (const r of all) {',
        '  const key = r.region + "|" + r.product',
        '  map.set(key, (map.get(key) ?? 0) + r.amount)',
        '}',
        'const sorted = [...map.entries()].sort((a, b) => b[1] - a[1])',
        '',
        '// 没有跳列、没有向量化批处理：就是一个 JS 循环。',
      ].join('\n'),
    },
  },
}

const COPY: Record<DemoLocale, { title: string; hint: string }> = {
  en: {
    title: '🔍 Compare the query implementations',
    hint: '(key parts of all three approaches · click to expand)',
  },
  'zh-CN': {
    title: '🔍 核心源码对比',
    hint: '（三种实现的查询关键部分 · 点击展开）',
  },
}

/** 极简 TS 高亮：复用博客 prism.css 的 .token-* 主题 */
function highlight(code: string): string {
  const esc = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const tokenRe =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")|\b(const|let|var|function|return|for|of|if|else|async|await|new|import|export|type|void|class|extends|Map|Array|Math)\b|\b(\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)(?=\()/g

  let output = ''
  let last = 0
  for (const match of code.matchAll(tokenRe)) {
    const index = match.index ?? 0
    if (index > last) output += esc(code.slice(last, index))
    const [full, comment, string, keyword, number, functionName] = match
    if (comment !== undefined) output += '<span class="token comment">' + esc(full) + '</span>'
    else if (string !== undefined) output += '<span class="token string">' + esc(full) + '</span>'
    else if (keyword !== undefined) output += '<span class="token keyword">' + esc(full) + '</span>'
    else if (number !== undefined) output += '<span class="token number">' + esc(full) + '</span>'
    else if (functionName !== undefined)
      output += '<span class="token function">' + esc(full) + '</span>'
    last = index + full.length
  }
  if (last < code.length) output += esc(code.slice(last))
  return output
}

export function QuerySource({ locale = 'en' }: { locale?: DemoLocale }) {
  const [tab, setTab] = useState<EngineKey>('duckdb')
  const src = SOURCES[locale][tab]
  const copy = COPY[locale]

  return (
    <details className="group mt-5 rounded-lg border border-slate-700 bg-slate-900/60 open:pb-4">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-slate-300 transition hover:text-amber-300">
        <span>{copy.title}</span>
        <span className="text-xs font-normal text-slate-500">{copy.hint}</span>
        <span className="ml-auto text-slate-500 transition group-open:rotate-180">▾</span>
      </summary>

      <div className="px-4">
        <div className="mb-3 flex gap-1 rounded-lg bg-slate-800/80 p-1">
          {(Object.keys(SOURCES[locale]) as EngineKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={
                'flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition ' +
                (tab === key
                  ? 'bg-slate-700 text-amber-300 shadow'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200')
              }
            >
              {SOURCES[locale][key].icon} {SOURCES[locale][key].label}
            </button>
          ))}
        </div>

        <pre className="max-h-80 overflow-auto rounded-lg bg-slate-950 p-4 text-[12px] leading-relaxed text-slate-200">
          <code dangerouslySetInnerHTML={{ __html: highlight(src.code) }} />
        </pre>
      </div>
    </details>
  )
}
