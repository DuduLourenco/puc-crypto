import { UpstreamError, UpstreamUnavailableError } from '../../src/application/errors/upstream.errors';
import { CatalogHttpGateway } from '../../src/infrastructure/http/catalog-http.gateway';
import { ForecastHttpGateway } from '../../src/infrastructure/http/forecast-http.gateway';
import { MarketDataHttpGateway } from '../../src/infrastructure/http/market-data-http.gateway';
import { UpstreamHttpClient } from '../../src/infrastructure/http/upstream-http.client';
import { BITCOIN_ID, dailyPrices } from '../support/fixtures';

function json(status: number, body: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('UpstreamHttpClient', () => {
  let fetchMock: jest.Mock;
  let client: UpstreamHttpClient;

  const lastCall = (): { url: URL; init: RequestInit & { headers: Record<string, string> } } => ({
    url: fetchMock.mock.calls.at(-1)![0] as URL,
    init: fetchMock.mock.calls.at(-1)![1],
  });

  beforeEach(() => {
    fetchMock = jest.fn();
    client = new UpstreamHttpClient('Catalog', 'http://catalog:8080/', 1000, fetchMock as unknown as typeof fetch);
  });

  it('envia o token, o corpo em JSON e os parâmetros de consulta definidos', async () => {
    fetchMock.mockResolvedValue(json(200, { ok: true }));

    const result = await client.request('POST', 'cryptos', {
      accessToken: 'jwt',
      body: { symbol: 'BTC' },
      query: { limit: 5, from: undefined },
    });

    expect(result).toEqual({ ok: true });
    expect(lastCall().url.toString()).toBe('http://catalog:8080/cryptos?limit=5');
    expect(lastCall().init.method).toBe('POST');
    expect(lastCall().init.headers).toMatchObject({ Authorization: 'Bearer jwt', 'Content-Type': 'application/json' });
    expect(lastCall().init.body).toBe('{"symbol":"BTC"}');
  });

  it('resposta 204 não tem corpo', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(client.request('DELETE', 'cryptos/1')).resolves.toBeUndefined();
  });

  it('erro do serviço vira UpstreamError com o status e o corpo originais', async () => {
    const problem = { title: 'Catalog.CryptoNotFound', status: 404 };
    fetchMock.mockResolvedValue(json(404, problem));

    const error = await client.request('GET', 'cryptos/1').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(UpstreamError);
    expect(error).toMatchObject({ service: 'Catalog', status: 404, body: problem });
  });

  it('erro sem corpo JSON mantém o texto', async () => {
    fetchMock.mockResolvedValue(new Response('falha interna', { status: 500 }));

    await expect(client.request('GET', 'cryptos')).rejects.toMatchObject({ status: 500, body: 'falha interna' });
  });

  it('falha de rede e resposta ilegível viram UpstreamUnavailableError', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
    await expect(client.request('GET', 'cryptos')).rejects.toBeInstanceOf(UpstreamUnavailableError);

    fetchMock.mockResolvedValueOnce(new Response('<html>', { status: 200 }));
    await expect(client.request('GET', 'cryptos')).rejects.toBeInstanceOf(UpstreamUnavailableError);
  });
});

describe('gateways HTTP', () => {
  let fetchMock: jest.Mock;
  const client = (service: 'Catalog' | 'MarketData' | 'Forecast', baseUrl: string): UpstreamHttpClient =>
    new UpstreamHttpClient(service, baseUrl, 1000, fetchMock as unknown as typeof fetch);

  beforeEach(() => {
    fetchMock = jest.fn().mockImplementation(() => Promise.resolve(json(200, [])));
  });

  it('Catalog: rotas do catálogo e da lista do usuário', async () => {
    const gateway = new CatalogHttpGateway(client('Catalog', 'http://catalog:8080/'));

    await gateway.updateCrypto('jwt', BITCOIN_ID, { symbol: 'BTC', name: 'Bitcoin' });
    expect(fetchMock.mock.calls.at(-1)![0].toString()).toBe(`http://catalog:8080/cryptos/${BITCOIN_ID}`);
    expect(fetchMock.mock.calls.at(-1)![1].method).toBe('PUT');

    await gateway.listUserCryptos('jwt');
    expect(fetchMock.mock.calls.at(-1)![0].toString()).toBe('http://catalog:8080/user-cryptos');
  });

  it('MarketData: o filtro do histórico vai na query string', async () => {
    const gateway = new MarketDataHttpGateway(client('MarketData', 'http://marketdata:8080/'));

    await gateway.listPricePoints('jwt', { cryptocurrencyId: BITCOIN_ID, limit: 90 });

    expect(fetchMock.mock.calls.at(-1)![0].toString()).toBe(
      `http://marketdata:8080/prices?cryptocurrencyId=${BITCOIN_ID}&limit=90`,
    );
  });

  it('Forecast: envia a chave da Function e apenas instante e preço de cada ponto', async () => {
    const gateway = new ForecastHttpGateway(client('Forecast', 'http://function/api/'), 'chave-da-function');

    await gateway.getForecast(dailyPrices(2), 7);

    const [url, init] = fetchMock.mock.calls.at(-1)!;
    expect(url.toString()).toBe('http://function/api/forecast');
    expect(init.headers).toMatchObject({ 'x-functions-key': 'chave-da-function' });
    expect(init.headers.Authorization).toBeUndefined();
    expect(JSON.parse(init.body)).toEqual({
      prices: [
        { timestamp: '2026-01-01T00:00:00.000Z', priceUsd: 60000 },
        { timestamp: '2026-01-02T00:00:00.000Z', priceUsd: 60100 },
      ],
      horizon: 7,
    });
  });
});
