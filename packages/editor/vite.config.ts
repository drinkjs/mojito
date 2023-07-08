import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve('./src') // @替代src
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://mojito.drinkjs.com",
        changeOrigin: true,
      },
      '/public': {
        target: 'http://mojito.drinkjs.com',
        changeOrigin: true
      },
    },
  }
})
