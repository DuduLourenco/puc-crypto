import { UserCrypto } from '../../../domain/models';
import { CatalogGateway } from '../../ports/catalog.gateway';
import { UpdateUserCryptoCommand } from './update-user-crypto.command';

/** Altera a anotação de um item da lista do usuário. */
export class UpdateUserCryptoHandler {
  constructor(private readonly catalog: CatalogGateway) {}

  execute(command: UpdateUserCryptoCommand): Promise<UserCrypto> {
    return this.catalog.updateUserCrypto(command.accessToken, command.id, command.data);
  }
}
