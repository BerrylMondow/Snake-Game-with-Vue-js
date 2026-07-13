import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0',              // Penting agar bisa diakses dari luar
    port: 5173,
    allowedHosts: ['.ngrok-free.app'],                   // Pastikan sama dengan yang dipakai ngrok
    strictPort: true,
    cors: true,                   // Izinkan akses lintas origin
    hmr: {
      host: 'localhost',         // atau bisa disesuaikan
    },
  }
})
