import { Forecast, ForecastPoint, PricePoint, UserCrypto } from './models';

/** Quantidade mínima de preços para pedir uma previsão (a mesma exigida pela Function). */
export const MIN_POINTS_FOR_FORECAST = 14;

export const DEFAULT_HISTORY_LIMIT = 90;
export const MAX_HISTORY_LIMIT = 365;
export const DEFAULT_FORECAST_HORIZON = 7;
export const MAX_FORECAST_HORIZON = 30;

/** Resultado da consulta de histórico de uma criptomoeda no MarketData. */
export type HistoryOutcome = { status: 'ok'; prices: PricePoint[] } | { status: 'unavailable' };

/**
 * Resultado da previsão de uma criptomoeda:
 * - ok: a Function devolveu a previsão;
 * - insufficient-history: há menos preços que o mínimo, e a Function não foi chamada;
 * - unavailable: o histórico ou a Function não responderam.
 */
export type ForecastOutcome =
  | { status: 'ok'; forecast: Forecast }
  | { status: 'insufficient-history' }
  | { status: 'unavailable' };

export interface HistoryPoint {
  timestamp: string;
  priceUsd: number;
}

/** Tudo o que o dashboard mostra sobre uma criptomoeda monitorada. */
export interface CryptoAggregate {
  userCryptoId: string;
  cryptocurrencyId: string;
  symbol: string;
  name: string;
  coinGeckoId: string;
  notes: string | null;
  latestPriceUsd: number | null;
  latestPriceAt: string | null;
  historyStatus: HistoryOutcome['status'];
  history: HistoryPoint[];
  /** Variação percentual entre o primeiro e o último preço do histórico. */
  periodChangePercent: number | null;
  forecastStatus: ForecastOutcome['status'];
  forecast: { model: string; horizon: number; points: ForecastPoint[] } | null;
}

export interface AggregatedData {
  generatedAt: string;
  cryptos: CryptoAggregate[];
}

export function canForecast(prices: readonly PricePoint[]): boolean {
  return prices.length >= MIN_POINTS_FOR_FORECAST;
}

export function periodChangePercent(history: readonly HistoryPoint[]): number | null {
  if (history.length < 2 || history[0].priceUsd === 0) {
    return null;
  }

  const first = history[0].priceUsd;
  const last = history[history.length - 1].priceUsd;

  return Math.round(((last - first) / first) * 10000) / 100;
}

/** Combina os dados do Catalog, do MarketData e da Function em um único item. */
export function buildCryptoAggregate(
  userCrypto: UserCrypto,
  historyOutcome: HistoryOutcome,
  forecastOutcome: ForecastOutcome,
): CryptoAggregate {
  const history =
    historyOutcome.status === 'ok'
      ? historyOutcome.prices.map(({ timestamp, priceUsd }) => ({ timestamp, priceUsd }))
      : [];

  return {
    userCryptoId: userCrypto.id,
    cryptocurrencyId: userCrypto.cryptocurrencyId,
    symbol: userCrypto.symbol,
    name: userCrypto.name,
    coinGeckoId: userCrypto.coinGeckoId,
    notes: userCrypto.notes,
    latestPriceUsd: userCrypto.latestPriceUsd,
    latestPriceAt: userCrypto.latestPriceAt,
    historyStatus: historyOutcome.status,
    history,
    periodChangePercent: periodChangePercent(history),
    forecastStatus: forecastOutcome.status,
    forecast:
      forecastOutcome.status === 'ok'
        ? {
            model: forecastOutcome.forecast.model,
            horizon: forecastOutcome.forecast.horizon,
            points: forecastOutcome.forecast.forecast,
          }
        : null,
  };
}
