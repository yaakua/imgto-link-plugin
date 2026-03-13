# FaFaFa-全部发 Reviewer Notes Template (EN)

> Use this in the “Notes for reviewers” field for Chrome Web Store or Edge Add-ons.

## Standard Version

FaFaFa-全部发 is the official browser extension for `fafafa.ai`. It helps users publish content from the mdeditor to multiple platforms only after the user explicitly clicks **Publish**.

How the extension works:

1. The extension runs only on `https://fafafa.ai/*` and supported publishing platforms.
2. Publishing starts only after the user explicitly clicks **Publish** in the editor.
3. Article content is processed locally in the browser by default and is not uploaded to extension-owned servers.
4. The extension does not auto-publish content in the background and does not submit articles without user action.

Permission rationale:

- `scripting`: fill article content into target platform editors
- `cookies`: check whether the user is signed in on supported platforms
- `tabGroups` / `activeTab`: manage tabs opened during the publishing flow
- `debugger`: simulate richer paste behavior on some editors to preserve formatting
- `clipboardRead`: read rich HTML content used in publishing flows
- `storage`: store required local state
- `offscreen` / `declarativeNetRequest`: support compatibility and sign-in related flows

Official pages:

- Install guide: https://fafafa.ai/publish-extension
- Editor entry: https://fafafa.ai/mdeditor

## If asked “Why do you need debugger permission?”

Some rich-text editors require a closer-to-real paste simulation to preserve formatting reliably. This permission is used only when the user explicitly starts a publishing flow. It is not used for general browser debugging, scraping, or background monitoring.

## If asked “Why do you need cookies permission?”

This permission is used only to check whether the user is already signed in to supported publishing platforms, so the flow can avoid failing on login pages. We do not upload cookies or use them for unrelated tracking.
