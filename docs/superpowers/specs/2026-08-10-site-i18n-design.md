# Site-wide English and Chinese localization design

## Objective

Add English and Simplified Chinese support to `alohayo.blog` while keeping English as the default and preserving every existing English URL and English string. A compact `文/A` button beside the theme button switches the locale. Hiding that button through configuration must leave the existing English site fully usable.

The work spans two repositories:

- `GarfieldZHU/alohayo.blog` owns locale routing, shared UI strings, MDX content selection, the About translation, and the Home Terminal messages.
- `GarfieldZHU/live2d-widget` owns the page-wide Live2D dialogue engine and catalog.

Supported locale codes are exactly `en` and `zh-CN`. URLs use the BCP 47 spelling `zh-CN`; file suffixes use `_cn` for author convenience.

## Public URLs

English keeps its current unprefixed URLs:

- `/`
- `/agent/`
- `/about/`
- `/blog/webgpu/`

Chinese UI and translated content use a root locale namespace:

- `/zh-CN/`
- `/zh-CN/agent/`
- `/zh-CN/about/`
- `/zh-CN/blog/webgpu/`

The locale prefix comes before the product area because it applies to the complete site, not only blog posts. Query parameters are not used as locale identity.

The default locale is never auto-detected from the browser for a new visitor. A visitor without saved state sees the current English site. The selected locale is persisted under `alohayo:locale`.

## Header switch and compatibility flag

The header adds one compact `文/A` button immediately beside the theme button. It has an accessible label describing the target locale and remains available in both desktop and mobile header layouts.

`data/siteMetadata.js` gains a typed-equivalent configuration shape:

```js
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'zh-CN'],
  showLocaleSwitch: true,
}
```

When `showLocaleSwitch` is `false`, the button is absent. No English route, link, component, metadata field, Live2D mount, or content lookup depends on the button being rendered. English continues to be the default and all existing functionality remains available.

Switching to Chinese prefixes the current site route. Switching to English strips the prefix. On a blog detail page, the switch first saves `zh-CN` and requests the corresponding Chinese route. That route redirects back to the English URL when no `_cn` document exists, while the saved locale keeps the surrounding client UI Chinese.

## Locale state and dictionaries

The blog adds a small typed locale module modeled on the World Game's existing dictionary approach:

- `LocaleCode` is `'en' | 'zh-CN'`.
- `normalizeLocale` accepts only supported values and falls back to `en`.
- a client provider reads and persists `alohayo:locale` and synchronizes `document.documentElement.lang`.
- locale changes dispatch an `alohayo:locale-change` browser event for the Live2D widget.
- route-prefixed pages set the provider to `zh-CN`; a direct unprefixed visit with no saved preference remains English.

English dictionary values are copied byte-for-byte from the current rendered labels inventoried for this project. This includes navigation, search and theme labels, Home Terminal menus and views, Agent workbench copy, blog lists and post chrome, tags, projects, Game launcher shell, About shell, pagination, footer, and error pages. Chinese values are natural UI translations, not machine-literal wording.

Server-rendered Chinese routes receive the locale explicitly so their headings, dates, metadata, and static content are Chinese before hydration. Client components consume the same locale contract through the provider.

The World Game keeps its current in-page locale controls. They become synchronized with the shared site locale and the current remote `setLocale`/remount fallback remains intact.

## Blog content model and fallback

English source files remain unchanged:

```text
data/blog/webgpu.mdx
```

An optional Chinese sibling uses the `_cn` suffix:

```text
data/blog/webgpu_cn.mdx
```

Contentlayer computes the following fields from the filename:

- `locale`: `en` or `zh-CN`
- `translationKey`: the English slug with `_cn` removed
- `localizedSlug`: the public slug without `_cn`

The English detail route serves English documents only. `_cn` is never exposed as `/blog/webgpu_cn/`.

The Chinese route resolves `translationKey` to the `_cn` document. If it exists, the public URL is `/zh-CN/blog/webgpu/`. If it does not exist, the locale switch returns to or remains on `/blog/webgpu/` and renders the original English MDX; the surrounding client UI may remain Chinese according to the saved locale.

All aggregate content operations use canonical English posts as their base set:

- English home/blog/tag lists never show `_cn` as a duplicate.
- English pagination and previous/next navigation never include `_cn`.
- English search, RSS, tag counts, and sitemap behavior remain unchanged except that `_cn` files are excluded.
- Chinese lists substitute translated title, summary, and route when a sibling exists; otherwise they show the English metadata and English route.
- Chinese sitemap entries and `hreflang` metadata exist only for real `_cn` documents.
- canonical metadata points to the actual public English or Chinese URL.

This rule allows authors to add translations gradually without creating blank Chinese pages.

## About page

The current English `data/authors/default.mdx` remains unchanged. A complete initial translation is added at `data/authors/default_cn.mdx`. `/about/` renders the English document and `/zh-CN/about/` renders the Chinese document. The Chinese file is intentionally ordinary MDX so the user can edit it later without touching routing code.

## Live2D localization

The external widget currently owns its dialogue listeners and Chinese catalog. Localization is implemented at that source rather than by layering competing event listeners in the blog.

The widget keeps `waifu-tips.json` as a backward-compatible Chinese catalog and adds explicit locale catalogs:

- `waifu-tips.zh-CN.json`
- `waifu-tips.en.json`

The English catalog preserves every selector, date/hour range, placeholder such as `{text}` and `{year}`, and scenario count. Its prose is rewritten as natural English in the voice of a cute Japanese maid: playful, slightly teasing, technically aware, and native-sounding rather than literal.

The widget accepts locale-specific catalog paths, exposes a locale-change hook, and listens for `alohayo:locale-change`. Event handlers reference the current catalog so switching locale does not duplicate listeners or require reloading the page. Welcome, idle, hover, click, copy, console, visibility, time, holiday, model, texture, photo, and quit messages follow the active locale.

`autoload.js` derives its asset base from its own script URL instead of pinning an internal older tag. After the widget changes are committed and pushed, the blog pins the widget script to that immutable commit so all widget assets resolve from one revision.

The blog's Home Terminal-specific Live2D hints and dynamic Pokemon messages use the shared blog locale and are translated alongside the external catalog.

Translation work is divided among independent subagents by scenario group. The primary agent validates placeholder parity, selector parity, tone consistency, and the final merged catalogs.

## Search, navigation, metadata, RSS, and sitemap

Locale-aware navigation prefixes Chinese site links and preserves unprefixed English links. Blog links use the translation/fallback rule rather than only string concatenation.

English search and feeds retain their existing public locations. Chinese search data uses `/search.zh-CN.json`, built from the canonical post set with translated metadata substituted when present. `/zh-CN/feed.xml` contains only real Chinese post documents; it does not publish duplicate English fallback items.

Chinese page metadata uses Chinese titles/descriptions, `zh-CN`/`zh_CN` locale values where required, canonical URLs, and English/Chinese alternates when a translation exists. The sitemap includes stable Chinese page routes and real Chinese content routes without exposing `_cn` filenames.

## Tests and validation

Automated tests cover:

- locale normalization and English default behavior;
- saved locale restoration without overwriting an existing `zh-CN` value;
- route prefix add/remove behavior;
- locale-switch visibility controlled by `showLocaleSwitch`;
- blog translation resolution, `_cn` exclusion, and English fallback;
- dictionary key parity between English and Chinese;
- Live2D selector, placeholder, date/hour range, and message-shape parity;
- English output contracts for important existing labels;
- production builds in both repositories.

Browser validation covers desktop and mobile header placement, persistence across reloads, English and Chinese Home/Agent/About/Game/blog chrome, World Game synchronization, Live2D English/Chinese dialogue scenarios, theme switching, and a missing-blog-translation fallback.

A temporary published pair is used for production route validation:

```text
data/blog/i18n-routing-smoke.mdx
data/blog/i18n-routing-smoke_cn.mdx
```

Both files use `translationTest: true`, an optional Blog frontmatter field. Canonical listing/search/tag/feed selectors exclude test documents while detail routes keep them directly addressable. Independent subagents validate the English and Chinese URLs and locale behavior after deployment. After both validations pass, the pair is deleted, the site is redeployed, and fallback behavior is validated again. No synthetic Chinese blog remains in the final tree.

## Documentation and authoring rules

The blog repository gains an `AGENTS.md` and `docs/i18n.md` that record:

- English is the default and existing English copy must not be rewritten incidentally.
- every new UI string requires both `en` and `zh-CN` entries;
- agents adding content must ask whether a translation is wanted when the request does not specify it;
- blog translations use `<slug>_cn.mdx` and publish at `/zh-CN/blog/<slug>/`;
- missing translations fall back to English rather than generating placeholder content;
- About translations use `default.mdx` and `default_cn.mdx`;
- Live2D dialogue catalogs must retain selector and placeholder parity;
- required tests and browser checks for locale-related changes.

The Live2D repository documentation records the locale catalog schema, runtime locale API/event, compatibility behavior, build command, and parity test.

## Delivery sequence

1. Add failing tests for the blog locale contract.
2. Implement the shared locale state, dictionaries, route helpers, and header switch.
3. Localize site UI and add Chinese route wrappers.
4. Add Contentlayer translation identity and blog routing/fallback behavior.
5. Add the Chinese About document.
6. Translate and localize the Live2D widget with subagent assistance, then pin the blog to its committed revision.
7. Add repository authoring documentation.
8. Deploy the temporary translated blog pair and run independent English/Chinese browser validation.
9. Delete the temporary pair, redeploy, and validate final fallback and English regression behavior.
10. Push the verified final commits to the default branches of both repositories.
