import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import clerk from '@clerk/astro';
import vercel from '@astrojs/vercel';
import { esES } from '@clerk/localizations';
import { clerkAppearance } from './src/lib/clerk-appearance';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  compressHTML: true,
  image: {
    quality: 70,
  },
  integrations: [
    clerk({
      localization: esES,
      appearance: clerkAppearance,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
