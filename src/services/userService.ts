import { apiRequest } from './apiClient';
import { API_CONFIG } from '../config/api.config';
import { MeResponse, UserProfile, UserWatchlistItem } from '../types/user.types';
import { MOCK_USER } from './mockData';

let localUserState: UserProfile = { ...MOCK_USER };

/**
 * Serviço responsável por obter os dados do usuário autenticado (/me) na API Azure
 * (Modo puramente informativo)
 */
export const userService = {
  /**
   * Obtém as informações do usuário logado
   * GET /api/me
   */
  async getMe(): Promise<MeResponse> {
    const endpoint = API_CONFIG.endpoints.me;
    return apiRequest<MeResponse>(
      endpoint,
      { method: 'GET' },
      () => ({
        success: true,
        data: { ...localUserState },
        unreadNotifications: 2,
        serverRegion: 'brazilsouth (Azure)',
      })
    );
  },

  /**
   * Adiciona uma criptomoeda aos favoritos/watchlist do usuário
   * POST /api/me/watchlist
   */
  async addWatchlistItem(item: Partial<UserWatchlistItem>): Promise<UserWatchlistItem> {
    const newItem: UserWatchlistItem = {
      id: `fav_${Date.now()}`,
      cryptoId: item.cryptoId || 'bitcoin',
      symbol: item.symbol || 'BTC',
      name: item.name || 'Cripto Favorita',
      iconUrl: item.iconUrl || 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      addedAt: 'Adicionado agora',
    };

    localUserState = {
      ...localUserState,
      watchlist: [newItem, ...localUserState.watchlist],
    };

    try {
      await apiRequest(
        API_CONFIG.endpoints.watchlist,
        {
          method: 'POST',
          body: JSON.stringify(newItem),
        },
        () => ({ success: true, data: newItem })
      );
    } catch {
      // Mock fallback
    }

    return newItem;
  },

  /**
   * Remove uma criptomoeda dos favoritos/watchlist do usuário
   * DELETE /api/me/watchlist/:id
   */
  async removeWatchlistItem(id: string): Promise<boolean> {
    localUserState = {
      ...localUserState,
      watchlist: localUserState.watchlist.filter((w) => w.id !== id),
    };

    try {
      await apiRequest(
        `${API_CONFIG.endpoints.watchlist}/${id}`,
        { method: 'DELETE' },
        () => ({ success: true })
      );
    } catch {
      // Mock fallback
    }

    return true;
  },
};
