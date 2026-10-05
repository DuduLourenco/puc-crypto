import { Crypto } from '../../../domain/models';
import { CatalogGateway } from '../../ports/catalog.gateway';
import { UpdateCryptoCommand } from './update-crypto.command';

/** Altera uma criptomoeda do catálogo. */
export class UpdateCryptoHandler {
  constructor(private readonly catalog: CatalogGateway) {}

  execute(command: UpdateCryptoCommand): Promise<Crypto> {
    return this.catalog.updateCrypto(command.accessToken, command.id, command.data);
  }
}
