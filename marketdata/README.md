# PucCrypto — MarketData

Microsserviço de dados de mercado do PucCrypto (microsserviço MongoDB do enunciado). Guarda o histórico de preços das criptomoedas do catálogo, coletado da API CoinGecko, e oferece o CRUD desses preços.

## Arquitetura

O PucCrypto é uma aplicação distribuída: um microfrontend consome um BFF, exposto por um API Gateway; o BFF agrega o microsserviço Catalog (Azure SQL), este serviço e uma Azure Function de previsão, que recebe o histórico de preços fornecido por aqui.

O MarketData não chama o Catalog. Ele sabe quais criptomoedas acompanhar pelos eventos que o Catalog publica, e avisa por evento quando grava preços novos:

| Evento | Direção | Efeito |
|---|---|---|
| `CryptoRegistered` | Consumido (do Catalog) | Passa a acompanhar a criptomoeda e carrega 90 dias de histórico diário |
| `CryptoRemoved` | Consumido (do Catalog) | Deixa de acompanhar a criptomoeda e apaga o histórico dela |
| `PricesIngested` | Publicado | Avisa que há preços novos; o Catalog guarda o último preço |

Os eventos trafegam pela exchange `puccrypto.events` (tipo topic) do RabbitMQ, em JSON. Este serviço consome pelas filas `marketdata.CryptoRegistered` e `marketdata.CryptoRemoved`.

O serviço segue Clean Architecture, com um projeto por camada e dependências apontando para dentro:

| Camada | Projeto | Conteúdo |
|---|---|---|
| Domain | `src/PucCrypto.MarketData.Domain` | Entidades `TrackedAsset` e `PricePoint`. Não depende de nada |
| Application | `src/PucCrypto.MarketData.Application` | Casos de uso em `Features/`, portas em `Abstractions/`, eventos em `IntegrationEvents/` |
| Infrastructure | `src/PucCrypto.MarketData.Infrastructure` | MongoDB, cliente da CoinGecko, RabbitMQ |
| API | `src/PucCrypto.MarketData.Api` | Raiz de composição, autenticação JWT, Swagger |

Os casos de uso são Vertical Slices em `Application/Features`. Uma slice tem como entrada um endpoint HTTP (`<Slice>Endpoint`) ou um consumidor de evento (`<Slice>Consumer`), que monta o command e chama o handler.

| Slice | Entrada | Descrição |
|---|---|---|
| `TrackAsset` | Evento `CryptoRegistered` | Acompanha a criptomoeda e carrega o histórico inicial |
| `UntrackAsset` | Evento `CryptoRemoved` | Remove a criptomoeda e o histórico |
| `CollectPrices` | `POST /prices/collect` | Coleta o preço atual de todos os ativos e publica `PricesIngested` |
| `ListTrackedAssets` | `GET /assets` | Lista as criptomoedas acompanhadas |
| `CreatePricePoint` | `POST /prices` | Cadastra um preço manualmente |
| `ListPricePoints` | `GET /prices?cryptocurrencyId=&from=&to=&limit=` | Histórico de uma criptomoeda, em ordem cronológica |
| `GetPricePoint` | `GET /prices/{id}` | Devolve um preço |
| `UpdatePricePoint` | `PUT /prices/{id}` | Altera o valor de um preço |
| `DeletePricePoint` | `DELETE /prices/{id}` | Exclui um preço |

As rotas exigem o JWT emitido pelo serviço Identity, exceto `POST /prices/collect`, chamada pela Azure Function agendada, que exige a chave configurada em `Collector:ApiKey` no cabeçalho `X-Api-Key`.

### Modelo de dados (MongoDB, banco `marketdata`)

| Coleção | Campos | Índices |
|---|---|---|
| `tracked_assets` | `_id` (id da criptomoeda no Catalog), `coinGeckoId`, `symbol`, `name`, `trackedSince` | Único em `coinGeckoId` |
| `price_points` | `_id`, `cryptocurrencyId`, `timestamp`, `priceUsd` (Decimal128), `source` (`CoinGecko` ou `Manual`) | Único em (`cryptocurrencyId`, `timestamp`) |

`src/BuildingBlocks` contém o código de apoio comum aos serviços .NET do PucCrypto (contratos de handler, `Result`, endpoints, validação, mensageria e autenticação), copiado para este repositório.

## Tecnologias

- .NET 8, ASP.NET Core (Minimal APIs)
- MongoDB (driver oficial) / MongoDB Atlas
- API CoinGecko
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

Sobe o MarketData, um MongoDB e um RabbitMQ.

- API: http://localhost:5103
- Swagger: http://localhost:5103/swagger (use o botão "Authorize" com um token do Identity)

Coletar os preços manualmente:

```bash
curl -X POST http://localhost:5103/prices/collect -H 'X-Api-Key: puccrypto-dev-collector-key'
```

Sozinho, o serviço não tem ativos para acompanhar: eles chegam pelo evento `CryptoRegistered` do Catalog. Para o fluxo completo, use o `docker-compose.yml` da área de trabalho do projeto, que sobe todos os serviços.

Para rodar a API fora do Docker, com o MongoDB e o RabbitMQ do Compose no ar:

```bash
docker compose up -d mongo rabbitmq
dotnet run --project src/PucCrypto.MarketData.Api
```

### Configuração

| Chave | Descrição |
|---|---|
| `ConnectionStrings__Database` | Connection string do MongoDB (`mongodb://` local ou `mongodb+srv://` no Atlas) |
| `Mongo__DatabaseName` | Nome do banco (padrão `marketdata`) |
| `CoinGecko__BaseUrl` | Endereço da API (padrão `https://api.coingecko.com/api/v3/`) |
| `CoinGecko__ApiKey` | Chave do plano Demo da CoinGecko (opcional) |
| `Collector__ApiKey` | Chave exigida em `POST /prices/collect` |
| `Jwt__SigningKey`, `Jwt__Issuer`, `Jwt__Audience` | Validação do JWT emitido pelo Identity |
| `RabbitMq__Uri` | Endereço do broker: `amqp://` local ou `amqps://` na nuvem |
| `RabbitMq__ServiceName` | Prefixo das filas consumidas (padrão `marketdata`) |

Os índices do MongoDB são criados quando a API inicia.

## Testes

```bash
dotnet test
```

- `tests/PucCrypto.MarketData.UnitTests`: entidades, as slices acionadas por eventos, a coleta, o CRUD de preços, os validadores e a leitura das respostas da CoinGecko.
- `tests/PucCrypto.MarketData.ArchitectureTests`: Domain não depende de nada (nem do driver do MongoDB); Application não depende de Infrastructure; slices não referenciam outras slices e seguem a convenção de nomes.

## Imagem Docker

```bash
docker build -t <usuario>/puccrypto/marketdata:v1 .
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
