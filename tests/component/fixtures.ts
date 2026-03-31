import { test as base, expect } from '@playwright/experimental-ct-react';
import fs from 'node:fs';
import path from 'node:path';
import v8ToIstanbul from 'v8-to-istanbul';
import libCoverage from 'istanbul-lib-coverage';

const RAW_DIR = 'coverage-ct-raw';
// Only collect coverage for our source files, not assets or node_modules
const INCLUDE = (file: string) =>
  file.includes('/src/') &&
  !file.includes('/src/assets/') &&
  !file.includes('node_modules') &&
  !file.includes('/src/components/ui/');

async function fetchSourceMap(url: string): Promise<object | null> {
  try {
    const res = await fetch(url.replace(/\.js(\?.*)?$/, '.js.map'));
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export const test = base.extend<{ collectCoverage: void }>({
  collectCoverage: [
    async ({ page }, use) => {
      if (process.env.COVERAGE) {
        await page.coverage.startJSCoverage({ resetOnNavigation: false });
      }

      await use();

      if (!process.env.COVERAGE) return;

      const entries = await page.coverage.stopJSCoverage();
      const map = libCoverage.createCoverageMap({});

      for (const entry of entries) {
        if (!entry.source) continue;
        const sourceMap = await fetchSourceMap(entry.url);
        if (!sourceMap) continue;

        // Resolve source map paths relative to the Playwright CT cache directory
        const urlPath = new URL(entry.url).pathname;
        const scriptPath = path.join(process.cwd(), 'playwright/.cache', urlPath);

        const converter = v8ToIstanbul(scriptPath, 0, {
          source: entry.source,
          sourceMap: { sourcemap: sourceMap as Parameters<typeof v8ToIstanbul>[2] extends { sourceMap: { sourcemap: infer T } } ? T : never },
        });
        await converter.load();
        converter.applyCoverage(entry.functions);

        for (const [file, data] of Object.entries(converter.toIstanbul())) {
          if (INCLUDE(file)) {
            map.addFileCoverage(data as Parameters<typeof map.addFileCoverage>[0]);
          }
        }
      }

      if (map.files().length > 0) {
        fs.mkdirSync(RAW_DIR, { recursive: true });
        const out = path.join(RAW_DIR, `${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
        fs.writeFileSync(out, JSON.stringify(map.toJSON()));
      }
    },
    { auto: true, scope: 'test' },
  ],
});

export { expect };
