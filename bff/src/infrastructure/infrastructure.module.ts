import { Global, Module } from '@nestjs/common';
import { CatalogGateway } from '../application/ports/catalog.gateway';
import { ForecastGateway } from '../application/ports/forecast.gateway';
import { IdentityGateway } from '../application/ports/identity.gateway';
import { MarketDataGateway } from '../application/ports/market-data.gateway';
import { TokenVerifier } from '../application/ports/token-verifier';
import { JwtTokenVerifier } from './auth/jwt-token-verifier';
import { BFF_CONFIG, BffConfig, loadBffConfig } from './config/bff.config';
import { CatalogHttpGateway } from './http/catalog-http.gateway';
import { ForecastHttpGateway } from './http/forecast-http.gateway';
import { IdentityHttpGateway } from './http/identity-http.gateway';
import { MarketDataHttpGateway } from './http/market-data-http.gateway';
import { UpstreamHttpClient } from './http/upstream-http.client';

/**
 * Liga cada porta da Application ao seu adaptador. É global para que a camada API
 * receba as portas por injeção sem importar nada da Infrastructure.
 */
@Global()
@Module({
  providers: [
    { provide: BFF_CONFIG, useFactory: () => loadBffConfig() },
    {
      provide: IdentityGateway,
      inject: [BFF_CONFIG],
      useFactory: (config: BffConfig) =>
        new IdentityHttpGateway(new UpstreamHttpClient('Identity', config.identityUrl, config.upstreamTimeoutMs)),
    },
    {
      provide: CatalogGateway,
      inject: [BFF_CONFIG],
      useFactory: (config: BffConfig) =>
        new CatalogHttpGateway(new UpstreamHttpClient('Catalog', config.catalogUrl, config.upstreamTimeoutMs)),
    },
    {
      provide: MarketDataGateway,
      inject: [BFF_CONFIG],
      useFactory: (config: BffConfig) =>
        new MarketDataHttpGateway(new UpstreamHttpClient('MarketData', config.marketDataUrl, config.upstreamTimeoutMs)),
    },
    {
      provide: ForecastGateway,
      inject: [BFF_CONFIG],
      useFactory: (config: BffConfig) =>
        new ForecastHttpGateway(
          new UpstreamHttpClient('Forecast', config.forecastUrl, config.upstreamTimeoutMs),
          config.forecastFunctionKey,
        ),
    },
    {
      provide: TokenVerifier,
      inject: [BFF_CONFIG],
      useFactory: (config: BffConfig) =>
        new JwtTokenVerifier(config.jwt.signingKey, config.jwt.issuer, config.jwt.audience),
    },
  ],
  exports: [IdentityGateway, CatalogGateway, MarketDataGateway, ForecastGateway, TokenVerifier],
})
export class InfrastructureModule {}
