
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'date-fns']
  },
  build: {
    commonjsOptions: {
      include: ['node_modules/**'],
    },
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Placer React et les packages associés dans un chunk séparé
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          // Placer les composants shadcn/ui dans un chunk séparé
          if (id.includes('@/components/ui/')) {
            return 'vendor-ui';
          }
          // Séparer les pages
          if (id.includes('/pages/Pipeline') || id.includes('/components/pipeline/')) {
            return 'pipeline';
          }
          if (id.includes('/pages/Leads') || id.includes('/components/leads/')) {
            return 'leads';
          }
        }
      }
    }
  }
}));
