import { CatalogGateway } from '../../ports/catalog.gateway';
import { DeleteCryptoCommand } from './delete-crypto.command';

/** Exclui uma criptomoeda do catálogo. */
export class DeleteCryptoHandler {
  constructor(private readonly catalog: CatalogGateway) {}

  execute(command: DeleteCryptoCommand): Promise<void> {
    return this.catalog.deleteCrypto(command.accessToken, command.id);
  }
}
