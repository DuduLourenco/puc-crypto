import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AuthApp from './AuthApp';

// Execução isolada do microfrontend, para desenvolvimento. No sistema, quem o monta é o shell.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main style={{ maxWidth: 480, margin: '48px auto', padding: '0 16px' }}>
      <AuthApp />
    </main>
  </StrictMode>,
);
