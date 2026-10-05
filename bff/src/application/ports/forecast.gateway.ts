import { Forecast, PricePoint } from '../../domain/models';

/** Porta para a Azure Function GetForecast. */
export abstract class ForecastGateway {
  abstract getForecast(prices: readonly PricePoint[], horizon: number): Promise<Forecast>;
}
