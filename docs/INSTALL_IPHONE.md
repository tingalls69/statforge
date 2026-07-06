# Install Ascendry on iPhone

Ascendry must be served over HTTPS for Home Screen installation, offline caching, and service-worker updates. Opening an unzipped local file is not enough on iPhone.

## Install a hosted build

1. Open the Ascendry HTTPS address in Safari.
2. Tap **Share**.
3. Choose **Add to Home Screen**.
4. Confirm the name **Ascendry** and tap **Add**.
5. Open Ascendry from the new Home Screen icon once while online so the current offline cache can finish installing.

## Host your own alpha branch with GitHub Pages

1. Open the repository's **Settings → Pages** screen.
2. Choose **Deploy from a branch**.
3. Select the `alpha` branch and `/ (root)` folder.
4. Open the generated Pages address in Safari.
5. Add it to the Home Screen using the steps above.

Use `alpha`, not `main`, for current development builds.

## After an update

1. Open the hosted address in Safari while online.
2. Refresh once.
3. Close and reopen the Home Screen app.

Ascendry versions its service-worker cache. A successful update replaces the older Ascendry cache without deleting the local save.

When a build still appears stale, export the save first, then remove the Home Screen icon and clear only that site's Safari website data before reinstalling. Clearing site data removes local progress.

## Move progress to another device or host

1. On the old installation, open **Settings → Export Save**.
2. Transfer the JSON file to the new device.
3. Install/open Ascendry on the new host.
4. Use **Settings → Import Save**.

Browser storage is tied to the exact site origin, so moving from one host to another requires an export/import even on the same phone.
