import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from "rollup-plugin-visualizer"
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), visualizer({ open: true })],
  resolve: {
    alias: {
      '@': path.resolve('./src') // @替代src
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3838",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/public': {
        target: 'http://127.0.0.1:3838',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://127.0.0.1:3838',
        ws: true,
        changeOrigin: true
      }
    },
  }
})
