import { fileURLToPath, URL } from 'node:url'
 
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'
 
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
 
    VitePWA({
      registerType: 'autoUpdate',
 
      manifest: {
        name: 'PWA PROYECTO ESCUELA',
        short_name: 'PPE',
        description: 'Aplicacion web progresiva hecha en la uni',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#333aa2',
        lang: 'es',
 
        icons: [
          {
            src: 'images/icons/BTS.jpg',
            sizes: '128x128',
            type: 'image/jpeg',
          },
          {
            src: 'images/icons/BTS.jpg',
            sizes: '128x128',
            type: 'image/jpeg',
          }
        ]
      }
    }),
 
    vueDevTools(),
  ],
 
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})