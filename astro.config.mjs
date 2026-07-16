import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind'; // O el adaptador que tengas

export default defineConfig({
  // ... tus integraciones si las tienes
  integrations: [tailwind()],

  vite: {
    server: {
      allowedHosts: [
        '.loca.lt',                  // Esto permite CUALQUIER subdominio de localtunnel
        'dull-onions-own.loca.lt'    // Por si acaso, tu dominio actual exacto
      ]
    }
  }
});