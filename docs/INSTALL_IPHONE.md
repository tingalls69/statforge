# Install StatForge on iPhone

A Home Screen web app must be opened from an HTTPS website; an unzipped local file cannot register a service worker on iPhone.

## Free hosting option: GitHub Pages

1. Create a free GitHub account and a new repository named `statforge`.
2. Upload the **contents** of this folder to the repository root.
3. Open repository **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, then select `main` and `/ (root)`.
5. Open the generated `https://YOUR-NAME.github.io/statforge/` address in Safari.
6. Tap **Share → Add to Home Screen → Add**.

## Updating from Working Copy

1. In Files, replace the old repository contents with the new StatForge folder contents, keeping `index.html` at the repository root.
2. Open Working Copy, review the changed files, commit them, and push to GitHub.
3. Wait for GitHub Pages to finish deploying.
4. Force-close the Home Screen app and reopen it while online. The v1.2 service worker uses a new cache name. If the old version still appears, open the GitHub Pages address once in Safari, refresh it, then reopen the Home Screen icon.

App updates do not erase workout logs, nutrition data, character progress, or drafts because those remain in browser storage on the same site. Clearing Safari website data can erase them, so export a save before major updates.

## Moving progress between devices

On the old device, open **Settings → Export Save**. Move the JSON file to the new device, then use **Import Save**. Photos and the character portrait deliberately remain only on the original device.
