import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from "rollup-plugin-visualizer"
import path from 'path';

const PRO_HOST = "http://mojito.drinkjs.com"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), visualizer({ open: true })],
  resolve: {
    alias: {
      '@': path.resolve('./src') // @替代src
    }
  },
  server: {
    host:"0.0.0.0",
    proxy: {
      "/api": {
        target: PRO_HOST,
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/public': {
        target: PRO_HOST,
        changeOrigin: true
      },
      '/ws': {
        target: PRO_HOST,
        ws: true,
        changeOrigin: true
      }
    },
  }
})
