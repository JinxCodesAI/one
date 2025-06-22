import { defineConfig } from "vite";
import deno from "@deno/vite-plugin";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [deno(), react()],
  define: {
    // Expose environment variables to the client
    "import.meta.env.VITE_AI_API_URL": JSON.stringify(
      Deno.env.get("VITE_AI_API_URL") || "http://localhost:8000",
    ),
  },
});
