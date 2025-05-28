import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Detectar si estamos en producción (Vercel) o local
const isRender = process.env.RENDER === "true";

export default defineConfig(({ mode }) => ({
  base: "/", // importante para rutas limpias en producción
  server: {
    host: true,
    port: 8080,
    proxy: {
      "/api": {
        target: isRender
          ? "https://appweb-tfg.onrender.com" // BACKEND en Render
          : "http://localhost:5000",          // BACKEND local
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



