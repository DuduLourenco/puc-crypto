/** Resposta de GET /aggregated-data do BFF: Catalog + MarketData + Function de previsão. */
export interface PricePoint {
  timestamp: string;
  priceUsd: number;
}

export interface ForecastPoint extends PricePoint {
  lowerUsd: number;
  upperUsd: number;
}

export type HistoryStatus = 'ok' | 'unavailable';
export type ForecastStatus = 'ok' | 'insufficient-history' | 'unavailable';

export interface CryptoAggregate {
  userCryptoId: string;
  cryptocurrencyId: string;
  symbol: string;
  name: string;
  coinGeckoId: string;
  notes: string | null;
  latestPriceUsd: number | null;
  latestPriceAt: string | null;
  historyStatus: HistoryStatus;
  history: PricePoint[];
  periodChangePercent: number | null;
  forecastStatus: ForecastStatus;
  forecast: { model: string; horizon: number; points: ForecastPoint[] } | null;
}

export interface AggregatedData {
  generatedAt: string;
  cryptos: CryptoAggregate[];
}

export interface DashboardFilters {
  /** Dias de previsão. */
  horizon: number;
  /** Quantidade de preços do histórico. */
  historyLimit: number;
}

export const HORIZON_OPTIONS = [7, 14, 30] as const;
export const HISTORY_OPTIONS = [30, 90, 180] as const;
export const DEFAULT_FILTERS: DashboardFilters = { horizon: 7, historyLimit: 90 };

/** A criptomoeda selecionada; se ela saiu da lista, a primeira. */
export function selectCrypto(cryptos: readonly CryptoAggregate[], selectedId: string | null): CryptoAggregate | null {
  return cryptos.find((crypto) => crypto.userCryptoId === selectedId) ?? cryptos[0] ?? null;
}
