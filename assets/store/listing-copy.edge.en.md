# FaFaFa-全部发 Edge Add-ons Listing Copy (EN)

## Product Name
FaFaFa-全部发

## Short Description
Publish from fafafa.ai mdeditor to multiple platforms with one click while checking login state and preserving formatting where possible.

## Long Description
FaFaFa-全部发 is the official browser extension for fafafa.ai, built to help creators distribute one Markdown draft across multiple publishing platforms.

After installation, users can open fafafa.ai mdeditor, click **Publish**, detect signed-in platform accounts in the current browser, choose targets, and let the extension open editors and fill content automatically.

### Key Features
- Write once, distribute to multiple platforms
- Detect platform sign-in state automatically
- Bridge rich HTML, Markdown, and WeChat-ready content
- Preserve formatting as much as possible
- Process article content locally in the browser instead of relaying it through extension-owned servers

### Typical Use Cases
- Cross-posting technical articles
- Content operation and distribution workflows
- Draft syncing for WeChat Official Accounts, Xiaohongshu, Juejin, CSDN, and more

## Reviewer Notes
- The extension runs only after the user explicitly clicks Publish
- It does not auto-publish in the background
- Article content is processed locally in the browser by default
- Site permissions are used only for sign-in checks, opening editors, and filling content

## Permission Notes
- `scripting`: inject content into target editors
- `cookies`: check login state on supported platforms
- `tabGroups` / `activeTab`: organize tabs opened during publishing
- `debugger`: simulate paste behavior where richer editor automation is required
- `clipboardRead`: read rich HTML used in publishing flows
- `storage`: cache required local state
- `offscreen` / `declarativeNetRequest`: support compatibility and sign-in checks

## Privacy Summary
- No personal data collection
- No article content upload to extension-owned servers
- Access target platforms only when the user explicitly starts publishing

## Official Pages
- Install guide: https://fafafa.ai/publish-extension
- Editor entry: https://fafafa.ai/mdeditor
