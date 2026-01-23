import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Static output with server routes for Keystatic admin (hybrid behavior is now default)
  output: 'static',
  adapter: cloudflare(),
  integrations: [
    react(),
    tailwind(),
    keystatic(),
  ],
});
