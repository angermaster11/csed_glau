import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  base: './',             // Ensures asset paths are relative
  build: {
    outDir: 'dist',       // Output folder compatible with Vercel
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  plugins: [react()],
  root: 'client',         // Important: Treat client/ as project root
});
