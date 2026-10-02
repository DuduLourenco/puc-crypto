# Fase 4 — Serviço Catalog e publicação de eventos

> **Nota.** Após a [fase 3R](fase-03R.md), o Catalog fica em `catalog/`. O serviço foi revisto para o enunciado final na [fase 4R](fase-04R.md).

Esta fase entrega o serviço Catalog, com o CRUD de criptomoedas monitoradas por usuário, seguindo o mesmo padrão do Identity. Entrega também a mensageria: a porta `IEventBus`, o adaptador RabbitMQ e o primeiro evento, `CryptoRegistered`.

## 1. Endpoints

Todos exigem um JWT válido e operam apenas sobre os itens do usuário do token.

| Rota no Catalog | Slice | Sucesso | Falhas |
|---|---|---|---|
| `POST /cryptos` | `AddUserCrypto` | 201 com o item | 400 (validação), 409 (já está na lista do usuário) |
| `GET /cryptos` | `ListUserCryptos` | 200 com a lista, ordenada por nome | — |
| `GET /cryptos/{id}` | `GetUserCrypto` | 200 com o item | 404 |
| `PUT /cryptos/{id}` | `UpdateUserCrypto` | 200 com o item atualizado | 400, 404 |
| `DELETE /cryptos/{id}` | `RemoveUserCrypto` | 204 | 404 |

O `id` é o do item monitorado (`UserCrypto`). Um item de outro usuário responde 404, como se não existisse. Sem token, a resposta é 401.

Corpo do `POST`: `coinGeckoId`, `symbol`, `name` e `notes` (opcional). Corpo do `PUT`: `notes`. Resposta (`UserCryptoResponse`): `id`, `cryptocurrencyId`, `symbol`, `name`, `coinGeckoId`, `notes`, `addedAt`.

Nesta fase o Catalog é chamado diretamente (porta 5102, apenas para depuração). O acesso pelo Gateway passa pelo BFF, que chega na fase 7.

## 2. Componentes criados

### Domain — `PucCrypto.Catalog.Domain`

| Classe | Responsabilidade |
|---|---|
| `Cryptocurrencies/Cryptocurrency` | Criptomoeda do catálogo, única por `CoinGeckoId` e compartilhada entre usuários |
| `UserCryptos/UserCrypto` | Criptomoeda monitorada por um usuário, com anotações. Guarda `UserId` sem FK |

### Application — `PucCrypto.Catalog.Application`

| Slice | Arquivos | Responsabilidade do handler |
|---|---|---|
| `AddUserCrypto` | `Endpoint`, `Request`, `Command`, `Validator`, `Handler` | Cria a criptomoeda no catálogo se ainda não existe, cria o item do usuário e publica `CryptoRegistered` quando a moeda é nova |
| `ListUserCryptos` | `Endpoint`, `Query`, `Handler` | Lista os itens do usuário |
| `GetUserCrypto` | `Endpoint`, `Query`, `Handler` | Devolve um item do usuário |
| `UpdateUserCrypto` | `Endpoint`, `Request`, `Command`, `Validator`, `Handler` | Altera as anotações de um item |
| `RemoveUserCrypto` | `Endpoint`, `Command`, `Handler` | Remove o item da lista; a criptomoeda continua no catálogo |

| Outros tipos | Responsabilidade |
|---|---|
| `Abstractions/ICryptocurrencyRepository` | Porta de consulta de criptomoedas do catálogo |
| `Abstractions/IUserCryptoRepository` | Porta de persistência dos itens, sempre filtrada por usuário |
| `Common/UserCryptoResponse` | Representação do item, devolvida por quatro slices |
| `Common/UserCryptoErrors` | Erro "não encontrado", usado por três slices |

O `Request` é o corpo HTTP. O `Command` acrescenta o `UserId`, lido do token pelo endpoint. Assim o handler recebe todos os dados de que precisa e não conhece HTTP.

### Infrastructure — `PucCrypto.Catalog.Infrastructure`

| Classe | Responsabilidade | Implementa |
|---|---|---|
| `Persistence/CatalogDbContext` | Contexto do EF Core para o `catalog_db` | — |
| `Persistence/Configurations/CryptocurrencyConfiguration`, `UserCryptoConfiguration` | Mapeamento das tabelas | — |
| `Persistence/Repositories/CryptocurrencyRepository` | Consulta por `CoinGeckoId` | `ICryptocurrencyRepository` |
| `Persistence/Repositories/UserCryptoRepository` | Consulta e gravação dos itens | `IUserCryptoRepository` |
| `Persistence/Migrations/*`, `MigrationExtensions` | Migration `InitialCreate`, aplicada na inicialização | — |
| `DependencyInjection` | Registra banco, repositórios e mensageria | — |

### BuildingBlocks

| Projeto | Tipo novo | Responsabilidade |
|---|---|---|
| `PucCrypto.Contracts` | `CryptoRegistered` | Contrato do evento |
| `PucCrypto.BuildingBlocks.Abstractions` | `Events/IEventBus` | Porta de publicação de eventos |
| | `Handlers/ICommandHandler<TCommand>` | Command sem valor de retorno |
| | `Endpoints/ClaimsPrincipalExtensions.GetUserId` | Lê o id do usuário da claim `sub` |
| `PucCrypto.BuildingBlocks.Messaging` | `RabbitMq/RabbitMqEventBus`, `RabbitMqOptions` | Adaptador RabbitMQ da porta `IEventBus` |
| | `MessagingExtensions.AddMessaging` | Registra a mensageria |
| `PucCrypto.BuildingBlocks.Authentication` (novo projeto) | `JwtAuthenticationExtensions.AddJwtAuthentication` | Validação do JWT, usada pelo Gateway e pelo Catalog |

## 3. Dependências

| Componente | Depende de |
|---|---|
| Catalog | `catalog_db`, RabbitMQ (publicação), chave do JWT |
| `Catalog.Application` | `Catalog.Domain`, `BuildingBlocks.Abstractions`, `Contracts` |
| `Catalog.Infrastructure` | `Catalog.Application`, `BuildingBlocks.Messaging`, EF Core |
| `Catalog.Api` | `Catalog.Application`, `Catalog.Infrastructure`, `BuildingBlocks.Authentication` |
| Gateway | `BuildingBlocks.Authentication` (antes configurava o JWT no próprio `Program.cs`) |

O Catalog não chama nenhum outro serviço. Ele confia no token emitido pelo Identity, mas não acessa o Identity nem o seu banco.

## 4. Eventos

| Evento | Publicador | Quando | Consumidor |
|---|---|---|---|
| `CryptoRegistered` | Catalog (`AddUserCryptoHandler`) | Uma criptomoeda é adicionada ao catálogo pela primeira vez | MarketData (fase 5) |

Campos de `CryptoRegistered`: `cryptocurrencyId`, `symbol`, `name`, `coinGeckoId`, `occurredAt`.

Quando um segundo usuário adiciona uma moeda que já existe no catálogo, nenhum evento é publicado.

Topologia no RabbitMQ (ADR-023):

| Item | Valor |
|---|---|
| Exchange | `puccrypto.events`, tipo topic, durável |
| Chave de roteamento | Nome do evento (`CryptoRegistered`) |
| Corpo | O evento em JSON (camelCase), sem envelope |
| Propriedades | `type` com o nome do evento, `content_type` `application/json`, mensagem persistente, `message_id` único |

A publicação aguarda a confirmação do broker. O evento é publicado depois que os dados são gravados, sem outbox (ADR-022).

## 5. Fluxo de `AddUserCrypto`

1. O cliente envia `POST /cryptos` com o JWT.
2. O middleware de autenticação valida o token; `ValidationFilter` executa `AddUserCryptoValidator`.
3. `AddUserCryptoEndpoint` monta o `AddUserCryptoCommand` com o `UserId` do token e chama `AddUserCryptoHandler`.
4. O handler busca a criptomoeda com `ICryptocurrencyRepository.GetByCoinGeckoIdAsync`.
5. Se ela existe e o usuário já a monitora, devolve `Catalog.UserCryptoAlreadyAdded` (409). Se não existe, cria uma `Cryptocurrency`.
6. O handler cria o `UserCrypto` e chama `IUserCryptoRepository.AddAsync`, que grava o item e a criptomoeda nova na mesma transação.
7. Se a criptomoeda é nova, o handler publica `CryptoRegistered` pelo `IEventBus`.
8. O endpoint responde 201 com `UserCryptoResponse`.

## 6. Modelo de dados — `catalog_db`

Tabela `cryptocurrencies`:

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | `uuid` | Chave primária |
| `symbol` | `varchar(10)` | Gravado em maiúsculas |
| `name` | `varchar(100)` | |
| `coingecko_id` | `varchar(100)` | Índice único; gravado em minúsculas |
| `created_at` | `timestamptz` | |

Tabela `user_cryptos`:

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | `uuid` | Chave primária |
| `user_id` | `uuid` | Id do usuário no Identity. **Sem FK**: o usuário está em outro banco |
| `cryptocurrency_id` | `uuid` | FK para `cryptocurrencies`, dentro do mesmo banco |
| `notes` | `varchar(500)` | Opcional |
| `added_at` | `timestamptz` | |

Índice único em (`user_id`, `cryptocurrency_id`): um usuário monitora cada moeda uma única vez.

## 7. Testes de arquitetura

`dotnet test` roda 26 testes. `CatalogArchitectureTests` aplica ao Catalog as mesmas sete regras do Identity. `ServiceIsolationTests` ganhou a regra `CodigoCompartilhado_NaoReferenciaServicos`, que impede BuildingBlocks e Contracts de referenciarem serviços.

## 8. Como executar

```bash
docker compose up -d --build

TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana@example.com","password":"senha-segura-1"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")

curl -X POST http://localhost:5102/cryptos \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"coinGeckoId":"bitcoin","symbol":"BTC","name":"Bitcoin","notes":"longo prazo"}'

curl http://localhost:5102/cryptos -H "Authorization: Bearer $TOKEN"
```

Para ver o evento, crie no painel do RabbitMQ (http://localhost:15672) uma fila ligada à exchange `puccrypto.events` com a chave `#` antes de adicionar uma moeda nova. Sem fila ligada, a mensagem é descartada; o consumidor real chega na fase 5.

## 9. Verificação realizada

- `dotnet build`: 0 avisos, 0 erros. `dotnet test`: 26 testes aprovados.
- CRUD, com dois usuários, direto no Catalog:
  - sem token: 401; corpo inválido: 400;
  - adicionar moeda nova: 201, com símbolo em maiúsculas e anotação sem espaços nas pontas;
  - adicionar a mesma moeda de novo: 409;
  - outro usuário adiciona a mesma moeda: 201, reaproveitando a criptomoeda do catálogo;
  - listar: cada usuário vê apenas os seus itens;
  - ler, alterar e remover o item de outro usuário: 404;
  - alterar anotação: 200; remover: 204; remover de novo: 404.
- Evento: com uma fila de inspeção ligada à exchange, dois usuários adicionaram `bitcoin` e chegou exatamente uma mensagem `CryptoRegistered`, com a chave de roteamento, as propriedades e o JSON esperados.
- Banco: uma linha em `cryptocurrencies` para dois itens em `user_cryptos`; a única FK do banco é `user_cryptos → cryptocurrencies`.
- Os usuários, moedas e a fila criados nos testes foram removidos ao final.

## 10. Limitações e pendências

- O Catalog não confere se o `coinGeckoId` existe na CoinGecko. Um id inválido entra no catálogo e só será percebido pelo MarketData, na fase 5.
- Se a publicação do evento falhar depois da gravação, a moeda fica no catálogo sem que o MarketData seja avisado (ADR-022).
- Dois usuários adicionando ao mesmo tempo uma moeda inédita: o índice único impede a duplicidade, mas um deles recebe 500.
- O adaptador de Azure Service Bus para `IEventBus` será escrito na fase 9, quando houver onde testá-lo.
- Fase 7: o BFF repassa o JWT ao Catalog e expõe o CRUD pelo Gateway.
