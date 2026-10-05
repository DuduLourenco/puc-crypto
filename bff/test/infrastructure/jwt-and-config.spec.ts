import { sign } from 'jsonwebtoken';
import { JwtTokenVerifier } from '../../src/infrastructure/auth/jwt-token-verifier';
import { loadBffConfig } from '../../src/infrastructure/config/bff.config';

const KEY = 'chave-de-teste-com-pelo-menos-32-bytes!!';
const options = { algorithm: 'HS256', issuer: 'puccrypto-identity', audience: 'puccrypto', subject: 'user-1', expiresIn: 60 } as const;

describe('JwtTokenVerifier', () => {
  const verifier = new JwtTokenVerifier(KEY, 'puccrypto-identity', 'puccrypto');

  it('aceita o token emitido pelo Identity e lê o usuário', () => {
    const token = sign({ email: 'ana@example.com', name: 'Ana' }, KEY, options);

    expect(verifier.verify(token)).toEqual({ id: 'user-1', email: 'ana@example.com', name: 'Ana' });
  });

  it.each([
    ['assinado com outra chave', sign({}, 'outra-chave-com-pelo-menos-32-bytes!!!!', options)],
    ['de outro emissor', sign({}, KEY, { ...options, issuer: 'outro' })],
    ['para outra audiência', sign({}, KEY, { ...options, audience: 'outra' })],
    ['expirado', sign({}, KEY, { ...options, expiresIn: -10 })],
    ['malformado', 'nao-e-um-jwt'],
  ])('recusa token %s', (_, token) => {
    expect(verifier.verify(token)).toBeNull();
  });
});

describe('loadBffConfig', () => {
  const env = {
    IDENTITY_URL: 'http://identity:8080',
    CATALOG_URL: 'http://catalog:8080/',
    MARKETDATA_URL: 'http://marketdata:8080',
    FORECAST_URL: 'http://function/api',
    FORECAST_FUNCTION_KEY: 'chave',
    JWT_SIGNING_KEY: KEY,
  };

  it('lê os endereços com barra final e aplica os padrões', () => {
    const config = loadBffConfig(env);

    expect(config.identityUrl).toBe('http://identity:8080/');
    expect(config.catalogUrl).toBe('http://catalog:8080/');
    expect(config.forecastUrl).toBe('http://function/api/');
    expect(config.port).toBe(5100);
    expect(config.corsOrigins).toEqual(['*']);
    expect(config.jwt).toEqual({ signingKey: KEY, issuer: 'puccrypto-identity', audience: 'puccrypto' });
  });

  it('falha na inicialização se faltar uma variável obrigatória', () => {
    expect(() => loadBffConfig({ ...env, CATALOG_URL: ' ' })).toThrow('CATALOG_URL');
  });
});
