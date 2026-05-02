import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    watch: false,
  },
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src/core'),
      '@domains': path.resolve(__dirname, './src/domains'),
      '@ui': path.resolve(__dirname, './src/presentation'),
    },
  },
});
