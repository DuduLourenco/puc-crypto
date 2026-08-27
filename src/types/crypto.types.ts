/**
 * Interface que define o modelo de uma Criptomoeda informativa da API Azure
 */
export interface CryptoAsset {
  rank: number;
  id: string;
  name: string;
  symbol: string;
  iconUrl: string;
  priceBrl: number;
  change24h: number; // Percentual de variação em 24h (+3.9, -0.7, etc.)
  high24h: number;
  low24h: number;
  volume24hBrl: number;
  marketCapBrl: number;
  circulatingSupply: string;
  rating?: number; // 1 a 5 estrelas
  lastModified?: string;
  sparkline7d: number[];
  category?: 'layer1' | 'defi' | 'stablecoin' | 'meme' | 'nft';
}

/**
 * Resumo global do mercado de criptomoedas em Reais
 */
export interface MarketOverview {
  totalMarketCapBrl: number;
  totalVolume24hBrl: number;
  btcDominancePercent: number;
  ethDominancePercent: number;
  solDominancePercent: number;
  marketTrend: 'bullish' | 'bearish' | 'neutral';
  marketChange24h: number;
}

/**
 * Resposta padrão da listagem de criptomoedas da API Azure (/api/cryptos)
 */
export interface CryptoListResponse {
  success: boolean;
  timestamp: string;
  currency: 'BRL';
  total: number;
  data: CryptoAsset[];
  marketOverview?: MarketOverview;
}

/**
 * Parâmetros de consulta para o endpoint /api/cryptos
 */
export interface CryptoQueryParams {
  search?: string;
  sortBy?: 'rank' | 'name' | 'priceBrl' | 'change24h' | 'marketCapBrl' | 'volume24hBrl';
  order?: 'asc' | 'desc';
  category?: string;
  limit?: number;
  page?: number;
}
