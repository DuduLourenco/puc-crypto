import { BffClient } from '@puccrypto/shared';
import { CatalogGateway } from '../application/ports/catalog.gateway';
import { Crypto, CryptoDraft, WatchlistItem } from '../domain/crypto';

export class BffCatalogGateway implements CatalogGateway {
  constructor(private readonly bff: BffClient) {}

  listCryptos(): Promise<Crypto[]> {
    return this.bff.request('GET', 'cryptos');
  }

  createCrypto(draft: CryptoDraft): Promise<Crypto> {
    return this.bff.request('POST', 'cryptos', { body: draft });
  }

  updateCrypto(id: string, data: { symbol: string; name: string }): Promise<Crypto> {
    return this.bff.request('PUT', `cryptos/${id}`, { body: data });
  }

  deleteCrypto(id: string): Promise<void> {
    return this.bff.request('DELETE', `cryptos/${id}`);
  }

  listWatchlist(): Promise<WatchlistItem[]> {
    return this.bff.request('GET', 'user-cryptos');
  }

  addToWatchlist(cryptocurrencyId: string, notes: string | null): Promise<WatchlistItem> {
    return this.bff.request('POST', 'user-cryptos', { body: { cryptocurrencyId, notes } });
  }

  updateWatchlistNotes(id: string, notes: string | null): Promise<WatchlistItem> {
    return this.bff.request('PUT', `user-cryptos/${id}`, { body: { notes } });
  }

  removeFromWatchlist(id: string): Promise<void> {
    return this.bff.request('DELETE', `user-cryptos/${id}`);
  }
}
