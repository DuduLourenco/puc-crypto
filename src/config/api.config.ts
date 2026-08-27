/**
 * Configurações de conexão e endpoints para a API Azure
 */
export const API_CONFIG = {
  // URL base da API hospedada no Azure (App Service, Azure Functions ou APIM)
  baseUrl: (import.meta.env.VITE_AZURE_API_URL as string) || 'https://puc-crypto-api.azurewebsites.net/api',
  
  // Chave de Assinatura do Azure API Management (se aplicável)
  apimSubscriptionKey: (import.meta.env.VITE_AZURE_APIM_KEY as string) || '',
  
  // Token Bearer simulado/real para autenticação
  authToken: (import.meta.env.VITE_API_AUTH_TOKEN as string) || 'puc-crypto-session-token-azure',

  // Habilitar fallback para mock transparente caso a API Azure esteja offline
  useMockFallback: (import.meta.env.VITE_USE_MOCK_FALLBACK as string) !== 'false',

  // Mapeamento dos endpoints REST
  endpoints: {
    me: '/me',
    cryptos: '/cryptos',
    cryptoDetails: (id: string) => `/cryptos/${id}`,
    watchlist: '/me/watchlist',
    transactions: '/me/transactions',
    order: '/orders/execute',
  },

  // Headers padrão
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
