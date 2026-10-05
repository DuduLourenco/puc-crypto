import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AuthenticatedRequest } from './jwt-auth.guard';

/** Token do usuário autenticado, validado pelo JwtAuthGuard. */
export const AccessToken = createParamDecorator(
  (_: unknown, context: ExecutionContext): string => context.switchToHttp().getRequest<AuthenticatedRequest>().accessToken,
);
