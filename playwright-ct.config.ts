import { defineConfig, devices } from '@playwright/experimental-ct-react';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import istanbul from 'vite-plugin-istanbul';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: './tests/component',
  snapshotDir: './tests/component/__snapshots__',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  globalTeardown: './tests/component/coverage-teardown.ts',
  use: {
    trace: 'on-first-retry',
    ctPort: 3100,
    ctViteConfig: {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
      plugins: process.env.COVERAGE
        ? [istanbul({ include: 'src/**', exclude: ['node_modules/**', 'src/components/ui/**'] })]
        : [],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
