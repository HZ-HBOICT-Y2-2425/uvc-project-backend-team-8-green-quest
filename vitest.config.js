// vitest.config.js
import { defineConfig } from 'vitest/config';
 
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',  // Use V8 for coverage collection (you can also use 'c8')
      reporter: ['text', 'html'],  // Report coverage in text and HTML format
      all: true,  // Ensure all files are included, even those not directly tested
      include: ['src/**/*.js'],  // Specify which source files to include in coverage
      exclude: ['**/node_modules/**', '**/test/**'],  // Exclude certain files
      thresholds: {  // Set coverage thresholds (optional)
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