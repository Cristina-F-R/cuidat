import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CuidaT · seguimiento de bienestar',
        short_name: 'CuidaT',
        description: 'Seguimiento visual de salud y bienestar.',
        theme_color: '#496580',
        background_color: '#FDFDFD',
        display: 'standalone',
        icons: [{ src: '/cuidat-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
    hmr: {
      host: '127.0.0.1',
    },
  },
})