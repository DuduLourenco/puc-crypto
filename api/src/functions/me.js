const { app } = require('@azure/functions');

/**
 * Perfil do usuário autenticado.
 *
 * Ainda é um perfil fixo: o trabalho não tem autenticação, e o CRUD desta etapa
 * cobre só as criptomoedas. Fica aqui, e não no dashboard, para que o front
 * continue consumindo /api/me como já consome — quando houver login de verdade,
 * troca-se esta constante por uma consulta ao banco sem mexer no cliente.
 */
const PERFIL = {
  "id": "usr_puc_991823",
  "name": "Eduardo Lourenço",
  "email": "eduardo@puc-crypto.com.br",
  "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "role": "Analista de Mercado",
  "organization": "PUC Minas / Crypto Lab",
  "watchlist": [
    {
      "id": "watch_1",
      "cryptoId": "bitcoin",
      "symbol": "BTC",
      "name": "Bitcoin (BTC)",
      "addedAt": "Adicionado recentemente",
      "iconUrl": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
    },
    {
      "id": "watch_2",
      "cryptoId": "solana",
      "symbol": "SOL",
      "name": "Solana (SOL)",
      "addedAt": "Adicionado recentemente",
      "iconUrl": "https://assets.coingecko.com/coins/images/4128/large/solana.png"
    },
    {
      "id": "watch_3",
      "cryptoId": "avalanche-2",
      "symbol": "AVAX",
      "name": "Avalanche (AVAX)",
      "addedAt": "Adicionado recentemente",
      "iconUrl": "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png"
    }
  ],
  "preferences": {
    "currency": "BRL",
    "theme": "light",
    "language": "pt-BR",
    "notificationsEnabled": true
  },
  "createdAt": "2025-01-15T10:00:00Z",
  "lastLogin": "Hoje às 20:00"
};

app.http('me', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'me',
  handler: async () => ({
    status: 200,
    jsonBody: {
      success: true,
      data: PERFIL,
      unreadNotifications: 2,
      serverRegion: 'eastus2 (Azure Functions)',
    },
  }),
});
