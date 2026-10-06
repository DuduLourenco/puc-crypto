import { bffClient, sessionStore } from '@puccrypto/shared';
import '@puccrypto/shared/theme.css';
import { loginUser } from './application/features/login-user/login-user';
import { registerUser } from './application/features/register-user/register-user';
import { BffAuthGateway } from './infrastructure/bff-auth.gateway';
import { AuthPage } from './ui/AuthPage';

export interface AuthAppProps {
  /** Avisado depois do login ou do cadastro; o shell usa para navegar ao dashboard. */
  onAuthenticated?: () => void;
}

// Raiz de composição do microfrontend: liga as portas aos adaptadores.
const deps = { auth: new BffAuthGateway(bffClient), session: sessionStore };

/** Módulo exposto ao shell pelo Module Federation. */
export default function AuthApp({ onAuthenticated }: AuthAppProps) {
  return (
    <AuthPage
      onLogin={async (credentials) => {
        await loginUser(deps, credentials);
        onAuthenticated?.();
      }}
      onRegister={async (registration) => {
        await registerUser(deps, registration);
        onAuthenticated?.();
      }}
    />
  );
}
