# Home Visitor Telemetry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a privacy-friendly, terminal-native total-views counter at the bottom of the home page.

**Architecture:** A server-safe `VisitorTelemetry` component owns the presentation and its sole external dependency is a `hits.sh` SVG image for the canonical `alohayo.me` counter. `app/Main.tsx` composes that component after all home-specific content, keeping the global footer and every non-home route unchanged.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, hits.sh SVG image endpoint.

## Global Constraints

- Count total views for exactly `https://alohayo.me` through a single image request; do not add scripts, cookies, identifiers, API keys, or client-side state.
- Render only on the home page by importing the component only from `app/Main.tsx`.
- Use the exact visual tokens: `#212121` background, `#5c9cf5` count, `#fab283` accent, green status dot, and JetBrains Mono inherited from the app shell.
- Keep the external image accessible with alt text `Total views for alohayo.me`.
- Use `hits.sh` `for-the-badge` style with the label `TOTAL VIEWS`.

---

### Task 1: Build the telemetry presentation component

**Files:**
- Create: `components/VisitorTelemetry.tsx`

**Interfaces:**
- Consumes: no props; its counter source is the canonical `https://alohayo.me` URL.
- Produces: default React component `VisitorTelemetry(): JSX.Element`.

- [ ] **Step 1: Add the component skeleton**

```tsx
export default function VisitorTelemetry() {
  return <section aria-label="Visitor telemetry" />
}
```

- [ ] **Step 2: Implement the terminal instrument card**

```tsx
const counterUrl =
  'https://hits.sh/alohayo.me.svg?view=total&style=for-the-badge&label=TOTAL%20VIEWS&color=5c9cf5&labelColor=212121'

export default function VisitorTelemetry() {
  return (
    <section aria-label="Visitor telemetry" className="mt-12 flex justify-center">
      <div className="w-full max-w-sm border border-gray-200 bg-gray-50 p-4 font-mono shadow-sm hover:shadow-[0_0_24px_rgba(92,156,245,0.18)] dark:border-gray-700 dark:bg-[#212121]">
        <div className="flex items-center justify-between text-[10px] tracking-[0.16em] text-gray-500 uppercase dark:text-[#7b7f87]">
          <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Site traffic</span>
          <span className="text-orange-600 dark:text-[#fab283]">Live</span>
        </div>
        <div className="mt-3 flex justify-center">
          <a href="https://hits.sh/alohayo.me/" aria-label="Open alohayo.me view statistics">
            <img alt="Total views for alohayo.me" src={counterUrl} height={28} />
          </a>
        </div>
        <p className="mt-3 text-center text-[10px] tracking-[0.08em] text-gray-500 dark:text-[#7b7f87]">privacy-first · no cookies</p>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Run the targeted lint check**

Run: `yarn eslint components/VisitorTelemetry.tsx`

Expected: exits with status 0 and reports no lint errors.

- [ ] **Step 4: Commit the component**

```bash
git add components/VisitorTelemetry.tsx
git commit -m "Add home visitor telemetry component"
```

### Task 2: Place the component on the home page

**Files:**
- Modify: `app/Main.tsx:1-6`
- Modify: `app/Main.tsx:84-89`

**Interfaces:**
- Consumes: default `VisitorTelemetry` component from `@/components/VisitorTelemetry`.
- Produces: the telemetry panel after optional home-page content and before the global footer.

- [ ] **Step 1: Import the component**

```tsx
import VisitorTelemetry from '@/components/VisitorTelemetry'
```

- [ ] **Step 2: Render it after the optional newsletter block**

```tsx
      {siteMetadata.newsletter?.provider && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )}
      <VisitorTelemetry />
```

- [ ] **Step 3: Run the targeted lint check**

Run: `yarn eslint app/Main.tsx components/VisitorTelemetry.tsx`

Expected: exits with status 0 and reports no lint errors.

- [ ] **Step 4: Commit the composition change**

```bash
git add app/Main.tsx
git commit -m "Show visitor telemetry on the home page"
```

### Task 3: Visually verify the local preview

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: local Next.js development server and the home-page `VisitorTelemetry` component.
- Produces: verified light/dark and narrow-viewport rendering evidence.

- [ ] **Step 1: Start the development server**

Run: `yarn dev`

Expected: Next.js serves the site on its configured local URL.

- [ ] **Step 2: Verify the default theme on the home route**

Open the local home route and confirm the telemetry card follows the latest-posts/newsletter content, has a visible green dot, amber `LIVE`, and a loaded 28px `TOTAL VIEWS` counter.

- [ ] **Step 3: Verify dark theme and narrow width**

Switch the same route to dark theme and test a 375px-wide viewport. Confirm no horizontal overflow, clipped counter, or unreadable text.

- [ ] **Step 4: Inspect browser errors**

Read the browser console after the visual checks.

Expected: no new errors caused by `VisitorTelemetry`; an unavailable external image may leave the card intact without a broken layout.

- [ ] **Step 5: Commit only if verification requires a source correction**

```bash
git add components/VisitorTelemetry.tsx app/Main.tsx
git commit -m "Polish home visitor telemetry layout"
```
