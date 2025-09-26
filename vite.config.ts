import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: [
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-alert-dialog'
          ],
          charts: [
            '@nivo/bar',
            '@nivo/line', 
            '@nivo/pie',
            '@nivo/core',
            'recharts'
          ],
          maps: [
            'leaflet',
            'react-leaflet',
            '@react-leaflet/core',
            'leaflet.heat'
          ],
          animation: [
            'framer-motion',
            'motion'
          ],
          utils: [
            'lodash',
            'clsx',
            'class-variance-authority',
            'tailwind-merge'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    hmr: true,
    fs: {
      allow: ['..']
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'leaflet',
      'react-leaflet'
    ],
    exclude: [
      '@nivo/bar',
      '@nivo/line',
      '@nivo/pie'
    ]
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
})
