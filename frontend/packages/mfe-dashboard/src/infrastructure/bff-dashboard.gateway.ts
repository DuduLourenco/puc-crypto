import { BffClient } from '@puccrypto/shared';
import { DashboardGateway } from '../application/ports/dashboard.gateway';
import { AggregatedData, DashboardFilters } from '../domain/aggregated-data';

export class BffDashboardGateway implements DashboardGateway {
  constructor(private readonly bff: BffClient) {}

  getAggregatedData(filters: DashboardFilters): Promise<AggregatedData> {
    return this.bff.request('GET', 'aggregated-data', {
      query: { horizon: filters.horizon, historyLimit: filters.historyLimit },
    });
  }
}
