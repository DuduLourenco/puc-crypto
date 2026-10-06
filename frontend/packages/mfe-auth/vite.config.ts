/// <reference types="vitest/config" />
import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Microfrontend remoto: expõe AuthApp para o shell pelo remoteEntry.js.
export default defineConfig({
  // O arquivo .env fica na raiz do repositório e vale para todos os pacotes.
  envDir: fileURLToPath(new URL('../..', import.meta.url)),
  base: process.env.PUBLIC_BASE ?? '/',
  server: { port: 5201, strictPort: true, origin: 'http://localhost:5201' },
  preview: { port: 5201, strictPort: true },
  build: { target: 'esnext' },
  plugins: [
    react(),
    federation({
      name: 'mfe_auth',
      filename: 'remoteEntry.js',
      dts: false,
      exposes: { './AuthApp': './src/AuthApp.tsx' },
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
