/// <reference types="vitest/config" />
import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

// Host dos microfrontends. Os endereços dos remoteEntry.js vêm do ambiente, no build:
// portas locais no desenvolvimento; caminhos ou URLs públicas na nuvem.
export default defineConfig(({ mode }) => {
  // O arquivo .env fica na raiz do repositório e vale para todos os pacotes.
  const envDir = fileURLToPath(new URL('../..', import.meta.url));
  const env = loadEnv(mode, envDir, '');
  const remote = (name: string, variable: string, fallback: string) => ({
    type: 'module',
    name,
    entry: env[variable] ?? fallback,
    entryGlobalName: name,
    shareScope: 'default',
  });

  return {
    envDir,
    server: { port: 5200, strictPort: true },
    preview: { port: 5200, strictPort: true },
    build: { target: 'esnext' },
    plugins: [
      react(),
      federation({
        name: 'shell',
        dts: false,
        remotes: {
          mfe_auth: remote('mfe_auth', 'MFE_AUTH_URL', 'http://localhost:5201/remoteEntry.js'),
          mfe_cryptos: remote('mfe_cryptos', 'MFE_CRYPTOS_URL', 'http://localhost:5202/remoteEntry.js'),
          mfe_dashboard: remote('mfe_dashboard', 'MFE_DASHBOARD_URL', 'http://localhost:5203/remoteEntry.js'),
        },
        shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
      }),
    ],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./test/setup.ts'],
      include: ['test/**/*.spec.{ts,tsx}'],
    },
  };
});
