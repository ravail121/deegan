import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Deegaan Restaurant",
        short_name: "Deegaan",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f172a",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"   // ✅ improves Android icon display
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      }
    })
  ],
  server: {
    host: true, // expose to network
    port: 3000, // Match your ngrok port
    allowedHosts: [
      'pangolin-flowing-fox.ngrok-free.app'
    ],
    hmr: {
      host: 'pangolin-flowing-fox.ngrok-free.app',
      protocol: 'wss',
      clientPort: 443
    },
    // Proxy API calls to your Laravel backend (Docker container)
    proxy: {
      '/api': {
        target: 'http://restaurant_api:80', // Docker container name and port
        changeOrigin: true,
        secure: false
      }
    }
  }
})
