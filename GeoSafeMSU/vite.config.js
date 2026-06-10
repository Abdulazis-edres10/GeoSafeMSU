import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// recharts 3.x imports deep CommonJS paths like `es-toolkit/compat/get`.
// Vite's dev dependency optimizer generates a broken interop wrapper for those
// CJS files (`require_isUnsafeProperty is not a function`), crashing the whole
// app to a white screen in dev. We alias each deep import to a tiny ESM shim
// (see vite-shims/es-toolkit-compat/*.mjs) that re-exports the same function
// from the clean `es-toolkit/compat` ESM barrel. Production (rollup) is fine
// either way; this only affects the dev optimizer's resolution.
const shimDir = fileURLToPath(new URL('./vite-shims/es-toolkit-compat/', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^es-toolkit\/compat\/([A-Za-z0-9]+)$/, replacement: shimDir + '$1.mjs' },
    ],
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  optimizeDeps: {
    include: ['es-toolkit/compat'],
  },
})
