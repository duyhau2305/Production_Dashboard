import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 8686,
    strictPort: true,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl-certs/private-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl-certs/certificate.crt'))
    },
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://192.168.1.4:5001',
        changeOrigin: true,
        secure: true, // Chỉ dùng trong môi trường phát triển
      }
    }
  },
  assetsInclude: ['**/*.xlsx'],
})
