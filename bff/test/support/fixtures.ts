import { Forecast, PricePoint, UserCrypto } from '../../src/domain/models';

export const BITCOIN_ID = '11111111-1111-4111-8111-111111111111';
export const ETHEREUM_ID = '22222222-2222-4222-8222-222222222222';

export function userCrypto(overrides: Partial<UserCrypto> = {}): UserCrypto {
  return {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    cryptocurrencyId: BITCOIN_ID,
    symbol: 'BTC',
    name: 'Bitcoin',
    coinGeckoId: 'bitcoin',
    latestPriceUsd: 65000,
    latestPriceAt: '2026-01-30T00:00:00Z',
    notes: 'longo prazo',
    addedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

/** Um preço por dia a partir de 01/01/2026, subindo 100 por dia a partir de 60.000. */
export function dailyPrices(days: number, cryptocurrencyId = BITCOIN_ID): PricePoint[] {
  return Array.from({ length: days }, (_, day) => ({
    id: `price-${day}`,
    cryptocurrencyId,
    timestamp: new Date(Date.UTC(2026, 0, 1 + day)).toISOString(),
    priceUsd: 60000 + day * 100,
    source: 'CoinGecko',
  }));
}

export function forecast(horizon = 7): Forecast {
  return {
    model: 'modelo de teste',
    trainingPoints: 30,
    horizon,
    intervalSeconds: 86400,
    lastObservation: { timestamp: '2026-01-30T00:00:00.000Z', priceUsd: 62900 },
    forecast: Array.from({ length: horizon }, (_, step) => ({
      timestamp: new Date(Date.UTC(2026, 0, 31 + step)).toISOString(),
      priceUsd: 63000 + step * 100,
      lowerUsd: 62000,
      upperUsd: 64000,
    })),
  };
}
