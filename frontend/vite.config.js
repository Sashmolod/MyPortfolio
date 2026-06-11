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
    // HMR WebSocket конфигурация:
    // НЕ ставим hmr.host — иначе Vite привязывает WS к 127.0.0.1 внутри контейнера,
    // и Docker маппинг портов его не достаёт. Без host — наследует server.host (0.0.0.0).
    // clientPort говорит браузеру использовать правильный внешний порт.
    hmr: isDockerDev
      ? { clientPort: 5173 }  // браузер → localhost:5173, сервер слушает 0.0.0.0:5173
      : true,                 // локально — стандартное поведение Vite
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
