import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PWA
// - API와 WebSocket은 저장하지 않음
const pwa = VitePWA({
  registerType: 'prompt',
  injectRegister: 'auto',
  includeAssets: [
    'favicon/favicon.ico',
    'favicon/favicon.svg',
    'favicon/favicon-96x96.png',
    'favicon/apple-touch-icon.png',
  ],
  manifest: {
    name: '칼퇴',
    short_name: '칼퇴',
    description: '회의를 제시간에 끝내도록 돕는 회의 도우미',
    lang: 'ko',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#ffffff',
    background_color: '#f5f5f5',
    icons: [
      {
        src: '/favicon/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,ico,mp3}'],
    navigateFallback: '/index.html',
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fastly\.jsdelivr\.net\/gh\/Project-Noonnu\//,
        handler: 'CacheFirst',
        options: {
          cacheName: 'pretendard-fonts',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pwa],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
