import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Hybrid mode: static pages by default, but allows server routes for Keystatic admin
  output: 'hybrid',
  adapter: cloudflare(),
  integrations: [
    react(),
    tailwind(),
    keystatic(),
  ],
});
