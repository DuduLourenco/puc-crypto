/** Configuração do BFF, lida das variáveis de ambiente na inicialização. */
export interface BffConfig {
  port: number;
  /** Origens aceitas pelo CORS; "*" aceita qualquer origem. */
  corsOrigins: string[];
  identityUrl: string;
  catalogUrl: string;
  marketDataUrl: string;
  /** Endereço da Function, incluindo o prefixo /api/. */
  forecastUrl: string;
  forecastFunctionKey: string;
  upstreamTimeoutMs: number;
  jwt: {
    signingKey: string;
    issuer: string;
    audience: string;
  };
}

/** Token de injeção da configuração. */
export const BFF_CONFIG = Symbol('BFF_CONFIG');

export function loadBffConfig(env: NodeJS.ProcessEnv = process.env): BffConfig {
  const required = (name: string): string => {
    const value = env[name]?.trim();
    if (!value) {
      throw new Error(`Variável de ambiente ${name} não configurada.`);
    }
    return value;
  };

  // Garante a barra final, para que os caminhos relativos sejam resolvidos dentro do endereço base.
  const url = (name: string): string => required(name).replace(/\/*$/, '/');

  return {
    port: Number(env.PORT ?? 5100),
    corsOrigins: (env.CORS_ORIGINS ?? '*').split(',').map((origin) => origin.trim()).filter(Boolean),
    identityUrl: url('IDENTITY_URL'),
    catalogUrl: url('CATALOG_URL'),
    marketDataUrl: url('MARKETDATA_URL'),
    forecastUrl: url('FORECAST_URL'),
    forecastFunctionKey: required('FORECAST_FUNCTION_KEY'),
    upstreamTimeoutMs: Number(env.UPSTREAM_TIMEOUT_MS ?? 20000),
    jwt: {
      signingKey: required('JWT_SIGNING_KEY'),
      issuer: env.JWT_ISSUER?.trim() || 'puccrypto-identity',
      audience: env.JWT_AUDIENCE?.trim() || 'puccrypto',
    },
  };
}
