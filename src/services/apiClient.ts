import { API_CONFIG } from '../config/api.config';

export interface ApiClientOptions extends RequestInit {
  timeoutMs?: number;
  useFallbackOnFailure?: boolean;
}

export interface ApiStatusState {
  isUsingMockFallback: boolean;
  lastRequestUrl: string | null;
  lastStatus: number | null;
  lastLatencyMs: number | null;
  errorMessage: string | null;
}

// Estado global simples para telemetria da conexão Azure
export const currentApiStatus: ApiStatusState = {
  isUsingMockFallback: false,
  lastRequestUrl: null,
  lastStatus: null,
  lastLatencyMs: null,
  errorMessage: null,
};

type ApiStatusListener = (status: ApiStatusState) => void;
const listeners = new Set<ApiStatusListener>();

export const subscribeToApiStatus = (listener: ApiStatusListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyApiStatus = () => {
  listeners.forEach((l) => l({ ...currentApiStatus }));
};

/**
 * Cliente HTTP para a API Azure com interceptores, autenticação e fallback
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiClientOptions = {},
  fallbackFn?: () => T
): Promise<T> {
  const {
    timeoutMs = 6000,
    useFallbackOnFailure = API_CONFIG.useMockFallback,
    headers = {},
    ...restOptions
  } = options;

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_CONFIG.baseUrl.replace(/\/$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const requestHeaders: Record<string, string> = {
    ...API_CONFIG.defaultHeaders,
    ...(API_CONFIG.authToken ? { Authorization: `Bearer ${API_CONFIG.authToken}` } : {}),
    ...(API_CONFIG.apimSubscriptionKey ? { 'Ocp-Apim-Subscription-Key': API_CONFIG.apimSubscriptionKey } : {}),
    ...(headers as Record<string, string>),
  };

  const startTime = performance.now();
  currentApiStatus.lastRequestUrl = url;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Math.round(performance.now() - startTime);
    currentApiStatus.lastLatencyMs = latency;
    currentApiStatus.lastStatus = response.status;

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    currentApiStatus.isUsingMockFallback = false;
    currentApiStatus.errorMessage = null;
    notifyApiStatus();
    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    const latency = Math.round(performance.now() - startTime);
    currentApiStatus.lastLatencyMs = latency;
    currentApiStatus.errorMessage = error.message || 'Erro ao conectar à API Azure';

    // Se temos um gerador de dados mock de fallback configurado
    if (useFallbackOnFailure && fallbackFn) {
      console.warn(`[Azure API Client] Falha ao contactar ${url}. Utilizando fallback mock estruturado.`, error);
      currentApiStatus.isUsingMockFallback = true;
      notifyApiStatus();
      return fallbackFn();
    }

    notifyApiStatus();
    throw error;
  }
}
