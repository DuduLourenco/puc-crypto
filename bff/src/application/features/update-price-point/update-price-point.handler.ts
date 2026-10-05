import { PricePoint } from '../../../domain/models';
import { MarketDataGateway } from '../../ports/market-data.gateway';
import { UpdatePricePointCommand } from './update-price-point.command';

/** Altera o valor de um preço. */
export class UpdatePricePointHandler {
  constructor(private readonly marketData: MarketDataGateway) {}

  execute(command: UpdatePricePointCommand): Promise<PricePoint> {
    return this.marketData.updatePricePoint(command.accessToken, command.id, command.data);
  }
}
