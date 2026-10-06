import { CryptoDraft } from './crypto';

/**
 * Sugestões para o cadastro, com o identificador exato da CoinGecko. Evitam erro de
 * digitação: um identificador inexistente é aceito pelo catálogo, mas fica sem preços.
 */
export const POPULAR_COINS: readonly CryptoDraft[] = [
  { coinGeckoId: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { coinGeckoId: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { coinGeckoId: 'solana', symbol: 'SOL', name: 'Solana' },
  { coinGeckoId: 'ripple', symbol: 'XRP', name: 'XRP' },
  { coinGeckoId: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { coinGeckoId: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { coinGeckoId: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { coinGeckoId: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
];

/** Sugestões que ainda não estão no catálogo. */
export function availableSuggestions(registeredCoinGeckoIds: readonly string[]): CryptoDraft[] {
  const registered = new Set(registeredCoinGeckoIds);

  return POPULAR_COINS.filter((coin) => !registered.has(coin.coinGeckoId));
}
