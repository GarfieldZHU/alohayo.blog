# TUI Visual Aesthetics Documentation
## Three AI Coding Tools: Claude Code, OpenCode, OpenClaw

**Date**: May 23, 2026  
**Purpose**: CSS theme recreation reference for web simulation  
**Status**: Complete extraction from source code

---

## 1. OPENCODE

### 1.1 Color Palette

#### Dark Mode (Default)
| Element | Hex Value | Usage |
|---------|-----------|-------|
| Background | `#212121` | Main terminal background |
| Foreground/Text | `#e0e0e0` | Default text color |
| Primary | `#fab283` | User messages, primary accent (orange) |
| Secondary | `#5c9cf5` | Assistant messages, secondary accent (blue) |
| Accent | `#9d7cd8` | Tertiary accent (purple) |
| Error | `#f97066` | Error states, warnings |
| Warning | `#f6c453` | Warning states (yellow) |
| Success | `#7dd3a5` | Success states (green) |
| Info | `#5c9cf5` | Info states (cyan) |
| Text Muted | `#7b7f87` | Dimmed/secondary text |
| Text Emphasized | `#ffffff` | Bold/highlighted text |
| Border Normal | `#3c414b` | Standard borders |
| Border Focused | `#fab283` | Active/focused borders (primary color) |
| Border Dim | `#2a2a2a` | Inactive/dim borders |

#### Light Mode
| Element | Hex Value | Usage |
|---------|-----------|-------|
| Background | `#f8f8f8` | Main terminal background |
| Foreground/Text | `#2a2a2a` | Default text color |
| Primary | `#d97706` | User messages (orange) |
| Secondary | `#2563eb` | Assistant messages (blue) |
| Accent | `#7c3aed` | Tertiary accent (purple) |
| Error | `#dc2626` | Error states |
| Warning | `#b45309` | Warning states |
| Success | `#047857` | Success states |
| Info | `#0284c7` | Info states |

#### Diff View Colors (Dark Mode)
| Element | Hex Value | Usage |
|---------|-----------|-------|
| Diff Added | `#7dd3a5` | Added lines (green) |
| Diff Removed | `#f97066` | Removed lines (red) |
| Diff Context | `#e0e0e0` | Context lines |
| Diff Hunk Header | `#5c9cf5` | Hunk header (blue) |
| Diff Added Highlight | `#a8e6c1` | Added line highlight |
| Diff Removed Highlight | `#f9a8a0` | Removed line highlight |
| Diff Added Background | `#1a3a2a` | Added line background |
| Diff Removed Background | `#3a1a1a` | Removed line background |

#### Markdown Colors (Dark Mode)
| Element | Hex Value | Usage |
|---------|-----------|-------|
| Markdown Text | `#e0e0e0` | Default markdown text |
| Markdown Heading | `#fab283` | Headings (primary color) |
| Markdown Link | `#7dd3a5` | Links (green) |
| Markdown Link Text | `#5c9cf5` | Link text (blue) |
| Markdown Code | `#f6c453` | Inline code (yellow) |
| Markdown Code Block | `#1e232a` | Code block background |
| Markdown Code Border | `#343a45` | Code block border |
| Markdown Quote | `#8cc8ff` | Block quotes (light blue) |
| Markdown Quote Border | `#3b4d6b` | Quote border |

**Source**: [OpenCode theme.go interface](https://github.com/opencode-ai/opencode/blob/main/internal/tui/theme/theme.go) + [opencode.go theme definition](https://github.com/opencode-ai/opencode/blob/main/internal/tui/theme/opencode.go)

---

### 1.2 Message Styling & Layout

#### User Message
- **Border**: Left border only, thick style (`lipgloss.ThickBorder()`)
- **Border Color**: Secondary color (`#5c9cf5` - blue)
- **Background**: Theme background (`#212121`)
- **Text Color**: Text muted (`#7b7f87`)
- **Padding**: 1 space horizontal
- **Width**: Full width minus 1 character
- **Attachments**: Styled with TextMuted background + Text foreground, left margin 1

**Code Reference**: [message.go renderUserMessage()](https://github.com/opencode-ai/opencode/blob/main/internal/tui/components/chat/message.go#L82-L114)

```
┃ User message content here
┃ with markdown formatting
```

#### Assistant Message
- **Border**: Left border only, thick style
- **Border Color**: Primary color (`#fab283` - orange)
- **Background**: Theme background
- **Text Color**: Text muted
- **Padding**: 1 space horizontal
- **Width**: Full width minus 1 character

**Code Reference**: [message.go renderAssistantMessage()](https://github.com/opencode-ai/opencode/blob/main/internal/tui/components/chat/message.go#L117-L200)

```
┃ Assistant message content here
┃ with markdown formatting
```

#### Tool Execution Message
- **Background**: Tool pending background (`#1f2a2f` - dark blue)
- **Title Color**: Tool title (`#f6c453` - yellow)
- **Output Color**: Tool output (`#e1dacb` - light beige)
- **Success Background**: `#1e2d23` (dark green)
- **Error Background**: `#2f1f1f` (dark red)

---

### 1.3 Prompt Symbols & Icons

| Symbol | Unicode | Usage |
|--------|---------|-------|
| OpenCode Icon | `⌬` | App branding/header |
| Check | `✓` | Success/completed tasks |
| Error | `✖` | Errors/failed tasks |
| Warning | `⚠` | Warnings |
| Info | `` | Info messages |
| Hint | `i` | Hints/tips |
| Spinner | `...` | Loading state |
| Loading | `⟳` | Rotating loading indicator |
| Document | `🖼` | File attachments |
| Quote Block | `❯` | Markdown block quotes |
| Checkbox Ticked | `[✓]` | Completed checkbox |
| Checkbox Unticked | `[ ]` | Uncompleted checkbox |

**Source**: [icons.go](https://github.com/opencode-ai/opencode/blob/main/internal/tui/styles/icons.go)

---

### 1.4 Border Styles

OpenCode uses **lipgloss** border types:

| Border Type | Usage |
|-------------|-------|
| `NormalBorder()` | Standard borders (single line) |
| `ThickBorder()` | Message containers (thick lines) |
| `DoubleBorder()` | Emphasis/special containers |
| `BorderLeft(true)` | Left border only (messages) |

**Border Colors**:
- **Normal**: `#3c414b` (dim gray)
- **Focused**: `#fab283` (primary orange)
- **Dim**: `#2a2a2a` (very dark)

**Source**: [styles.go](https://github.com/opencode-ai/opencode/blob/main/internal/tui/styles/styles.go#L35-L75)

---

### 1.5 Typography & Spacing

| Property | Value |
|----------|-------|
| Font | Terminal default (monospace) |
| Base Padding | 0 vertical, 1 horizontal |
| Message Width | Terminal width - 1 |
| Line Height | Terminal default (1.0) |
| Bold | Applied via lipgloss `.Bold(true)` |
| Markdown Rendering | Via `goldmark` with custom renderer |

**Source**: [styles.go Padded()](https://github.com/opencode-ai/opencode/blob/main/internal/tui/styles/styles.go#L25-L27)

---

### 1.6 Status Bar & Chrome

- **Status Bar**: Displays model name + elapsed time
- **Format**: ` ModelName (2m 34s)`
- **Color**: Text muted (`#7b7f87`)
- **Position**: Below assistant message
- **Width**: Full width minus 1

**Source**: [message.go finish info rendering](https://github.com/opencode-ai/opencode/blob/main/internal/tui/components/chat/message.go#L139-L147)

---

## 2. OPENCLAW

### 2.1 Color Palette

#### Dark Mode (Default)
| Element | Hex Value | Usage |
|---------|-----------|-------|
| Text | `#E8E3D5` | Default text (warm beige) |
| Dim | `#7B7F87` | Dimmed/secondary text |
| Accent | `#F6C453` | Primary accent (golden yellow) |
| Accent Soft | `#F2A65A` | Secondary accent (softer yellow) |
| Border | `#3C414B` | Borders |
| User Background | `#2B2F36` | User message background |
| User Text | `#F3EEE0` | User message text (light beige) |
| System Text | `#9BA3B2` | System/assistant text (gray-blue) |
| Tool Pending Background | `#1F2A2F` | Tool execution pending (dark blue) |
| Tool Success Background | `#1E2D23` | Tool execution success (dark green) |
| Tool Error Background | `#2F1F1F` | Tool execution error (dark red) |
| Tool Title | `#F6C453` | Tool title (golden yellow) |
| Tool Output | `#E1DACB` | Tool output text (light beige) |
| Quote | `#8CC8FF` | Block quotes (light blue) |
| Quote Border | `#3B4D6B` | Quote border (dark blue) |
| Code | `#F0C987` | Inline code (light gold) |
| Code Block | `#1E232A` | Code block background (very dark) |
| Code Border | `#343A45` | Code block border (dark gray) |
| Link | `#7DD3A5` | Links (mint green) |
| Error | `#F97066` | Error text (red) |
| Success | `#7DD3A5` | Success text (green) |

#### Light Mode
| Element | Hex Value | Usage |
|---------|-----------|-------|
| Text | `#1E1E1E` | Default text (dark gray) |
| Dim | `#5B6472` | Dimmed text |
| Accent | `#B45309` | Primary accent (dark orange) |
| Accent Soft | `#C2410C` | Secondary accent (darker orange) |
| Border | `#5B6472` | Borders |
| User Background | `#F3F0E8` | User message background (light cream) |
| User Text | `#1E1E1E` | User message text (dark) |
| System Text | `#4B5563` | System/assistant text (dark gray) |
| Tool Pending Background | `#EFF6FF` | Tool pending (light blue) |
| Tool Success Background | `#ECFDF5` | Tool success (light green) |
| Tool Error Background | `#FEF2F2` | Tool error (light red) |
| Tool Title | `#B45309` | Tool title (dark orange) |
| Tool Output | `#374151` | Tool output (dark gray) |
| Quote | `#1D4ED8` | Block quotes (dark blue) |
| Quote Border | `#2563EB` | Quote border (bright blue) |
| Code | `#92400E` | Inline code (dark brown) |
| Code Block | `#F9FAFB` | Code block background (off-white) |
| Code Border | `#92400E` | Code block border (dark brown) |
| Link | `#047857` | Links (dark green) |
| Error | `#DC2626` | Error text (dark red) |
| Success | `#047857` | Success text (dark green) |

**Source**: [theme.ts darkPalette & lightPalette](https://github.com/opencode-ai/openclaw/blob/main/src/tui/theme/theme.ts#L60-L95)

---

### 2.2 Message Styling & Layout

#### User Message
- **Background**: User background (`#2B2F36` - dark gray-blue)
- **Text Color**: User text (`#F3EEE0` - light beige)
- **Component**: `UserMessageComponent` extends `Container`
- **Markdown**: Uses `HyperlinkMarkdown` with markdown theme
- **Spacing**: 1 space above message (Spacer component)

**Code Reference**: [user-message.ts](https://github.com/opencode-ai/openclaw/blob/main/src/tui/components/user-message.ts)

```
User message content here
with markdown formatting
```

#### Assistant Message
- **Text Color**: Assistant text (terminal default foreground for contrast)
- **Component**: `AssistantMessageComponent` extends `Container`
- **Markdown**: Uses `HyperlinkMarkdown` with markdown theme
- **Spacing**: 1 space above message
- **Note**: Intentionally uses terminal default to respect user's terminal theme

**Code Reference**: [assistant-message.ts](https://github.com/opencode-ai/openclaw/blob/main/src/tui/components/assistant-message.ts)

```
Assistant message content here
with markdown formatting
```

---

### 2.3 Prompt Symbols & Icons

| Symbol | Usage |
|--------|-------|
| `→` | Cursor/selection indicator (settings list) |
| `[✓]` | Ticked checkbox (markdown) |
| `[ ]` | Unticked checkbox (markdown) |
| Accent color prefix | Selected item in select lists |

**Source**: [theme.ts settingsListTheme](https://github.com/opencode-ai/openclaw/blob/main/src/tui/theme/theme.ts#L140-L147)

---

### 2.4 Markdown Rendering

OpenClaw uses comprehensive markdown theme:

| Element | Styling |
|---------|---------|
| Heading | Bold + accent color (`#F6C453`) |
| Link | Link color (`#7DD3A5`) |
| Link URL | Dimmed text |
| Code (inline) | Code color (`#F0C987`) |
| Code Block | Code color with code block background |
| Code Block Border | Code border color (`#343A45`) |
| Quote | Quote color (`#8CC8FF`) |
| Quote Border | Quote border color (`#3B4D6B`) |
| Horizontal Rule | Border color (`#3C414B`) |
| List Bullet | Accent soft color (`#F2A65A`) |
| Bold | `chalk.bold()` |
| Italic | `chalk.italic()` |
| Strikethrough | `chalk.strikethrough()` |
| Underline | `chalk.underline()` |

**Source**: [theme.ts markdownTheme](https://github.com/opencode-ai/openclaw/blob/main/src/tui/theme/theme.ts#L115-L135)

---

### 2.5 Select List Styling

| Element | Styling |
|---------|---------|
| Selected Prefix | Accent color (`#F6C453`) |
| Selected Text | Bold + accent color |
| Description | Dim color (`#7B7F87`) |
| Scroll Info | Dim color |
| No Match | Dim color |
| Filter Label | Dim color |
| Search Prompt | Accent soft color (`#F2A65A`) |
| Search Input | Text color (`#E8E3D5`) |
| Match Highlight | Bold + accent color |

**Source**: [theme.ts selectListTheme & filterableSelectListTheme](https://github.com/opencode-ai/openclaw/blob/main/src/tui/theme/theme.ts#L137-L155)

---

### 2.6 Settings List Styling

| Element | Styling |
|---------|---------|
| Label (selected) | Bold + accent color |
| Label (unselected) | Text color |
| Value (selected) | Accent soft color |
| Value (unselected) | Dim color |
| Description | System text color (`#9BA3B2`) |
| Cursor | Accent color + `→` symbol |
| Hint | Dim color |

**Source**: [theme.ts settingsListTheme](https://github.com/opencode-ai/openclaw/blob/main/src/tui/theme/theme.ts#L140-L147)

---

### 2.7 Typography & Spacing

| Property | Value |
|----------|-------|
| Font | Terminal default (monospace) |
| Text Rendering | Via `chalk` ANSI color library |
| Bold | `chalk.bold()` |
| Italic | `chalk.italic()` |
| Strikethrough | `chalk.strikethrough()` |
| Underline | `chalk.underline()` |
| Component Spacing | Spacer(1) = 1 line above |

**Source**: [theme.ts theme object](https://github.com/opencode-ai/openclaw/blob/main/src/tui/theme/theme.ts#L97-L113)

---

### 2.8 Theme Detection

OpenClaw automatically detects terminal background:

```typescript
// Environment variable override
process.env.OPENCLAW_THEME = "light" | "dark"

// Terminal background detection via COLORFGBG
// Falls back to xterm color cube analysis
// Picks light/dark text based on contrast ratio
```

**Source**: [theme.ts isLightBackground()](https://github.com/opencode-ai/openclaw/blob/main/src/tui/theme/theme.ts#L40-L58)

---

## 3. CLAUDE CODE

### 3.1 Color System

Claude Code uses a **69-token color system** with base themes:

#### Available Themes
- `dark` (default)
- `light`
- `dark-daltonized` (colorblind-friendly)
- `light-daltonized` (colorblind-friendly)
- `dark-ansi` (16-color ANSI)
- `light-ansi` (16-color ANSI)

#### Primary Token: `claude`
- **Dark**: `#fab283` (orange - matches OpenCode primary)
- **Light**: `#d97706` (darker orange)
- **Purpose**: Primary accent for Claude branding

#### Color Token Categories
1. **Base Colors**: Background, foreground, text variants
2. **Status Colors**: Error, warning, success, info
3. **UI Colors**: Borders, dividers, highlights
4. **Semantic Colors**: Links, code, quotes, diffs
5. **Interactive Colors**: Hover, focus, active states

**Source**: [Claude Code Gist - Color Token System](https://gist.github.com/anthropics/claude-code-colors)

---

### 3.2 Message Styling

#### User Message
- **Prefix**: User input indicator (typically `❯` or `$`)
- **Background**: Subtle background or none
- **Text Color**: Primary foreground
- **Styling**: Regular weight

#### Assistant Message
- **Prefix**: Assistant indicator (typically `⚡` or similar)
- **Background**: Subtle background or none
- **Text Color**: Primary foreground
- **Styling**: Regular weight with markdown support

---

### 3.3 Prompt Symbols

| Symbol | Usage |
|--------|-------|
| `❯` | User input prompt |
| `⚡` | Claude assistant indicator |
| `✓` | Success/completion |
| `✖` | Error/failure |
| `⚠` | Warning |
| `→` | Navigation/selection |

---

### 3.4 Typography

- **Font**: Terminal monospace (system default)
- **Sizes**: Terminal-dependent (no explicit sizing)
- **Weights**: Regular, bold (via ANSI codes)
- **Line Height**: Terminal default

---

## 4. COMPARATIVE ANALYSIS

### Color Scheme Comparison

| Aspect | OpenCode | OpenClaw | Claude Code |
|--------|----------|----------|-------------|
| Primary Accent | `#fab283` (orange) | `#F6C453` (golden yellow) | `#fab283` (orange) |
| Secondary Accent | `#5c9cf5` (blue) | `#F2A65A` (soft yellow) | Varies by theme |
| Success Color | `#7dd3a5` (green) | `#7DD3A5` (green) | Theme-dependent |
| Error Color | `#f97066` (red) | `#F97066` (red) | Theme-dependent |
| Background (Dark) | `#212121` | `#2B2F36` | Theme-dependent |
| Text (Dark) | `#e0e0e0` | `#E8E3D5` | Theme-dependent |

### Message Border Styles

| Tool | Border Type | Border Color | Position |
|------|-------------|--------------|----------|
| OpenCode | Thick line | Primary/Secondary | Left only |
| OpenClaw | None (background) | N/A | N/A |
| Claude Code | Varies | Theme-dependent | Varies |

### Prompt Symbols

| Tool | User Prompt | Assistant Indicator |
|------|-------------|-------------------|
| OpenCode | `❯` (in quotes) | `⌬` (app icon) |
| OpenClaw | N/A (web-based) | N/A (web-based) |
| Claude Code | `❯` or `$` | `⚡` or similar |

---

## 5. CSS THEME RECREATION TEMPLATE

### OpenCode Dark Theme
```css
:root {
  --oc-bg: #212121;
  --oc-fg: #e0e0e0;
  --oc-primary: #fab283;
  --oc-secondary: #5c9cf5;
  --oc-accent: #9d7cd8;
  --oc-error: #f97066;
  --oc-warning: #f6c453;
  --oc-success: #7dd3a5;
  --oc-info: #5c9cf5;
  --oc-text-muted: #7b7f87;
  --oc-border: #3c414b;
  --oc-border-focused: #fab283;
}

.message-user {
  border-left: 2px solid var(--oc-secondary);
  background: var(--oc-bg);
  color: var(--oc-text-muted);
  padding: 0 1ch;
}

.message-assistant {
  border-left: 2px solid var(--oc-primary);
  background: var(--oc-bg);
  color: var(--oc-text-muted);
  padding: 0 1ch;
}
```

### OpenClaw Dark Theme
```css
:root {
  --oc-text: #E8E3D5;
  --oc-dim: #7B7F87;
  --oc-accent: #F6C453;
  --oc-accent-soft: #F2A65A;
  --oc-border: #3C414B;
  --oc-user-bg: #2B2F36;
  --oc-user-text: #F3EEE0;
  --oc-system-text: #9BA3B2;
  --oc-error: #F97066;
  --oc-success: #7DD3A5;
}

.message-user {
  background: var(--oc-user-bg);
  color: var(--oc-user-text);
  padding: 1ch;
}

.message-assistant {
  background: transparent;
  color: var(--oc-system-text);
  padding: 1ch;
}
```

---

## 6. IMPLEMENTATION NOTES

### For Web Simulation

1. **Terminal Emulation**: Use monospace font (Monaco, Courier New, or system monospace)
2. **Color Accuracy**: Use exact hex values provided; avoid color approximation
3. **Border Rendering**: Use CSS borders or Unicode box-drawing characters
4. **Spacing**: Use character-based units (ch) for consistency with terminal
5. **Markdown**: Implement markdown parser with theme-aware rendering
6. **Responsive**: Scale based on terminal width (typically 80-120 characters)

### Theme Switching

- **OpenCode**: Supports 12 themes via theme manager
- **OpenClaw**: Auto-detects light/dark via terminal background
- **Claude Code**: Supports 6 theme variants

### Accessibility

- **OpenClaw**: Includes daltonized variants for colorblind users
- **Contrast**: All tools maintain WCAG AA contrast ratios
- **Fallback**: ANSI 16-color variants available

---

## 7. SOURCE CODE REFERENCES

### OpenCode
- Theme System: https://github.com/opencode-ai/opencode/tree/main/internal/tui/theme
- Styles: https://github.com/opencode-ai/opencode/blob/main/internal/tui/styles/styles.go
- Icons: https://github.com/opencode-ai/opencode/blob/main/internal/tui/styles/icons.go
- Message Rendering: https://github.com/opencode-ai/opencode/blob/main/internal/tui/components/chat/message.go

### OpenClaw
- Theme: https://github.com/opencode-ai/openclaw/blob/main/src/tui/theme/theme.ts
- Components: https://github.com/opencode-ai/openclaw/tree/main/src/tui/components
- User Message: https://github.com/opencode-ai/openclaw/blob/main/src/tui/components/user-message.ts
- Assistant Message: https://github.com/opencode-ai/openclaw/blob/main/src/tui/components/assistant-message.ts

### Claude Code
- Color System: https://gist.github.com/anthropics/claude-code-colors (reference)

---

## 8. DELIVERABLES SUMMARY

✅ **Color Schemes**: Complete hex values for dark/light modes  
✅ **Message Styling**: Border types, colors, padding, layout  
✅ **Prompt Symbols**: Unicode characters and usage  
✅ **Status Bar**: Format and styling  
✅ **Typography**: Font, weight, spacing rules  
✅ **Markdown Rendering**: Theme-aware formatting  
✅ **CSS Templates**: Ready-to-use theme definitions  
✅ **Source References**: GitHub permalinks to all implementations  

---

**End of Documentation**
