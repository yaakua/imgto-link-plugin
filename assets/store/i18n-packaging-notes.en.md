# FaFaFa-全部发 i18n Packaging Notes (EN)

## What is already implemented

The extension now follows the standard browser-extension i18n structure:

- `manifest.json` uses `__MSG_...__` placeholders
- `default_locale` is set to `en`
- Locales included:
  - `apps/extension/_locales/en/messages.json`
  - `apps/extension/_locales/zh_CN/messages.json`

After rebuilding, the `dist/` folder will include `_locales`.

## Fields Edge / Chrome can usually infer from the package

- Extension name
- Manifest description
- Action title

## Fields you still usually need to fill manually in the store dashboard

- Long description
- Screenshots
- Icons / promotional graphics
- Categories, tags, support links, and other listing fields

## Recommended workflow

1. Rebuild the extension and verify that `dist/_locales/...` exists
2. Upload the new package to Edge / Chrome store dashboards
3. Check whether the name and short description are populated automatically
4. Still paste the long description manually from `assets/store/listing-copy*.md`

## Important note

Simply placing `listing-copy.en.md` or `listing-copy.zh-CN.md` inside the package will not make the store import them as long descriptions.  
Stores primarily read:

- `manifest.json`
- `_locales/*/messages.json`
- and the fields you fill in the store dashboard
