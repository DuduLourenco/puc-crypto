import { WatchlistItem } from '../../../domain/crypto';
import { CatalogGateway } from '../../ports/catalog.gateway';

export function listWatchlist(catalog: CatalogGateway): Promise<WatchlistItem[]> {
  return catalog.listWatchlist();
}
