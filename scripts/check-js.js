'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const folders = ['js', 'scripts', 'tests'];
const files = [];

function collect(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(target);
    else if (entry.isFile() && target.endsWith('.js')) files.push(target);
  }
}

folders.forEach(folder => collect(path.join(root, folder)));

const failures = [];
for (const file of files.sort()) {
  try {
    new Function(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    failures.push(`${path.relative(root, file)}\n${error.message}`);
  }
}

if (failures.length) {
  console.error(`JavaScript syntax check failed:\n\n${failures.join('\n\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Syntax checked ${files.length} JavaScript files.`);
}
