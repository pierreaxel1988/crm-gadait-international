
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['@radix-ui/react-toast', '@radix-ui/react-tabs', '@radix-ui/react-aspect-ratio'],
          'forms': ['react-hook-form', '@hookform/resolvers'],
          'supabase': ['@supabase/supabase-js'],
          'query': ['@tanstack/react-query'],
          'charts': ['recharts'],
          'utils': ['date-fns', 'clsx', 'tailwind-merge'],
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', 'sonner', '@supabase/supabase-js']
  },
  define: {
    // Add runtime compilation time to track app version/build time
    '__APP_BUILD_TIMESTAMP__': JSON.stringify(new Date().toISOString())
  }
}));
