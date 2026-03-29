import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Met à jour l'app en silence quand le réseau revient
      includeAssets: ['icon.svg', 'icon.png'], 
      manifest: {
        name: 'IMPERIUM',
        short_name: 'IMPERIUM',
        description: 'QG de Gestion Stratégique',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone', // Pour s'afficher comme une vraie app native
        orientation: 'portrait',
        icons: [
          {
            src: '/icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        // On met TOUT le code en cache (JS, CSS, HTML, Images) pour survivre hors-ligne
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], 
        runtimeCaching: [
          {
            // On force la sauvegarde des polices d'écriture
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 an
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
})