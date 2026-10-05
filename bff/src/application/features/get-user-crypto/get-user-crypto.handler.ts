import { UserCrypto } from '../../../domain/models';
import { CatalogGateway } from '../../ports/catalog.gateway';
import { GetUserCryptoQuery } from './get-user-crypto.query';

/** Devolve um item da lista do usuário. */
export class GetUserCryptoHandler {
  constructor(private readonly catalog: CatalogGateway) {}

  execute(query: GetUserCryptoQuery): Promise<UserCrypto> {
    return this.catalog.getUserCrypto(query.accessToken, query.id);
  }
}
