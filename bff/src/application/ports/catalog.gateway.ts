import { Crypto, UserCrypto } from '../../domain/models';

export interface CreateCryptoData {
  coinGeckoId: string;
  symbol: string;
  name: string;
}

export interface UpdateCryptoData {
  symbol: string;
  name: string;
}

export interface AddUserCryptoData {
  cryptocurrencyId: string;
  notes?: string | null;
}

export interface UpdateUserCryptoData {
  notes?: string | null;
}

/** Porta para o microsserviço Catalog. O token do usuário é repassado em todas as chamadas. */
export abstract class CatalogGateway {
  abstract listCryptos(accessToken: string): Promise<Crypto[]>;
  abstract getCrypto(accessToken: string, id: string): Promise<Crypto>;
  abstract createCrypto(accessToken: string, data: CreateCryptoData): Promise<Crypto>;
  abstract updateCrypto(accessToken: string, id: string, data: UpdateCryptoData): Promise<Crypto>;
  abstract deleteCrypto(accessToken: string, id: string): Promise<void>;

  abstract listUserCryptos(accessToken: string): Promise<UserCrypto[]>;
  abstract getUserCrypto(accessToken: string, id: string): Promise<UserCrypto>;
  abstract addUserCrypto(accessToken: string, data: AddUserCryptoData): Promise<UserCrypto>;
  abstract updateUserCrypto(accessToken: string, id: string, data: UpdateUserCryptoData): Promise<UserCrypto>;
  abstract removeUserCrypto(accessToken: string, id: string): Promise<void>;
}
