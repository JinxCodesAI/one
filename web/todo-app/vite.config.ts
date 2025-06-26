import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import deno from "@deno/vite-plugin";

export default defineConfig({
  plugins: [deno(), react()],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  define: {
    // Define environment variables for the client
    __AI_API_URL__: JSON.stringify(process.env.VITE_AI_API_URL || "http://localhost:8000"),
    __PROFILE_API_URL__: JSON.stringify(process.env.VITE_PROFILE_API_URL || "http://localhost:8080"),
  },
});
