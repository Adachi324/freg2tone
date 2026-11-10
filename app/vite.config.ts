import { defineConfig } from 'vite';
export default defineConfig({ build: { target: 'safari16', chunkSizeWarningLimit: 700 }, server: { host: '127.0.0.1', port: 8877, strictPort: true } });
