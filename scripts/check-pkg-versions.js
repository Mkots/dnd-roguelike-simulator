#!/usr/bin/env node
/**
 * Checks that package.json contains no floating version ranges.
 * Forbidden prefixes: ^ ~ * >= > < (and bare "latest"/"next" tags).
 *
 * Run: node scripts/check-pkg-versions.js
 * Exit 0 → all versions are pinned
 * Exit 1 → floating ranges found (prints offenders)
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const FORBIDDEN = /^(\^|~|>=|>|<(?!=)|(?<!\d)\*|latest$|next$|x$)/;

const pkgPath = resolve(process.cwd(), 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

const groups = {
  dependencies: pkg.dependencies ?? {},
  devDependencies: pkg.devDependencies ?? {},
  peerDependencies: pkg.peerDependencies ?? {},
  optionalDependencies: pkg.optionalDependencies ?? {},
};

const offenders = [];

for (const [group, deps] of Object.entries(groups)) {
  for (const [name, version] of Object.entries(deps)) {
    if (FORBIDDEN.test(version.trim())) {
      offenders.push({ group, name, version });
    }
  }
}

if (offenders.length === 0) {
  console.log('✓ All versions are pinned exactly.');
  process.exit(0);
}

console.error('✗ Floating version ranges detected in package.json:\n');
for (const { group, name, version } of offenders) {
  console.error(`  [${group}] ${name}: "${version}"`);
}
console.error(
  '\nPin each version exactly (e.g. "1.2.3" not "^1.2.3").\n' +
  'Run: pnpm list <package> to find the currently installed exact version.',
);
process.exit(1);
