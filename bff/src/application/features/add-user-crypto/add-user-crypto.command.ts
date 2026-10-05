import { AddUserCryptoData } from '../../ports/catalog.gateway';

export interface AddUserCryptoCommand {
  accessToken: string;
  data: AddUserCryptoData;
}
