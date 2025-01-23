import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    silent: true,
    clearMocks: true,
    outputTruncateLength: 0,
    reporters: ['default'],
    include: [
      './test/alltests/Apigateway.test.js',
      './test/alltests/Challenges-api.test.js'
    ], 
    exclude: [
      '**/node_modules/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      all: true,
      include: ['src/**/*.js'],
      exclude: ['**/node_modules/**', '**/Apigateway.test.js'],
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