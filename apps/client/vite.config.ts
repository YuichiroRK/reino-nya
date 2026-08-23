import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0', // Essential for Docker mapping
    port: 5173
  },
  build: {
    target: 'esnext'
  }
});
