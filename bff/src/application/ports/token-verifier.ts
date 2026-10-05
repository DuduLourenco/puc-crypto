export interface AuthenticatedUser {
  id: string;
  email?: string;
  name?: string;
}

/** Porta para validar o JWT emitido pelo Identity. Devolve nulo quando o token não é válido. */
export abstract class TokenVerifier {
  abstract verify(token: string): AuthenticatedUser | null;
}
