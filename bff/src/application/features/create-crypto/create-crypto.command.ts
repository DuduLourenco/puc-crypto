import { CreateCryptoData } from '../../ports/catalog.gateway';

export interface CreateCryptoCommand {
  accessToken: string;
  data: CreateCryptoData;
}
