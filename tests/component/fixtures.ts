import { test as base, expect } from '@playwright/experimental-ct-react';
import fs from 'node:fs';
import path from 'node:path';

const RAW_DIR = 'coverage-ct-raw';

export const test = base.extend<{ collectCoverage: void }>({
  collectCoverage: [
    async ({ page }, use) => {
      await use();
      if (!process.env.COVERAGE) return;
      const coverage = await page.evaluate(
        () => (window as unknown as { __coverage__: unknown }).__coverage__ ?? null,
      );
      if (coverage) {
        fs.mkdirSync(RAW_DIR, { recursive: true });
        const file = path.join(RAW_DIR, `${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
        fs.writeFileSync(file, JSON.stringify(coverage));
      }
    },
    { auto: true, scope: 'test' },
  ],
});

export { expect };
