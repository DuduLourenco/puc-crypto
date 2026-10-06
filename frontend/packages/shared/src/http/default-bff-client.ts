import { sessionStore } from '../session/session-store';
import { createBffClient } from './bff-client';

/**
 * Cliente do BFF usado pelos microfrontends. O endereço vem de VITE_BFF_URL no build:
 * o BFF local no desenvolvimento, o API Gateway na nuvem.
 */
export const bffClient = createBffClient({
  baseUrl: import.meta.env.VITE_BFF_URL ?? 'http://localhost:5100',
  getAccessToken: () => sessionStore.get()?.accessToken ?? null,
  onUnauthorized: () => sessionStore.clear(),
});
