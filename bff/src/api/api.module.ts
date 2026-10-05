import { Module, Provider } from '@nestjs/common';
import { AddUserCryptoHandler } from '../application/features/add-user-crypto/add-user-crypto.handler';
import { CreateCryptoHandler } from '../application/features/create-crypto/create-crypto.handler';
import { CreatePricePointHandler } from '../application/features/create-price-point/create-price-point.handler';
import { DeleteCryptoHandler } from '../application/features/delete-crypto/delete-crypto.handler';
import { DeletePricePointHandler } from '../application/features/delete-price-point/delete-price-point.handler';
import { GetAggregatedDataHandler } from '../application/features/get-aggregated-data/get-aggregated-data.handler';
import { GetCryptoHandler } from '../application/features/get-crypto/get-crypto.handler';
import { GetPricePointHandler } from '../application/features/get-price-point/get-price-point.handler';
import { GetUserCryptoHandler } from '../application/features/get-user-crypto/get-user-crypto.handler';
import { ListCryptosHandler } from '../application/features/list-cryptos/list-cryptos.handler';
import { ListPricePointsHandler } from '../application/features/list-price-points/list-price-points.handler';
import { ListTrackedAssetsHandler } from '../application/features/list-tracked-assets/list-tracked-assets.handler';
import { ListUserCryptosHandler } from '../application/features/list-user-cryptos/list-user-cryptos.handler';
import { LoginUserHandler } from '../application/features/login-user/login-user.handler';
import { RegisterUserHandler } from '../application/features/register-user/register-user.handler';
import { RemoveUserCryptoHandler } from '../application/features/remove-user-crypto/remove-user-crypto.handler';
import { UpdateCryptoHandler } from '../application/features/update-crypto/update-crypto.handler';
import { UpdatePricePointHandler } from '../application/features/update-price-point/update-price-point.handler';
import { UpdateUserCryptoHandler } from '../application/features/update-user-crypto/update-user-crypto.handler';
import { CatalogGateway } from '../application/ports/catalog.gateway';
import { ForecastGateway } from '../application/ports/forecast.gateway';
import { IdentityGateway } from '../application/ports/identity.gateway';
import { MarketDataGateway } from '../application/ports/market-data.gateway';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AggregatedDataController } from './controllers/aggregated-data.controller';
import { AuthController } from './controllers/auth.controller';
import { CryptosController } from './controllers/cryptos.controller';
import { HealthController } from './controllers/health.controller';
import { PricesController } from './controllers/prices.controller';
import { UserCryptosController } from './controllers/user-cryptos.controller';

type Port = abstract new (...args: never[]) => unknown;

/**
 * Os handlers da Application são classes sem dependência do NestJS. Este provider
 * cria o handler entregando a ele as portas de que precisa, na ordem do construtor.
 */
function handler<T>(type: new (...ports: never[]) => T, ...ports: Port[]): Provider {
  return {
    provide: type,
    inject: ports,
    useFactory: (...resolved: never[]) => new type(...resolved),
  };
}

@Module({
  controllers: [
    AggregatedDataController,
    AuthController,
    CryptosController,
    UserCryptosController,
    PricesController,
    HealthController,
  ],
  providers: [
    JwtAuthGuard,

    handler(GetAggregatedDataHandler, CatalogGateway, MarketDataGateway, ForecastGateway),

    handler(RegisterUserHandler, IdentityGateway),
    handler(LoginUserHandler, IdentityGateway),

    handler(ListCryptosHandler, CatalogGateway),
    handler(GetCryptoHandler, CatalogGateway),
    handler(CreateCryptoHandler, CatalogGateway),
    handler(UpdateCryptoHandler, CatalogGateway),
    handler(DeleteCryptoHandler, CatalogGateway),

    handler(ListUserCryptosHandler, CatalogGateway),
    handler(GetUserCryptoHandler, CatalogGateway),
    handler(AddUserCryptoHandler, CatalogGateway),
    handler(UpdateUserCryptoHandler, CatalogGateway),
    handler(RemoveUserCryptoHandler, CatalogGateway),

    handler(ListTrackedAssetsHandler, MarketDataGateway),
    handler(ListPricePointsHandler, MarketDataGateway),
    handler(GetPricePointHandler, MarketDataGateway),
    handler(CreatePricePointHandler, MarketDataGateway),
    handler(UpdatePricePointHandler, MarketDataGateway),
    handler(DeletePricePointHandler, MarketDataGateway),
  ],
})
export class ApiModule {}
