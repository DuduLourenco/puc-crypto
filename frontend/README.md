# PucCrypto — Frontend

Interface do PucCrypto, feita como microfrontends em React: um shell e três microfrontends remotos, integrados em tempo de execução com Module Federation. O frontend chama apenas o BFF.

## Arquitetura

O PucCrypto é uma aplicação distribuída. Este frontend consome o BFF, exposto por um API Gateway; o BFF agrega os microsserviços Catalog (Azure SQL) e MarketData (MongoDB) e a Azure Function de previsão. O frontend não chama microsserviços diretamente.

| Pacote | Papel | Tela | Rotas do BFF que usa |
|---|---|---|---|
| `packages/shell` | Host: cabeçalho, navegação, sessão e carga dos microfrontends | — | — |
| `packages/mfe-auth` | Remoto `mfe_auth/AuthApp` | Entrar e criar conta | `POST /auth/register`, `POST /auth/login` |
| `packages/mfe-cryptos` | Remoto `mfe_cryptos/CryptosApp` | Catálogo de criptomoedas e lista do usuário | `/cryptos`, `/user-cryptos` |
| `packages/mfe-dashboard` | Remoto `mfe_dashboard/DashboardApp` | Gráfico de preço histórico e previsão | `GET /aggregated-data` |
| `packages/shared` | Biblioteca empacotada em cada um | — | Cliente do BFF, sessão, formatação e tema |

Cada microfrontend é um build independente, que publica um `remoteEntry.js`. O shell conhece apenas o endereço de cada `remoteEntry.js` e carrega o microfrontend quando a rota é acessada. React e React DOM são compartilhados como instância única. Se um microfrontend não carregar, o shell mostra um aviso naquela área e o restante continua funcionando.

Os microfrontends não importam código uns dos outros. A sessão do usuário fica no `localStorage`, e as mudanças são avisadas por um evento da janela; assim o shell e cada microfrontend sabem quem está logado sem depender de um módulo comum em tempo de execução.

### Camadas

Cada pacote segue a mesma organização, com dependências apontando para dentro:

| Camada | Pasta | Conteúdo | Pode importar |
|---|---|---|---|
| Domain | `src/domain` | Tipos e regras puras (validação, montagem das séries do gráfico) | Nada |
| Application | `src/application` | Casos de uso em `features/` e portas em `ports/` | Domain |
| Infrastructure | `src/infrastructure` | Adaptadores do BFF | Application, Domain, `shared` |
| UI | `src/ui` | Componentes React. Faz o papel da camada API: é a entrada, acionada pelo usuário | Application, Domain, `shared` |

O arquivo exposto ao shell (`AuthApp.tsx`, `CryptosApp.tsx`, `DashboardApp.tsx`) é a raiz de composição: liga os casos de uso aos adaptadores e os entrega à UI. Domain e Application são TypeScript puro, sem React.

### Vertical Slices

Cada caso de uso é uma pasta em `src/application/features`:

| Pacote | Slices |
|---|---|
| `mfe-auth` | `login-user`, `register-user` |
| `mfe-cryptos` | `list-catalog`, `create-crypto`, `update-crypto`, `delete-crypto`, `list-watchlist`, `add-to-watchlist`, `update-watchlist-notes`, `remove-from-watchlist` |
| `mfe-dashboard` | `load-dashboard` |
| `shell` | `sign-out` |

## Tecnologias

- React 19, TypeScript, Vite 8
- Module Federation (`@module-federation/vite`)
- React Router (no shell), Recharts (no dashboard)
- Vitest e Testing Library (testes unitários e de componentes)
- dependency-cruiser (testes de arquitetura)
- npm workspaces; nginx e Docker para servir o build

## Como rodar localmente

O frontend precisa do BFF no ar. O caminho mais simples é o `docker-compose.yml` da área de trabalho do projeto, que sobe o sistema inteiro, com o frontend em http://localhost:5200.

Para trabalhar só no frontend, com um BFF em http://localhost:5100:

```bash
npm install
npm run dev
```

| Aplicação | Endereço |
|---|---|
| Shell | http://localhost:5200 |
| `mfe-auth` | http://localhost:5201 |
| `mfe-cryptos` | http://localhost:5202 |
| `mfe-dashboard` | http://localhost:5203 |

Cada microfrontend também abre sozinho no seu endereço, sem o shell. `npm run build` gera os quatro builds e `npm run preview` os serve nas mesmas portas.

Com Docker, um único nginx entrega o shell em `/` e os microfrontends em `/mfe-auth/`, `/mfe-cryptos/` e `/mfe-dashboard/`:

```bash
docker compose up -d --build
```

### Configuração

As variáveis são lidas no build e no servidor de desenvolvimento, do arquivo `.env` na raiz deste repositório (ver `.env.example`).

| Variável | Descrição | Padrão |
|---|---|---|
| `VITE_BFF_URL` | Endereço do BFF visto pelo navegador. Na nuvem, o API Gateway | `http://localhost:5100` |
| `MFE_AUTH_URL`, `MFE_CRYPTOS_URL`, `MFE_DASHBOARD_URL` | Endereço do `remoteEntry.js` de cada microfrontend, usado pelo shell | `http://localhost:5201/remoteEntry.js` e seguintes |
| `PUBLIC_BASE` | Caminho público de um microfrontend quando ele é servido em uma subpasta | `/` |

## Testes

```bash
npm test            # unitários e de arquitetura
npm run test:unit   # Vitest, em todos os pacotes
npm run test:arch   # dependency-cruiser
npm run typecheck   # TypeScript
```

- **Unitários e de componentes**: regras do domínio (validação, montagem das séries e do eixo do gráfico, navegação), casos de uso com portas simuladas, cliente do BFF e sessão, e as telas com Testing Library (login, cadastro, CRUD do catálogo e da lista, dashboard e seus estados).
- **Arquitetura (`.dependency-cruiser.cjs`)**: Domain não importa nada; Application importa só o Domain; Infrastructure não importa a UI; a UI não importa a Infrastructure; slices não importam outras slices; um microfrontend não importa outro; não há dependências circulares.

## Imagem Docker

```bash
docker build --build-arg VITE_BFF_URL=<url-do-gateway> -t <usuario>/puccrypto/frontend:v1 .
```

## URLs na nuvem

| Recurso | URL |
|---|---|
| Frontend | _a preencher após o deploy_ |
| Imagem no Docker Hub | _a preencher após a publicação_ |

## Alunos

- _Nome do aluno 1_
- _Nome do aluno 2_
- _Nome do aluno 3_
