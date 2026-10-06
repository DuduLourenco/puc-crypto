export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Registration extends LoginCredentials {
  name: string;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Regras conferidas antes de enviar; o Identity valida de novo e tem a palavra final. */
export function validateLogin(credentials: LoginCredentials): FieldErrors<LoginCredentials> {
  const errors: FieldErrors<LoginCredentials> = {};

  if (!credentials.email.trim()) {
    errors.email = 'Informe o e-mail.';
  }
  if (!credentials.password) {
    errors.password = 'Informe a senha.';
  }

  return errors;
}

export function validateRegistration(registration: Registration): FieldErrors<Registration> {
  const errors: FieldErrors<Registration> = {};

  if (!registration.name.trim()) {
    errors.name = 'Informe o nome.';
  }
  if (!EMAIL_PATTERN.test(registration.email.trim())) {
    errors.email = 'Informe um e-mail válido.';
  }
  if (registration.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }

  return errors;
}

export function hasErrors(errors: object): boolean {
  return Object.keys(errors).length > 0;
}
