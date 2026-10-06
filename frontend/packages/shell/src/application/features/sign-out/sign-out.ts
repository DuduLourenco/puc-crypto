export interface SessionEnder {
  clear(): void;
}

/** Encerra a sessão; o shell reage à mudança e leva o usuário à tela de acesso. */
export function signOut(session: SessionEnder): void {
  session.clear();
}
