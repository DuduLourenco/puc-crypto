import { Crypto } from '../../../domain/crypto';
import { CatalogGateway } from '../../ports/catalog.gateway';

/** Altera símbolo e nome; o identificador da CoinGecko não pode ser alterado. */
export function updateCrypto(catalog: CatalogGateway, id: string, data: { symbol: string; name: string }): Promise<Crypto> {
  return catalog.updateCrypto(id, { symbol: data.symbol.trim().toUpperCase(), name: data.name.trim() });
}
