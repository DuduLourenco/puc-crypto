import { verify } from 'jsonwebtoken';
import { AuthenticatedUser, TokenVerifier } from '../../application/ports/token-verifier';

/** Valida o JWT emitido pelo Identity: assinatura HS256, emissor, audiência e validade. */
export class JwtTokenVerifier extends TokenVerifier {
  constructor(
    private readonly signingKey: string,
    private readonly issuer: string,
    private readonly audience: string,
  ) {
    super();
  }

  verify(token: string): AuthenticatedUser | null {
    try {
      const payload = verify(token, this.signingKey, {
        algorithms: ['HS256'],
        issuer: this.issuer,
        audience: this.audience,
      });

      if (typeof payload === 'string' || !payload.sub) {
        return null;
      }

      return { id: payload.sub, email: payload.email, name: payload.name };
    } catch {
      return null;
    }
  }
}
