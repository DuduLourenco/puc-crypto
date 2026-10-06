/** Rotas do shell. Cada área é entregue por um microfrontend. */
export const ROUTES = {
  login: '/login',
  dashboard: '/',
  cryptos: '/criptomoedas',
} as const;

export interface NavigationItem {
  path: string;
  label: string;
}

export const NAVIGATION: readonly NavigationItem[] = [
  { path: ROUTES.dashboard, label: 'Dashboard' },
  { path: ROUTES.cryptos, label: 'Criptomoedas' },
];

/**
 * Para onde o usuário deve ir, dado se está autenticado e o que pediu. Devolve nulo
 * quando pode ficar onde está.
 */
export function redirectFor(path: string, authenticated: boolean): string | null {
  if (!authenticated && path !== ROUTES.login) {
    return ROUTES.login;
  }

  if (authenticated && path === ROUTES.login) {
    return ROUTES.dashboard;
  }

  return null;
}
