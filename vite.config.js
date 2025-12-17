import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'wp-plugin/assets',
    emptyOutDir: true,
    assetsDir: '', // Output assets directly to outDir
  },
})
