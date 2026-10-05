import { UpdateUserCryptoData } from '../../ports/catalog.gateway';

export interface UpdateUserCryptoCommand {
  accessToken: string;
  id: string;
  data: UpdateUserCryptoData;
}
