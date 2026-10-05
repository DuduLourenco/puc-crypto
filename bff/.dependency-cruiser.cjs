/**
 * Testes de arquitetura do BFF (npm run test:arch).
 * Camadas: domain <- application <- infrastructure e api; main.ts e app.module.ts são a raiz de composição.
 */
module.exports = {
  forbidden: [
    {
      name: 'domain-nao-depende-de-nada',
      comment: 'Domain é TypeScript puro: não importa outras camadas, pacotes npm nem módulos do Node.',
      severity: 'error',
      from: { path: '^src/domain/' },
      to: { pathNot: '^src/domain/' },
    },
    {
      name: 'application-nao-depende-de-camadas-externas',
      comment: 'Application conhece apenas o Domain; não importa Infrastructure nem API.',
      severity: 'error',
      from: { path: '^src/application/' },
      to: { path: '^src/(infrastructure|api)/' },
    },
    {
      name: 'application-nao-depende-de-frameworks',
      comment: 'Application não importa NestJS, bibliotecas HTTP nem qualquer outro pacote npm ou módulo do Node.',
      severity: 'error',
      from: { path: '^src/application/' },
      to: { dependencyTypes: ['npm', 'npm-dev', 'npm-optional', 'npm-peer', 'npm-bundled', 'npm-no-pkg', 'npm-unknown', 'core'] },
    },
    {
      name: 'infrastructure-nao-depende-de-api',
      comment: 'Os adaptadores implementam as portas da Application e não conhecem a camada API.',
      severity: 'error',
      from: { path: '^src/infrastructure/' },
      to: { path: '^src/api/' },
    },
    {
      name: 'api-nao-depende-de-infrastructure',
      comment: 'A API recebe as portas por injeção; só a raiz de composição conhece os adaptadores.',
      severity: 'error',
      from: { path: '^src/api/' },
      to: { path: '^src/infrastructure/' },
    },
    {
      name: 'slices-nao-referenciam-outras-slices',
      comment: 'Vertical Slice: cada pasta de application/features é independente das demais.',
      severity: 'error',
      from: { path: '^src/application/features/([^/]+)/' },
      to: { path: '^src/application/features/', pathNot: '^src/application/features/$1/' },
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
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: { extensions: ['.ts', '.js'] },
  },
};
