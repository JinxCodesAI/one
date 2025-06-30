import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import deno from "@deno/vite-plugin";

export default defineConfig({
  plugins: [deno(), react()],
  server: {
    port: 5173, // Changed to avoid conflict with BFF server on 3000
    host: true,
    proxy: {
      // Proxy API calls to the BFF server during development
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    // Ensure proper asset handling for BFF static serving
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  },
  // Remove direct environment variable definitions since we now use BFF
  // The BFF handles all external service communication
});
