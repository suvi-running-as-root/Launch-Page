import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // IMPORTANT: was probably '/Launch-Page/' before
  build: {
    outDir: 'dist',      // ensure build goes to /dist
    emptyOutDir: true,   // optional: cleans dist before each build
  },
})
