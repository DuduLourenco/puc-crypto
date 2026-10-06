import { LoginCredentials } from '../../../domain/credentials';
import { AuthGateway } from '../../ports/auth.gateway';
import { SessionPort } from '../../ports/session.port';

export interface LoginUserDeps {
  auth: AuthGateway;
  session: SessionPort;
}

/** Autentica no BFF e inicia a sessão com o token recebido. */
export async function loginUser(deps: LoginUserDeps, credentials: LoginCredentials): Promise<void> {
  const token = await deps.auth.login({ email: credentials.email.trim(), password: credentials.password });

  deps.session.start(token);
}
