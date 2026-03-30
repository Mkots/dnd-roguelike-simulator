import { beforeMount, afterMount } from '@playwright/experimental-ct-react/hooks';

export type HooksConfig = Record<string, never>;

beforeMount(async () => {});
afterMount(async () => {});
