import { Crypto, CryptoDraft, normalizeCryptoDraft } from '../../../domain/crypto';
import { CatalogGateway } from '../../ports/catalog.gateway';

/** Cadastra a criptomoeda no catálogo, com símbolo e identificador normalizados. */
export function createCrypto(catalog: CatalogGateway, draft: CryptoDraft): Promise<Crypto> {
  return catalog.createCrypto(normalizeCryptoDraft(draft));
}
