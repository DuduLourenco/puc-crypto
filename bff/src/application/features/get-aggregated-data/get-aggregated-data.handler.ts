import {
  AggregatedData,
  CryptoAggregate,
  DEFAULT_FORECAST_HORIZON,
  DEFAULT_HISTORY_LIMIT,
  ForecastOutcome,
  HistoryOutcome,
  buildCryptoAggregate,
  canForecast,
} from '../../../domain/aggregated-data';
import { PricePoint, UserCrypto } from '../../../domain/models';
import { isUpstreamFailure } from '../../errors/upstream.errors';
import { CatalogGateway } from '../../ports/catalog.gateway';
import { ForecastGateway } from '../../ports/forecast.gateway';
import { MarketDataGateway } from '../../ports/market-data.gateway';
import { GetAggregatedDataQuery } from './get-aggregated-data.query';

/**
 * Monta, em uma única resposta, tudo o que o dashboard precisa:
 * - Catalog (microsserviço SQL): as criptomoedas monitoradas pelo usuário;
 * - MarketData (microsserviço MongoDB): o histórico de preços de cada uma;
 * - Function GetForecast: a previsão a partir desse histórico.
 *
 * Sem o Catalog não há o que mostrar, e a falha é repassada. Uma falha do MarketData ou da
 * Function afeta só a criptomoeda em questão, que volta marcada como "unavailable".
 */
export class GetAggregatedDataHandler {
  constructor(
    private readonly catalog: CatalogGateway,
    private readonly marketData: MarketDataGateway,
    private readonly forecast: ForecastGateway,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(query: GetAggregatedDataQuery): Promise<AggregatedData> {
    const horizon = query.horizon ?? DEFAULT_FORECAST_HORIZON;
    const historyLimit = query.historyLimit ?? DEFAULT_HISTORY_LIMIT;

    const userCryptos = await this.catalog.listUserCryptos(query.accessToken);

    const cryptos = await Promise.all(
      userCryptos.map((userCrypto) => this.aggregate(query.accessToken, userCrypto, historyLimit, horizon)),
    );

    return { generatedAt: this.now().toISOString(), cryptos };
  }

  private async aggregate(
    accessToken: string,
    userCrypto: UserCrypto,
    historyLimit: number,
    horizon: number,
  ): Promise<CryptoAggregate> {
    const history = await this.loadHistory(accessToken, userCrypto.cryptocurrencyId, historyLimit);

    const forecast: ForecastOutcome =
      history.status === 'ok' ? await this.loadForecast(history.prices, horizon) : { status: 'unavailable' };

    return buildCryptoAggregate(userCrypto, history, forecast);
  }

  private async loadHistory(accessToken: string, cryptocurrencyId: string, limit: number): Promise<HistoryOutcome> {
    try {
      const prices = await this.marketData.listPricePoints(accessToken, { cryptocurrencyId, limit });
      return { status: 'ok', prices };
    } catch (error) {
      if (isUpstreamFailure(error)) {
        return { status: 'unavailable' };
      }
      throw error;
    }
  }

  private async loadForecast(prices: PricePoint[], horizon: number): Promise<ForecastOutcome> {
    if (!canForecast(prices)) {
      return { status: 'insufficient-history' };
    }

    try {
      return { status: 'ok', forecast: await this.forecast.getForecast(prices, horizon) };
    } catch (error) {
      if (isUpstreamFailure(error)) {
        return { status: 'unavailable' };
      }
      throw error;
    }
  }
}
