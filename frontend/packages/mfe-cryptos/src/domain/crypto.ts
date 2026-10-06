/** Criptomoeda do catálogo. */
export interface Crypto {
  id: string;
  symbol: string;
  name: string;
  coinGeckoId: string;
  latestPriceUsd: number | null;
  latestPriceAt: string | null;
  createdAt: string;
}

/** Criptomoeda do catálogo na lista do usuário. */
export interface WatchlistItem {
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

export interface CryptoDraft {
  coinGeckoId: string;
  symbol: string;
  name: string;
}

export type CryptoDraftErrors = Partial<Record<keyof CryptoDraft, string>>;

export const NOTES_MAX_LENGTH = 500;

const COINGECKO_ID_PATTERN = /^[A-Za-z0-9-]+$/;

/** Regras conferidas antes de enviar; o Catalog valida de novo e tem a palavra final. */
export function validateCryptoDraft(draft: CryptoDraft): CryptoDraftErrors {
  const errors: CryptoDraftErrors = {};

  if (!COINGECKO_ID_PATTERN.test(draft.coinGeckoId.trim())) {
    errors.coinGeckoId = 'Use o identificador da CoinGecko: letras, números e hífen (ex.: bitcoin).';
  }
  if (!draft.symbol.trim() || draft.symbol.trim().length > 10) {
    errors.symbol = 'Informe o símbolo, com até 10 caracteres (ex.: BTC).';
  }
  if (!draft.name.trim()) {
    errors.name = 'Informe o nome.';
  }

  return errors;
}

export function normalizeCryptoDraft(draft: CryptoDraft): CryptoDraft {
  return {
    coinGeckoId: draft.coinGeckoId.trim().toLowerCase(),
    symbol: draft.symbol.trim().toUpperCase(),
    name: draft.name.trim(),
  };
}

/** Criptomoedas do catálogo que ainda não estão na lista do usuário. */
export function notInWatchlist(catalog: readonly Crypto[], watchlist: readonly WatchlistItem[]): Crypto[] {
  const watched = new Set(watchlist.map((item) => item.cryptocurrencyId));

  return catalog.filter((crypto) => !watched.has(crypto.id));
}

export function isInWatchlist(crypto: Crypto, watchlist: readonly WatchlistItem[]): boolean {
  return watchlist.some((item) => item.cryptocurrencyId === crypto.id);
}
