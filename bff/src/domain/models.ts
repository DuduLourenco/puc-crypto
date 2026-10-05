/** Modelos de leitura que o BFF recebe dos serviços e entrega ao frontend. */

export interface Crypto {
  id: string;
  symbol: string;
  name: string;
  coinGeckoId: string;
  latestPriceUsd: number | null;
  latestPriceAt: string | null;
  createdAt: string;
}

export interface UserCrypto {
  id: string;
  cryptocurrencyId: string;
  symbol: string;
  name: string;
  coinGeckoId: string;
  latestPriceUsd: number | null;
  latestPriceAt: string | null;
  notes: string | null;
  addedAt: string;
}

export interface PricePoint {
  id: string;
  cryptocurrencyId: string;
  timestamp: string;
  priceUsd: number;
  source: string;
}

export interface TrackedAsset {
  cryptocurrencyId: string;
  coinGeckoId: string;
  symbol: string;
  name: string;
  trackedSince: string;
}

export interface ForecastPoint {
  timestamp: string;
  priceUsd: number;
  lowerUsd: number;
  upperUsd: number;
}

export interface Forecast {
  model: string;
  trainingPoints: number;
  horizon: number;
  intervalSeconds: number;
  lastObservation: { timestamp: string; priceUsd: number };
  forecast: ForecastPoint[];
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
}

export interface AccessToken {
  accessToken: string;
  expiresAt: string;
}
