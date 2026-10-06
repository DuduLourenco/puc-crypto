import { describe, expect, it, vi } from 'vitest';
import { signOut } from '../src/application/features/sign-out/sign-out';
import { ROUTES, redirectFor } from '../src/domain/navigation';

describe('navegação do shell (domínio)', () => {
  it('sem sessão, qualquer rota leva à tela de acesso', () => {
    expect(redirectFor(ROUTES.dashboard, false)).toBe(ROUTES.login);
    expect(redirectFor(ROUTES.cryptos, false)).toBe(ROUTES.login);
    expect(redirectFor(ROUTES.login, false)).toBeNull();
  });

  it('com sessão, a tela de acesso leva ao dashboard e as demais rotas ficam como estão', () => {
    expect(redirectFor(ROUTES.login, true)).toBe(ROUTES.dashboard);
    expect(redirectFor(ROUTES.cryptos, true)).toBeNull();
  });
});

describe('signOut', () => {
  it('encerra a sessão', () => {
    const session = { clear: vi.fn() };

    signOut(session);

    expect(session.clear).toHaveBeenCalledOnce();
  });
});
