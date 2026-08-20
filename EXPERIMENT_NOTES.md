# DuckDB Demo 实验笔记（experiment/duckdb-demo 分支）

> 状态：实验中（draft），基于真实 headless Chrome 验证
> 创建：2026-08-20

## 目标

在博客里嵌入一个交互 demo，让读者点一下就能看见 DuckDB / SQLite / IndexedDB 三引擎的**真实性能差异**，配合博客文章讨论列式 vs 行式 + JS 聚合的本质区别。

## 实验环境

- 浏览器：headless Chrome 145（chromium channel）
- Next.js 15.5.12 dev server
- DuckDB-Wasm：1.33.1-dev64.0（mvp/eh/coi 三个 bundle）
- SQLite-Wasm：3.53.0-build1（ESM oo1 API）
- IndexedDB：浏览器原生
- Node 22.22.2
- 物理机：Mac mini

## 关键决策记录

### 1. 自托管 wasm 而不是 CDN

第一版 duckdb.ts 用了 jsdelivr CDN 加载 wasm + worker。**踩坑**：

- 站点 CSP `worker-src 'self' blob:`（next.config.js 第 17 行），不允许从外部域名加载 worker
- 浏览器控制台：`Creating a worker from 'https://cdn.jsdelivr.net/...' violates CSP worker-src`

**修复**：

- 把 `duckdb-mvp.wasm` / `duckdb-eh.wasm` / `duckdb-coi.wasm` 和 4 个 worker 复制到 `public/vendor/duckdb-wasm/`
- `sqlite3.wasm` 复制到 `public/vendor/sqlite-wasm/`
- `MANUAL_BUNDLES` 改成同源路径 `${NEXT_PUBLIC_BASE_PATH}/vendor/duckdb-wasm/...`
- 这同时消除运行时网络依赖（更稳更快，也满足「自托管 + 零外链」的工程洁癖）

**教训**：WebAssembly 生态要嵌入第三方产品，CSP 是必须早考虑的环境变量。

### 2. duckdb-wasm 的导入路径

第一版用 `import * as duckdb from '@duckdb/duckdb-wasm'`。**踩坑**：

- Next.js webpack 在 SSR 打包时把 `duckdb-node.cjs` 拉进来（`Critical dependency: the request of a dependency is an expression`）
- package.json `exports.browser` 条件没用上

**修复**：直接导入浏览器子路径：

```ts
import * as duckdb from '@duckdb/duckdb-wasm/dist/duckdb-browser.mjs'
```

### 3. Apache Arrow Table 构造

第一版 `new arrow.Table(schema, rows)` 期望 RecordBatch[] 而非 plain object[]，TS 报错。

**修复**：用 `arrow.tableFromJSON(rows as Record<string, unknown>[])`，schema 推断省事。

### 4. SQLite-Wasm prepared statement API

第一版用 `stmt.free()`，运行时 `TypeError: stmt.free is not a function`。

**修复**：sqlite-wasm 的 oo1 API 叫 `finalize()`，不是 `free()`。同时 `import` 走默认导出 `sqlite3InitModule`。

### 5. demo 组件的 TS 类型

- `TradeRow` interface id 字段在 `tableFromJSON` 会被推断为 Float64（够用）
- `prepare` 返回类型要用 `finalize`，不能照搬 SQLite C API 的 `free`

## CSP 笔记

站点 `next.config.js` CSP 关键条款：

- `default-src 'self'`（兜底）
- `script-src` 允许 `cdn.jsdelivr.net`（已用上，需要保留）
- `worker-src 'self' blob:`（不允许外部 worker → 必须自托管）
- `connect-src *`（wasm fetch 放行）

**结论**：wasm/worker 必须放在 public/ 或自托管 CDN，不要走第三方 CDN（worker-src 会拦）。

## 性能实测（headless Chrome，50K 行）

| 引擎 | 耗时 | 相对 DuckDB |
|---|---|---|
| **DuckDB-Wasm** | **26.7 ms** | 1x |
| **SQLite-Wasm** | **80.6 ms** | 3x |
| **IndexedDB + JS 聚合** | **2.81 s** | **105x** |
| 结论 | DuckDB 比 IndexedDB 快 105x | 🏆 |

更大的数据量（200K、1M）正在跑，结果待补。

## 关键观察 / 写博客可用

1. **DuckDB 真实在浏览器里跑出 26ms**（50K 行 + 列式 + 向量化），不是理论值
2. **SQLite 也比 IndexedDB + JS 聚合快 ~35 倍**（80ms vs 2.8s）——证明「有 SQL 引擎 vs 纯 JS」本身就是降维打击
3. **IndexedDB 慢的本质**：没 SQL，必须把数据 `getAll()` 到内存用 JS 算。这是浏览器原生方案的根本局限
4. **DuckDB-Wasm 自托管 ≈ 5-10MB wasm + worker**，比下载 npm 友好
5. **CSP worker-src 'self' blob:** 是嵌入 wasm 项目的常见坑，需要早规划

## 待补充 / 后续结论

- **200K / 1M 测试未完成**：连续多次跑分时 demo 不稳定（Next.js dev 热更新会随机 500，`chunk.reason.enqueueModel` 报错）。50K 单次验证稳定，已足够支撑博客论点
- **博客核心论点**（基于 50K 实测）：
  - DuckDB 26.7ms vs IndexedDB+JS 2.81s = **105x**，这就是「列式向量化 SQL vs 手动 JS 聚合」的差距
  - SQLite 80.6ms 也比 IndexedDB 快 35x →「有 SQL 引擎 vs 纯 JS 遍历」本身就降维打击
  - IndexedDB 慢的本质：没 SQL，`getAll()` 全量捞出 + JS 算
- **稳定性教训**：benchmark 场景要隔离跑（每次 fresh 页面 / 单独 URL），不要在同一 dev server 上连续跑多次
- 截图在 `/tmp/pw-verify/result.png`（三引擎对比结果）

## 下一步

- [x] 实验验证（50K 通过）
- [ ] 写正式博客 `data/blog/duckdb-2026.mdx`（嵌入 `<DuckDbBenchmarkDemo />`）
- [ ] 本地 build 验证
- [ ] 提交到 experiment 分支（不推送），向用户汇报后决定是否合并 main
