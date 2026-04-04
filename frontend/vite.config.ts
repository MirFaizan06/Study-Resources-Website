import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Inject abstracts for any remaining .module.scss files (e.g. Board, Admin pages)
        additionalData: (source: string) => {
          const abs = path.resolve(__dirname, 'src/styles/abstracts').replace(/\\/g, '/')
          return `@import "${abs}/functions";@import "${abs}/variables";@import "${abs}/mixins";\n${source}`
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'motion': ['framer-motion'],
          'icons': ['lucide-react'],
        },
      },
    },
  },
})
