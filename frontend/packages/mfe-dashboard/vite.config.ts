/// <reference types="vitest/config" />
import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Microfrontend remoto: expõe DashboardApp para o shell pelo remoteEntry.js.
export default defineConfig({
  // O arquivo .env fica na raiz do repositório e vale para todos os pacotes.
  envDir: fileURLToPath(new URL('../..', import.meta.url)),
  base: process.env.PUBLIC_BASE ?? '/',
  server: { port: 5203, strictPort: true, origin: 'http://localhost:5203' },
  preview: { port: 5203, strictPort: true },
  build: { target: 'esnext' },
  plugins: [
    react(),
    federation({
      name: 'mfe_dashboard',
      filename: 'remoteEntry.js',
      dts: false,
      exposes: { './DashboardApp': './src/DashboardApp.tsx' },
      shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.spec.{ts,tsx}'],
  },
});
