/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { compression } from 'vite-plugin-compression2'

// https://vite.dev/config/
export default defineConfig({
  // Configuration Vitest
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/tests/']
    }
  },
  plugins: [
    react({
      // Fast Refresh optimisé
      fastRefresh: true
    }),
    tailwindcss(),
    // Compression Brotli + Gzip
    compression({
      algorithm: 'gzip',
      threshold: 1024, // Compresser seulement fichiers > 1KB
      deleteOriginalAssets: false
    }),
    compression({
      algorithm: 'brotliCompress',
      threshold: 1024,
      deleteOriginalAssets: false
    })
  ],

  // Optimisations de build
  build: {
    // Code splitting intelligent
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks séparés pour meilleur cache
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
          // Séparer les pages lourdes
          'pages-auth': [
            './src/Pages/Login.jsx',
            './src/Pages/SignUp.jsx',
            './src/Pages/Landing.jsx'
          ],
          'pages-main': [
            './src/Pages/HomePage.jsx',
            './src/Pages/AllCourses.jsx'
          ],
          'pages-course': [
            './src/Pages/Course.jsx',
            './src/Pages/AddCourse.jsx',
            './src/Pages/FichePage.jsx',
            './src/Pages/Quiz.jsx'
          ]
        }
      }
    },
    // Optimisations supplémentaires
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer console.log en prod
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // Supprimer ces fonctions
        passes: 2 // 2 passes de compression
      },
      mangle: {
        safari10: true // Fix Safari 10
      },
      format: {
        comments: false // Supprimer commentaires
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 500, // Warning si chunk > 500KB
    // CSS code splitting
    cssCodeSplit: true,
    // Source maps en production (optionnel - désactiver pour plus de perf)
    sourcemap: false,
    // Target moderne pour bundle plus petit
    target: 'esnext',
    // Optimiser les assets
    assetsInlineLimit: 4096, // Inline assets < 4KB
    // Report compressed size
    reportCompressedSize: true
  },

  // Optimisations serveur dev
  server: {
    port: 5173,
    strictPort: false,
    open: false,
    // HMR optimisé
    hmr: {
      overlay: true
    },
    // Compression dev server
    compress: true,
    // Proxy pour éviter les problèmes de cookies cross-origin en dev
    proxy: {
      '/api': {
        target: 'http://localhost:3070',
        changeOrigin: true,
        secure: false
      }
    }
  },

  // Optimisations preview
  preview: {
    port: 4173,
    strictPort: false,
    open: false,
    compress: true
  },

  // Optimiser les dépendances
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react'
    ],
    // Exclude packages qui ne nécessitent pas de pré-bundling
    exclude: []
  },

  // Performance
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    // Minify identifiers
    minifyIdentifiers: true,
    // Minify syntax
    minifySyntax: true,
    // Minify whitespace
    minifyWhitespace: true,
    // Target moderne
    target: 'esnext'
  }
})
