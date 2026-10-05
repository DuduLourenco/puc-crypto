import { PricePoint } from '../../../domain/models';
import { MarketDataGateway } from '../../ports/market-data.gateway';
import { GetPricePointQuery } from './get-price-point.query';

/** Devolve um preço. */
export class GetPricePointHandler {
  constructor(private readonly marketData: MarketDataGateway) {}

  execute(query: GetPricePointQuery): Promise<PricePoint> {
    return this.marketData.getPricePoint(query.accessToken, query.id);
  }
}
