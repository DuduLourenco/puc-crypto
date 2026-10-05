import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser, TokenVerifier } from '../../application/ports/token-verifier';

export interface AuthenticatedRequest extends Request {
  accessToken: string;
  user: AuthenticatedUser;
}

/**
 * Exige um JWT válido do Identity no cabeçalho Authorization. O token fica disponível
 * na requisição para ser repassado aos microsserviços, que também o validam.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokenVerifier: TokenVerifier) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');

    const user = scheme?.toLowerCase() === 'bearer' && token ? this.tokenVerifier.verify(token) : null;

    if (!user) {
      throw new UnauthorizedException('Token de acesso ausente ou inválido.');
    }

    request.accessToken = token;
    request.user = user;

    return true;
  }
}
