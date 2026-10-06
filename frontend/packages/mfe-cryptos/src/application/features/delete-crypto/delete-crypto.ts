import { CatalogGateway } from '../../ports/catalog.gateway';

export function deleteCrypto(catalog: CatalogGateway, id: string): Promise<void> {
  return catalog.deleteCrypto(id);
}
