import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@renderer': resolve('src/renderer/src'),
      '@shared': resolve('src/shared')
    }
  },
  // Match the app build (@vitejs/plugin-react), which uses the automatic JSX
  // runtime — component files render JSX without importing React, and their
  // tests should not have to either.
  esbuild: { jsx: 'automatic' },
  test: {
    // Required for @testing-library/react's automatic per-test cleanup, which
    // registers itself on a global afterEach.
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.d.ts', '**/__tests__/**', 'src/preload/**', '**/*.config.*'],
      // Global floors — ratcheted to just under current coverage so the suite
      // guards against regression rather than setting an aspiration. The bulk
      // of the untested surface is the UI layer (components/pages), which is
      // covered by the Playwright specs in e2e/ instead. Raise these as the
      // zustand stores pick up unit tests.
      thresholds: {
        statements: 27,
        branches: 19,
        functions: 17,
        lines: 28
      }
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: [
            'src/main/**/__tests__/**/*.test.ts',
            'src/shared/**/__tests__/**/*.test.ts',
            'src/renderer/src/lib/__tests__/**/*.test.ts',
            'scripts/**/*.test.mjs'
          ]
        }
      },
      {
        extends: true,
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          include: [
            'src/renderer/src/__tests__/**/*.test.{ts,tsx}',
            'src/renderer/src/{components,pages,hooks,store}/**/__tests__/**/*.test.{ts,tsx}'
          ],
          setupFiles: ['./src/renderer/src/__tests__/setup/vitest.setup.ts']
        }
      }
    ]
  }
})
