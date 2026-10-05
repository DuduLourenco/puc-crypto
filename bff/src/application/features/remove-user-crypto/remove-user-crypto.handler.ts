import { CatalogGateway } from '../../ports/catalog.gateway';
import { RemoveUserCryptoCommand } from './remove-user-crypto.command';

/** Remove um item da lista do usuário. */
export class RemoveUserCryptoHandler {
  constructor(private readonly catalog: CatalogGateway) {}

  execute(command: RemoveUserCryptoCommand): Promise<void> {
    return this.catalog.removeUserCrypto(command.accessToken, command.id);
  }
}
