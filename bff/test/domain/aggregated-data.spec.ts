import {
  MIN_POINTS_FOR_FORECAST,
  buildCryptoAggregate,
  canForecast,
  periodChangePercent,
} from '../../src/domain/aggregated-data';
import { dailyPrices, forecast, userCrypto } from '../support/fixtures';

describe('aggregated-data (domínio)', () => {
  it('só permite previsão a partir do mínimo de preços', () => {
    expect(canForecast(dailyPrices(MIN_POINTS_FOR_FORECAST - 1))).toBe(false);
    expect(canForecast(dailyPrices(MIN_POINTS_FOR_FORECAST))).toBe(true);
  });

  it('calcula a variação percentual entre o primeiro e o último preço', () => {
    expect(periodChangePercent([{ timestamp: 'a', priceUsd: 100 }, { timestamp: 'b', priceUsd: 112.345 }])).toBe(12.35);
    expect(periodChangePercent([{ timestamp: 'a', priceUsd: 200 }, { timestamp: 'b', priceUsd: 150 }])).toBe(-25);
    expect(periodChangePercent([{ timestamp: 'a', priceUsd: 100 }])).toBeNull();
    expect(periodChangePercent([])).toBeNull();
  });

  it('combina os dados do Catalog, do MarketData e da Function em um item', () => {
    const aggregate = buildCryptoAggregate(
      userCrypto(),
      { status: 'ok', prices: dailyPrices(30) },
      { status: 'ok', forecast: forecast(3) },
    );

    expect(aggregate).toMatchObject({
      symbol: 'BTC',
      notes: 'longo prazo',
      latestPriceUsd: 65000,
      historyStatus: 'ok',
      forecastStatus: 'ok',
      periodChangePercent: 4.83,
    });
    expect(aggregate.history).toHaveLength(30);
    expect(aggregate.history[0]).toEqual({ timestamp: '2026-01-01T00:00:00.000Z', priceUsd: 60000 });
    expect(aggregate.forecast).toEqual({ model: 'modelo de teste', horizon: 3, points: forecast(3).forecast });
  });

  it('sem histórico e sem previsão, devolve o item do catálogo com os status', () => {
    const aggregate = buildCryptoAggregate(userCrypto(), { status: 'unavailable' }, { status: 'unavailable' });

    expect(aggregate.history).toEqual([]);
    expect(aggregate.periodChangePercent).toBeNull();
    expect(aggregate.forecast).toBeNull();
    expect(aggregate.historyStatus).toBe('unavailable');
    expect(aggregate.forecastStatus).toBe('unavailable');
  });
});
