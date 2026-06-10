import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Определяем среду запуска
const isDockerDev = process.env.DOCKER_DEV === 'true'

// HMR-конфигурация: приоритет у переменных VITE_HMR_*, иначе дефолтные значения
// Используем 'ws' протокол (без токенов, которые могут вызывать ошибки)
const hmrProtocol = process.env.VITE_HMR_PROTOCOL || 'ws'
const hmrHost = process.env.VITE_HMR_HOST || (isDockerDev ? '0.0.0.0' : 'localhost')
const hmrPort = parseInt(process.env.VITE_HMR_PORT, 10) || 5173
const hmrClientPort = parseInt(process.env.VITE_HMR_CLIENT_PORT, 10) || 5173

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
    // HMR-конфигурация для Docker dev режима
    // host должен быть '0.0.0.0' чтобы Vite слушал на всех интерфейсах
    // clientHost в браузере должен быть IP/домен по которому обращается браузер
    hmr: {
      protocol: hmrProtocol,
      host: hmrHost,
      port: hmrPort,
      clientPort: hmrClientPort,
      clientOverlay: true,
    },
    // clientHost переопределяет URL для WebSocket подключения в браузере
    // Когда установлен, игнорирует hmr.host и использует это значение
    clientHost: hmrHost,
    // clientPort переопределяет порт для WebSocket подключения в браузере
    clientPort: hmrClientPort,
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
