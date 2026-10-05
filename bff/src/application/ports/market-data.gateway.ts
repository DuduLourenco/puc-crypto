import { PricePoint, TrackedAsset } from '../../domain/models';

export interface PricePointFilter {
  cryptocurrencyId: string;
  from?: string;
  to?: string;
  limit?: number;
}

export interface CreatePricePointData {
  cryptocurrencyId: string;
  timestamp: string;
  priceUsd: number;
}

export interface UpdatePricePointData {
  priceUsd: number;
}

/** Porta para o microsserviço MarketData. O token do usuário é repassado em todas as chamadas. */
export abstract class MarketDataGateway {
  abstract listTrackedAssets(accessToken: string): Promise<TrackedAsset[]>;
  abstract listPricePoints(accessToken: string, filter: PricePointFilter): Promise<PricePoint[]>;
  abstract getPricePoint(accessToken: string, id: string): Promise<PricePoint>;
  abstract createPricePoint(accessToken: string, data: CreatePricePointData): Promise<PricePoint>;
  abstract updatePricePoint(accessToken: string, id: string, data: UpdatePricePointData): Promise<PricePoint>;
  abstract deletePricePoint(accessToken: string, id: string): Promise<void>;
}
