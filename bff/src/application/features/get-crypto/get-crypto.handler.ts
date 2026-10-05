import { Crypto } from '../../../domain/models';
import { CatalogGateway } from '../../ports/catalog.gateway';
import { GetCryptoQuery } from './get-crypto.query';

/** Devolve uma criptomoeda do catálogo. */
export class GetCryptoHandler {
  constructor(private readonly catalog: CatalogGateway) {}

  execute(query: GetCryptoQuery): Promise<Crypto> {
    return this.catalog.getCrypto(query.accessToken, query.id);
  }
}
