import { Crypto } from '../../../domain/models';
import { CatalogGateway } from '../../ports/catalog.gateway';
import { ListCryptosQuery } from './list-cryptos.query';

/** Lista o catálogo de criptomoedas. */
export class ListCryptosHandler {
  constructor(private readonly catalog: CatalogGateway) {}

  execute(query: ListCryptosQuery): Promise<Crypto[]> {
    return this.catalog.listCryptos(query.accessToken);
  }
}
