import { LoginCredentials, Registration } from '../../domain/credentials';

export interface IssuedToken {
  accessToken: string;
  expiresAt: string;
}

/** Porta para o cadastro e o login no BFF. */
export interface AuthGateway {
  register(registration: Registration): Promise<void>;
  login(credentials: LoginCredentials): Promise<IssuedToken>;
}
