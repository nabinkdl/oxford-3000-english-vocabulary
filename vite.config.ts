import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/icon-192.svg', 'icons/icon-512.svg'],
        manifest: {
          name: 'Oxford 3000 English-Nepali Vocabulary',
          short_name: 'Oxford 3000',
          description: 'Interactive vocabulary practice with translations, flashcards, quizzes, and progress tracking.',
          theme_color: '#1A232E',
          background_color: '#FAF7F0',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
            { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          navigateFallback: '/',
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/clients5\.google\.com\/translate_a\/t\/.*/i,
              handler: 'NetworkFirst',
              options: { cacheName: 'translation-cache', expiration: { maxEntries: 300, maxAgeSeconds: 604800 } },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
