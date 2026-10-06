import { BffError } from './bff-error';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface BffRequest {
  body?: unknown;
  query?: Record<string, string | number | undefined>;
}

export interface BffClientOptions {
  baseUrl: string;
  getAccessToken: () => string | null;
  /** Chamado quando o BFF responde 401 a uma requisição autenticada (sessão expirada). */
  onUnauthorized: () => void;
  fetchFn?: typeof fetch;
}

export interface BffClient {
  request<T>(method: HttpMethod, path: string, options?: BffRequest): Promise<T>;
}

/** Cliente HTTP do BFF: o único backend que os microfrontends chamam. */
export function createBffClient(options: BffClientOptions): BffClient {
  const baseUrl = options.baseUrl.replace(/\/+$/, '');

  return {
    async request<T>(method: HttpMethod, path: string, request: BffRequest = {}): Promise<T> {
      const fetchFn = options.fetchFn ?? fetch;
      const query = new URLSearchParams();
      for (const [name, value] of Object.entries(request.query ?? {})) {
        if (value !== undefined) {
          query.set(name, String(value));
        }
      }

      const url = `${baseUrl}/${path.replace(/^\/+/, '')}${query.size > 0 ? `?${query}` : ''}`;
      const token = options.getAccessToken();
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      if (request.body !== undefined) {
        headers['Content-Type'] = 'application/json';
      }

      let response: Response;
      try {
        response = await fetchFn(url, {
          method,
          headers,
          body: request.body === undefined ? undefined : JSON.stringify(request.body),
        });
      } catch {
        throw new BffError(0, 'Frontend.BffUnreachable', 'Não foi possível conectar ao servidor. Tente novamente.');
      }

      if (response.ok) {
        return (response.status === 204 ? undefined : await response.json()) as T;
      }

      if (response.status === 401 && token) {
        options.onUnauthorized();
      }

      throw await toBffError(response);
    },
  };
}

async function toBffError(response: Response): Promise<BffError> {
  const problem = (await response.json().catch(() => ({}))) as {
    title?: unknown;
    detail?: unknown;
    errors?: unknown;
  };

  const fieldErrors: Record<string, string[]> = {};
  if (problem.errors && typeof problem.errors === 'object') {
    for (const [field, messages] of Object.entries(problem.errors as Record<string, unknown>)) {
      fieldErrors[field] = Array.isArray(messages) ? messages.map(String) : [String(messages)];
    }
  }

  return new BffError(
    response.status,
    typeof problem.title === 'string' ? problem.title : `HTTP ${response.status}`,
    typeof problem.detail === 'string' ? problem.detail : '',
    fieldErrors,
  );
}
