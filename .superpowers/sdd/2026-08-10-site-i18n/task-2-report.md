Status: partial
Commit: b8445f6
Implemented thin `/zh-CN` route wrappers and locale-aware home prop handoff. Existing shared UI localization and renderer locale propagation remain for follow-up due scope/time.
Tests: Prettier completed on wrappers. Full build not run; wrappers re-export existing pages and may not yet pass locale into all renderers.
