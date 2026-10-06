import { useSyncExternalStore } from 'react';
import { Session, TokenResponse, isExpired, sessionFromToken } from './session';

const STORAGE_KEY = 'puccrypto.session';
const CHANGE_EVENT = 'puccrypto:session-changed';

/**
 * Sessão compartilhada entre o shell e os microfrontends. Cada um empacota a sua cópia
 * deste módulo; o estado comum fica no localStorage, e as mudanças são avisadas por um
 * evento da janela. Assim nenhum microfrontend depende de outro para saber quem está logado.
 */
let cachedRaw: string | null = null;
let cachedSession: Session | null = null;

function read(): Session | null {
  const raw = localStorage.getItem(STORAGE_KEY);

  // useSyncExternalStore exige a mesma referência enquanto o valor não mudar.
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSession = parse(raw);
  }

  if (cachedSession && isExpired(cachedSession)) {
    return null;
  }

  return cachedSession;
}

function parse(raw: string | null): Session | null {
  if (!raw) {
    return null;
  }

  try {
    const session = JSON.parse(raw) as Session;
    return typeof session.accessToken === 'string' && typeof session.expiresAt === 'string' ? session : null;
  } catch {
    return null;
  }
}

function notify(): void {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export const sessionStore = {
  get: read,

  start(token: TokenResponse): Session {
    const session = sessionFromToken(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    notify();
    return session;
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    notify();
  },

  subscribe(listener: () => void): () => void {
    window.addEventListener(CHANGE_EVENT, listener);
    window.addEventListener('storage', listener);

    return () => {
      window.removeEventListener(CHANGE_EVENT, listener);
      window.removeEventListener('storage', listener);
    };
  },
};

/** Sessão atual; o componente é renderizado de novo no login e no logout. */
export function useSession(): Session | null {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.get, () => null);
}
