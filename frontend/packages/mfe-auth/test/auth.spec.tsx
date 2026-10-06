import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { loginUser } from '../src/application/features/login-user/login-user';
import { registerUser } from '../src/application/features/register-user/register-user';
import { validateLogin, validateRegistration } from '../src/domain/credentials';
import { AuthPage } from '../src/ui/AuthPage';

const token = { accessToken: 'jwt', expiresAt: '2026-01-01T01:00:00Z' };

describe('regras de credenciais (domínio)', () => {
  it('aceita um cadastro válido', () => {
    expect(validateRegistration({ name: 'Ana', email: 'ana@example.com', password: 'senha-segura-1' })).toEqual({});
  });

  it('aponta nome vazio, e-mail inválido e senha curta', () => {
    expect(Object.keys(validateRegistration({ name: ' ', email: 'ana', password: '123' })).sort()).toEqual(['email', 'name', 'password']);
  });

  it('no login, exige apenas e-mail e senha preenchidos', () => {
    expect(validateLogin({ email: 'ana@example.com', password: 'x' })).toEqual({});
    expect(Object.keys(validateLogin({ email: '', password: '' })).sort()).toEqual(['email', 'password']);
  });
});

describe('casos de uso', () => {
  it('loginUser autentica e inicia a sessão com o token', async () => {
    const auth = { register: vi.fn(), login: vi.fn().mockResolvedValue(token) };
    const session = { start: vi.fn() };

    await loginUser({ auth, session }, { email: ' ana@example.com ', password: 'senha' });

    expect(auth.login).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'senha' });
    expect(session.start).toHaveBeenCalledWith(token);
  });

  it('registerUser cadastra, autentica e inicia a sessão', async () => {
    const auth = { register: vi.fn().mockResolvedValue(undefined), login: vi.fn().mockResolvedValue(token) };
    const session = { start: vi.fn() };

    await registerUser({ auth, session }, { name: ' Ana ', email: 'ana@example.com', password: 'senha-segura-1' });

    expect(auth.register).toHaveBeenCalledWith({ name: 'Ana', email: 'ana@example.com', password: 'senha-segura-1' });
    expect(auth.login).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'senha-segura-1' });
    expect(session.start).toHaveBeenCalledWith(token);
  });

  it('se o cadastro falha, não tenta autenticar', async () => {
    const auth = { register: vi.fn().mockRejectedValue(new Error('e-mail já cadastrado')), login: vi.fn() };
    const session = { start: vi.fn() };

    await expect(registerUser({ auth, session }, { name: 'Ana', email: 'ana@example.com', password: 'senha-segura-1' })).rejects.toThrow();

    expect(auth.login).not.toHaveBeenCalled();
    expect(session.start).not.toHaveBeenCalled();
  });
});

describe('AuthPage', () => {
  it('envia o login com os dados digitados', async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined);
    render(<AuthPage onLogin={onLogin} onRegister={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'senha-segura-1');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(onLogin).toHaveBeenCalledWith(expect.objectContaining({ email: 'ana@example.com', password: 'senha-segura-1' }));
  });

  it('não envia o cadastro inválido e mostra os erros por campo', async () => {
    const onRegister = vi.fn();
    render(<AuthPage onLogin={vi.fn()} onRegister={onRegister} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Criar conta' }));
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(onRegister).not.toHaveBeenCalled();
    expect(screen.getByText('Informe o nome.')).toBeInTheDocument();
    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument();
  });

  it('mostra a mensagem de erro devolvida pelo servidor', async () => {
    const onLogin = vi.fn().mockRejectedValue(new Error('E-mail ou senha inválidos.'));
    render(<AuthPage onLogin={onLogin} onRegister={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'errada');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.');
  });
});
