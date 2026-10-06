import { Crypto } from '../../../domain/crypto';
import { CatalogGateway } from '../../ports/catalog.gateway';

export function listCatalog(catalog: CatalogGateway): Promise<Crypto[]> {
  return catalog.listCryptos();
}
