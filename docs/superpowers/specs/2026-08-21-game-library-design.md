# Blog Game Library Design

**Goal:** Replace the single-game `/game` page with a compact bilingual game library that keeps four approved games, supports light/dark themes, opens every game in a blog-styled modal, links to the live game, and provides one-click iframe embed code.

**Scope:** The standalone `game-hub` repository is checked out locally at `/Users/jiazhu/Dev/GarfieldZHU/game-hub` for source and cover provenance. `alohayo.blog` owns the page presentation and only copies the four required cover assets; it does not embed the game-hub shell or its filters/search UI.

**Catalog:** The order is AlohaYo World, UNO 2026, 红色警戒 2, 坦克大战. AlohaYo World tags are `自制` and `开发中`; UNO 2026 tags are `自制` and `复刻`; Red Alert 2 keeps its source tags; Battle City uses `复刻`. English labels are paired in the same catalog and selected from the existing site locale provider.

**Interaction:** A card opens an accessible modal. AlohaYo World reuses the existing `/game` dynamic `mountGame` launcher UI (seed, dev mode, theme, fullscreen, and lifecycle) inside the modal; it must not be replaced by an iframe to the public landing URL. UNO 2026 and Battle City render their live URLs in sandboxed iframes with fullscreen and new-window controls. Red Alert 2 remains a modal detail view with a direct-launch action because its source sends anti-framing headers. Every modal offers a copyable `<iframe>` snippet and reports copy status without adding a global clipboard dependency; the AlohaYo snippet is explicitly documented as a generic embed fallback while in-site play uses the launcher module.

**Visual system:** The page uses the existing `SectionContainer`/global layout, site background, border, typography, `next-themes` classes, and existing language/theme controls. No separate game-hub navigation, stats, filter bar, or search field is carried over.

**Verification:** A pure catalog test covers order, required tags, embeddability, and generated embed code. TypeScript/ESLint, `git diff --check`, and a production build are required. Browser checks cover both locale routes, light/dark rendering, all four modals, iframe/direct-launch behavior, fullscreen control presence, and clipboard state.

The sitemap includes both `/game/` and `/zh-CN/game/` so the replacement page is discoverable in either locale.
