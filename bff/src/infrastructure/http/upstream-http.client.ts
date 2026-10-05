import { UpstreamError, UpstreamService, UpstreamUnavailableError } from '../../application/errors/upstream.errors';

export interface UpstreamRequest {
  /** JWT do usuário, repassado no cabeçalho Authorization. */
  accessToken?: string;
  headers?: Record<string, string>;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
}

/**
 * Cliente HTTP de um serviço chamado pelo BFF. Converte as respostas de erro em
 * UpstreamError (com o status e o corpo originais) e as falhas de rede, de tempo
 * esgotado ou de leitura em UpstreamUnavailableError.
 */
export class UpstreamHttpClient {
  constructor(
    private readonly service: UpstreamService,
    private readonly baseUrl: string,
    private readonly timeoutMs: number,
    private readonly fetchFn: typeof fetch = fetch,
  ) {}

  async request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, options: UpstreamRequest = {}): Promise<T> {
    const url = new URL(path, this.baseUrl);
    for (const [name, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) {
        url.searchParams.set(name, String(value));
      }
    }

    const headers: Record<string, string> = { Accept: 'application/json', ...options.headers };
    if (options.accessToken) {
      headers.Authorization = `Bearer ${options.accessToken}`;
    }
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    let response: Response;
    try {
      response = await this.fetchFn(url, {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      throw new UpstreamUnavailableError(this.service, error);
    }

    if (!response.ok) {
      throw new UpstreamError(this.service, response.status, await this.readBody(response));
    }

    if (response.status === 204) {
      return undefined as T;
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new UpstreamUnavailableError(this.service, error);
    }
  }

  /** Corpo de uma resposta de erro: JSON (Problem Details) quando possível, senão o texto. */
  private async readBody(response: Response): Promise<unknown> {
    const text = await response.text().catch(() => '');
    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
}
