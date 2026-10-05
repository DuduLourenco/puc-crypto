import {
  CreatePricePointData,
  MarketDataGateway,
  PricePointFilter,
  UpdatePricePointData,
} from '../../application/ports/market-data.gateway';
import { PricePoint, TrackedAsset } from '../../domain/models';
import { UpstreamHttpClient } from './upstream-http.client';

export class MarketDataHttpGateway extends MarketDataGateway {
  constructor(private readonly http: UpstreamHttpClient) {
    super();
  }

  listTrackedAssets(accessToken: string): Promise<TrackedAsset[]> {
    return this.http.request('GET', 'assets', { accessToken });
  }

  listPricePoints(accessToken: string, filter: PricePointFilter): Promise<PricePoint[]> {
    return this.http.request('GET', 'prices', {
      accessToken,
      query: {
        cryptocurrencyId: filter.cryptocurrencyId,
        from: filter.from,
        to: filter.to,
        limit: filter.limit,
      },
    });
  }

  getPricePoint(accessToken: string, id: string): Promise<PricePoint> {
    return this.http.request('GET', `prices/${encodeURIComponent(id)}`, { accessToken });
  }

  createPricePoint(accessToken: string, data: CreatePricePointData): Promise<PricePoint> {
    return this.http.request('POST', 'prices', { accessToken, body: data });
  }

  updatePricePoint(accessToken: string, id: string, data: UpdatePricePointData): Promise<PricePoint> {
    return this.http.request('PUT', `prices/${encodeURIComponent(id)}`, { accessToken, body: data });
  }

  deletePricePoint(accessToken: string, id: string): Promise<void> {
    return this.http.request('DELETE', `prices/${encodeURIComponent(id)}`, { accessToken });
  }
}
