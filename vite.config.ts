import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.API_BASE_URL_DEV || "https://hgfitaccess-api.onrender.com";

  return {
    plugins: [tailwindcss(), react()],
    resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
    server: {
      // Requests go to /api/... locally and are forwarded as-is, so there is no CORS in dev.
      proxy: { "/api": { target, changeOrigin: true, secure: true } },
    },
    build: {
      // The ECharts chunk (~525 kB) is only loaded by chart pages, never on first paint.
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
          },
        },
      },
    },
  };
});
