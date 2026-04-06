import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: [
      'app/javascript/bot_execution/**/*.test.js',
      'app/javascript/editorV2/**/*.test.js',
      'app/javascript/gameplay/**/*.test.js'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'app/javascript/bot_execution/**/*.js',
        'app/javascript/editorV2/**/*.js',
        'app/javascript/gameplay/**/*.js'
      ],
      exclude: ['**/*.test.js', '**/node_modules/**']
    }
  },
  resolve: {
    alias: {
      editorV2: "/app/javascript/editorV2",
      gameplay: "/app/javascript/gameplay",
      bot_execution: "/app/javascript/bot_execution"
    }
  }

});
