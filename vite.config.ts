import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const isRender = process.env.RENDER === "true";
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: true,
    port: 8080,
    allowedHosts: ['appweb-tfg-frontend.onrender.com'],
    proxy: {
      "/api": {
        target: isRender
          ? "https://appweb-tfg.onrender.com" 
          : "http://localhost:5000", 
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));


