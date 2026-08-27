/**
 * Item na lista de criptomoedas observadas/favoritas do usuário
 */
export interface UserWatchlistItem {
  id: string;
  cryptoId: string;
  symbol: string;
  name: string;
  iconUrl?: string;
  addedAt: string;
  notes?: string;
}

/**
 * Perfil do usuário autenticado retornado pelo endpoint /api/me da API Azure
 * (Exclusivamente informativo - sem custódia de saldo/criptos)
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  organization: string;
  watchlist: UserWatchlistItem[];
  preferences: {
    currency: 'BRL' | 'USD';
    theme: 'light' | 'dark';
    language: 'pt-BR' | 'en';
    notificationsEnabled: boolean;
  };
  createdAt: string;
  lastLogin: string;
}

/**
 * Resposta padrão do endpoint GET /api/me da API Azure
 */
export interface MeResponse {
  success: boolean;
  data: UserProfile;
  unreadNotifications: number;
  serverRegion: string;
}
