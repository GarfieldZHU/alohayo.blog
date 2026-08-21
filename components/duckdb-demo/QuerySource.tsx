'use client'

import { useState } from 'react'

type Lang = 'duckdb' | 'sqlite' | 'indexeddb'

const SOURCES: Record<Lang, { label: string; icon: string; code: string }> = {
  duckdb: {
    label: 'DuckDB-Wasm',
    icon: '🦆',
    code: `// DuckDB 查询：列式存储 + 向量化执行
// 数据直接转成 Arrow 列式表，一条 SQL 跑完聚合
const arrow = await import('apache-arrow')
const table = arrow.tableFromJSON(rows)

await conn.query('DROP TABLE IF EXISTS trades')
await conn.insertArrowTable(table, { name: 'trades' })

// 核心：SQL 聚合由引擎内部向量化完成
const result = await conn.query(
  \`SELECT region, product, SUM(amount) AS total
   FROM trades
   GROUP BY region, product
   ORDER BY total DESC\`
)

// 26ms 跑完 50K 行 🚀 快的原因：
// 列式存储只读需要的列 + SIMD 批量计算`,
  },
  sqlite: {
    label: 'SQLite-Wasm',
    icon: '🗄️',
    code: `// SQLite 查询：行式存储，同样一条 SQL
db.exec(
  'CREATE TABLE trades (id INT, date TEXT, region TEXT, product TEXT, amount REAL)'
)

// 行式数据库逐行 INSERT 太慢 → 用一条多值语句批量插入
const BATCH = 10000
for (let i = 0; i < rows.length; i += BATCH) {
  const slice = rows.slice(i, i + BATCH)
  const values = slice
    .map(r => \`(\${r.id},'\${r.date}','\${r.region}','\${r.product}',\${r.amount})\`)
    .join(',')
  db.exec(\`INSERT INTO trades VALUES \${values}\`)
}

const stmt = db.prepare(
  \`SELECT region, product, SUM(amount) AS total
   FROM trades GROUP BY region, product ORDER BY total DESC\`
)
while (stmt.step()) { /* 逐行取结果 */ }

// 80ms：比 DuckDB 慢 3 倍，行式扫描不如列式向量化`,
  },
  indexeddb: {
    label: 'IndexedDB + JS',
    icon: '📂',
    code: `// IndexedDB 查询：没有 SQL，只能全量捞回内存用 JS 手写聚合
await writeRows(db, rows)          // 1. 逐条写入
const all = await readAll(db)      // 2. 全部记录读回 JS 内存

// 3. 手写分组聚合：Map 遍历每一行
const map = new Map<string, number>()
for (const r of all) {
  const key = \`\${r.region}|\${r.product}\`
  map.set(key, (map.get(key) ?? 0) + r.amount)
}
const sorted = [...map.entries()].sort((a, b) => b[1] - a[1])

// 2.8 秒：比 DuckDB 慢 100 倍的原因就在这
// 没有列式存储、没有向量化、JS 逐行遍历`,
  },
}

/** 极简 TS 高亮：复用博客 prism.css 的 .token-* 主题 */
function highlight(code: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // 顺序：注释 → 字符串 → 关键字 → 数字 → 函数调用
  const TOKEN_RE =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`)|\b(const|let|var|function|return|for|of|if|else|async|await|new|import|export|type|void|class|extends|Map|Array|Math)\b|\b(\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)(?=\()/g

  let out = ''
  let last = 0
  for (const m of code.matchAll(TOKEN_RE)) {
    const idx = m.index ?? 0
    if (idx > last) out += esc(code.slice(last, idx))
    const [full, comment, str, kw, num, fn] = m
    if (comment !== undefined) out += `<span class="token comment">${esc(full)}</span>`
    else if (str !== undefined) out += `<span class="token string">${esc(full)}</span>`
    else if (kw !== undefined) out += `<span class="token keyword">${esc(full)}</span>`
    else if (num !== undefined) out += `<span class="token number">${esc(full)}</span>`
    else if (fn !== undefined) out += `<span class="token function">${esc(full)}</span>`
    last = idx + full.length
  }
  if (last < code.length) out += esc(code.slice(last))
  return out
}

export function QuerySource() {
  const [tab, setTab] = useState<Lang>('duckdb')
  const src = SOURCES[tab]

  return (
    <details className="group mt-5 rounded-lg border border-slate-700 bg-slate-900/60 open:pb-4">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-slate-300 transition hover:text-amber-300">
        <span>🔍 核心源码对比</span>
        <span className="text-xs font-normal text-slate-500">
          （三种实现的查询关键部分 · 点击展开）
        </span>
        <span className="ml-auto text-slate-500 transition group-open:rotate-180">▾</span>
      </summary>

      <div className="px-4">
        <div className="mb-3 flex gap-1 rounded-lg bg-slate-800/80 p-1">
          {(Object.keys(SOURCES) as Lang[]).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${
                tab === k
                  ? 'bg-slate-700 text-amber-300 shadow'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
              }`}
            >
              {SOURCES[k].icon} {SOURCES[k].label}
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
