import { MarketDataGateway } from '../../ports/market-data.gateway';
import { DeletePricePointCommand } from './delete-price-point.command';

/** Exclui um preço. */
export class DeletePricePointHandler {
  constructor(private readonly marketData: MarketDataGateway) {}

  execute(command: DeletePricePointCommand): Promise<void> {
    return this.marketData.deletePricePoint(command.accessToken, command.id);
  }
}
