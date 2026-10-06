import { bffClient } from '@puccrypto/shared';
import '@puccrypto/shared/theme.css';
import { loadDashboard } from './application/features/load-dashboard/load-dashboard';
import { DashboardFilters } from './domain/aggregated-data';
import { BffDashboardGateway } from './infrastructure/bff-dashboard.gateway';
import { DashboardPage } from './ui/DashboardPage';

// Raiz de composição do microfrontend: liga o caso de uso ao adaptador do BFF.
const gateway = new BffDashboardGateway(bffClient);
const load = (filters: DashboardFilters) => loadDashboard(gateway, filters);

/** Módulo exposto ao shell pelo Module Federation. */
export default function DashboardApp() {
  return <DashboardPage load={load} />;
}
