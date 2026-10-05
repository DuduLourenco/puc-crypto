import { Crypto } from '../../../domain/models';
import { CatalogGateway } from '../../ports/catalog.gateway';
import { CreateCryptoCommand } from './create-crypto.command';

/** Cadastra uma criptomoeda no catálogo. */
export class CreateCryptoHandler {
  constructor(private readonly catalog: CatalogGateway) {}

  execute(command: CreateCryptoCommand): Promise<Crypto> {
    return this.catalog.createCrypto(command.accessToken, command.data);
  }
}
