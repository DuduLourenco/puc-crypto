import { ForecastGateway } from '../../application/ports/forecast.gateway';
import { Forecast, PricePoint } from '../../domain/models';
import { UpstreamHttpClient } from './upstream-http.client';

/** Chama a Azure Function GetForecast, autenticando com a chave da Function. */
export class ForecastHttpGateway extends ForecastGateway {
  constructor(
    private readonly http: UpstreamHttpClient,
    private readonly functionKey: string,
  ) {
    super();
  }

  getForecast(prices: readonly PricePoint[], horizon: number): Promise<Forecast> {
    return this.http.request('POST', 'forecast', {
      headers: { 'x-functions-key': this.functionKey },
      body: {
        prices: prices.map(({ timestamp, priceUsd }) => ({ timestamp, priceUsd })),
        horizon,
      },
    });
  }
}
