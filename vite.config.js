import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/little-guys/',
  server: {
    // Honour PORT when something else already holds the default, so a second
    // dev server can run alongside one that is already up.
    port: Number(globalThis.process?.env?.PORT) || 5173,
  },
})