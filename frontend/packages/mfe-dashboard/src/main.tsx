import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import DashboardApp from './DashboardApp';

// Execução isolada do microfrontend, para desenvolvimento. No sistema, quem o monta é o shell.
// É preciso já ter uma sessão no navegador (faça o login pelo shell ou pelo microfrontend de acesso).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main style={{ maxWidth: 1120, margin: '24px auto', padding: '0 20px' }}>
      <DashboardApp />
    </main>
  </StrictMode>,
);
