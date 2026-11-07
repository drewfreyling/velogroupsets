import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.SITE_URL || 'http://localhost:4321';
export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  vite: { plugins: [tailwindcss()], build: { assetsInlineLimit: 0 } },
});
