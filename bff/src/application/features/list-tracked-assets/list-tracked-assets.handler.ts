import { TrackedAsset } from '../../../domain/models';
import { MarketDataGateway } from '../../ports/market-data.gateway';
import { ListTrackedAssetsQuery } from './list-tracked-assets.query';

/** Lista as criptomoedas acompanhadas pelo MarketData. */
export class ListTrackedAssetsHandler {
  constructor(private readonly marketData: MarketDataGateway) {}

  execute(query: ListTrackedAssetsQuery): Promise<TrackedAsset[]> {
    return this.marketData.listTrackedAssets(query.accessToken);
  }
}
