import 'reflect-metadata';
import { Global, INestApplication, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ApiModule } from '../../src/api/api.module';
import { configureApp } from '../../src/api/configure-app';
import { UpstreamError, UpstreamUnavailableError } from '../../src/application/errors/upstream.errors';
import { CatalogGateway } from '../../src/application/ports/catalog.gateway';
import { ForecastGateway } from '../../src/application/ports/forecast.gateway';
import { IdentityGateway } from '../../src/application/ports/identity.gateway';
import { MarketDataGateway } from '../../src/application/ports/market-data.gateway';
import { TokenVerifier } from '../../src/application/ports/token-verifier';
import { BITCOIN_ID, dailyPrices, forecast, userCrypto } from '../support/fixtures';

/**
 * Sobe a camada API de verdade (controllers, guard, filtro, validação e Swagger), com as
 * portas da Application substituídas por dublês: nenhum serviço externo é chamado.
 */
describe('API do BFF', () => {
  const identity = { register: jest.fn(), login: jest.fn() };
  const catalog = { listUserCryptos: jest.fn(), getCrypto: jest.fn(), createCrypto: jest.fn(), deleteCrypto: jest.fn() };
  const marketData = { listPricePoints: jest.fn() };
  const forecastGateway = { getForecast: jest.fn() };
  const tokenVerifier = { verify: (token: string) => (token === 'token-valido' ? { id: 'user-1' } : null) };

  @Global()
  @Module({
    providers: [
      { provide: IdentityGateway, useValue: identity },
      { provide: CatalogGateway, useValue: catalog },
      { provide: MarketDataGateway, useValue: marketData },
      { provide: ForecastGateway, useValue: forecastGateway },
      { provide: TokenVerifier, useValue: tokenVerifier },
    ],
    exports: [IdentityGateway, CatalogGateway, MarketDataGateway, ForecastGateway, TokenVerifier],
  })
  class FakeInfrastructureModule {}

  let app: INestApplication;
  const auth = { Authorization: 'Bearer token-valido' };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [FakeInfrastructureModule, ApiModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(() => app.close());
  beforeEach(() => jest.resetAllMocks());

  describe('GET /aggregated-data', () => {
    it('devolve Catalog, MarketData e Function em um único JSON', async () => {
      catalog.listUserCryptos.mockResolvedValue([userCrypto()]);
      marketData.listPricePoints.mockResolvedValue(dailyPrices(30));
      forecastGateway.getForecast.mockResolvedValue(forecast(5));

      const response = await request(app.getHttpServer()).get('/aggregated-data?horizon=5').set(auth).expect(200);

      expect(catalog.listUserCryptos).toHaveBeenCalledWith('token-valido');
      expect(forecastGateway.getForecast).toHaveBeenCalledWith(expect.any(Array), 5);
      expect(response.body.cryptos).toHaveLength(1);
      expect(response.body.cryptos[0]).toMatchObject({ symbol: 'BTC', historyStatus: 'ok', forecastStatus: 'ok' });
      expect(response.body.cryptos[0].history).toHaveLength(30);
      expect(response.body.cryptos[0].forecast.points).toHaveLength(5);
    });

    it('recusa horizonte fora do limite', async () => {
      const response = await request(app.getHttpServer()).get('/aggregated-data?horizon=99').set(auth).expect(400);

      expect(response.body).toMatchObject({ title: 'Bff.BadRequest', status: 400 });
      expect(catalog.listUserCryptos).not.toHaveBeenCalled();
    });

    it('responde 502 quando o Catalog não responde', async () => {
      catalog.listUserCryptos.mockRejectedValue(new UpstreamUnavailableError('Catalog'));

      const response = await request(app.getHttpServer()).get('/aggregated-data').set(auth).expect(502);

      expect(response.body).toEqual({ title: 'Bff.UpstreamUnavailable', status: 502, detail: 'O serviço Catalog não respondeu.' });
    });
  });

  describe('autenticação', () => {
    it.each(['/aggregated-data', '/cryptos', '/user-cryptos', `/prices?cryptocurrencyId=${BITCOIN_ID}`, '/assets'])(
      'GET %s exige token válido',
      async (path) => {
        await request(app.getHttpServer()).get(path).expect(401);
        const response = await request(app.getHttpServer()).get(path).set('Authorization', 'Bearer invalido').expect(401);

        expect(response.body).toMatchObject({ title: 'Bff.Unauthorized', status: 401 });
      },
    );

    it('login e cadastro são públicos e repassam ao Identity', async () => {
      identity.register.mockResolvedValue({ id: 'user-1', name: 'Ana', email: 'ana@example.com' });
      identity.login.mockResolvedValue({ accessToken: 'jwt', expiresAt: '2026-01-01T01:00:00Z' });
      const credentials = { email: 'ana@example.com', password: 'senha-segura-1' };

      await request(app.getHttpServer()).post('/auth/register').send({ name: 'Ana', ...credentials }).expect(201);
      const login = await request(app.getHttpServer()).post('/auth/login').send(credentials).expect(200);

      expect(identity.login).toHaveBeenCalledWith(credentials);
      expect(login.body.accessToken).toBe('jwt');
    });
  });

  describe('repasse dos CRUDs', () => {
    it('devolve ao cliente o mesmo status e o mesmo corpo de erro do serviço', async () => {
      const problem = { title: 'Catalog.CryptoAlreadyRegistered', status: 409, detail: 'Já existe.' };
      catalog.createCrypto.mockRejectedValue(new UpstreamError('Catalog', 409, problem));

      const response = await request(app.getHttpServer())
        .post('/cryptos')
        .set(auth)
        .send({ coinGeckoId: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' })
        .expect(409);

      expect(response.body).toEqual(problem);
      expect(catalog.createCrypto).toHaveBeenCalledWith('token-valido', { coinGeckoId: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' });
    });

    it('exclusão responde 204 sem corpo', async () => {
      catalog.deleteCrypto.mockResolvedValue(undefined);

      await request(app.getHttpServer()).delete(`/cryptos/${BITCOIN_ID}`).set(auth).expect(204);

      expect(catalog.deleteCrypto).toHaveBeenCalledWith('token-valido', BITCOIN_ID);
    });

    it('id que não é UUID é recusado antes de chamar o serviço', async () => {
      await request(app.getHttpServer()).get('/cryptos/abc').set(auth).expect(400);

      expect(catalog.getCrypto).not.toHaveBeenCalled();
    });

    it('o filtro do histórico é validado e convertido', async () => {
      marketData.listPricePoints.mockResolvedValue([]);

      await request(app.getHttpServer()).get('/prices?cryptocurrencyId=abc').set(auth).expect(400);
      await request(app.getHttpServer()).get(`/prices?cryptocurrencyId=${BITCOIN_ID}&limit=30`).set(auth).expect(200);

      expect(marketData.listPricePoints).toHaveBeenCalledWith('token-valido', { cryptocurrencyId: BITCOIN_ID, limit: 30 });
    });
  });

  describe('Swagger e saúde', () => {
    it('GET /health é público', async () => {
      await request(app.getHttpServer()).get('/health').expect(200, { status: 'Healthy' });
    });

    it('o documento OpenAPI lista as rotas e o esquema de autenticação', async () => {
      const response = await request(app.getHttpServer()).get('/swagger/v1/swagger.json').expect(200);

      expect(Object.keys(response.body.paths).sort()).toEqual([
        '/aggregated-data',
        '/assets',
        '/auth/login',
        '/auth/register',
        '/cryptos',
        '/cryptos/{id}',
        '/health',
        '/prices',
        '/prices/{id}',
        '/user-cryptos',
        '/user-cryptos/{id}',
      ]);
      expect(response.body.components.securitySchemes.bearer).toMatchObject({ type: 'http', scheme: 'bearer' });
      expect(response.body.paths['/aggregated-data'].get.responses['200']).toBeDefined();
    });
  });
});
