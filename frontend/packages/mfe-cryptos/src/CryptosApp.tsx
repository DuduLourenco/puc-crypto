import { bffClient } from '@puccrypto/shared';
import '@puccrypto/shared/theme.css';
import { addToWatchlist } from './application/features/add-to-watchlist/add-to-watchlist';
import { createCrypto } from './application/features/create-crypto/create-crypto';
import { deleteCrypto } from './application/features/delete-crypto/delete-crypto';
import { listCatalog } from './application/features/list-catalog/list-catalog';
import { listWatchlist } from './application/features/list-watchlist/list-watchlist';
import { removeFromWatchlist } from './application/features/remove-from-watchlist/remove-from-watchlist';
import { updateCrypto } from './application/features/update-crypto/update-crypto';
import { updateWatchlistNotes } from './application/features/update-watchlist-notes/update-watchlist-notes';
import { BffCatalogGateway } from './infrastructure/bff-catalog.gateway';
import { CryptosPage } from './ui/CryptosPage';
import { CryptosActions } from './ui/cryptos-actions';

// Raiz de composição do microfrontend: liga os casos de uso ao adaptador do BFF.
const catalog = new BffCatalogGateway(bffClient);

const actions: CryptosActions = {
  listCatalog: () => listCatalog(catalog),
  createCrypto: (draft) => createCrypto(catalog, draft),
  updateCrypto: (id, data) => updateCrypto(catalog, id, data),
  deleteCrypto: (id) => deleteCrypto(catalog, id),
  listWatchlist: () => listWatchlist(catalog),
  addToWatchlist: (cryptocurrencyId) => addToWatchlist(catalog, cryptocurrencyId),
  updateWatchlistNotes: (id, notes) => updateWatchlistNotes(catalog, id, notes),
  removeFromWatchlist: (id) => removeFromWatchlist(catalog, id),
};

/** Módulo exposto ao shell pelo Module Federation. */
export default function CryptosApp() {
  return <CryptosPage actions={actions} />;
}
