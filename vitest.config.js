import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      './test/alltests/apigateway.test.js',
      './test/alltests/challenges-api.test.js',
      './test/alltests/shop-api.test.js',
    ], 
    exclude: [
      '**/node_modules/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      all: true,
      include: ['src/**/*.{js,ts}'],
      exclude: ['**/node_modules/**'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});