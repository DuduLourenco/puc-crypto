import { ReactNode, useEffect, useState } from 'react';
import { toUserMessage } from '../http/bff-error';

/** Espera a partir da qual uma resposta do servidor é considerada lenta. */
export const SLOW_RESPONSE_MS = 5000;

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

/** Indica se `active` está ligado há mais de `delayMs`; volta a falso quando ele desliga. */
export function useTakingLong(active: boolean, delayMs = SLOW_RESPONSE_MS): boolean {
  const [takingLong, setTakingLong] = useState(false);

  useEffect(() => {
    if (!active) {
      setTakingLong(false);
      return;
    }

    const timer = setTimeout(() => setTakingLong(true), delayMs);
    return () => clearTimeout(timer);
  }, [active, delayMs]);

  return takingLong;
}

/**
 * Aviso para uma espera longa. Na nuvem, os bancos do Azure SQL pausam depois de um tempo sem uso
 * para caber na cota gratuita, e a primeira chamada espera o banco voltar (ADR-056).
 */
export function SlowResponseNotice({ waiting }: { waiting: boolean }) {
  if (!useTakingLong(waiting)) {
    return null;
  }

  return <InfoMessage>O servidor está acordando depois de um tempo sem uso. Isso pode levar até 1 minuto.</InfoMessage>;
}

export function Loading({ label = 'Carregando…' }: { label?: string }) {
  return (
    <>
      <p className="pc-loading" role="status">
        {label}
      </p>
      <SlowResponseNotice waiting />
    </>
  );
}
