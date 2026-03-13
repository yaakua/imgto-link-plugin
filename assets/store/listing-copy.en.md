# FaFaFa-全部发 Store Listing Copy (EN)

## Extension Name
FaFaFa-全部发

## Store Summary (Short Description)
Publish from fafafa.ai mdeditor to multiple platforms with one click, while checking login state and preserving formatting where possible.

## Optional Taglines
- Write once, publish to multiple platforms
- Start publishing directly from fafafa.ai
- Detect signed-in accounts and automate the repetitive steps

## Optional Keywords
markdown, publishing, cross-posting, multiposting, browser extension, creators, fafafa.ai, WeChat, Xiaohongshu, Juejin, CSDN

## Long Description
FaFaFa-全部发 is the official browser extension for fafafa.ai, built for creators who need to distribute one Markdown article across multiple publishing platforms.

After installation, open fafafa.ai mdeditor, click **Publish**, detect signed-in platform accounts, choose your targets, and let the extension open platform editors and fill content automatically.

Key capabilities:
- Write once, distribute to multiple platforms
- Detect platform login state automatically
- Bridge rich HTML, Markdown, and WeChat-ready content
- Preserve formatting as much as possible to reduce manual cleanup
- Run locally in the browser without sending article content through extension-owned relay servers

Typical use cases:
- Technical blog cross-posting
- Content operation and distribution workflows
- Draft syncing for WeChat Official Accounts, Xiaohongshu, Juejin, CSDN, and more

## Reviewer Notes
- The extension runs only after the user explicitly clicks Publish
- Article content is processed locally in the browser by default
- Site access is limited to fafafa.ai and supported publishing platforms for sign-in checks, opening editors, and filling content
- If requested during review, clarify that `debugger` and `clipboardRead` are used to preserve formatting and support richer editor automation on some sites

## Permission Notes
- `scripting`: inject content into target editors
- `cookies`: check platform login status
- `tabGroups` / `activeTab`: manage tabs opened during automated publishing
- `debugger`: simulate paste behavior on platforms that require richer editor automation
- `clipboardRead`: read rich HTML from the clipboard for publishing flows
- `storage`: cache required local state
- `offscreen` / `declarativeNetRequest`: support platform-specific login detection and compatibility logic

## Privacy Summary
- No personal data collection
- No article content upload to extension-owned servers
- Access target platforms only when the user explicitly starts a publishing flow

## Initial Release Notes
- Add one-click publishing from fafafa.ai mdeditor
- Add in-editor platform detection and selection
- Rebrand to FaFaFa-全部发
- Improve permission scoping and installation guidance for store submission
