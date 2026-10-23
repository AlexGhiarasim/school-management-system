import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    passWithNoTests: true,
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
  },
});

