import { WatchlistItem } from '../../../domain/crypto';
import { CatalogGateway } from '../../ports/catalog.gateway';

export function addToWatchlist(catalog: CatalogGateway, cryptocurrencyId: string, notes: string = ''): Promise<WatchlistItem> {
  return catalog.addToWatchlist(cryptocurrencyId, notes.trim() || null);
}
