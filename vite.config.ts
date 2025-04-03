import { sentryVitePlugin } from "@sentry/vite-plugin";
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sentryVitePlugin({
    org: "pomo-org",
    project: "javascript-react"
  }), sentryVitePlugin({
    org: "pomo-org",
    project: "javascript-react"
  })],

  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    deps: {
      inline: ['@dnd-kit/core', '@dnd-kit/sortable']
    }
  },

  build: {
    sourcemap: true
  }
})