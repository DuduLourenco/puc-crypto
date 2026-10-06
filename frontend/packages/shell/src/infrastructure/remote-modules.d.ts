// Módulos entregues pelos microfrontends em tempo de execução (Module Federation).
declare module 'mfe_auth/AuthApp' {
  import { ComponentType } from 'react';
  const AuthApp: ComponentType<{ onAuthenticated?: () => void }>;
  export default AuthApp;
}

declare module 'mfe_cryptos/CryptosApp' {
  import { ComponentType } from 'react';
  const CryptosApp: ComponentType;
  export default CryptosApp;
}

declare module 'mfe_dashboard/DashboardApp' {
  import { ComponentType } from 'react';
  const DashboardApp: ComponentType;
  export default DashboardApp;
}
