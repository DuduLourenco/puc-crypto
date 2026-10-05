import { PricePointFilter } from '../../ports/market-data.gateway';

export interface ListPricePointsQuery {
  accessToken: string;
  filter: PricePointFilter;
}
