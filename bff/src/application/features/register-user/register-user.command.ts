import { RegisterUserData } from '../../ports/identity.gateway';

export interface RegisterUserCommand {
  data: RegisterUserData;
}
