# FaFaFa-全部发 Final Packaging Checklist (EN)

## 1. Directory to Upload

When submitting to Edge or Chrome stores, upload:

- `apps/extension/dist/`

Do not upload the source directory `apps/extension/` directly.

## 2. Files that must be included

### Core files
- `manifest.json`
- `offscreen.html`

### Build output
- `bundles/background.js`
- `bundles/content.js`
- `bundles/inject.js`
- `bundles/offscreen.js`
- `bundles/platforms/*`

### Icon assets
- `icons/imgtolink_publisher_16.png`
- `icons/imgtolink_publisher_48.png`
- `icons/imgtolink_publisher_128.png`

### i18n resources
- `_locales/en/messages.json`
- `_locales/zh_CN/messages.json`

## 3. Files that do not need to be inside the uploaded package

These are useful for development or store prep, but should not be included in the uploaded zip:

- `assets/store/*`
- `README.md`
- `PRIVACY.md`
- `scripts/*`
- source directory `src/*`
- workspace source `packages/*`

## 4. Pre-upload checks

1. `dist/manifest.json` should contain:
   - `default_locale`
   - `__MSG_extensionName__`
   - `__MSG_extensionDescription__`
2. `dist/_locales/en/messages.json` exists
3. `dist/_locales/zh_CN/messages.json` exists
4. `dist/icons/*` exists
5. `dist/bundles/*` exists

## 5. Recommended packaging flow

1. Run build:
   - `bun run build`
2. Open:
   - `apps/extension/dist`
3. Zip the contents of `dist`
4. Upload the zip to Chrome / Edge store dashboards
