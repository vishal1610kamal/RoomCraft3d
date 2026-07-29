import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// RoomCraft 3D — Vite config
// Pinned to Vite 6 + @vitejs/plugin-react 4 so the project installs and runs
// cleanly on Node 18 / 20 / 22 (see .nvmrc). The 3D runtime (React 19, three
// r185, R3F 9, drei 10) is independent of the Vite major version.
export default defineConfig({
  plugins: [react()],
  // Relative base so the built site works when served from a subfolder
  // (GitHub Pages / itch.io / static hosts) without extra config.
  base: './',
  server: {
    host: true,
    port: 5173,
    open: false,
  },
  build: {
    target: 'es2020',
    // Split the heavy 3D libraries out of the app chunk for better caching.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
        },
      },
    },
    chunkSizeWarningLimit: 1600,
  },
});
