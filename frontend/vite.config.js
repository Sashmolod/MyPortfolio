import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Определяем среду запуска
const isDockerDev = process.env.DOCKER_DEV === 'true'

// В development (локально) используем localhost, в Docker — сервис backend
const proxyTarget = isDockerDev
  ? 'http://backend:3000'
  : 'http://localhost:3000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
    // HMR: в Docker браузер подключается к localhost на хост-машине (через проброс порта),
    // локально — просто localhost:5173
    hmr: isDockerDev
      ? {
          host: 'localhost',   // адрес с точки зрения БРАУЗЕРА (хост-машина)
          port: 5173,          // проброшенный порт
          protocol: 'ws',
          clientPort: 5173,    // явно указываем порт для WS-клиента в браузере
        }
      : {
          host: 'localhost',
          port: 5173,
          protocol: 'ws',
        },
    fs: {
      allow: ['..'],
    },
    // Filesystem polling для корректной работы HMR внутри Docker
    watch: {
      usePolling: true,
      interval: 100,
    },
    // Разрешаем подключения из внешних сетей (включая браузер на хост-машине)
    allowedHosts: ['all'],
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: '',
        headers: {
          'Accept': '*/*',
        },
      },
      '/uploads': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
