import { UserCrypto } from '../../../domain/models';
import { CatalogGateway } from '../../ports/catalog.gateway';
import { ListUserCryptosQuery } from './list-user-cryptos.query';

/** Lista as criptomoedas monitoradas pelo usuário. */
export class ListUserCryptosHandler {
  constructor(private readonly catalog: CatalogGateway) {}

  execute(query: ListUserCryptosQuery): Promise<UserCrypto[]> {
    return this.catalog.listUserCryptos(query.accessToken);
  }
}
