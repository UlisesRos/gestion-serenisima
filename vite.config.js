import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      
      // Service Worker con Workbox
      workbox: {
        // Cachear todos los assets del build
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        
        // Estrategias de caché para las rutas de la API
        runtimeCaching: [
          {
            // Caché para devoluciones - Network First (intenta red, fallback a caché)
            urlPattern: ({ url }) => url.pathname.startsWith('/api/devoluciones'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'devoluciones-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 días
              },
              networkTimeoutSeconds: 5,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Caché para coberturas - Network First
            urlPattern: ({ url }) => url.pathname.startsWith('/api/coberturas'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'coberturas-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              networkTimeoutSeconds: 5,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Health check - Network Only (no cachear)
            urlPattern: ({ url }) => url.pathname.startsWith('/api/health'),
            handler: 'NetworkOnly',
          },
        ],
      },

      // Manifest de la PWA
      manifest: {
        name: 'Gestión Serenísima',
        short_name: 'Serenísima',
        description: 'Gestión de devoluciones y coberturas de La Serenísima',
        theme_color: '#4caf50',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'es-AR',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',  
          },
        ],
      },
    }),
  ],
});