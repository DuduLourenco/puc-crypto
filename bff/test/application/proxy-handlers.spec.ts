import { CreateCryptoHandler } from '../../src/application/features/create-crypto/create-crypto.handler';
import { DeletePricePointHandler } from '../../src/application/features/delete-price-point/delete-price-point.handler';
import { ListPricePointsHandler } from '../../src/application/features/list-price-points/list-price-points.handler';
import { LoginUserHandler } from '../../src/application/features/login-user/login-user.handler';
import { UpdateUserCryptoHandler } from '../../src/application/features/update-user-crypto/update-user-crypto.handler';
import { CatalogGateway } from '../../src/application/ports/catalog.gateway';
import { IdentityGateway } from '../../src/application/ports/identity.gateway';
import { MarketDataGateway } from '../../src/application/ports/market-data.gateway';
import { BITCOIN_ID, dailyPrices, userCrypto } from '../support/fixtures';

/** As slices de repasse entregam os dados à porta certa, com o token do usuário, e devolvem a resposta. */
describe('slices de repasse', () => {
  it('LoginUser chama o Identity e devolve o token', async () => {
    const token = { accessToken: 'jwt', expiresAt: '2026-01-01T01:00:00Z' };
    const identity = { login: jest.fn().mockResolvedValue(token) } as unknown as IdentityGateway;

    const result = await new LoginUserHandler(identity).execute({ data: { email: 'ana@example.com', password: 'x' } });

    expect(identity.login).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'x' });
    expect(result).toBe(token);
  });

  it('CreateCrypto repassa o token e os dados ao Catalog', async () => {
    const catalog = { createCrypto: jest.fn().mockResolvedValue({ id: BITCOIN_ID }) } as unknown as CatalogGateway;
    const data = { coinGeckoId: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' };

    await new CreateCryptoHandler(catalog).execute({ accessToken: 'token', data });

    expect(catalog.createCrypto).toHaveBeenCalledWith('token', data);
  });

  it('UpdateUserCrypto repassa o id e a anotação ao Catalog', async () => {
    const updated = userCrypto({ notes: 'nova' });
    const catalog = { updateUserCrypto: jest.fn().mockResolvedValue(updated) } as unknown as CatalogGateway;

    const result = await new UpdateUserCryptoHandler(catalog).execute({ accessToken: 'token', id: updated.id, data: { notes: 'nova' } });

    expect(catalog.updateUserCrypto).toHaveBeenCalledWith('token', updated.id, { notes: 'nova' });
    expect(result).toBe(updated);
  });

  it('ListPricePoints repassa o filtro ao MarketData', async () => {
    const marketData = { listPricePoints: jest.fn().mockResolvedValue(dailyPrices(3)) } as unknown as MarketDataGateway;
    const filter = { cryptocurrencyId: BITCOIN_ID, limit: 3 };

    const result = await new ListPricePointsHandler(marketData).execute({ accessToken: 'token', filter });

    expect(marketData.listPricePoints).toHaveBeenCalledWith('token', filter);
    expect(result).toHaveLength(3);
  });

  it('DeletePricePoint repassa o id ao MarketData', async () => {
    const marketData = { deletePricePoint: jest.fn().mockResolvedValue(undefined) } as unknown as MarketDataGateway;

    await new DeletePricePointHandler(marketData).execute({ accessToken: 'token', id: 'price-1' });

    expect(marketData.deletePricePoint).toHaveBeenCalledWith('token', 'price-1');
  });
});
