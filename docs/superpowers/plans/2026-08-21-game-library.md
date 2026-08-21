# Blog Game Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single AlohaYo World route with a compact, bilingual four-game library that supports modal play, live links, and iframe snippet copying.

**Architecture:** Keep a pure typed catalog in `app/game/gameCatalog.ts`; keep all interaction state in the existing client entry `GameLauncher.tsx`, which will contain the library, modal, and the old dynamic AlohaYo World launcher as a named child component. Copy only the four cover files from the local `game-hub` checkout into blog-owned public assets, and allow the two external iframe origins through the blog CSP.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind v4 utilities, `next-themes`, Node built-in tests, existing blog locale provider.

**Spec:** `docs/superpowers/specs/2026-08-21-game-library-design.md`

## Global Constraints

- Preserve English `/game/` and Chinese `/zh-CN/game/` routes.
- Preserve all unrelated dirty working-tree changes.
- Render only AlohaYo World, UNO 2026, 红色警戒 2, and 坦克大战 in that order.
- Use exact requested Chinese tags and keep Red Alert 2 source tags.
- Do not carry over game-hub search, category filters, stats, or footer shell.
- Use the existing dynamic AlohaYo World launcher UI for that game; use live iframes only for UNO 2026 and Battle City; keep Red Alert 2 as direct-launch.

### Task 1: Fetch the source repository and stage the four covers

**Files:**
- Create: `/Users/jiazhu/Dev/GarfieldZHU/game-hub/` via the user-requested Git clone.
- Create: `alohayo.blog/public/static/images/game-library/alohayo-world.png`
- Create: `alohayo.blog/public/static/images/game-library/uno-2026.png`
- Create: `alohayo.blog/public/static/images/game-library/red-alert-2.png`
- Create: `alohayo.blog/public/static/images/game-library/battle-city.png`

- [ ] Confirm the target directory is absent and clone `https://github.com/GarfieldZHU/game-hub.git` into it.
- [ ] Verify `src/data/games.ts` contains the four approved source URLs and `public/covers` contains all four cover files.
- [ ] Copy only those cover files into the blog-owned public directory; do not add the other two covers.

### Task 2: Add a failing catalog contract test

**Files:**
- Create: `alohayo.blog/scripts/game-library.test.mjs`
- Create: `alohayo.blog/app/game/gameCatalog.ts`

- [ ] Write a Node test that imports `app/game/gameCatalog.ts` with Node's strip-types loader and asserts the four-item order, exact Chinese tag requirements, Red Alert 2 non-embeddability, and an iframe string containing the selected URL and title.
- [ ] Run `node --experimental-strip-types --test scripts/game-library.test.mjs` and confirm it fails because the catalog module does not exist yet.

### Task 3: Implement the catalog and make the contract green

**Files:**
- Modify: `alohayo.blog/app/game/gameCatalog.ts`
- Modify: `alohayo.blog/scripts/game-library.test.mjs`

- [ ] Define `LocaleCode`, `GameCatalogItem`, the ordered `GAME_CATALOG`, `getGameCopy`, and `getEmbedCode` with explicit English/Chinese labels, URLs, local cover paths, source links, tags, and `embeddable` flags.
- [ ] Return a safe escaped iframe snippet from `getEmbedCode` with the game's URL and title; keep the function pure.
- [ ] Re-run the focused test and confirm it passes before touching the page component.

### Task 4: Wrap the existing AlohaYo launcher in the blog-styled library and modal

**Files:**
- Modify: `alohayo.blog/app/game/GameLauncher.tsx`
- Modify: `alohayo.blog/app/game/page.tsx`
- Modify: `alohayo.blog/app/zh-CN/game/page.tsx`
- Modify: `alohayo.blog/app/sitemap.ts`

- [ ] Rename the current single-game default component to a named `AlohaYoWorldEmbed` without removing its dynamic `mountGame` URL, seed/dev/theme/fullscreen controls, or lifecycle cleanup; keep its current visual surface intact.
- [ ] Add a default library component sourced from `GAME_CATALOG`, using `useSiteLocale` and `useTheme` so locale/theme changes update visible copy without a route reload.
- [ ] Add compact card markup with local covers, requested tags, a live-play affordance, and keyboard-accessible buttons.
- [ ] Add a modal with `role="dialog"`, `aria-modal`, Escape/overlay close, body-scroll cleanup, title/description, copy button/status, the `AlohaYoWorldEmbed` child for AlohaYo World, fullscreen for external iframes, and direct-launch fallback for Red Alert 2.
- [ ] Use the existing blog spacing, borders, light/dark colors, and typography; avoid game-hub filters, search, stats, and footer.
- [ ] Update page metadata to localized “Game Library” / “游戏库”.
- [ ] Include the English `/game/` route in the sitemap alongside the existing Chinese route.

### Task 5: Allow the new iframe origins and run verification

**Files:**
- Modify: `alohayo.blog/next.config.js`

- [ ] Add `https://uno-2026.vercel.app` and `https://battle-city.js.org` to `frame-src` while leaving existing CSP entries intact; do not add the AlohaYo landing URL because it is not used as an iframe source.
- [ ] Run the focused catalog test, `yarn eslint app/game/GameLauncher.tsx app/game/gameCatalog.ts app/game/page.tsx app/zh-CN/game/page.tsx scripts/game-library.test.mjs`, `git diff --check`, and `yarn build`.
- [ ] Start the blog locally and use the browser to verify `/game/` and `/zh-CN/game/`, all four cards, light/dark theme classes, modal close/open, iframe/direct-launch distinction, fullscreen control, and copy feedback.
- [ ] Inspect `git status` and `git diff --stat` to ensure only intended new/modified files plus the pre-existing dirty files remain.
