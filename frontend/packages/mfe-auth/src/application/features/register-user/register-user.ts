import { Registration } from '../../../domain/credentials';
import { AuthGateway } from '../../ports/auth.gateway';
import { SessionPort } from '../../ports/session.port';

export interface RegisterUserDeps {
  auth: AuthGateway;
  session: SessionPort;
}

/** Cadastra o usuário e já o autentica, para que ele não precise digitar a senha de novo. */
export async function registerUser(deps: RegisterUserDeps, registration: Registration): Promise<void> {
  const normalized = { ...registration, name: registration.name.trim(), email: registration.email.trim() };

  await deps.auth.register(normalized);

  const token = await deps.auth.login({ email: normalized.email, password: normalized.password });
  deps.session.start(token);
}
