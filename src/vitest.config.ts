import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: ['./src/vitest-global-setup.ts'],
    fileParallelism: false,
    testTimeout: 120000,
  },
});
