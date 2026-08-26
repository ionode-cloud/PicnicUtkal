import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // Pre-compress all build assets with gzip (.gz files)
    // Nginx can serve these directly — zero CPU cost at request time
    compression({
      algorithm: 'gzip',
      exclude: [/\.(png|jpg|jpeg|gif|webp|ico|svg)$/], // images compressed separately
      threshold: 1024, // only compress files > 1KB
    }),

    // Also pre-compress with Brotli (.br files) — 15-20% better than gzip
    // Nginx will serve .br to browsers that support it (all modern mobile browsers)
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(png|jpg|jpeg|gif|webp|ico|svg)$/],
      threshold: 1024,
    }),
  ],

  resolve: {
    preserveSymlinks: true,
  },

  optimizeDeps: {
    include: ['socket.io-client']
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5300',
        changeOrigin: true
      }
    }
  },

  build: {
    // Enable CSS code splitting — each page only loads its own CSS
    cssCodeSplit: true,

    // Source maps in production help with debugging without impacting perf
    // (browsers only download them when DevTools is open)
    sourcemap: false,

    rollupOptions: {
      output: {
        // Split vendor chunks for better long-term caching
        // Returning mobile users only re-download changed chunks
        manualChunks: (id) => {
          // Core React — changes rarely, aggressively cached
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'react-vendor'
          }
          // Framer Motion — large, isolated
          if (id.includes('node_modules/framer-motion')) return 'motion'
          // Recharts — large, only used in admin
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) return 'charts'
          // Leaflet / Map — large, only used on map pages
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) return 'map'
          // React Query — shared state management
          if (id.includes('node_modules/@tanstack/react-query')) return 'query'
          // Swiper — hero/gallery slider
          if (id.includes('node_modules/swiper')) return 'swiper'
          // React Icons — large icon set
          if (id.includes('node_modules/react-icons')) return 'icons'
          // Socket.IO client — real-time events
          if (id.includes('node_modules/socket.io-client') || id.includes('node_modules/engine.io-client')) return 'socket'
        },

        // Use content-hash filenames for long-term caching
        // Nginx can set 1-year cache on these — mobile browsers cache perfectly
        chunkFileNames:  'assets/[name]-[hash].js',
        entryFileNames:  'assets/[name]-[hash].js',
        assetFileNames:  'assets/[name]-[hash][extname]',
      }
    },

    // Increase warning threshold (Leaflet + map are legitimately large)
    chunkSizeWarningLimit: 1000,
  }
})
