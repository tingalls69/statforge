'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const swPath = path.join(root, 'sw.js');
const indexPath = path.join(root, 'index.html');
const source = fs.readFileSync(swPath, 'utf8');
const setup = source.split("self.addEventListener('install'")[0] + '\nglobalThis.__ASCENDRY_ASSETS = ASSETS;';
const sandbox = { importScripts() {}, encodeURIComponent, globalThis: {} };
vm.runInNewContext(setup, sandbox, { filename: 'sw.js' });
const assets = sandbox.globalThis.__ASCENDRY_ASSETS || [];

function clean(asset) {
  return String(asset).split('?')[0].replace(/^\.\//, '');
}

const missing = [];
for (const asset of assets) {
  const relative = clean(asset);
  if (!relative) continue;
  if (!fs.existsSync(path.join(root, relative))) missing.push(relative);
}

const index = fs.readFileSync(indexPath, 'utf8');
const versionSource = fs.readFileSync(path.join(root, 'js', 'version.js'), 'utf8');
const packageVersion = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const runtimeVersion = versionSource.match(/SF_VERSION\s*=\s*["']([^"']+)/)?.[1];
const workerVersion = source.match(/const VERSION\s*=\s*["']([^"']+)/)?.[1];
const queryVersions = [...index.matchAll(/\?v=([0-9.]+)/g)].map(match => match[1]);
const inconsistentVersions = [...new Set([runtimeVersion, workerVersion, packageVersion, ...queryVersions].filter(Boolean))];
const indexAssets = [...index.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map(match => clean(match[1]))
  .filter(value => value && !value.startsWith('http'));
const cached = new Set(assets.map(clean));
const uncached = indexAssets.filter(asset => !cached.has(asset));

const textFiles = [];
function collectText(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory() && !['.git', 'node_modules'].includes(entry.name)) collectText(target);
    else if (entry.isFile() && /\.(?:html|js|css|json|md|webmanifest)$/.test(entry.name)) textFiles.push(target);
  }
}
collectText(root);
const corpus = textFiles.filter(file => file !== swPath).map(file => fs.readFileSync(file, 'utf8')).join('\n');
const indexSet = new Set(indexAssets);
const unreferencedRuntime = assets
  .map(clean)
  .filter(asset => /^(?:js|css)\//.test(asset) && !indexSet.has(asset))
  .filter(asset => !corpus.includes(asset));

const errors = [];
if (inconsistentVersions.length !== 1) errors.push(`Version mismatch: ${inconsistentVersions.join(', ')}`);
if (missing.length) errors.push(`Missing cached files:\n- ${[...new Set(missing)].join('\n- ')}`);
if (uncached.length) errors.push(`Index assets absent from the service-worker cache:\n- ${[...new Set(uncached)].join('\n- ')}`);
if (unreferencedRuntime.length) errors.push(`Cached JS/CSS with no static or dynamic source reference:\n- ${[...new Set(unreferencedRuntime)].join('\n- ')}`);

if (errors.length) {
  console.error(errors.join('\n\n'));
  process.exit(1);
}

console.log(`Validated ${assets.length} service-worker assets and ${indexAssets.length} index references.`);
