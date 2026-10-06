import { ReactNode } from 'react';
import { toUserMessage } from '../http/bff-error';

/** Mensagem de erro com ícone e texto: o estado nunca é comunicado só pela cor. */
export function ErrorMessage({ error }: { error: unknown }) {
  if (!error) {
    return null;
  }

  return (
    <p className="pc-alert pc-alert--error" role="alert">
      <span aria-hidden="true">⚠</span> {toUserMessage(error)}
    </p>
  );
}

export function InfoMessage({ children }: { children: ReactNode }) {
  return (
    <p className="pc-alert pc-alert--info" role="status">
      <span aria-hidden="true">ℹ</span> {children}
    </p>
  );
}

export function Loading({ label = 'Carregando…' }: { label?: string }) {
  return (
    <p className="pc-loading" role="status">
      {label}
    </p>
  );
}
