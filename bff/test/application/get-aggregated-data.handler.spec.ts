import { UpstreamError, UpstreamUnavailableError } from '../../src/application/errors/upstream.errors';
import { GetAggregatedDataHandler } from '../../src/application/features/get-aggregated-data/get-aggregated-data.handler';
import { CatalogGateway } from '../../src/application/ports/catalog.gateway';
import { ForecastGateway } from '../../src/application/ports/forecast.gateway';
import { MarketDataGateway } from '../../src/application/ports/market-data.gateway';
import { BITCOIN_ID, ETHEREUM_ID, dailyPrices, forecast, userCrypto } from '../support/fixtures';

describe('GetAggregatedDataHandler', () => {
  const now = new Date('2026-02-01T12:00:00Z');

  let catalog: jest.Mocked<Pick<CatalogGateway, 'listUserCryptos'>>;
  let marketData: jest.Mocked<Pick<MarketDataGateway, 'listPricePoints'>>;
  let forecastGateway: jest.Mocked<ForecastGateway>;
  let handler: GetAggregatedDataHandler;

  beforeEach(() => {
    catalog = { listUserCryptos: jest.fn().mockResolvedValue([userCrypto()]) };
    marketData = { listPricePoints: jest.fn().mockResolvedValue(dailyPrices(30)) };
    forecastGateway = { getForecast: jest.fn().mockImplementation((_, horizon: number) => Promise.resolve(forecast(horizon))) };

    handler = new GetAggregatedDataHandler(
      catalog as unknown as CatalogGateway,
      marketData as unknown as MarketDataGateway,
      forecastGateway,
      () => now,
    );
  });

  it('consulta Catalog, MarketData e Function e devolve tudo em uma resposta', async () => {
    const result = await handler.execute({ accessToken: 'token' });

    expect(catalog.listUserCryptos).toHaveBeenCalledWith('token');
    expect(marketData.listPricePoints).toHaveBeenCalledWith('token', { cryptocurrencyId: BITCOIN_ID, limit: 90 });
    expect(forecastGateway.getForecast).toHaveBeenCalledWith(dailyPrices(30), 7);
    expect(result.generatedAt).toBe('2026-02-01T12:00:00.000Z');
    expect(result.cryptos).toHaveLength(1);
    expect(result.cryptos[0]).toMatchObject({ symbol: 'BTC', historyStatus: 'ok', forecastStatus: 'ok' });
    expect(result.cryptos[0].history).toHaveLength(30);
    expect(result.cryptos[0].forecast?.points).toHaveLength(7);
  });

  it('usa o horizonte e o limite de histórico informados', async () => {
    await handler.execute({ accessToken: 'token', horizon: 3, historyLimit: 45 });

    expect(marketData.listPricePoints).toHaveBeenCalledWith('token', { cryptocurrencyId: BITCOIN_ID, limit: 45 });
    expect(forecastGateway.getForecast).toHaveBeenCalledWith(expect.anything(), 3);
  });

  it('com histórico insuficiente, não chama a Function', async () => {
    marketData.listPricePoints.mockResolvedValue(dailyPrices(5));

    const result = await handler.execute({ accessToken: 'token' });

    expect(forecastGateway.getForecast).not.toHaveBeenCalled();
    expect(result.cryptos[0]).toMatchObject({ historyStatus: 'ok', forecastStatus: 'insufficient-history', forecast: null });
    expect(result.cryptos[0].history).toHaveLength(5);
  });

  it('se a Function falha, devolve o histórico e marca a previsão como indisponível', async () => {
    forecastGateway.getForecast.mockRejectedValue(new UpstreamUnavailableError('Forecast'));

    const result = await handler.execute({ accessToken: 'token' });

    expect(result.cryptos[0]).toMatchObject({ historyStatus: 'ok', forecastStatus: 'unavailable', forecast: null });
    expect(result.cryptos[0].history).toHaveLength(30);
  });

  it('se o MarketData falha para uma criptomoeda, as demais não são afetadas', async () => {
    catalog.listUserCryptos.mockResolvedValue([
      userCrypto(),
      userCrypto({ id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', cryptocurrencyId: ETHEREUM_ID, symbol: 'ETH', name: 'Ethereum' }),
    ]);
    marketData.listPricePoints.mockImplementation((_, filter) =>
      filter.cryptocurrencyId === ETHEREUM_ID
        ? Promise.reject(new UpstreamError('MarketData', 500, null))
        : Promise.resolve(dailyPrices(30)),
    );

    const result = await handler.execute({ accessToken: 'token' });

    expect(result.cryptos.map((crypto) => [crypto.symbol, crypto.historyStatus, crypto.forecastStatus])).toEqual([
      ['BTC', 'ok', 'ok'],
      ['ETH', 'unavailable', 'unavailable'],
    ]);
    expect(forecastGateway.getForecast).toHaveBeenCalledTimes(1);
  });

  it('sem criptomoedas monitoradas, devolve a lista vazia sem chamar os outros serviços', async () => {
    catalog.listUserCryptos.mockResolvedValue([]);

    const result = await handler.execute({ accessToken: 'token' });

    expect(result.cryptos).toEqual([]);
    expect(marketData.listPricePoints).not.toHaveBeenCalled();
  });

  it('a falha do Catalog é repassada: sem ele não há o que agregar', async () => {
    const failure = new UpstreamError('Catalog', 401, { title: 'Unauthorized' });
    catalog.listUserCryptos.mockRejectedValue(failure);

    await expect(handler.execute({ accessToken: 'token' })).rejects.toBe(failure);
  });

  it('erros que não são de serviço externo não são engolidos', async () => {
    marketData.listPricePoints.mockRejectedValue(new TypeError('erro de programação'));

    await expect(handler.execute({ accessToken: 'token' })).rejects.toThrow(TypeError);
  });
});
