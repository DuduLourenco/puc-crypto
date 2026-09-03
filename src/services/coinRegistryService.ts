import { API_CONFIG } from '../config/api.config';
import { CustomCoin, CustomCoinInput } from '../types/coin.types';

/**
 * Erro devolvido pela API de moedas, preservando o status HTTP e a lista de
 * problemas de validação para que a tela possa destacar o campo certo.
 */
export class CoinApiError extends Error {
  readonly status: number;
  readonly details: string[];

  constructor(message: string, status: number, details: string[] = []) {
    super(message);
    this.name = 'CoinApiError';
    this.status = status;
    this.details = details;
  }

  /** Símbolo duplicado — o índice único do MongoDB devolve 409 */
  get isDuplicateSymbol(): boolean {
    return this.status === 409;
  }
}

/** Formato bruto que a Azure Function devolve para cada moeda */
interface CoinApiPayload {
  id: string;
  name: string;
  symbol: string;
  iconSource?: 'preset' | 'upload';
  iconPresetId?: string;
  iconDataUrl?: string;
  iconFileName?: string;
  createdAt?: string;
  updatedAt?: string;
}

const toCustomCoin = (payload: CoinApiPayload): CustomCoin => ({
  id: payload.id,
  name: payload.name,
  symbol: payload.symbol,
  iconSource: payload.iconSource === 'upload' ? 'upload' : 'preset',
  iconPresetId: payload.iconPresetId,
  iconDataUrl: payload.iconDataUrl,
  iconFileName: payload.iconFileName,
  createdAt: payload.createdAt || new Date().toISOString(),
});

/**
 * Requisição direta à API Azure.
 *
 * Não passa pelo fallback de mock do apiClient de propósito: numa escrita, um
 * fallback silencioso faria a tela dizer "cadastrado" sem nada ter sido gravado.
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = API_CONFIG.baseUrl.replace(/\/$/, '');
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { ...API_CONFIG.defaultHeaders, ...(options.headers || {}) },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.success) {
    const message = body?.error || `Falha na comunicação com a API (HTTP ${response.status})`;
    throw new CoinApiError(message, response.status, body?.details || []);
  }

  return body.data as T;
}

/** Converte o formulário no corpo esperado pela API */
const toRequestBody = (input: Partial<CustomCoinInput>) => ({
  ...(input.name !== undefined ? { name: input.name.trim() } : {}),
  ...(input.symbol !== undefined ? { symbol: input.symbol.trim().toUpperCase() } : {}),
  ...(input.iconSource !== undefined ? { iconSource: input.iconSource } : {}),
  // campos do ícone: enviados vazios quando a origem muda, para limpar o anterior
  ...(input.iconSource === 'preset'
    ? { iconPresetId: input.iconPresetId || '', iconDataUrl: '', iconFileName: '' }
    : {}),
  ...(input.iconSource === 'upload'
    ? { iconDataUrl: input.iconDataUrl || '', iconFileName: input.iconFileName || '' }
    : {}),
});

/**
 * Serviço de cadastro de moedas, persistido no MongoDB Atlas através das
 * Azure Functions (/api/cryptos).
 */
export const coinRegistryService = {
  /** Lista as moedas cadastradas */
  async list(): Promise<CustomCoin[]> {
    const data = await request<CoinApiPayload[]>(API_CONFIG.endpoints.cryptos);
    return data.map(toCustomCoin);
  },

  /** Cadastra uma nova moeda */
  async create(input: CustomCoinInput): Promise<CustomCoin> {
    const data = await request<CoinApiPayload>(API_CONFIG.endpoints.cryptos, {
      method: 'POST',
      body: JSON.stringify(toRequestBody(input)),
    });
    return toCustomCoin(data);
  },

  /** Edita uma moeda existente */
  async update(id: string, input: Partial<CustomCoinInput>): Promise<CustomCoin> {
    const data = await request<CoinApiPayload>(API_CONFIG.endpoints.cryptoDetails(id), {
      method: 'PUT',
      body: JSON.stringify(toRequestBody(input)),
    });
    return toCustomCoin(data);
  },

  /** Remove uma moeda cadastrada */
  async remove(id: string): Promise<void> {
    await request<unknown>(API_CONFIG.endpoints.cryptoDetails(id), { method: 'DELETE' });
  },
};
