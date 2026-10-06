import { lazy } from 'react';

// Cada microfrontend é carregado sob demanda, do seu próprio remoteEntry.js.
export const AuthApp = lazy(() => import('mfe_auth/AuthApp'));
export const CryptosApp = lazy(() => import('mfe_cryptos/CryptosApp'));
export const DashboardApp = lazy(() => import('mfe_dashboard/DashboardApp'));
