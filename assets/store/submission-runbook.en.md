# FaFaFa-全部发 Submission Runbook (EN)

## 1. Before Submission
1. Confirm the extension name: `FaFaFa-全部发`
2. Keep `manifest.json`, README, privacy policy, and store copy aligned
3. Prepare assets:
   - 128x128 icon
   - 3 to 5 store screenshots
   - Optional banner: `promo-1400x560.svg`
4. Prepare copy:
   - Chrome: `listing-copy.zh-CN.md` / `listing-copy.en.md`
   - Edge: `listing-copy.edge.zh-CN.md` / `listing-copy.edge.en.md`
   - Reviewer notes: `reviewer-notes.zh-CN.md` / `reviewer-notes.en.md`

## 2. Chrome Web Store Submission
1. Open the Chrome Web Store Developer Dashboard
2. Upload the packaged extension
3. Fill in name, short description, and long description
4. Upload icon assets and screenshots
5. Fill in privacy and permission explanations
6. Paste the reviewer note template into the reviewer notes field
7. Verify listing links:
   - https://fafafa.ai/publish-extension
   - https://fafafa.ai/mdeditor
8. Submit for review

## 3. Edge Add-ons Submission
1. Open Microsoft Partner Center / Edge Add-ons dashboard
2. Upload the extension package
3. Prefer the `listing-copy.edge.*` files for the store copy
4. Upload the same icon and screenshot set
5. Add reviewer notes with emphasis on:
   - explicit user-triggered behavior
   - local article processing
   - permissions used only for sign-in checks and content filling
6. Submit for review

## 4. If Reviewers Ask About Permissions
- `cookies`: used to detect whether the user is already signed in on supported platforms
- `clipboardRead`: used to read rich HTML content for publishing flows

## 5. Rejection Triage Order
1. Permission rationale is unclear
2. Screenshots do not reflect the real user flow
3. Branding or privacy copy is inconsistent
4. Store links do not match the install guide
5. Reviewer notes do not clearly explain the user-triggered workflow
