import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    clearMocks: true,
    alias: {
      '@sentry/react': path.resolve(
        rootDir,
        './src/test/mocks/sentry-react.ts',
      ),
    },
    env: {
      VITE_BFF_BASE_URL: 'http://localhost:3002/api',
      VITE_SENTRY_DSN: '',
      VITE_SENTRY_TRACES_SAMPLE_RATE: '0.1',
    },
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'text-summary', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.spec.{ts,tsx}',
        'src/main.tsx',
        'src/test/**',
        'src/types/api-error.ts',
      ],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
  },
});
