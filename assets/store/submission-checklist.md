# Imgto.link Publisher Store Submission Checklist

## Branding
- Extension name: `Imgto.link Publisher`
- Short description: official browser extension for one-click multi-platform publishing
- Keep website landing page, manifest, README, privacy policy, and store copy aligned

## Required listing assets
- 128x128 icon
- Small tile / store icon variants if the marketplace requests them
- At least 3 screenshots showing:
  1. mdeditor publish button
  2. in-editor platform selection dialog
  3. publish progress / result state
- Optional promotional banner (see `promo-1400x560.svg`)

## Reviewer-facing notes
- The extension runs only on explicit website + target platform matches
- It does not upload article content to extension-owned servers
- Permissions are used for login detection, opening target editors, and filling content
- `debugger` / clipboard-related permissions should be justified in listing notes if still retained

## Store copy consistency
- Landing page: `https://imgto.link/publish-extension`
- Editor entry: `https://imgto.link/mdeditor`
- Privacy policy: local processing, no analytics, no remote content storage

## Before submitting
- Verify manifest permissions and host matches
- Verify screenshots reflect the current UI and branding
- Verify README / privacy policy do not mention the old COSE brand in user-facing headings
