import { UpdateCryptoData } from '../../ports/catalog.gateway';

export interface UpdateCryptoCommand {
  accessToken: string;
  id: string;
  data: UpdateCryptoData;
}
