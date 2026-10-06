import { AggregatedData, DashboardFilters } from '../../domain/aggregated-data';

/** Porta para o endpoint agregado do BFF. */
export interface DashboardGateway {
  getAggregatedData(filters: DashboardFilters): Promise<AggregatedData>;
}
