/**
 * Testes de arquitetura do frontend (npm run test:arch).
 *
 * Cada pacote de packages/ (shell e microfrontends) tem as camadas:
 *   domain <- application <- infrastructure e ui
 * e uma raiz de composição (<Nome>App.tsx e main.tsx) que liga os casos de uso aos adaptadores.
 * A camada ui faz o papel da camada API dos serviços: é a entrada, aqui acionada pelo usuário.
 */
const PACKAGE = '^packages/([^/]+)/src/';

module.exports = {
  forbidden: [
    {
      name: 'domain-nao-depende-de-nada',
      comment: 'Domain é TypeScript puro: sem React, sem outras camadas, sem pacotes npm.',
      severity: 'error',
      from: { path: `${PACKAGE}domain/` },
      to: { pathNot: '^packages/$1/src/domain/' },
    },
    {
      name: 'application-depende-apenas-do-domain',
      comment: 'Application não importa Infrastructure, UI, o pacote shared, React nem outro pacote npm.',
      severity: 'error',
      from: { path: `${PACKAGE}application/` },
      to: { pathNot: '^packages/$1/src/(domain|application)/' },
    },
    {
      name: 'infrastructure-nao-depende-de-ui',
      severity: 'error',
      from: { path: `${PACKAGE}infrastructure/` },
      to: { path: '^packages/$1/src/ui/' },
    },
    {
      name: 'ui-nao-depende-de-infrastructure',
      comment: 'A UI recebe os casos de uso da raiz de composição; não conhece os adaptadores.',
      severity: 'error',
      from: { path: '^packages/(mfe-[^/]+)/src/ui/' },
      to: { path: '^packages/$1/src/infrastructure/' },
    },
    {
      name: 'slices-nao-referenciam-outras-slices',
      comment: 'Vertical Slice: cada pasta de application/features é independente das demais.',
      severity: 'error',
      from: { path: '^packages/([^/]+)/src/application/features/([^/]+)/' },
      to: { path: '^packages/$1/src/application/features/', pathNot: '^packages/$1/src/application/features/$2/' },
    },
    {
      name: 'microfrontends-nao-importam-uns-aos-outros',
      comment: 'Um pacote só importa a si mesmo e o shared. O shell recebe os remotes em tempo de execução.',
      severity: 'error',
      from: { path: '^packages/([^/]+)/' },
      to: { path: '^packages/', pathNot: '^packages/($1|shared)/' },
    },
    {
      name: 'shared-nao-importa-microfrontends',
      severity: 'error',
      from: { path: '^packages/shared/' },
      to: { path: '^packages/', pathNot: '^packages/shared/' },
    },
    {
      name: 'sem-dependencias-circulares',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    // node_modules não é excluído: as regras precisam enxergar as importações de pacotes npm.
    exclude: { path: '(^|/)(dist|test)/|\\.d\\.ts$|vite\\.config\\.ts$|vitest\\.config\\.ts$' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.base.json' },
    enhancedResolveOptions: { extensions: ['.ts', '.tsx', '.js'] },
  },
};
