# Home visitor telemetry panel

## Goal

Add a compact, visually native total-views counter at the bottom of the home page. It must use a privacy-friendly third-party image counter, without cookies, scripts, or site-wide placement.

## Chosen approach

Use the `hits.sh` SVG endpoint for `https://alohayo.me` and render it in a small client-safe React component named `VisitorTelemetry`.

The component appears only in `app/Main.tsx`, after the optional All Posts link and newsletter form, immediately before the site footer.

## Visual design

The panel follows the existing home terminal language:

- centered, monospace container with a subtle light/dark border;
- header text: `// VISITOR TELEMETRY`;
- small green status dot and amber `LIVE` indicator;
- a single `hits.sh` flat-square SVG badge, using the dark terminal background, cyan count, and amber label accents already used by `HomeTerminal`;
- responsive width with no horizontal overflow and no motion.

The badge is given meaningful alt text. The surrounding frame is presentational, so a failed badge leaves an unobtrusive panel rather than an error message or layout shift.

## Data flow and privacy

The browser requests the SVG image directly from `hits.sh` when the home page renders. The service counts total views for the canonical `https://alohayo.me` URL. No cookies, identifiers, scripts, API keys, or client-side state are introduced by this implementation.

## Validation

1. Run the existing lint command for the changed component and `app/Main.tsx`.
2. Start the local development server and inspect the home page in both light and dark themes.
3. Verify the panel appears only on `/`, sits below all home content, and remains readable at a narrow mobile width.
4. Confirm the external SVG loads and does not introduce console errors.

## Out of scope

- Per-page analytics, unique-visitor tracking, dashboards, and historical reporting.
- Changes to the global footer or non-home routes.
- Self-hosting or persisting visitor data.
