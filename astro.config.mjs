// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  integrations: [
    react({
      // Configuration React corrigée pour éviter l'erreur preamble
      include: ["**/*.tsx", "**/*.jsx"],
      experimentalReactChildren: true,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    // Configuration pour éviter les erreurs de preamble
    define: {
      __DEV__: true,
    },
    optimizeDeps: {
      include: ["react", "react-dom"],
    },
    server: {
      hmr: {
        overlay: false, // Désactive l'overlay d'erreur pour éviter les conflits
      },
    },
  },
  site: "https://idrissa183.github.io",
  // base: '/ecowatch.com',
  outDir: "./dist",

  // Configuration pour servir les fichiers statiques correctement
  publicDir: "public",

  // Configuration de build pour éviter les erreurs
  build: {
    assets: "_astro",
    rollupOptions: {
      output: {
        entryFileNames: "_astro/[name].[hash].js",
        chunkFileNames: "_astro/[name].[hash].js",
        assetFileNames: "_astro/[name].[hash][extname]",
      },
    },
  },
});
