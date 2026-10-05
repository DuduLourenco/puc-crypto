import { LoginUserData } from '../../ports/identity.gateway';

export interface LoginUserCommand {
  data: LoginUserData;
}
