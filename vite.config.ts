import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Detectar si estamos en producción (Vercel) o local
const backendUrl = process.env.VITE_API_URL || "http://localhost:5000";

export default defineConfig(({ mode }) => ({
  base: "/", // importante para rutas limpias en producción
  server: {
    host: true,
    port: 8080,
    proxy: {
      "/api": {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));



