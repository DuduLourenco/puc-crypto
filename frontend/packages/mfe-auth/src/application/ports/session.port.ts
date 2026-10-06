import { IssuedToken } from './auth.gateway';

/** Porta para iniciar a sessão do usuário no navegador. */
export interface SessionPort {
  start(token: IssuedToken): void;
}
