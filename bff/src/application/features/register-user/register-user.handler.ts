import { RegisteredUser } from '../../../domain/models';
import { IdentityGateway } from '../../ports/identity.gateway';
import { RegisterUserCommand } from './register-user.command';

/** Cadastra um usuário no Identity. */
export class RegisterUserHandler {
  constructor(private readonly identity: IdentityGateway) {}

  execute(command: RegisterUserCommand): Promise<RegisteredUser> {
    return this.identity.register(command.data);
  }
}
