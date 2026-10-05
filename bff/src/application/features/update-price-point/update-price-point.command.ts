import { UpdatePricePointData } from '../../ports/market-data.gateway';

export interface UpdatePricePointCommand {
  accessToken: string;
  id: string;
  data: UpdatePricePointData;
}
