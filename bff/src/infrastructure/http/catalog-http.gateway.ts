import {
  AddUserCryptoData,
  CatalogGateway,
  CreateCryptoData,
  UpdateCryptoData,
  UpdateUserCryptoData,
} from '../../application/ports/catalog.gateway';
import { Crypto, UserCrypto } from '../../domain/models';
import { UpstreamHttpClient } from './upstream-http.client';

export class CatalogHttpGateway extends CatalogGateway {
  constructor(private readonly http: UpstreamHttpClient) {
    super();
  }

  listCryptos(accessToken: string): Promise<Crypto[]> {
    return this.http.request('GET', 'cryptos', { accessToken });
  }

  getCrypto(accessToken: string, id: string): Promise<Crypto> {
    return this.http.request('GET', `cryptos/${encodeURIComponent(id)}`, { accessToken });
  }

  createCrypto(accessToken: string, data: CreateCryptoData): Promise<Crypto> {
    return this.http.request('POST', 'cryptos', { accessToken, body: data });
  }

  updateCrypto(accessToken: string, id: string, data: UpdateCryptoData): Promise<Crypto> {
    return this.http.request('PUT', `cryptos/${encodeURIComponent(id)}`, { accessToken, body: data });
  }

  deleteCrypto(accessToken: string, id: string): Promise<void> {
    return this.http.request('DELETE', `cryptos/${encodeURIComponent(id)}`, { accessToken });
  }

  listUserCryptos(accessToken: string): Promise<UserCrypto[]> {
    return this.http.request('GET', 'user-cryptos', { accessToken });
  }

  getUserCrypto(accessToken: string, id: string): Promise<UserCrypto> {
    return this.http.request('GET', `user-cryptos/${encodeURIComponent(id)}`, { accessToken });
  }

  addUserCrypto(accessToken: string, data: AddUserCryptoData): Promise<UserCrypto> {
    return this.http.request('POST', 'user-cryptos', { accessToken, body: data });
  }

  updateUserCrypto(accessToken: string, id: string, data: UpdateUserCryptoData): Promise<UserCrypto> {
    return this.http.request('PUT', `user-cryptos/${encodeURIComponent(id)}`, { accessToken, body: data });
  }

  removeUserCrypto(accessToken: string, id: string): Promise<void> {
    return this.http.request('DELETE', `user-cryptos/${encodeURIComponent(id)}`, { accessToken });
  }
}
