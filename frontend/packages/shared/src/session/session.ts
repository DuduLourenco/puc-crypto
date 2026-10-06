/** Sessão do usuário autenticado, criada a partir da resposta de login do BFF. */
export interface Session {
  accessToken: string;
  expiresAt: string;
  userName: string;
  email: string;
}

export interface TokenResponse {
  accessToken: string;
  expiresAt: string;
}

/** Lê nome e e-mail do JWT. O token não é validado aqui: quem valida é o BFF. */
export function sessionFromToken(token: TokenResponse): Session {
  const claims = decodeJwtPayload(token.accessToken);

  return {
    accessToken: token.accessToken,
    expiresAt: token.expiresAt,
    userName: typeof claims.name === 'string' ? claims.name : '',
    email: typeof claims.email === 'string' ? claims.email : '',
  };
}

export function isExpired(session: Session, now: Date = new Date()): boolean {
  return new Date(session.expiresAt).getTime() <= now.getTime();
}

function decodeJwtPayload(jwt: string): Record<string, unknown> {
  try {
    const payload = jwt.split('.')[1] ?? '';
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

    return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
  } catch {
    return {};
  }
}
