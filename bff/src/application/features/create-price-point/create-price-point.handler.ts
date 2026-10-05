import { PricePoint } from '../../../domain/models';
import { MarketDataGateway } from '../../ports/market-data.gateway';
import { CreatePricePointCommand } from './create-price-point.command';

/** Cadastra um preço manualmente. */
export class CreatePricePointHandler {
  constructor(private readonly marketData: MarketDataGateway) {}

  execute(command: CreatePricePointCommand): Promise<PricePoint> {
    return this.marketData.createPricePoint(command.accessToken, command.data);
  }
}
