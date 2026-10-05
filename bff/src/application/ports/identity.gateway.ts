import { AccessToken, RegisteredUser } from '../../domain/models';

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

/** Porta para o serviço Identity. */
export abstract class IdentityGateway {
  abstract register(data: RegisterUserData): Promise<RegisteredUser>;
  abstract login(data: LoginUserData): Promise<AccessToken>;
}
