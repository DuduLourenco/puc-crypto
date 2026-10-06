import { CatalogGateway } from '../../ports/catalog.gateway';

export function removeFromWatchlist(catalog: CatalogGateway, id: string): Promise<void> {
  return catalog.removeFromWatchlist(id);
}
