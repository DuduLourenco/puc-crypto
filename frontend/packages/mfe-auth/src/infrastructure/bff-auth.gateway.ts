import { BffClient } from '@puccrypto/shared';
import { AuthGateway, IssuedToken } from '../application/ports/auth.gateway';
import { LoginCredentials, Registration } from '../domain/credentials';

export class BffAuthGateway implements AuthGateway {
  constructor(private readonly bff: BffClient) {}

  async register(registration: Registration): Promise<void> {
    await this.bff.request('POST', 'auth/register', { body: registration });
  }

  login(credentials: LoginCredentials): Promise<IssuedToken> {
    return this.bff.request('POST', 'auth/login', { body: credentials });
  }
}
