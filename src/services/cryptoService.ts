import { apiRequest } from './apiClient';
import { API_CONFIG } from '../config/api.config';
import { CryptoAsset, CryptoListResponse, CryptoQueryParams } from '../types/crypto.types';
import { getMockCryptoListResponse, MOCK_CRYPTOS } from './mockData';

/**
 * Serviço responsável por obter os dados de criptomoedas em Reais da API Azure
 */
export const cryptoService = {
  /**
   * Obtém a lista de criptomoedas disponíveis com cotações em R$
   * GET /api/cryptos
   */
  async getCryptos(params?: CryptoQueryParams): Promise<CryptoListResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.order) query.append('order', params.order);
    if (params?.category) query.append('category', params.category);
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const endpoint = `${API_CONFIG.endpoints.cryptos}${queryString}`;

    return apiRequest<CryptoListResponse>(
      endpoint,
      { method: 'GET' },
      () => getMockCryptoListResponse(params?.search)
    );
  },

  /**
   * Obtém os detalhes de uma criptomoeda específica
   * GET /api/cryptos/:id
   */
  async getCryptoById(id: string): Promise<{ success: boolean; data: CryptoAsset }> {
    const endpoint = API_CONFIG.endpoints.cryptoDetails(id);
    return apiRequest<{ success: boolean; data: CryptoAsset }>(
      endpoint,
      { method: 'GET' },
      () => {
        const item = MOCK_CRYPTOS.find((c) => c.id === id) || MOCK_CRYPTOS[0];
        return { success: true, data: item };
      }
    );
  },
};
