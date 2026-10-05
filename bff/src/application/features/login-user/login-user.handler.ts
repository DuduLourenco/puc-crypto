import { AccessToken } from '../../../domain/models';
import { IdentityGateway } from '../../ports/identity.gateway';
import { LoginUserCommand } from './login-user.command';

/** Autentica o usuário no Identity e devolve o token de acesso. */
export class LoginUserHandler {
  constructor(private readonly identity: IdentityGateway) {}

  execute(command: LoginUserCommand): Promise<AccessToken> {
    return this.identity.login(command.data);
  }
}
