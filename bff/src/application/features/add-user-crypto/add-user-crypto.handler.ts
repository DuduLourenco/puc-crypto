import { UserCrypto } from '../../../domain/models';
import { CatalogGateway } from '../../ports/catalog.gateway';
import { AddUserCryptoCommand } from './add-user-crypto.command';

/** Adiciona uma criptomoeda à lista do usuário. */
export class AddUserCryptoHandler {
  constructor(private readonly catalog: CatalogGateway) {}

  execute(command: AddUserCryptoCommand): Promise<UserCrypto> {
    return this.catalog.addUserCrypto(command.accessToken, command.data);
  }
}
