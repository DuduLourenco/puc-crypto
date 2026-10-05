import { PricePoint } from '../../../domain/models';
import { MarketDataGateway } from '../../ports/market-data.gateway';
import { ListPricePointsQuery } from './list-price-points.query';

/** Lista o histórico de preços de uma criptomoeda. */
export class ListPricePointsHandler {
  constructor(private readonly marketData: MarketDataGateway) {}

  execute(query: ListPricePointsQuery): Promise<PricePoint[]> {
    return this.marketData.listPricePoints(query.accessToken, query.filter);
  }
}
