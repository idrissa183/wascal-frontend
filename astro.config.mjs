// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // server: {
  //   port: 3000,
  // },

  devToolbar: {
    enabled: false,
  },
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  },
  site: 'https://idrissa183.github.io',
  base: '/wascal-frontend',
  outDir: './dist'
});