# Install StatForge on iPhone

A Home Screen web app must be opened from an HTTPS website; an unzipped local file cannot register a service worker on iPhone.

## Free hosting option: GitHub Pages

1. Create a free GitHub account and a new repository named `statforge`.
2. Upload the **contents** of this folder to the repository root.
3. Open repository **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, then select `main` and `/ (root)`.
5. Open the generated `https://YOUR-NAME.github.io/statforge/` address in Safari.
6. Tap **Share → Add to Home Screen → Add**.

## Updating

Replace files in the repository. StatForge's service worker updates its cache when the web app next loads. Your browser data remains local on the device unless site data is cleared.

## Moving progress between devices

On the old device, open **Settings → Export Save**. Move the JSON file to the new device, then use **Import Save**. Photos and the character portrait deliberately remain only on the original device.
