import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/dist/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp,woff,woff2,ttf,eot}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            urlPattern: /^\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
              networkTimeoutSeconds: 2,
            },
          },
          {
            urlPattern: /^\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pages',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
            },
          },
        ],
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: "Deegaan Restaurant",
        short_name: "Deegaan",
        start_url: "/",
        display: "standalone",
        background_color: "#0b0f12",
        theme_color: "#0b0f12",
        orientation: "portrait",
        scope: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      // Disable splash screen generation
      includeAssets: false,
      strategies: 'generateSW'
    })
  ],
  build: {
    outDir: 'public/dist',
    rollupOptions: {
      input: 'resources/js/main.js'
    }
  },
  server: {
    host: true,
    port: 5173,
    hmr: {
      host: 'localhost'
    }
  }
})
