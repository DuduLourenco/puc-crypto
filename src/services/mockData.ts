import { CryptoAsset, CryptoListResponse, MarketOverview } from '../types/crypto.types';
import { UserProfile, MeResponse } from '../types/user.types';

/**
 * Resumo Global do Mercado em Reais (BRL)
 */
export const MOCK_MARKET_OVERVIEW: MarketOverview = {
  totalMarketCapBrl: 14850000000000.00, // R$ 14.85 Triliões
  totalVolume24hBrl: 485900000000.00,  // R$ 485.9 Bilhões
  btcDominancePercent: 57.2,
  ethDominancePercent: 18.4,
  solDominancePercent: 8.5,
  marketTrend: 'bullish',
  marketChange24h: 2.7,
};

/**
 * Mock de Criptomoedas com cotações e métricas em Reais (BRL)
 */
export const MOCK_CRYPTOS: CryptoAsset[] = [
  {
    rank: 1,
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    iconUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    priceBrl: 348920.50,
    change24h: 3.92,
    high24h: 352100.00,
    low24h: 341500.00,
    volume24hBrl: 145890200.00,
    marketCapBrl: 6890450120300.00,
    circulatingSupply: '19.7M BTC',
    rating: 5,
    lastModified: '21 Out, 2026',
    category: 'layer1',
    sparkline7d: [330000, 334000, 332000, 339000, 342500, 345000, 348920.50],
  },
  {
    rank: 2,
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    iconUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    priceBrl: 18450.20,
    change24h: -0.74,
    high24h: 18900.00,
    low24h: 18200.00,
    volume24hBrl: 85200300.00,
    marketCapBrl: 2220100450000.00,
    circulatingSupply: '120.2M ETH',
    rating: 5,
    lastModified: '15 Out, 2026',
    category: 'layer1',
    sparkline7d: [18900, 18750, 18600, 18300, 18550, 18400, 18450.20],
  },
  {
    rank: 3,
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    iconUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    priceBrl: 982.40,
    change24h: 8.24,
    high24h: 995.00,
    low24h: 905.00,
    volume24hBrl: 36400000.00,
    marketCapBrl: 456000000000.00,
    circulatingSupply: '465.1M SOL',
    rating: 4,
    lastModified: '10 Out, 2026',
    category: 'layer1',
    sparkline7d: [890, 905, 920, 915, 940, 960, 982.40],
  },
  {
    rank: 4,
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ADA',
    iconUrl: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    priceBrl: 3.48,
    change24h: 1.85,
    high24h: 3.55,
    low24h: 3.39,
    volume24hBrl: 12400000.00,
    marketCapBrl: 124500000000.00,
    circulatingSupply: '35.6B ADA',
    rating: 4,
    lastModified: '08 Out, 2026',
    category: 'layer1',
    sparkline7d: [3.35, 3.38, 3.42, 3.40, 3.45, 3.44, 3.48],
  },
  {
    rank: 5,
    id: 'ripple',
    name: 'XRP',
    symbol: 'XRP',
    iconUrl: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    priceBrl: 3.22,
    change24h: -1.15,
    high24h: 3.30,
    low24h: 3.18,
    volume24hBrl: 18500000.00,
    marketCapBrl: 178000000000.00,
    circulatingSupply: '56.1B XRP',
    rating: 4,
    lastModified: '05 Out, 2026',
    category: 'layer1',
    sparkline7d: [3.30, 3.28, 3.25, 3.20, 3.22, 3.24, 3.22],
  },
  {
    rank: 6,
    id: 'polkadot',
    name: 'Polkadot',
    symbol: 'DOT',
    iconUrl: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    priceBrl: 38.60,
    change24h: -0.72,
    high24h: 39.50,
    low24h: 37.80,
    volume24hBrl: 7100000.00,
    marketCapBrl: 56000000000.00,
    circulatingSupply: '1.4B DOT',
    rating: 4,
    lastModified: '02 Out, 2026',
    category: 'layer1',
    sparkline7d: [39.2, 39.0, 38.4, 38.1, 38.8, 38.5, 38.60],
  },
  {
    rank: 7,
    id: 'avalanche-2',
    name: 'Avalanche',
    symbol: 'AVAX',
    iconUrl: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
    priceBrl: 168.90,
    change24h: 4.60,
    high24h: 172.00,
    low24h: 159.00,
    volume24hBrl: 21300000.00,
    marketCapBrl: 67000000000.00,
    circulatingSupply: '398.2M AVAX',
    rating: 5,
    lastModified: '01 Out, 2026',
    category: 'layer1',
    sparkline7d: [158, 160, 163, 162, 165, 166, 168.90],
  },
  {
    rank: 8,
    id: 'chainlink',
    name: 'Chainlink',
    symbol: 'LINK',
    iconUrl: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    priceBrl: 84.15,
    change24h: 2.10,
    high24h: 86.00,
    low24h: 82.30,
    volume24hBrl: 15800000.00,
    marketCapBrl: 51000000000.00,
    circulatingSupply: '608.1M LINK',
    rating: 4,
    lastModified: '29 Set, 2026',
    category: 'defi',
    sparkline7d: [81, 82, 83, 82.5, 84, 83.8, 84.15],
  },
  {
    rank: 9,
    id: 'uniswap',
    name: 'Uniswap',
    symbol: 'UNI',
    iconUrl: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
    priceBrl: 45.30,
    change24h: 5.40,
    high24h: 46.50,
    low24h: 42.80,
    volume24hBrl: 9800000.00,
    marketCapBrl: 27000000000.00,
    circulatingSupply: '600.4M UNI',
    rating: 4,
    lastModified: '28 Set, 2026',
    category: 'defi',
    sparkline7d: [42, 42.8, 43.5, 44.0, 44.8, 45.0, 45.30],
  },
  {
    rank: 10,
    id: 'tether',
    name: 'Tether USD',
    symbol: 'USDT',
    iconUrl: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    priceBrl: 5.62,
    change24h: 0.08,
    high24h: 5.64,
    low24h: 5.60,
    volume24hBrl: 95000000.00,
    marketCapBrl: 650000000000.00,
    circulatingSupply: '118.4B USDT',
    rating: 5,
    lastModified: '27 Set, 2026',
    category: 'stablecoin',
    sparkline7d: [5.61, 5.62, 5.61, 5.63, 5.62, 5.62, 5.62],
  }
];

/**
 * Mock do Usuário Logado retornado pelo endpoint /api/me (Informativo)
 */
export const MOCK_USER: UserProfile = {
  id: 'usr_puc_991823',
  name: 'Eduardo Lourenço',
  email: 'eduardo@puc-crypto.com.br',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'Analista de Mercado',
  organization: 'PUC Minas / Crypto Lab',
  watchlist: [
    {
      id: 'watch_1',
      cryptoId: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin (BTC)',
      addedAt: 'Adicionado recentemente',
      iconUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    },
    {
      id: 'watch_2',
      cryptoId: 'solana',
      symbol: 'SOL',
      name: 'Solana (SOL)',
      addedAt: 'Adicionado recentemente',
      iconUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    },
    {
      id: 'watch_3',
      cryptoId: 'avalanche-2',
      symbol: 'AVAX',
      name: 'Avalanche (AVAX)',
      addedAt: 'Adicionado recentemente',
      iconUrl: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
    },
  ],
  preferences: {
    currency: 'BRL',
    theme: 'light',
    language: 'pt-BR',
    notificationsEnabled: true,
  },
  createdAt: '2025-01-15T10:00:00Z',
  lastLogin: 'Hoje às 20:00',
};

/**
 * Auxiliares de Mock
 */
export const getMockCryptoListResponse = (search?: string): CryptoListResponse => {
  let list = [...MOCK_CRYPTOS];
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }
  return {
    success: true,
    timestamp: new Date().toISOString(),
    currency: 'BRL',
    total: list.length,
    data: list,
    marketOverview: MOCK_MARKET_OVERVIEW,
  };
};

export const getMockMeResponse = (): MeResponse => {
  return {
    success: true,
    data: MOCK_USER,
    unreadNotifications: 2,
    serverRegion: 'brazilsouth (Azure)',
  };
};
