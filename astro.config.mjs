import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Astro 5: static mode supports SSR routes (used by Keystatic)
  output: 'static',
  adapter: cloudflare({
    routes: {
      // Include keystatic routes for SSR
      include: ['/keystatic/*', '/api/keystatic/*'],
    },
  }),
  integrations: [
    react(),
    tailwind(),
    keystatic(),
  ],
});
