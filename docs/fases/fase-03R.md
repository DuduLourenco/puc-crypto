# Fase 3R — Reorganização para o enunciado final

O enunciado final do PJBL ([enunciado-pjbl.md](../enunciado-pjbl.md)) mudou parte da arquitetura. A análise está em [analise-impacto-pjbl.md](../analise-impacto-pjbl.md). Esta fase reorganiza o repositório para a nova estrutura e completa o Identity com o que passou a ser exigido de todos os projetos: Swagger, testes unitários, Dockerfile e README próprios.

Nenhuma regra de negócio foi alterada nesta fase.

## 1. Nova estrutura

```
puc-crypto/                       # área de trabalho: docs, ambiente local do sistema
├── docs/
├── docker-compose.yml            # sistema completo, local
├── infra/local/postgres/
├── identity/                     # → repositório público do Identity
│   ├── PucCrypto.Identity.sln
│   ├── Dockerfile
│   ├── docker-compose.yml        # o serviço e o seu banco
│   ├── README.md
│   ├── Directory.Build.props, Directory.Packages.props, global.json
│   ├── src/
│   │   ├── PucCrypto.Identity.Domain/
│   │   ├── PucCrypto.Identity.Application/
│   │   ├── PucCrypto.Identity.Infrastructure/
│   │   ├── PucCrypto.Identity.Api/
│   │   └── BuildingBlocks/PucCrypto.BuildingBlocks.Abstractions/
│   └── tests/
│       ├── PucCrypto.Identity.UnitTests/
│       └── PucCrypto.Identity.ArchitectureTests/
├── catalog/                      # → repositório público do Catalog (mesma organização)
├── marketdata/                   # fase 5
├── forecast-function/            # fase 6
├── bff/                          # fase 7
└── frontend/                     # fase 8
```

Cada pasta de componente é autossuficiente: tem a sua solução, os seus arquivos de build e não referencia nada fora dela. Isso permite exportá-la para um repositório próprio com `git subtree push` (ADR-025).

## 2. O que mudou de lugar

| Antes | Depois |
|---|---|
| `src/Services/Identity/*` | `identity/src/*` |
| `src/Services/Catalog/*` | `catalog/src/*` |
| `src/BuildingBlocks/PucCrypto.BuildingBlocks.Abstractions` | Uma cópia em `identity/src/BuildingBlocks` e outra em `catalog/src/BuildingBlocks` |
| `src/BuildingBlocks/PucCrypto.BuildingBlocks.Messaging` e `.Authentication` | `catalog/src/BuildingBlocks` (o Identity não usa) |
| `src/BuildingBlocks/PucCrypto.Contracts/CryptoRegistered.cs` | `catalog/src/PucCrypto.Catalog.Application/IntegrationEvents/CryptoRegistered.cs` |
| `tests/PucCrypto.ArchitectureTests` | `identity/tests/PucCrypto.Identity.ArchitectureTests` e `catalog/tests/PucCrypto.Catalog.ArchitectureTests` |
| `PucCrypto.sln`, `Directory.*.props`, `global.json`, `.config/` na raiz | Um conjunto por pasta de componente |
| `infra/docker/dotnet-service.Dockerfile` | `identity/Dockerfile` e `catalog/Dockerfile` |

## 3. O que foi removido

| Item | Motivo |
|---|---|
| `src/Gateway/PucCrypto.Gateway` (YARP) | O Gateway passa a ser um serviço gerenciado na nuvem, na frente do BFF (ADR-028) |
| `src/Bff/PucCrypto.Bff.Web` (.NET, vazio) | O BFF será escrito em NestJS (fase 7) |
| `src/Services/Prediction/*` (vazio) | A previsão passa a ser uma Azure Function HTTP, sem banco (ADR-029) |
| `src/Services/MarketData/*` (vazio) | Será recriado na fase 5, já sobre MongoDB |
| `PucCrypto.Contracts` | Cada serviço declara os eventos que publica ou consome (ADR-026) |
| `ServiceIsolationTests` | A separação em repositórios impede, por construção, que um serviço referencie outro |
| Bancos `marketdata_db` e `prediction_db`, Azurite | Não são mais usados |

Tudo continua disponível no histórico do Git (até o commit `eb0e79f`).

## 4. Componentes após a fase

| Componente | Responsabilidade | Depende de | Estado |
|---|---|---|---|
| Identity | Cadastro, login e emissão de JWT | PostgreSQL (`identity_db`) | Completo para a entrega, exceto deploy |
| Catalog | CRUD da lista do usuário; publica `CryptoRegistered` | PostgreSQL (`catalog_db`), RabbitMQ, chave do JWT | Funcional como na fase 4; será revisto na fase 4 revisada |

## 5. Acréscimos ao Identity

| Item | Descrição |
|---|---|
| Swagger | Interface em `/swagger` e documento em `/swagger/v1/swagger.json`. Cada endpoint declara nome, resumo e respostas possíveis |
| Testes unitários | `PucCrypto.Identity.UnitTests`, 19 testes: `User`, `RegisterUserHandler`, `LoginUserHandler`, validadores, `BCryptPasswordHasher` e `JwtTokenGenerator` |
| Testes de arquitetura | `PucCrypto.Identity.ArchitectureTests`, 7 testes, com as mesmas regras de antes |
| Dockerfile | Próprio do repositório, com contexto na pasta `identity/` |
| Compose próprio | Sobe o Identity e o seu PostgreSQL, sem o resto do sistema |
| README | Arquitetura, tecnologias, como rodar, e campos para URLs da nuvem e nomes dos alunos |

Os testes unitários usam dublês escritos à mão (`InMemoryUserRepository`, `FakePasswordHasher`, `FakeJwtTokenGenerator`, `FixedTimeProvider`), sem biblioteca de mocks. Os handlers continuam internos ao projeto; os testes os enxergam por `InternalsVisibleTo`.

## 6. Eventos

Sem alteração de comportamento. `CryptoRegistered` continua sendo publicado pelo Catalog; o contrato passou a ficar dentro do próprio Catalog.

## 7. Verificação realizada

- `identity/`: `dotnet build` com 0 avisos e 0 erros; `dotnet test` com 26 testes aprovados (19 unitários e 7 de arquitetura).
- `catalog/`: `dotnet build` com 0 avisos e 0 erros; 7 testes de arquitetura aprovados.
- Compose do sistema: imagens geradas a partir de `identity/Dockerfile` e `catalog/Dockerfile`; cadastro e login no Identity; o Catalog recusa requisição sem token (401) e aceita o token do Identity (200).
- Swagger do Identity: interface responde 200; o documento lista `POST /auth/register` (201, 400, 409) e `POST /auth/login` (200, 400, 401).
- Compose do repositório `identity/`, sozinho: serviço e Swagger respondem.

## 8. Pendências

- O Catalog ainda não tem README, Swagger nem testes unitários; entram na fase 4, junto com a troca para Azure SQL.
- Os repositórios públicos ainda não existem. A exportação com `git subtree push` depende de o grupo criá-los no GitHub.
- O workflow antigo do Static Web Apps continua em `.github/workflows/`.
