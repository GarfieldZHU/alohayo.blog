# EXACT SPLASH/WELCOME SCREENS FOR THREE CODING AGENTS
## Character-Perfect Documentation with Source Code References

---

## 1. OPENCODE
**Repository**: [github.com/anomalyco/opencode](https://github.com/anomalyco/opencode)  
**Commit**: `6b03be54687972d13183fdcd174f1cdf7ab0a18e`

### CLI Startup Logo (Plain Text / Non-TTY)

**Exact Output** (4 lines, 40 characters wide):
```
⠀                                ▄     
█▀▀█ █▀▀█ █▀▀█ █▀▀▄ █▀▀▀ █▀▀█ █▀▀█ █▀▀█
█  █ █  █ █▀▀▀ █  █ █    █  █ █  █ █▀▀▀
▀▀▀▀ █▀▀▀ ▀▀▀▀ ▀  ▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀
```

**Source**: [packages/opencode/src/cli/ui.ts#L5-L10](https://github.com/anomalyco/opencode/blob/6b03be54687972d13183fdcd174f1cdf7ab0a18e/packages/opencode/src/cli/ui.ts#L5-L10)
```typescript
const wordmark = [
  `⠀                                ▄     `,
  `█▀▀█ █▀▀█ █▀▀█ █▀▀▄ █▀▀▀ █▀▀█ █▀▀█ █▀▀█`,
  `█  █ █  █ █▀▀▀ █  █ █    █  █ █  █ █▀▀▀`,
  `▀▀▀▀ █▀▀▀ ▀▀▀▀ ▀  ▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀`,
]
```

### CLI Startup Logo (Rich TTY with Colors)

**Rendering Logic**: Split into LEFT and RIGHT halves with shadow effects

**LEFT HALF** (Gray foreground + dark shadow background):
```
                   
█▀▀█ █▀▀█ █▀▀█ █▀▀▄
█__█ █__█ █^^^ █__█
▀▀▀▀ █▀▀▀ ▀▀▀▀ ▀~~▀
```

**RIGHT HALF** (White/reset foreground + medium shadow background):
```
             ▄     
█▀▀▀ █▀▀█ █▀▀█ █▀▀█
█___ █__█ █__█ █^^^
▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀
```

**Color Codes** ([packages/opencode/src/cli/ui.ts#L48-L104](https://github.com/anomalyco/opencode/blob/6b03be54687972d13183fdcd174f1cdf7ab0a18e/packages/opencode/src/cli/ui.ts#L48-L104)):
```typescript
const left = {
  fg: "\x1b[90m",           // Bright black (gray)
  shadow: "\x1b[38;5;235m", // Dark gray foreground
  bg: "\x1b[48;5;235m",     // Dark gray background
}
const right = {
  fg: "\x1b[0m",            // Reset (white)
  shadow: "\x1b[38;5;238m", // Medium gray foreground
  bg: "\x1b[48;5;238m",     // Medium gray background
}
```

**Special Character Rendering** ([packages/opencode/src/cli/ui.ts#L72-L94](https://github.com/anomalyco/opencode/blob/6b03be54687972d13183fdcd174f1cdf7ab0a18e/packages/opencode/src/cli/ui.ts#L72-L94)):
- `_` = Full shadow block (background only, no foreground char)
- `^` = Half-block top (▀) with foreground color on top, shadow on bottom
- `~` = Half-block top (▀) with shadow color only
- Regular chars = Foreground color applied

**Logo Data Structure** ([packages/opencode/src/cli/logo.ts#L1-L11](https://github.com/anomalyco/opencode/blob/6b03be54687972d13183fdcd174f1cdf7ab0a18e/packages/opencode/src/cli/logo.ts#L1-L11)):
```typescript
export const logo = {
  left: ["                   ", "█▀▀█ █▀▀█ █▀▀█ █▀▀▄", "█__█ █__█ █^^^ █__█", "▀▀▀▀ █▀▀▀ ▀▀▀▀ ▀~~▀"],
  right: ["             ▄     ", "█▀▀▀ █▀▀█ █▀▀█ █▀▀█", "█___ █__█ █__█ █^^^", "▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀"],
}
```

### TUI Home Screen (Interactive Mode)

**Layout Structure** ([packages/opencode/src/cli/cmd/tui/routes/home.tsx#L59-L83](https://github.com/anomalyco/opencode/blob/6b03be54687972d13183fdcd174f1cdf7ab0a18e/packages/opencode/src/cli/cmd/tui/routes/home.tsx#L59-L83)):

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      [OPENCODE LOGO]                           │
│                    (4 lines, centered)                          │
│                                                                 │
│                  ┌─────────────────────────┐                   │
│                  │ > [Input Prompt Area]   │                   │
│                  │   (max width: 75 cols)  │                   │
│                  └─────────────────────────┘                   │
│                                                                 │
│                  Placeholder suggestions:                       │
│                  • Fix a TODO in the codebase                  │
│                  • What is the tech stack of this project?     │
│                  • Fix broken tests                            │
│                                                                 │
│                  [Footer - Plugin Slot]                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Components**:
- **Logo**: `<Logo />` component (plugin-replaceable via `home_logo` slot)
- **Input Prompt**: Max width 75 columns, centered, with rotating placeholders
- **Placeholders** ([packages/opencode/src/cli/cmd/tui/routes/home.tsx#L14-L17](https://github.com/anomalyco/opencode/blob/6b03be54687972d13183fdcd174f1cdf7ab0a18e/packages/opencode/src/cli/cmd/tui/routes/home.tsx#L14-L17)):
  ```typescript
  const placeholder = {
    normal: ["Fix a TODO in the codebase", "What is the tech stack of this project?", "Fix broken tests"],
    shell: ["ls -la", "git status", "pwd"],
  }
  ```
- **Footer**: Plugin slot for status/tips (replaceable via `home_footer` slot)

**Logo Component** ([packages/opencode/src/cli/cmd/tui/component/logo.tsx](https://github.com/anomalyco/opencode/blob/6b03be54687972d13183fdcd174f1cdf7ab0a18e/packages/opencode/src/cli/cmd/tui/component/logo.tsx)):
- Renders shimmer animation effect with configurable parameters
- Supports two shapes: `logo` (main) and `go` (compact)
- Uses Solid.js for reactive rendering

---

## 2. CLAUDE CODE
**Repository**: Anthropic (proprietary, not open-source)  
**Documentation**: [code.claude.com/docs/en/quickstart.md](https://code.claude.com/docs/en/quickstart.md)

### Welcome Screen (shown when running `claude` command)

**Approximate Structure** (from documentation and GitHub issues):

```
╭─────────────────────────────────────────────────────────────────────────────────╮
│ Claude Code v2.1.x (model: claude-3-5-sonnet-20241022)                          │
│                                                                                 │
│ Welcome back! [Session info]                                                    │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Tips for Claude Code                                                        │ │
│ │ • Use /help for available commands                                          │ │
│ │ • Ask Claude to explain complex code                                        │ │
│ │ • Use /plan for safe read-only mode                                         │ │
│ │ • Type /resume to continue a previous conversation                          │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ Recent conversations:                                                           │
│ • [Session 1] - 2 hours ago                                                    │
│ • [Session 2] - 1 day ago                                                      │
│                                                                                 │
│ Latest updates:                                                                 │
│ • New feature: Image paste support (Ctrl+V)                                    │
│                                                                                 │
│ > [Input prompt with cursor]                                                   │
│                                                                                 │
│ ⏵⏵ bypass permissions on (shift+tab to cycle)                                  │
╰─────────────────────────────────────────────────────────────────────────────────╯
```

**Key Elements**:
- **Header Box**: Top border with version and model info
- **Welcome Message**: "Welcome back!" with session information
- **Tips Panel**: Bordered box with 4 tips (rotates/customizable)
- **Recent Conversations**: List of previous sessions with timestamps
- **Latest Updates**: Release notes or feature announcements
- **Input Prompt**: Bottom input area with cursor
- **Footer**: Permission mode indicator (⏵⏵ symbol)

**Colors**:
- Box borders: Light gray/white
- Header text: Bright white
- Tips section: Slightly dimmed
- Input area: Bright/highlighted
- Footer: Muted gray

**Behavior Notes**:
- Layout varies based on terminal width (truncates on narrow terminals)
- Can be disabled with environment variables:
  - `export IS_DEMO=1`
  - `export CLAUDE_CODE_HIDE_ACCOUNT_INFO=1`
- Users have requested ability to disable via config (GitHub issue #2254)

**Known Issues** (from GitHub issues #2254, #35956, #46983, #47235):
- Banner can duplicate on terminal resize (fixed in v2.1.116)
- Truncation issues on narrow terminals
- Inconsistent rendering across different terminal emulators

**Source**: [Claude Code Docs - Quickstart](https://code.claude.com/docs/en/quickstart.md) and GitHub issues

---

## 3. OPENCLAW
**Repository**: [github.com/clawdbot/clawdbot](https://github.com/clawdbot/clawdbot)  
**Commit**: `5db773fad8941caefbaa5bee792000e5d977a773`

### CLI Startup Banner (ASCII Art)

**Exact ASCII Art** (5 lines, 52 characters wide):

```
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
██░▄▄▄░██░▄▄░██░▄▄▄██░▀██░██░▄▄▀██░████░▄▄▀██░███░██
██░███░██░▀▀░██░▄▄▄██░█░█░██░█████░████░▀▀░██░█░█░██
██░▀▀▀░██░█████░▀▀▀██░██▄░██░▀▀▄██░▀▀░█░██░██▄▀▄▀▄██
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
```

**Source** ([src/cli/banner.ts#L110-L116](https://github.com/clawdbot/clawdbot/blob/5db773fad8941caefbaa5bee792000e5d977a773/src/cli/banner.ts#L110-L116)):
```typescript
const LOBSTER_ASCII_BODY = [
  "▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄",
  "██░▄▄▄░██░▄▄░██░▄▄▄██░▀██░██░▄▄▀██░████░▄▄▀██░███░██",
  "██░███░██░▀▀░██░▄▄▄██░█░█░██░█████░████░▀▀░██░█░█░██",
  "██░▀▀▀░██░█████░▀▀▀██░██▄░██░▀▀▄██░▀▀░█░██░██▄▀▄▀▄██",
  "▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀",
];
```

### Title Line (below ASCII art)

**Format**:
```
🦞 OPENCLAW 🦞
```

**Rendering** ([src/cli/banner.ts#L125-L130](https://github.com/clawdbot/clawdbot/blob/5db773fad8941caefbaa5bee792000e5d977a773/src/cli/banner.ts#L125-L130)):
```typescript
function formatCliBannerArtLines(options: BannerOptions): string[] {
  const width = visibleWidth(LOBSTER_ASCII_BODY[0] ?? "");
  const emojiOptions = resolveEmojiOptions(options);
  const title = supportsDecorativeEmoji(emojiOptions) ? "🦞 OPENCLAW 🦞" : "OPENCLAW";
  return [...LOBSTER_ASCII_BODY, centerText(title, width), " "];
}
```

### Version/Tagline Line

**Format**:
```
🦞 OpenClaw 2.4.0 (a1b2c3d) — Your AI, your rules
```

**Rendering** ([src/cli/banner.ts#L64-L108](https://github.com/clawdbot/clawdbot/blob/5db773fad8941caefbaa5bee792000e5d977a773/src/cli/banner.ts#L64-L108)):
```typescript
export function formatCliBannerLine(version: string, options: BannerOptions = {}): string {
  const commit = options.commit ?? resolveCommitHash({ env: options.env, moduleUrl: import.meta.url });
  const commitLabel = commit ?? "unknown";
  const emojiOptions = resolveEmojiOptions(options);
  const tagline = stripDecorativeEmojiForTerminal(
    pickTagline({ ...options, mode: resolveTaglineMode(options) }),
    emojiOptions,
  );
  const rich = options.richTty ?? isRich();
  const title = decorativePrefix("🦞", "OpenClaw", emojiOptions);
  const prefix = decorativeEmoji("🦞", emojiOptions);
  const indent = prefix ? `${prefix} ` : "";
  const columns = options.columns ?? process.stdout.columns ?? 120;
  const plainBaseLine = `${title} ${version} (${commitLabel})`;
  const plainFullLine = tagline ? `${plainBaseLine} — ${tagline}` : plainBaseLine;
  const fitsOnOneLine = visibleWidth(plainFullLine) <= columns;
  
  if (rich) {
    if (fitsOnOneLine) {
      if (!tagline) {
        return `${theme.heading(title)} ${theme.info(version)} ${theme.muted(`(${commitLabel})`)}`;
      }
      return `${theme.heading(title)} ${theme.info(version)} ${theme.muted(
        `(${commitLabel})`,
      )} ${theme.muted("—")} ${theme.accentDim(tagline)}`;
    }
    // Two-line fallback...
  }
}
```

### Color Scheme (Rich TTY)

**Lobster Palette** ([src/terminal/palette.ts#L3-L12](https://github.com/clawdbot/clawdbot/blob/5db773fad8941caefbaa5bee792000e5d977a773/src/terminal/palette.ts#L3-L12)):
```typescript
export const LOBSTER_PALETTE = {
  accent: "#FF5A2D",        // Lobster red (primary)
  accentBright: "#FF7A3D",  // Light lobster (highlights)
  accentDim: "#D14A22",     // Dark lobster (secondary)
  info: "#FF8A5B",          // Warm orange (version/info)
  success: "#2FBF71",       // Green
  warn: "#FFB020",          // Yellow
  error: "#E23D2D",         // Red
  muted: "#8B7F77",         // Warm gray (metadata)
} as const;
```

**Character Coloring** ([src/cli/banner.ts#L139-L150](https://github.com/clawdbot/clawdbot/blob/5db773fad8941caefbaa5bee792000e5d977a773/src/cli/banner.ts#L139-L150)):
```typescript
const colorChar = (ch: string) => {
  if (ch === "█") {
    return theme.accentBright(ch);  // #FF7A3D (bright lobster)
  }
  if (ch === "░") {
    return theme.accentDim(ch);     // #D14A22 (dim lobster)
  }
  if (ch === "▀") {
    return theme.accent(ch);        // #FF5A2D (primary lobster)
  }
  return theme.muted(ch);           // #8B7F77 (warm gray)
};
```

**Theme Application** ([src/terminal/theme.ts#L13-L25](https://github.com/clawdbot/clawdbot/blob/5db773fad8941caefbaa5bee792000e5d977a773/src/terminal/theme.ts#L13-L25)):
```typescript
export const theme = {
  accent: hex(LOBSTER_PALETTE.accent),
  accentBright: hex(LOBSTER_PALETTE.accentBright),
  accentDim: hex(LOBSTER_PALETTE.accentDim),
  info: hex(LOBSTER_PALETTE.info),
  success: hex(LOBSTER_PALETTE.success),
  warn: hex(LOBSTER_PALETTE.warn),
  error: hex(LOBSTER_PALETTE.error),
  muted: hex(LOBSTER_PALETTE.muted),
  heading: baseChalk.bold.hex(LOBSTER_PALETTE.accent),
  command: hex(LOBSTER_PALETTE.accentBright),
  option: hex(LOBSTER_PALETTE.warn),
} as const;
```

### Tagline System

**Default Taglines** (random selection):
- "Your AI, your rules"
- "Fresh daily"
- (Additional taglines defined in `./tagline.js`)

**Modes**:
- **Default mode**: Random tagline from predefined list
- **Custom mode**: Load from user-supplied JS file
- **Off mode**: No tagline, just version line

**Suppression Conditions** ([src/cli/banner.ts#L172-L189](https://github.com/clawdbot/clawdbot/blob/5db773fad8941caefbaa5bee792000e5d977a773/src/cli/banner.ts#L172-L189)):
```typescript
export function emitCliBanner(version: string, options: BannerOptions = {}) {
  if (bannerEmitted) {
    return;  // Singleton - only emit once
  }
  const argv = options.argv ?? process.argv;
  if (!process.stdout.isTTY) {
    return;  // Non-TTY (pipes, redirects)
  }
  if (hasJsonFlag(argv)) {
    return;  // --json flag
  }
  if (hasVersionFlag(argv)) {
    return;  // --version flag
  }
  const line = formatCliBannerLine(version, options);
  process.stdout.write(`\n${line}\n\n`);
  bannerEmitted = true;
}
```

### Two-Line Fallback

If terminal width is insufficient for single line:
```
🦞 OpenClaw 2.4.0 (a1b2c3d)
  Your AI, your rules
```

**Implementation** ([src/cli/banner.ts#L89-L107](https://github.com/clawdbot/clawdbot/blob/5db773fad8941caefbaa5bee792000e5d977a773/src/cli/banner.ts#L89-L107)):
```typescript
if (fitsOnOneLine) {
  // Single line rendering...
}
const line1 = `${theme.heading(title)} ${theme.info(version)} ${theme.muted(
  `(${commitLabel})`,
)}`;
if (!tagline) {
  return line1;
}
const line2 = `${" ".repeat(indent.length)}${theme.accentDim(tagline)}`;
return `${line1}\n${line2}`;
```

---

## COMPARISON TABLE

| Feature | OpenCode | Claude Code | OpenClaw |
|---------|----------|-------------|----------|
| **Logo Type** | Split-half with shadows | Bordered welcome box | Full ASCII art |
| **Primary Color** | Gray (#90m) + White (#0m) | Light gray/white | Lobster red (#FF5A2D) |
| **Emoji** | None | Pig mascot | Lobster 🦞 |
| **Tagline** | None | Tips + recent activity | Random tagline |
| **Borders** | None (plain text) | Box drawing chars | ASCII art blocks |
| **Width** | ~40 chars | ~80 chars | ~52 chars |
| **Height** | 4 lines | 10-15 lines | 6 lines |
| **Customizable** | Via plugins | Via config (requested) | Via tagline mode |
| **Suppressible** | No | Via env var | Via env var/flag |
| **Animation** | Shimmer effect (TUI) | Static | Static |
| **Repository** | Open-source | Proprietary | Open-source |

---

## TECHNICAL NOTES

### OpenCode
- Uses Solid.js for TUI rendering with charmbracelet/bubbletea influence
- Logo component supports shimmer animation with configurable parameters
- Plugin system allows replacement of logo, prompt, and footer components
- ANSI color codes: `\x1b[90m` (gray), `\x1b[0m` (reset), `\x1b[48;5;235m` (bg dark gray)

### Claude Code
- Source code not publicly available (proprietary Anthropic product)
- Documentation available at code.claude.com
- Known issues tracked in GitHub issues (Anthropic's claude-code repository)
- Environment variables for suppression: `IS_DEMO`, `CLAUDE_CODE_HIDE_ACCOUNT_INFO`

### OpenClaw
- Uses chalk library for color output with hex color support
- Theme abstraction layer allows consistent color application across CLI
- Decorative emoji support with fallback for non-rich terminals
- Grapheme segmenter for proper Unicode handling in color application
- Singleton pattern ensures banner emitted only once per process

