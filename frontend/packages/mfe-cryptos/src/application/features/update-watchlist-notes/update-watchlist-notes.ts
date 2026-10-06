import { WatchlistItem } from '../../../domain/crypto';
import { CatalogGateway } from '../../ports/catalog.gateway';

/** Anotação em branco é gravada como ausente. */
export function updateWatchlistNotes(catalog: CatalogGateway, id: string, notes: string): Promise<WatchlistItem> {
  return catalog.updateWatchlistNotes(id, notes.trim() || null);
}
