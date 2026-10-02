# Fase 1 — Estrutura do repositório e plano de fases

Esta fase define a organização do repositório, os componentes do sistema e a ordem de construção. Não há código nesta fase. As decisões e suas justificativas estão em [ADRs.md](../ADRs.md).

## 1. Visão geral

O PucCrypto é um site com cadastro e login, CRUD de criptomoedas monitoradas por usuário e um dashboard com gráfico de preço histórico e previsão gerada por machine learning.

O navegador fala apenas com o API Gateway. O Gateway encaminha a autenticação ao serviço Identity e o restante ao BFF. O BFF agrega os serviços Catalog, MarketData e Prediction. Os serviços conversam entre si por eventos, e cada um tem seu próprio banco PostgreSQL.

## 2. Estrutura de pastas

```
puc-crypto/
├── PucCrypto.sln
├── docker-compose.yml
├── .env.example
├── Directory.Build.props
├── Directory.Packages.props
├── global.json
├── docs/
│   ├── ADRs.md                         # decisão, alternativas, justificativa
│   └── fases/fase-0N.md                # inventário de cada fase (insumo C4 e Arc42)
├── src/
│   ├── BuildingBlocks/
│   │   ├── PucCrypto.BuildingBlocks.Abstractions/  # ICommandHandler, IQueryHandler, Result, IEventBus
│   │   ├── PucCrypto.BuildingBlocks.Messaging/     # adaptadores RabbitMQ e Azure Service Bus
│   │   └── PucCrypto.Contracts/                    # CryptoRegistered, PricesIngested, ForecastGenerated
│   ├── Gateway/
│   │   └── PucCrypto.Gateway/                      # YARP
│   ├── Bff/
│   │   └── PucCrypto.Bff.Web/                      # Features/GetDashboard, Features/Cryptos
│   ├── Services/
│   │   ├── Identity/
│   │   │   ├── PucCrypto.Identity.Domain/
│   │   │   ├── PucCrypto.Identity.Application/
│   │   │   ├── PucCrypto.Identity.Infrastructure/
│   │   │   └── PucCrypto.Identity.Api/
│   │   ├── Catalog/                                # mesmas 4 camadas
│   │   ├── MarketData/                             # 4 camadas + PucCrypto.MarketData.Functions
│   │   └── Prediction/                             # 4 camadas + PucCrypto.Prediction.Functions
│   └── Web/                                        # npm workspaces
│       ├── shell/                                  # host: layout, rotas, sessão
│       ├── mfe-auth/
│       ├── mfe-cryptos/
│       ├── mfe-dashboard/
│       └── shared/                                 # cliente HTTP e tipos
├── tests/
│   └── PucCrypto.ArchitectureTests/                # uma classe por serviço + regras entre serviços
└── infra/
    ├── docker/dotnet-service.Dockerfile            # imagem do Gateway, do BFF e das APIs
    ├── local/postgres/init-databases.sh            # cria os 4 bancos e os 4 usuários
    └── azure/                                      # Bicep (fase 9)
```

A árvore foi ajustada na fase 2 (ver [fase-02.md](fase-02.md)): o script de bancos passou a ser `.sh`, para ler as senhas do ambiente, e surgiu `infra/docker`.

## 3. Padrão interno de cada serviço

Todo serviço tem quatro projetos, com dependências apontando para dentro.

| Projeto | Conteúdo | Pode depender de |
|---|---|---|
| `PucCrypto.<Servico>.Domain` | Entidades e regras de negócio | Nada |
| `PucCrypto.<Servico>.Application` | `Features/<CasoDeUso>/` e portas (`Abstractions/`) | Domain, BuildingBlocks.Abstractions, Contracts |
| `PucCrypto.<Servico>.Infrastructure` | EF Core, repositórios, mensageria, clientes HTTP | Application, Domain, BuildingBlocks.Messaging |
| `PucCrypto.<Servico>.Api` | `Program.cs`, registro de dependências | Application, Infrastructure |
| `PucCrypto.<Servico>.Functions` (MarketData e Prediction) | Gatilhos de Azure Functions | Application, Infrastructure |

Cada caso de uso é uma pasta em `Application/Features/`, com nomes fixos:

```
Features/RegisterUser/
├── RegisterUserEndpoint.cs     # rota HTTP
├── RegisterUserCommand.cs      # entrada (Command ou Query)
├── RegisterUserHandler.cs      # orquestra o caso de uso
└── RegisterUserValidator.cs    # validação da entrada
```

Uma slice não referencia outra slice. O que é comum a várias slices fica em `Domain`, em `Application/Abstractions` (portas) ou em `Application/Common` (respostas e erros compartilhados).

## 4. Componentes planejados

| Componente | Tipo | Responsabilidade | Depende de | Banco |
|---|---|---|---|---|
| Shell | Microfrontend host (React + Vite) | Layout, rotas, sessão do usuário, carga dos MFEs | Gateway | — |
| MFE Auth | Microfrontend remoto | Telas de cadastro e login | Gateway | — |
| MFE Cryptos | Microfrontend remoto | Telas do CRUD de criptomoedas monitoradas | Gateway | — |
| MFE Dashboard | Microfrontend remoto | Gráfico de preço histórico e previsão | Gateway | — |
| Gateway | API Gateway (YARP) | Ponto único de entrada, roteamento, validação do JWT | Identity, BFF | — |
| BFF | Backend for Frontend | Agrega dados para o frontend web e repassa o CRUD | Catalog, MarketData, Prediction | — |
| Identity | Microsserviço | Cadastro, login e emissão de JWT | — | `identity_db` |
| Catalog | Microsserviço | Catálogo de criptomoedas e lista monitorada por usuário | Mensageria | `catalog_db` |
| MarketData | Microsserviço | Histórico de preços e lista de ativos acompanhados | Mensageria, CoinGecko | `marketdata_db` |
| MarketData Functions | Azure Function (timer) | Coleta agendada de preços na CoinGecko | MarketData (Application), CoinGecko, Mensageria | `marketdata_db` |
| Prediction | Microsserviço | Consulta de previsões e execuções de modelo | — | `prediction_db` |
| Prediction Functions | Azure Function (mensagem) | Treina o modelo e gera a previsão | Prediction (Application), MarketData (API), Mensageria | `prediction_db` |
| Mensageria | RabbitMQ local, Azure Service Bus na nuvem | Transporte dos eventos | — | — |

### Slices previstas

| Serviço | Slices |
|---|---|
| Identity | `RegisterUser`, `LoginUser` |
| Catalog | `AddUserCrypto`, `ListUserCryptos`, `UpdateUserCrypto`, `RemoveUserCrypto` |
| MarketData | `TrackAsset`, `IngestPrices`, `GetPriceHistory` |
| Prediction | `GenerateForecast`, `GetLatestForecast` |
| BFF | `GetDashboard`, `Cryptos` |

Os nomes finais são confirmados na fase que implementa cada serviço.

## 5. Eventos

| Evento | Publicador | Consumidor | Quando ocorre | Efeito no consumidor |
|---|---|---|---|---|
| `CryptoRegistered` | Catalog | MarketData | Uma criptomoeda entra no catálogo pela primeira vez | Registra o ativo e carrega o histórico inicial |
| `PricesIngested` | MarketData e MarketData Functions | Prediction Functions | Novos preços são gravados | Treina o modelo e gera nova previsão |
| `ForecastGenerated` | Prediction Functions | BFF | Uma previsão é gravada | Invalida o cache do dashboard |

Os contratos ficam em `PucCrypto.Contracts`. Os campos de cada evento são definidos na fase que o implementa.

## 6. Fluxo principal

1. O usuário se cadastra e faz login. O Gateway encaminha `/api/auth/*` ao Identity, que devolve um JWT.
2. O usuário adiciona uma criptomoeda. O Gateway encaminha ao BFF, que repassa ao Catalog. Se a moeda é nova no catálogo, o Catalog publica `CryptoRegistered`.
3. O MarketData consome `CryptoRegistered`, registra o ativo, busca o histórico inicial na CoinGecko e publica `PricesIngested`.
4. A Function de timer coleta periodicamente os preços dos ativos acompanhados, grava `PricePoint` e publica `PricesIngested`.
5. A Function de previsão é disparada por `PricesIngested`, lê o histórico pela API do MarketData, treina o modelo, grava `ModelRun` e `Forecast` e publica `ForecastGenerated`.
6. O dashboard pede os dados ao BFF, que combina Catalog, MarketData e Prediction em uma única resposta.

## 7. Modelo de dados por serviço

| Serviço | Banco | Entidades |
|---|---|---|
| Identity | `identity_db` | `User` |
| Catalog | `catalog_db` | `Cryptocurrency`, `UserCrypto` (`user_id` sem FK) |
| MarketData | `marketdata_db` | `PricePoint`, `TrackedAsset` |
| Prediction | `prediction_db` | `Forecast`, `ModelRun` |

Nenhum serviço acessa o banco de outro e não há FKs entre bancos. Referências entre serviços usam apenas o identificador, sem restrição no banco. `TrackedAsset` é a única adição ao modelo original (ver ADR-008).

## 8. Portas locais previstas

| Componente | Porta |
|---|---|
| Gateway | 8080 |
| BFF | 5100 |
| Identity / Catalog / MarketData / Prediction | 5101 / 5102 / 5103 / 5104 |
| MarketData Functions / Prediction Functions | 7071 / 7072 |
| Shell / MFE Auth / MFE Cryptos / MFE Dashboard | 5173 / 5174 / 5175 / 5176 |
| PostgreSQL | 5440 |
| RabbitMQ (AMQP / painel) | 5672 / 15672 |
| Azurite | 10000–10002 |

## 9. Onde cada estilo arquitetural aparece

| Estilo | Local no repositório |
|---|---|
| Microfrontend | `src/Web/shell` e `src/Web/mfe-*` |
| API Gateway | `src/Gateway/PucCrypto.Gateway` |
| BFF | `src/Bff/PucCrypto.Bff.Web` |
| Microservices com Database per Service | `src/Services/*` e `infra/local/postgres` |
| EDA | `src/BuildingBlocks/PucCrypto.Contracts` e `PucCrypto.BuildingBlocks.Messaging` |
| Serverless | `PucCrypto.MarketData.Functions` e `PucCrypto.Prediction.Functions` |
| Clean Architecture + Vertical Slice | Os quatro projetos de cada serviço e `Application/Features/` |
| Testes de arquitetura | `tests/PucCrypto.ArchitectureTests` |

## 10. Plano de fases

| Fase | Entrega | Critério de pronto |
|---|---|---|
| 1 | Estrutura de pastas, plano e ADRs iniciais | Este documento validado |
| 2 | Solução com projetos vazios, Compose (PostgreSQL, RabbitMQ, Azurite), 4 bancos, Gateway mínimo | `dotnet build` e `docker compose up` funcionam |
| 3 | Identity completo (cadastro, login, JWT) e testes de arquitetura | Testes verdes; login pelo Gateway |
| 4 | Catalog (CRUD de `UserCrypto`) e publicação de `CryptoRegistered` | Evento visível no RabbitMQ |
| 5 | MarketData, Function de coleta, `PricesIngested` | Histórico gravado a partir da CoinGecko |
| 6 | Prediction, Function de previsão, `ForecastGenerated` | Previsão gravada após ingestão |
| 7 | BFF (agregação) e rotas finais do Gateway | Dashboard em uma única chamada |
| 8 | Shell e 3 MFEs com gráfico de histórico e previsão | Fluxo completo no navegador |
| 9 | Bicep e scripts de deploy no Azure | Ambiente provisionável por script |

Cada fase termina com um arquivo `docs/fases/fase-0N.md` listando componentes criados, responsabilidades, dependências e eventos, e com os ADRs novos em `docs/ADRs.md`.

## 11. Pendências antes da fase 2

- Instalar o SDK do .NET 8 (`brew install dotnet@8`). O Azure Functions Core Tools é opcional, porque as Functions podem rodar em contêiner.
- Decidir o destino do projeto antigo no Git (ver ADR-001) e remover o workflow antigo em `.github/workflows/`, que publicaria no Static Web Apps a cada push na `main`.
- Definir na fase 3 como o JWT é assinado e onde é validado.
- Verificar no início da fase 6 se o forecasting do ML.NET roda em ARM64 (ver ADR-010).
