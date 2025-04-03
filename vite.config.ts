import { sentryVitePlugin } from "@sentry/vite-plugin";
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sentryVitePlugin({
    org: "pomo-org",
    project: "pomo-app",
    authToken: process.env.SENTRY_AUTH_TOKEN,
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