
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/petcare-pwa/', // 确保资源路径与 GitHub 仓库名匹配
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        // 关键：确保在 Safari 上不因缓存策略导致无法连接
        clientsClaim: true,
        skipWaiting: true
      },
      manifest: {
        name: '萌宠日记 - 宠物健康助手',
        short_name: '萌宠日记',
        description: '记录宠物的每一刻温情，管理健康与生活。',
        theme_color: '#f97316',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/petcare-pwa/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ]
});
