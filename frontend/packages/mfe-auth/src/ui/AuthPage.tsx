import { ErrorMessage } from '@puccrypto/shared';
import { FormEvent, useState } from 'react';
import {
  FieldErrors,
  MIN_PASSWORD_LENGTH,
  Registration,
  hasErrors,
  validateLogin,
  validateRegistration,
} from '../domain/credentials';

export interface AuthPageProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
  onRegister: (registration: Registration) => Promise<void>;
}

type Mode = 'login' | 'register';

/** Tela de acesso: uma aba para entrar e outra para criar a conta. */
export function AuthPage({ onLogin, onRegister }: AuthPageProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState<Registration>({ name: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<Registration>>({});
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  const change = (field: keyof Registration) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const switchMode = (next: Mode) => {
    setMode(next);
    setFieldErrors({});
    setError(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    const errors = mode === 'login' ? validateLogin(form) : validateRegistration(form);
    setFieldErrors(errors);
    setError(null);

    if (hasErrors(errors)) {
      return;
    }

    setSubmitting(true);
    try {
      await (mode === 'login' ? onLogin(form) : onRegister(form));
    } catch (caught) {
      setError(caught);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="pc-card" aria-labelledby="auth-title">
      <div>
        <h1 id="auth-title">PucCrypto</h1>
        <p className="pc-subtitle">Acompanhe criptomoedas com histórico de preços e previsão.</p>
      </div>

      <div className="pc-tabs" role="tablist" aria-label="Acesso">
        <button type="button" role="tab" className="pc-tab" aria-selected={mode === 'login'} onClick={() => switchMode('login')}>
          Entrar
        </button>
        <button type="button" role="tab" className="pc-tab" aria-selected={mode === 'register'} onClick={() => switchMode('register')}>
          Criar conta
        </button>
      </div>

      <form className="pc-form" onSubmit={submit} noValidate>
        {mode === 'register' && (
          <label className="pc-field">
            <span>Nome</span>
            <input className="pc-input" value={form.name} onChange={change('name')} autoComplete="name" />
            {fieldErrors.name && <small role="alert">{fieldErrors.name}</small>}
          </label>
        )}

        <label className="pc-field">
          <span>E-mail</span>
          <input className="pc-input" type="email" value={form.email} onChange={change('email')} autoComplete="email" />
          {fieldErrors.email && <small role="alert">{fieldErrors.email}</small>}
        </label>

        <label className="pc-field">
          <span>Senha</span>
          <input
            className="pc-input"
            type="password"
            value={form.password}
            onChange={change('password')}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          {mode === 'register' && !fieldErrors.password && <small>Pelo menos {MIN_PASSWORD_LENGTH} caracteres.</small>}
          {fieldErrors.password && <small role="alert">{fieldErrors.password}</small>}
        </label>

        <ErrorMessage error={error} />

        <button className="pc-button" type="submit" disabled={submitting}>
          {submitting ? 'Enviando…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>
    </section>
  );
}
