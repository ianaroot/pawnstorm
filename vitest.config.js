import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config';

const appJavascriptPath = fileURLToPath(new URL('./app/javascript', import.meta.url))

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./app/javascript/vitest.setup.js'],
    include: [
      'app/javascript/bot_execution/**/*.test.js',
      'app/javascript/editorV2/**/*.test.js',
      'app/javascript/gameplay/**/*.test.js',
      'app/javascript/tour/**/*.test.js'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'app/javascript/bot_execution/**/*.js',
        'app/javascript/editorV2/**/*.js',
        'app/javascript/gameplay/**/*.js',
        'app/javascript/tour/**/*.js'
      ],
      exclude: ['**/*.test.js', '**/node_modules/**']
    }
  },
  resolve: {
    alias: {
      editorV2: `${appJavascriptPath}/editorV2`,
      gameplay: `${appJavascriptPath}/gameplay`,
      bot_execution: `${appJavascriptPath}/bot_execution`,
      tour: `${appJavascriptPath}/tour`
    }
  }

});
