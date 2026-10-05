import { CreatePricePointData } from '../../ports/market-data.gateway';

export interface CreatePricePointCommand {
  accessToken: string;
  data: CreatePricePointData;
}
