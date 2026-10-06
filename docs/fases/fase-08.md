# Fase 8 — Frontend em microfrontends

Esta fase entrega a interface do PucCrypto: um shell e três microfrontends em React, integrados em tempo de execução com Module Federation, consumindo apenas o BFF. No enunciado, é o "Microfrontend". Com ela, o fluxo completo funciona no navegador: criar conta, montar a lista de criptomoedas e ver o gráfico de preço histórico com a previsão.

## 1. Telas

| Tela | Microfrontend | Rota no shell | O que faz |
|---|---|---|---|
| Acesso | `mfe-auth` | `/login` | Entrar e criar conta |
| Criptomoedas | `mfe-cryptos` | `/criptomoedas` | Lista do usuário (anotar, remover) e catálogo (cadastrar, editar, excluir, adicionar à lista) |
| Dashboard | `mfe-dashboard` | `/` | Último preço, variação no período, previsão e gráfico de cada criptomoeda da lista |

Capturas do teste local: [acesso](imagens/fase-08-acesso.png), [criptomoedas](imagens/fase-08-criptomoedas.png), [dashboard](imagens/fase-08-dashboard.png) e [dashboard no modo escuro, com o tooltip](imagens/fase-08-dashboard-escuro.png). As capturas da entrega devem ser refeitas com as URLs da nuvem (fase 10).

## 2. Componentes criados (`frontend/packages`)

| Pacote | Tipo | Responsabilidade | Depende de |
|---|---|---|---|
| `shell` | Host do Module Federation | Cabeçalho, navegação, proteção de rotas pela sessão, carga dos microfrontends e isolamento de falhas | Os três remotos (em tempo de execução), `shared` |
| `mfe-auth` | Remoto (`mfe_auth/AuthApp`) | Cadastro e login | BFF (`/auth/*`), `shared` |
| `mfe-cryptos` | Remoto (`mfe_cryptos/CryptosApp`) | CRUD do catálogo e da lista do usuário | BFF (`/cryptos`, `/user-cryptos`), `shared` |
| `mfe-dashboard` | Remoto (`mfe_dashboard/DashboardApp`) | Gráfico de histórico e previsão | BFF (`/aggregated-data`), `shared` |
| `shared` | Biblioteca, empacotada em cada aplicação | Cliente HTTP do BFF, sessão, formatação, tema e componentes de aviso | — |

### Estrutura de cada pacote

| Camada | `mfe-auth` | `mfe-cryptos` | `mfe-dashboard` | `shell` |
|---|---|---|---|---|
| `domain` | `credentials` (validação de login e cadastro) | `crypto` (tipos, validação, moedas fora da lista), `popular-coins` (sugestões) | `aggregated-data` (tipos, filtros, seleção), `chart-series` (linhas do gráfico, resumo da previsão, eixo) | `navigation` (rotas e redirecionamento) |
| `application/ports` | `AuthGateway`, `SessionPort` | `CatalogGateway` | `DashboardGateway` | — |
| `application/features` | `login-user`, `register-user` | 8 slices do catálogo e da lista | `load-dashboard` | `sign-out` |
| `infrastructure` | `BffAuthGateway` | `BffCatalogGateway` | `BffDashboardGateway` | `remotes` (importação dos módulos remotos) |
| `ui` | `AuthPage` | `CryptosPage`, `WatchlistPanel`, `CatalogPanel` | `DashboardPage`, `CryptoDetail`, `PriceForecastChart`, `DataTable` | `App`, `Layout`, `RemoteBoundary` |
| Raiz de composição | `AuthApp.tsx` | `CryptosApp.tsx` | `DashboardApp.tsx` | `main.tsx` |

## 3. Integração dos microfrontends

- **Carga.** O shell declara os três remotos com o endereço do `remoteEntry.js` de cada um, definido no build por variável de ambiente. O módulo de cada remoto é importado sob demanda, quando a rota é acessada.
- **Dependências compartilhadas.** React e React DOM são instância única entre o shell e os remotos.
- **Sessão.** Fica no `localStorage`. `sessionStore`, do pacote `shared`, grava, lê e avisa as mudanças por um evento da janela. O `mfe-auth` inicia a sessão; o shell reage e libera as rotas; o cliente do BFF de cada microfrontend lê o token. Não há chamada direta entre microfrontends.
- **Sessão expirada.** Quando o BFF responde 401 a uma requisição autenticada, o cliente encerra a sessão e o shell leva o usuário à tela de acesso.
- **Falha de um microfrontend.** `RemoteBoundary` captura o erro de carga ou de execução e mostra um aviso naquela área; o shell e as outras rotas continuam funcionando.
- **Execução isolada.** Cada microfrontend tem o seu `main.tsx` e abre sozinho, sem o shell.

## 4. Fluxo principal

1. Sem sessão, o shell redireciona para `/login` e carrega `mfe_auth/AuthApp`.
2. O usuário cria a conta: `registerUser` chama `POST /auth/register` e `POST /auth/login` no BFF e inicia a sessão.
3. O shell navega para o dashboard e carrega `mfe_dashboard/DashboardApp`, que chama `GET /aggregated-data`.
4. Em Criptomoedas, o usuário cadastra uma moeda (`POST /cryptos`) e a adiciona à lista (`POST /user-cryptos`). O Catalog publica `CryptoRegistered`; o MarketData carrega o histórico; o último preço volta ao Catalog por `PricesIngested`.
5. De volta ao dashboard, `GET /aggregated-data` traz a lista, o histórico e a previsão; `buildChartRows` monta a série do gráfico.

## 5. Gráfico de preço e previsão

| Aspecto | Decisão |
|---|---|
| Forma | Gráfico de linha: o dado é a mudança ao longo do tempo |
| Séries | Histórico (linha contínua) e previsão (linha tracejada), com a faixa do intervalo de 95% |
| Eixos | Um único eixo de valores, em dólar, com marcas em números redondos; eixo do tempo em dia/mês |
| Identificação | Legenda sempre visível; o tracejado distingue a previsão além da cor; o último valor previsto é rotulado no gráfico |
| Interação | Linha vertical que acompanha o ponteiro e um tooltip com data e valor |
| Acesso sem o gráfico | Os mesmos dados em uma tabela, abaixo do gráfico |
| Cores | Azul e laranja, validadas para daltonismo e contraste nos modos claro e escuro |
| Números de destaque | Último preço (número principal), variação no período e valor previsto, com seta e sinal além da cor |
| Estados | Lista vazia, histórico insuficiente para prever, previsão indisponível e histórico indisponível têm mensagem própria |
| Filtros | Uma linha acima do conteúdo: quantidade de preços do histórico (30, 90 ou 180) e dias de previsão (7, 14 ou 30). Ao recarregar, o conteúdo anterior permanece esmaecido |

## 6. Testes

| Tipo | Quantidade | Conteúdo |
|---|---|---|
| Unitários e de componentes (Vitest, Testing Library) | 48 | `shared` 12, `mfe-auth` 9, `mfe-cryptos` 10, `mfe-dashboard` 14, `shell` 3 |
| Arquitetura (dependency-cruiser) | 8 regras | Ver abaixo |

Regras de arquitetura (`frontend/.dependency-cruiser.cjs`):

| Regra | O que proíbe |
|---|---|
| `domain-nao-depende-de-nada` | Domain importar React, outras camadas ou pacotes npm |
| `application-depende-apenas-do-domain` | Application importar Infrastructure, UI, `shared`, React ou outro pacote npm |
| `infrastructure-nao-depende-de-ui` | Adaptadores importarem componentes |
| `ui-nao-depende-de-infrastructure` | Componentes dos microfrontends importarem adaptadores |
| `slices-nao-referenciam-outras-slices` | Uma pasta de `application/features` importar outra |
| `microfrontends-nao-importam-uns-aos-outros` | Um pacote importar outro que não seja o `shared` |
| `shared-nao-importa-microfrontends` | O `shared` importar os demais pacotes |
| `sem-dependencias-circulares` | Ciclos de importação |

Com violações inseridas de propósito, as regras correspondentes falharam; as violações foram removidas em seguida. Durante esse teste apareceu um erro na configuração: as importações de pacotes npm estavam sendo excluídas da análise, e React no Domain não era detectado. A configuração foi corrigida e o teste repetido.

## 7. Ambiente local

| Arquivo | Conteúdo |
|---|---|
| `frontend/Dockerfile`, `nginx.conf` | Um nginx entrega o shell em `/` e os microfrontends em `/mfe-auth/`, `/mfe-cryptos/` e `/mfe-dashboard/` |
| `frontend/docker-compose.yml` | Sobe só o frontend, apontando para um BFF na máquina |
| `frontend/scripts/run-all.mjs` | Inicia o shell e os três microfrontends em paralelo (`npm run dev`, `npm run preview`) |
| `docker-compose.yml` (raiz) | Entra o frontend em http://localhost:5200 |

Portas locais: shell 5200, `mfe-auth` 5201, `mfe-cryptos` 5202, `mfe-dashboard` 5203. As portas 5173 e 5174, previstas na fase 1, estavam ocupadas por outros projetos na máquina de desenvolvimento.

## 8. Verificação realizada

- `npm run typecheck`: sem erros. `npm test`: 48 testes aprovados e nenhuma violação de arquitetura (62 módulos). `npm run build`: os quatro builds gerados.
- Fluxo completo em um navegador real (Chrome, sem interface, controlado por script), com o sistema inteiro no Docker Compose e a CoinGecko simulada da fase 5:
  1. sem sessão, o shell leva a `/login` e carrega o microfrontend de acesso;
  2. criação da conta e login; o nome do usuário aparece no cabeçalho; dashboard com a lista vazia;
  3. em Criptomoedas, cadastro de `bitcoin` e `ethereum` pelas sugestões e inclusão na lista;
  4. anotação salva; os preços chegam à tela depois dos eventos;
  5. dashboard com os números de destaque, a legenda, duas linhas e a faixa do intervalo no gráfico, e o modelo informado;
  6. tooltip com data e valor ao passar o ponteiro;
  7. troca para `ETH` e para previsão de 30 dias;
  8. remoção da lista, exclusão do catálogo e logout, que volta a `/login`.
- O mesmo fluxo passou nas três formas de execução: builds servidos por `npm run preview`, contêiner nginx do Compose e servidores de desenvolvimento (`npm run dev`), nos modos claro e escuro, sem erros no console do navegador.
- Com dois microfrontends fora do ar, o shell abriu e a tela de acesso funcionou.
- nginx: `/criptomoedas` devolve o shell; os `remoteEntry.js` e o `index.html` saem sem cache; arquivo inexistente de um microfrontend devolve 404.
- As capturas de tela foram conferidas. Dois ajustes saíram dessa conferência: o número principal do dashboard ultrapassava o cartão, e as marcas do eixo de valores tinham números quebrados e o rótulo cortado.
- Os usuários de teste foram removidos; as moedas foram excluídas pela própria interface.

## 9. Limitações e pendências

- No contêiner e no modo de preview, os três microfrontends estão no mesmo servidor ou máquina; a publicação separada de cada um fica para a fase 9.
- O endereço do BFF e dos `remoteEntry.js` é definido no build. Mudar de ambiente exige um novo build.
- O shell busca os três `remoteEntry.js` ao abrir, embora só importe o módulo de cada microfrontend ao acessar a rota.
- Não há testes automatizados de navegador no repositório; o fluxo foi verificado por um script externo.
- Fase 9: o frontend passa a chamar o API Gateway (`VITE_BFF_URL`) e é publicado na nuvem.
