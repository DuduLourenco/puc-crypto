import { sessionStore, useSession } from '@puccrypto/shared';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from '../application/features/sign-out/sign-out';
import { ROUTES, redirectFor } from '../domain/navigation';
import { AuthApp, CryptosApp, DashboardApp } from '../infrastructure/remotes';
import { Layout } from './Layout';
import { RemoteBoundary } from './RemoteBoundary';

/** Rotas do shell: decide qual microfrontend ocupa a área de conteúdo. */
export function App() {
  const session = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  const redirect = redirectFor(location.pathname, session !== null);

  if (redirect) {
    return <Navigate to={redirect} replace />;
  }

  return (
    <Layout session={session} onSignOut={() => signOut(sessionStore)}>
      <Routes>
        <Route
          path={ROUTES.login}
          element={
            <RemoteBoundary name="Acesso">
              <AuthApp onAuthenticated={() => navigate(ROUTES.dashboard, { replace: true })} />
            </RemoteBoundary>
          }
        />
        <Route
          path={ROUTES.dashboard}
          element={
            <RemoteBoundary name="Dashboard">
              <DashboardApp />
            </RemoteBoundary>
          }
        />
        <Route
          path={ROUTES.cryptos}
          element={
            <RemoteBoundary name="Criptomoedas">
              <CryptosApp />
            </RemoteBoundary>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
      </Routes>
    </Layout>
  );
}
