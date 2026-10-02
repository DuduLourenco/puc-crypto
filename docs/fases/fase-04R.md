# Fase 4 revisada — Catalog em Azure SQL

Esta fase adapta o Catalog ao enunciado final: banco Azure SQL (SQL Server no ambiente local), CRUD completo do catálogo de criptomoedas separado da lista do usuário, o novo evento `CryptoRemoved`, Swagger, testes unitários e README. No enunciado, o Catalog é o "Microserviço 2 (Azure SQL)".

## 1. Endpoints

Todos exigem o JWT emitido pelo Identity.

| Rota | Slice | Sucesso | Falhas | Evento |
|---|---|---|---|---|
| `POST /cryptos` | `CreateCrypto` | 201 | 400, 409 (identificador da CoinGecko já cadastrado) | `CryptoRegistered` |
| `GET /cryptos` | `ListCryptos` | 200 | — | — |
| `GET /cryptos/{id}` | `GetCrypto` | 200 | 404 | — |
| `PUT /cryptos/{id}` | `UpdateCrypto` | 200 | 400, 404 | — |
| `DELETE /cryptos/{id}` | `DeleteCrypto` | 204 | 404, 409 (na lista de algum usuário) | `CryptoRemoved` |
| `POST /user-cryptos` | `AddUserCrypto` | 201 | 400, 404 (criptomoeda fora do catálogo), 409 (já na lista) | — |
| `GET /user-cryptos` | `ListUserCryptos` | 200 | — | — |
| `GET /user-cryptos/{id}` | `GetUserCrypto` | 200 | 404 | — |
| `PUT /user-cryptos/{id}` | `UpdateUserCrypto` | 200 | 400, 404 | — |
| `DELETE /user-cryptos/{id}` | `RemoveUserCrypto` | 204 | 404 | — |

Corpos: `CreateCrypto` recebe `coinGeckoId`, `symbol` e `name`; `UpdateCrypto`, `symbol` e `name` (o `coinGeckoId` não muda); `AddUserCrypto`, `cryptocurrencyId` e `notes`; `UpdateUserCrypto`, `notes`.

Respostas: `CryptoResponse` (`id`, `symbol`, `name`, `coinGeckoId`, `createdAt`) e `UserCryptoResponse` (`id`, `cryptocurrencyId`, `symbol`, `name`, `coinGeckoId`, `notes`, `addedAt`).

## 2. O que mudou em relação à fase 4 original

| Antes | Agora |
|---|---|
| PostgreSQL (`Npgsql.EntityFrameworkCore.PostgreSQL`) | SQL Server / Azure SQL (`Microsoft.EntityFrameworkCore.SqlServer`), com retentativa automática |
| A criptomoeda era criada de forma implícita, quando o primeiro usuário a adicionava | CRUD explícito em `/cryptos`; a lista do usuário referencia uma criptomoeda existente |
| CRUD da lista em `/cryptos` | Lista do usuário em `/user-cryptos` |
| `CryptoRegistered` publicado ao adicionar à lista uma moeda inédita | `CryptoRegistered` publicado em `CreateCrypto` |
| — | `CryptoRemoved`, publicado em `DeleteCrypto` |
| RabbitMQ configurado por host, porta, usuário e senha | RabbitMQ configurado por uma URI (`amqp://` local, `amqps://` na nuvem) |
| Sem Swagger, sem testes unitários, sem README | Swagger com autenticação, 31 testes unitários, README |

O Domain mudou apenas com o acréscimo de `Cryptocurrency.Update`. As regras das slices da lista do usuário se mantiveram; mudaram a rota e a origem da criptomoeda.

## 3. Componentes

### Domain

| Classe | Responsabilidade |
|---|---|
| `Cryptocurrencies/Cryptocurrency` | Criptomoeda do catálogo. `Create` normaliza símbolo e identificador; `Update` altera símbolo e nome |
| `UserCryptos/UserCrypto` | Item da lista de um usuário, com anotação. `UserId` sem FK |

### Application

| Tipo | Responsabilidade |
|---|---|
| 10 slices em `Features/` (tabela da seção 1) | Um caso de uso cada |
| `Abstractions/ICryptocurrencyRepository` | Porta do catálogo: listar, buscar por id, verificar identificador, gravar, alterar, excluir |
| `Abstractions/IUserCryptoRepository` | Porta da lista do usuário, sempre filtrada por usuário; `AnyByCryptocurrencyAsync` informa se uma moeda está em uso |
| `Common/CryptoResponse`, `CryptoErrors` | Resposta e erro "não encontrada" do catálogo |
| `Common/UserCryptoResponse`, `UserCryptoErrors` | Resposta e erro "não encontrado" da lista |
| `IntegrationEvents/CryptoRegistered`, `CryptoRemoved` | Contratos dos eventos publicados |

### Infrastructure

| Classe | Responsabilidade |
|---|---|
| `Persistence/CatalogDbContext` e configurações | Mapeamento para o SQL Server |
| `Persistence/Configurations/UtcDateTimeConverter` | Marca como UTC as datas lidas do banco (o `datetime2` não guarda fuso) |
| `Persistence/Repositories/CryptocurrencyRepository`, `UserCryptoRepository` | Implementação das portas |
| `Persistence/Migrations/*` | Migration `InitialCreate`, regerada para SQL Server |
| `DependencyInjection` | SQL Server com `EnableRetryOnFailure`, repositórios, mensageria |

### BuildingBlocks (cópia do Catalog)

`RabbitMqOptions` passou a ter apenas `Uri` e `Exchange`, e `AddMessaging` valida a URI na inicialização. O restante não mudou.

### Api

`Program.cs` ganhou o Swagger, com um esquema de segurança Bearer: na interface, o botão "Authorize" recebe o token do Identity.

## 4. Dependências

| Componente | Depende de |
|---|---|
| Catalog | SQL Server / Azure SQL (`catalog_db`), RabbitMQ (publicação), chave do JWT |
| Catalog → Identity | Apenas o formato do token; nenhuma chamada |
| Catalog → MarketData | Nenhuma chamada; apenas eventos |

## 5. Eventos

| Evento | Publicador | Quando | Consumidor |
|---|---|---|---|
| `CryptoRegistered` | `CreateCryptoHandler` | Criptomoeda cadastrada | MarketData (fase 5) |
| `CryptoRemoved` | `DeleteCryptoHandler` | Criptomoeda excluída | MarketData (fase 5) |

Mesma topologia do ADR-023: exchange `puccrypto.events`, chave de roteamento com o nome do evento, JSON sem envelope, mensagem persistente. A publicação continua acontecendo depois da gravação, sem outbox (ADR-022).

## 6. Fluxos

**`CreateCrypto`**

1. O cliente envia `POST /cryptos` com o JWT; o token e o corpo são validados.
2. `CreateCryptoHandler` normaliza o identificador e verifica se ele já existe (409).
3. Cria a `Cryptocurrency` e chama `ICryptocurrencyRepository.AddAsync`.
4. Publica `CryptoRegistered` pelo `IEventBus` e responde 201.

**`DeleteCrypto`**

1. O cliente envia `DELETE /cryptos/{id}` com o JWT.
2. `DeleteCryptoHandler` busca a criptomoeda (404 se não existe).
3. Consulta `IUserCryptoRepository.AnyByCryptocurrencyAsync`; se algum usuário a monitora, responde 409.
4. Exclui com `ICryptocurrencyRepository.RemoveAsync`, publica `CryptoRemoved` e responde 204.

**`AddUserCrypto`**

1. O cliente envia `POST /user-cryptos` com o JWT e o `cryptocurrencyId`.
2. `AddUserCryptoEndpoint` monta o command com o `UserId` do token.
3. `AddUserCryptoHandler` busca a criptomoeda (404), verifica se o usuário já a tem (409), cria o `UserCrypto` e grava. Responde 201.

## 7. Modelo de dados — `catalog_db` (SQL Server)

| Tabela | Coluna | Tipo | Observação |
|---|---|---|---|
| `cryptocurrencies` | `id` | `uniqueidentifier` | Chave primária |
| | `symbol` | `nvarchar(10)` | Maiúsculas |
| | `name` | `nvarchar(100)` | |
| | `coingecko_id` | `nvarchar(100)` | Índice único; minúsculas |
| | `created_at` | `datetime2` | UTC |
| `user_cryptos` | `id` | `uniqueidentifier` | Chave primária |
| | `user_id` | `uniqueidentifier` | **Sem FK**: o usuário pertence ao Identity |
| | `cryptocurrency_id` | `uniqueidentifier` | FK para `cryptocurrencies`, sem exclusão em cascata |
| | `notes` | `nvarchar(500)` | Opcional |
| | `added_at` | `datetime2` | UTC |

Índice único em (`user_id`, `cryptocurrency_id`).

## 8. Testes

| Projeto | Testes | Conteúdo |
|---|---|---|
| `PucCrypto.Catalog.UnitTests` | 31 | `Cryptocurrency`, `UserCrypto`, os dez handlers, validadores |
| `PucCrypto.Catalog.ArchitectureTests` | 7 | Mesmas regras do Identity |

Os testes unitários usam dublês escritos à mão: `InMemoryCryptocurrencyRepository`, `InMemoryUserCryptoRepository`, `RecordingEventBus` (guarda os eventos publicados) e `FixedTimeProvider`.

## 9. Ambiente local

| Arquivo | Mudança |
|---|---|
| `docker-compose.yml` (raiz) | Entra o SQL Server (porta 1440); o PostgreSQL fica só com o `identity_db`; o script `infra/local/postgres/init-databases.sh` foi removido |
| `catalog/docker-compose.yml` (novo) | Sobe o Catalog sozinho, com SQL Server e RabbitMQ |
| `.env.example` | Entra `MSSQL_SA_PASSWORD`; saem as senhas do PostgreSQL que não são mais usadas |

A imagem do SQL Server é x64 e roda por emulação no Mac ARM. Isso foi testado no início da fase: o servidor sobe e responde (risco R1 da análise de impacto, resolvido).

## 10. Verificação realizada

- `dotnet build`: 0 avisos, 0 erros. `dotnet test`: 38 testes aprovados (31 unitários e 7 de arquitetura).
- A migration regerada não tem diferenças em relação ao modelo (`has-pending-model-changes`).
- Swagger: interface responde 200; o documento lista as dez rotas, com resumo, respostas possíveis e o esquema de segurança Bearer.
- No Docker Compose, com dois usuários:
  - catálogo: sem token 401; corpo inválido 400; cadastro 201; cadastro repetido (em maiúsculas) 409; leitura 200 e 404; listagem; alteração 200, mantendo o `coinGeckoId`;
  - lista: adicionar 201, com a anotação sem espaços nas pontas; repetir 409; moeda inexistente 404; cada usuário vê apenas os seus itens; ler, alterar e remover o item de outro usuário 404;
  - exclusão da moeda em uso: 409 `Catalog.CryptoInUse`; depois de remover da lista: 204; de novo: 404.
- Eventos: em uma fila de inspeção ligada à exchange chegaram, em ordem, `CryptoRegistered` e `CryptoRemoved`, com os campos esperados.
- Banco: tabelas `cryptocurrencies` e `user_cryptos`; uma única FK, `user_cryptos → cryptocurrencies`; datas lidas do banco voltam em UTC.
- Compose do repositório `catalog/`, sozinho: serviço, Swagger e recusa sem token funcionam.
- Os usuários, a moeda e a fila de inspeção criados nos testes foram removidos.

## 11. Limitações e pendências

- Qualquer usuário autenticado pode cadastrar, alterar e excluir criptomoedas do catálogo; não há papéis de administrador.
- O Catalog não confere se o `coinGeckoId` existe na CoinGecko. O MarketData perceberá um identificador inválido na coleta (fase 5).
- A falha na publicação depois da gravação perde o evento (ADR-022).
- Fase 5: o Catalog passa a consumir `PricesIngested` para guardar o último preço (decisão D5), o que exige o lado consumidor da mensageria.
- O banco na nuvem (Azure SQL) e o broker gerenciado são configurados na fase 9.
