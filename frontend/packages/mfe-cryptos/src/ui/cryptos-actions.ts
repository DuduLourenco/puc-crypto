import { Crypto, CryptoDraft, WatchlistItem } from '../domain/crypto';

/** Casos de uso que a tela aciona. Quem os liga aos adaptadores é a raiz de composição. */
export interface CryptosActions {
  listCatalog(): Promise<Crypto[]>;
  createCrypto(draft: CryptoDraft): Promise<Crypto>;
  updateCrypto(id: string, data: { symbol: string; name: string }): Promise<Crypto>;
  deleteCrypto(id: string): Promise<void>;

  listWatchlist(): Promise<WatchlistItem[]>;
  addToWatchlist(cryptocurrencyId: string): Promise<WatchlistItem>;
  updateWatchlistNotes(id: string, notes: string): Promise<WatchlistItem>;
  removeFromWatchlist(id: string): Promise<void>;
}
