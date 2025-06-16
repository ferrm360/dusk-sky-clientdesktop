import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  root: 'src/presentation',
  base: './',
  plugins: [react()],
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@business': resolve(__dirname, 'src/business'),
      '@data': resolve(__dirname, 'src/data-access'),
    },
  },
  server: {
    proxy: {
      '/auth': {
        target: 'http://auth.local',
        changeOrigin: true,
        secure: false,
      },
      '/comments': {
        target: 'http://commentservice.local',
        changeOrigin: true,
        secure: false,
      },
      '/friendships': {
        target: 'http://friendship.local',
        changeOrigin: true,
        secure: false,
      },
      '/lists': {
        target: 'http://gamelistservice.local',
        changeOrigin: true,
        secure: false,
      },
      '/api/game': {
        target: 'http://games.local',
        changeOrigin: true,
        secure: false,
      },
      '/moderation': {
        target: 'http://moderationservice.local',
        changeOrigin: true,
        secure: false,
      },
      '/reviews': {
        target: 'http://review.local',
        changeOrigin: true,
        secure: false,
      },
      '/profiles': {
        target: 'http://usermanager.local',
        changeOrigin: true,
        secure: false,
      },
      '/api/trackings': {
        target: 'http://usergametracking.local',
        changeOrigin: true,
        secure: false,
      },

    },
  },
})
