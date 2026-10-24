import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    passWithNoTests: true,
    fileParallelism: false,
    testTimeout: 15000,
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
  },
});
