import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import legacy from "@vitejs/plugin-legacy"
import path from "path"

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ["defaults", "not IE 11"],
      modernTargets: ["chrome >= 61", "safari >= 11"],
      modernPolyfills: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:10000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "es2015",
  },
})
