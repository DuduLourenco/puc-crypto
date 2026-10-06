import { beforeEach, describe, expect, it, vi } from 'vitest';
import { formatPercent, formatUsd } from '../src/format/format';
import { createBffClient } from '../src/http/bff-client';
import { BffError } from '../src/http/bff-error';
import { isExpired, sessionFromToken } from '../src/session/session';
import { sessionStore } from '../src/session/session-store';

/** JWT de teste (não assinado): só o payload importa para o frontend. */
function jwt(payload: object): string {
  // Como em um JWT real: JSON em UTF-8, codificado em base64url.
  const encode = (value: object) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(value))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${encode({ alg: 'HS256' })}.${encode(payload)}.assinatura`;
}

const future = new Date(Date.now() + 3_600_000).toISOString();

describe('sessão', () => {
  beforeEach(() => localStorage.clear());

  it('lê nome e e-mail do token, inclusive com acentos', () => {
    const session = sessionFromToken({ accessToken: jwt({ name: 'João Sousa', email: 'joao@example.com' }), expiresAt: future });

    expect(session).toMatchObject({ userName: 'João Sousa', email: 'joao@example.com', expiresAt: future });
  });

  it('token ilegível resulta em sessão sem nome, sem erro', () => {
    expect(sessionFromToken({ accessToken: 'nao-e-jwt', expiresAt: future }).userName).toBe('');
  });

  it('considera a validade', () => {
    const session = sessionFromToken({ accessToken: jwt({}), expiresAt: '2026-01-01T00:00:00Z' });

    expect(isExpired(session, new Date('2025-12-31T23:59:59Z'))).toBe(false);
    expect(isExpired(session, new Date('2026-01-01T00:00:00Z'))).toBe(true);
  });

  it('guarda a sessão, avisa quem está inscrito e a encerra', () => {
    const listener = vi.fn();
    const unsubscribe = sessionStore.subscribe(listener);

    sessionStore.start({ accessToken: jwt({ name: 'Ana' }), expiresAt: future });
    expect(sessionStore.get()?.userName).toBe('Ana');
    expect(sessionStore.get()).toBe(sessionStore.get());

    sessionStore.clear();
    expect(sessionStore.get()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
  });

  it('uma sessão expirada no armazenamento é tratada como ausente', () => {
    sessionStore.start({ accessToken: jwt({ name: 'Ana' }), expiresAt: '2020-01-01T00:00:00Z' });

    expect(sessionStore.get()).toBeNull();
  });
});

describe('cliente do BFF', () => {
  const response = (status: number, body?: unknown) =>
    new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

  const client = (fetchFn: ReturnType<typeof vi.fn>, token: string | null = 'jwt', onUnauthorized = vi.fn()) =>
    createBffClient({ baseUrl: 'http://bff:5100/', getAccessToken: () => token, onUnauthorized, fetchFn: fetchFn as unknown as typeof fetch });

  it('envia o token, o corpo e os parâmetros de consulta', async () => {
    const fetchFn = vi.fn().mockResolvedValue(response(200, { ok: true }));

    await client(fetchFn).request('POST', '/cryptos', { body: { symbol: 'BTC' }, query: { limit: 5, from: undefined } });

    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe('http://bff:5100/cryptos?limit=5');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer jwt', 'Content-Type': 'application/json' });
    expect(init.body).toBe('{"symbol":"BTC"}');
  });

  it('204 não tem corpo', async () => {
    await expect(client(vi.fn().mockResolvedValue(response(204))).request('DELETE', 'cryptos/1')).resolves.toBeUndefined();
  });

  it('converte Problem Details em BffError, com os erros por campo', async () => {
    const fetchFn = vi.fn().mockResolvedValue(response(400, { title: 'Validação', status: 400, errors: { Name: ['Nome obrigatório.'] } }));

    const error = (await client(fetchFn).request('POST', 'cryptos').catch((caught: unknown) => caught)) as BffError;

    expect(error).toBeInstanceOf(BffError);
    expect(error.status).toBe(400);
    expect(error.fieldErrors).toEqual({ Name: ['Nome obrigatório.'] });
    expect(error.userMessage).toBe('Nome obrigatório.');
  });

  it('usa o detalhe do erro como mensagem ao usuário', async () => {
    const fetchFn = vi.fn().mockResolvedValue(response(409, { title: 'Catalog.CryptoInUse', status: 409, detail: 'A criptomoeda está em uso.' }));

    await expect(client(fetchFn).request('DELETE', 'cryptos/1')).rejects.toMatchObject({ title: 'Catalog.CryptoInUse', userMessage: 'A criptomoeda está em uso.' });
  });

  it('401 com sessão encerra a sessão; 401 no login não', async () => {
    const onUnauthorized = vi.fn();
    const fetchFn = vi.fn().mockImplementation(() => Promise.resolve(response(401, { title: 'Bff.Unauthorized', status: 401 })));

    await client(fetchFn, 'jwt', onUnauthorized).request('GET', 'cryptos').catch(() => undefined);
    expect(onUnauthorized).toHaveBeenCalledOnce();

    await client(fetchFn, null, onUnauthorized).request('POST', 'auth/login').catch(() => undefined);
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('falha de rede vira um erro com mensagem amigável', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(client(fetchFn).request('GET', 'cryptos')).rejects.toMatchObject({ status: 0, title: 'Frontend.BffUnreachable' });
  });
});

describe('formatação', () => {
  it('formata dólar e percentual em pt-BR, com traço para valor ausente', () => {
    expect(formatUsd(65000.5)).toContain('65.000,50');
    expect(formatUsd(null)).toBe('—');
    expect(formatPercent(12.345)).toBe('+12,35%');
    expect(formatPercent(-3)).toBe('-3,00%');
    expect(formatPercent(null)).toBe('—');
  });
});
