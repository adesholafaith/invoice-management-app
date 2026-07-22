import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('jspdf')) return 'pdf'
          if (id.includes('html2canvas')) return 'html2canvas'
          if (id.includes('dompurify') || id.includes('purify')) return 'purify'
          if (id.includes('react-icons')) return 'icons'
          if (id.includes('@supabase')) return 'supabase'
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router-dom/')
          ) {
            return 'react'
          }
          return 'vendor'
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
