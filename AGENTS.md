# AlohaYo blog agent notes

## Language and content

- English is the default locale (`en`) and existing unprefixed URLs must keep working.
- The site also supports Simplified Chinese (`zh-CN`) under `/zh-CN/...`. The switch is the `文/A` button in the header and persists `alohayo:locale`.
- Add UI copy to both dictionaries in `lib/i18nMessages.ts` by default. Keep the English value identical to the existing English UI unless the user asks for a wording change.
- Blog prose is not translated automatically. When adding a blog, ask whether a Chinese sibling is wanted; if yes, create `<slug>_cn.mdx`. It is published at `/zh-CN/blog/<slug>/`. Without a sibling, the Chinese detail route falls back to the English URL.
- For explicit provenance, use `locale`, a shared `translationKey`, and `translationKind: original | ai-translation | bilingual`. AI translations also set `translationSourceLocale` (`en` or `zh-CN`); the detail page then links to that source. Legacy posts continue to infer locale and pairing from `_cn` filenames. Bilingual posts intentionally render no AI-translation label.
- The Chinese About page is `data/authors/default_cn.mdx`; keep `data/authors/default.mdx` as the English source.
- Do not add `_cn` posts to English aggregate lists, search, tags, RSS, or sitemap. Use the helpers in `lib/blogI18n.ts`.

## Live2D

- The blog loads a pinned commit of `GarfieldZHU/live2d-widget` from jsDelivr. Update the immutable hash in `app/layout.tsx` when the widget repo changes.
- The widget uses `waifu-tips.json` for Chinese and `waifu-tips.en.json` for English, and listens for `alohayo:locale-change`.

## Verification

- Run `node --test scripts/i18n.test.mjs scripts/blog-i18n.test.mjs` and `yarn build` after locale/content changes.
- Check both an English URL and its `/zh-CN/` counterpart in the deployed browser. If a temporary translated fixture is used, remove it before the final commit and verify the fallback again.
