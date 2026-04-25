import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config';

const appJavascriptPath = fileURLToPath(new URL('./app/javascript', import.meta.url))

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: [
      'app/javascript/chess_engine/**/*.test.js',
      'app/javascript/bot_execution/**/*.test.js',
      'app/javascript/bot_match/**/*.test.js',
      'app/javascript/replay/**/*.test.js',
      'app/javascript/live_game/**/*.test.js',
      'app/javascript/editorV2/**/*.test.js'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'app/javascript/chess_engine/**/*.js',
        'app/javascript/bot_execution/**/*.js',
        'app/javascript/bot_match/**/*.js',
        'app/javascript/replay/**/*.js',
        'app/javascript/live_game/**/*.js',
        'app/javascript/editorV2/**/*.js'
      ],
      exclude: ['**/*.test.js', '**/node_modules/**']
    }
  },
  resolve: {
    alias: {
      editorV2: `${appJavascriptPath}/editorV2`,
      chess_engine: `${appJavascriptPath}/chess_engine`,
      bot_execution: `${appJavascriptPath}/bot_execution`,
      bot_match: `${appJavascriptPath}/bot_match`,
      replay: `${appJavascriptPath}/replay`,
      live_game: `${appJavascriptPath}/live_game`
    }
  }

});