import { IdentityGateway, LoginUserData, RegisterUserData } from '../../application/ports/identity.gateway';
import { AccessToken, RegisteredUser } from '../../domain/models';
import { UpstreamHttpClient } from './upstream-http.client';

export class IdentityHttpGateway extends IdentityGateway {
  constructor(private readonly http: UpstreamHttpClient) {
    super();
  }

  register(data: RegisterUserData): Promise<RegisteredUser> {
    return this.http.request('POST', 'auth/register', { body: data });
  }

  login(data: LoginUserData): Promise<AccessToken> {
    return this.http.request('POST', 'auth/login', { body: data });
  }
}
