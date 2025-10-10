import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react', 'react-hot-toast'],
          supabase: ['@supabase/supabase-js'],
          utils: ['axios', 'papaparse', '@faker-js/faker'],
        },
      },
    },
  },

  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  },
});
