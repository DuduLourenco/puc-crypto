import { AggregatedData, DashboardFilters } from '../../../domain/aggregated-data';
import { DashboardGateway } from '../../ports/dashboard.gateway';

/** Busca, em uma única chamada ao BFF, tudo o que o dashboard mostra. */
export function loadDashboard(gateway: DashboardGateway, filters: DashboardFilters): Promise<AggregatedData> {
  return gateway.getAggregatedData(filters);
}
