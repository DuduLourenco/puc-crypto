import { Crypto, CryptoDraft, WatchlistItem } from '../../domain/crypto';

/** Porta para o catálogo e a lista do usuário, atendidos pelo BFF. */
export interface CatalogGateway {
  listCryptos(): Promise<Crypto[]>;
  createCrypto(draft: CryptoDraft): Promise<Crypto>;
  updateCrypto(id: string, data: { symbol: string; name: string }): Promise<Crypto>;
  deleteCrypto(id: string): Promise<void>;

  listWatchlist(): Promise<WatchlistItem[]>;
  addToWatchlist(cryptocurrencyId: string, notes: string | null): Promise<WatchlistItem>;
  updateWatchlistNotes(id: string, notes: string | null): Promise<WatchlistItem>;
  removeFromWatchlist(id: string): Promise<void>;
}
