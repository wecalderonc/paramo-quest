/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

/** En GitHub Pages la app vive en /paramo-quest/ (nombre del repo). */
const base =
  process.env.GITHUB_PAGES === "true" ? "/paramo-quest/" : "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        id: base,
        name: "Páramo Quest",
        short_name: "PáramoQuest",
        description:
          "Seguimiento gamificado del plan de carrera geoespacial/NbS",
        lang: "es",
        start_url: base,
        scope: base,
        display: "standalone",
        background_color: "#0a120d",
        theme_color: "#0a120d",
        icons: [
          {
            src: `${base}icons/icon-192.png`,
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: `${base}icons/icon-512.png`,
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: `${base}icons/icon-512.png`,
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,json,woff2}"],
      },
    }),
  ],
  test: {
    environment: "node",
  },
});
