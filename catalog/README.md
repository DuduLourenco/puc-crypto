# PucCrypto — Catalog

Microsserviço de catálogo do PucCrypto (microsserviço SQL do enunciado). Mantém o catálogo de criptomoedas e a lista de criptomoedas que cada usuário monitora, e publica eventos quando uma criptomoeda entra ou sai do catálogo.

## Arquitetura

O PucCrypto é uma aplicação distribuída: um microfrontend consome um BFF, exposto por um API Gateway; o BFF agrega este serviço, o microsserviço MarketData (MongoDB) e uma Azure Function de previsão. O Catalog avisa o MarketData, por eventos, de quais criptomoedas existem, para que o histórico de preços delas seja coletado.

Este serviço segue Clean Architecture, com um projeto por camada e dependências apontando para dentro:

| Camada | Projeto | Conteúdo |
|---|---|---|
| Domain | `src/PucCrypto.Catalog.Domain` | Entidades `Cryptocurrency` e `UserCrypto`. Não depende de nada |
| Application | `src/PucCrypto.Catalog.Application` | Casos de uso em `Features/`, portas em `Abstractions/`, tipos comuns em `Common/`, eventos em `IntegrationEvents/` |
| Infrastructure | `src/PucCrypto.Catalog.Infrastructure` | EF Core com SQL Server (Azure SQL), repositórios, publicação no RabbitMQ |
| API | `src/PucCrypto.Catalog.Api` | Raiz de composição, autenticação JWT, Swagger |

Os casos de uso são organizados em Vertical Slices. Cada pasta de `Application/Features` reúne o endpoint, o command ou query, o validador e o handler de um caso de uso. Todas as rotas exigem o JWT emitido pelo serviço Identity.

**Catálogo de criptomoedas**

| Slice | Rota | Descrição |
|---|---|---|
| `CreateCrypto` | `POST /cryptos` | Cadastra uma criptomoeda e publica `CryptoRegistered` |
| `ListCryptos` | `GET /cryptos` | Lista o catálogo |
| `GetCrypto` | `GET /cryptos/{id}` | Devolve uma criptomoeda |
| `UpdateCrypto` | `PUT /cryptos/{id}` | Altera símbolo e nome |
| `DeleteCrypto` | `DELETE /cryptos/{id}` | Exclui a criptomoeda e publica `CryptoRemoved`; recusa (409) se estiver na lista de algum usuário |

**Lista do usuário**

| Slice | Rota | Descrição |
|---|---|---|
| `AddUserCrypto` | `POST /user-cryptos` | Adiciona uma criptomoeda do catálogo à lista do usuário |
| `ListUserCryptos` | `GET /user-cryptos` | Lista os itens do usuário |
| `GetUserCrypto` | `GET /user-cryptos/{id}` | Devolve um item do usuário |
| `UpdateUserCrypto` | `PUT /user-cryptos/{id}` | Altera a anotação do item |
| `RemoveUserCrypto` | `DELETE /user-cryptos/{id}` | Remove o item da lista |

Um item da lista de outro usuário responde 404.

### Eventos

| Evento | Quando | Campos |
|---|---|---|
| `CryptoRegistered` | Uma criptomoeda é cadastrada | `cryptocurrencyId`, `symbol`, `name`, `coinGeckoId`, `occurredAt` |
| `CryptoRemoved` | Uma criptomoeda é excluída | `cryptocurrencyId`, `coinGeckoId`, `occurredAt` |

O Catalog também consome `PricesIngested`, publicado pelo MarketData, na slice `UpdateLatestPrice`: guarda o último preço de cada criptomoeda (`latestPriceUsd`, `latestPriceAt`), que aparece nas respostas do catálogo e da lista. A fila é `catalog.PricesIngested`.

Os eventos vão para a exchange `puccrypto.events` (tipo topic) do RabbitMQ, com o nome do evento como chave de roteamento e o corpo em JSON.

### Modelo de dados

| Tabela | Colunas |
|---|---|
| `cryptocurrencies` | `id`, `symbol`, `name`, `coingecko_id` (único), `latest_price_usd`, `latest_price_at`, `created_at` |
| `user_cryptos` | `id`, `user_id` (sem FK: o usuário pertence ao Identity), `cryptocurrency_id` (FK), `notes`, `added_at` |

`src/BuildingBlocks` contém o código de apoio comum aos serviços .NET do PucCrypto (contratos de handler, `Result`, endpoints, validação, mensageria e autenticação), copiado para este repositório.

## Tecnologias

- .NET 8, ASP.NET Core (Minimal APIs)
- Entity Framework Core com SQL Server / Azure SQL Database
- RabbitMQ (cliente RabbitMQ.Client)
- FluentValidation, autenticação JWT Bearer
- Swagger (Swashbuckle)
- xUnit e NetArchTest
- Docker

## Como rodar localmente

Requisitos: Docker. Para compilar e testar fora do Docker, SDK do .NET 8.

```bash
docker compose up -d --build
```

Sobe o Catalog, um SQL Server (equivalente local do Azure SQL) e um RabbitMQ.

- API: http://localhost:5102
- Swagger: http://localhost:5102/swagger (use o botão "Authorize" com um token do Identity)
- Painel do RabbitMQ: http://localhost:15672 (usuário `puccrypto`, senha `puccrypto_dev`)

O token é obtido no login do serviço Identity. Exemplo:

```bash
curl -X POST http://localhost:5102/cryptos \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"coinGeckoId":"bitcoin","symbol":"BTC","name":"Bitcoin"}'
```

Para rodar a API fora do Docker, com o SQL Server e o RabbitMQ do Compose no ar:

```bash
docker compose up -d sqlserver rabbitmq
dotnet run --project src/PucCrypto.Catalog.Api
```

Em Macs com processador ARM, a imagem do SQL Server roda por emulação (Rosetta no Docker Desktop).

### Configuração

| Chave | Descrição |
|---|---|
| `ConnectionStrings__Database` | Connection string do SQL Server / Azure SQL |
| `Jwt__SigningKey`, `Jwt__Issuer`, `Jwt__Audience` | Validação do JWT emitido pelo Identity |
| `RabbitMq__Uri` | Endereço do broker: `amqp://` local ou `amqps://` na nuvem |
| `RabbitMq__Exchange` | Exchange dos eventos (padrão `puccrypto.events`) |
| `RabbitMq__ServiceName` | Prefixo das filas consumidas (padrão `catalog`) |

As migrations do banco são aplicadas quando a API inicia.

## Testes

```bash
dotnet test
```

- `tests/PucCrypto.Catalog.UnitTests`: entidades, os onze handlers e os validadores.
- `tests/PucCrypto.Catalog.ArchitectureTests`: Domain não depende de nada; Application não depende de Infrastructure; slices não referenciam outras slices e seguem a convenção de nomes.

## Imagem Docker

```bash
docker build -t <usuario>/puccrypto/catalog:v1 .
```

## URLs na nuvem

| Recurso | URL |
|---|---|
| API | _a preencher após o deploy_ |
| Swagger | _a preencher após o deploy_ |
| Imagem no Docker Hub | _a preencher após a publicação_ |

## Alunos

- _Nome do aluno 1_
- _Nome do aluno 2_
- _Nome do aluno 3_
