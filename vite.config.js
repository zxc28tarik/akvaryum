import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'vite-app',
  base: '/akvaryum/',
  publicDir: false,
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
  },
});
