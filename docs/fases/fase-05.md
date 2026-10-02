# Fase 5 — MarketData em MongoDB e fluxo de eventos

Esta fase entrega o MarketData, o "Microserviço 1 (MongoDB)" do enunciado: histórico de preços em MongoDB, coleta na API CoinGecko, CRUD de preços, consumo dos eventos do Catalog e publicação de `PricesIngested`. Entrega também o lado consumidor da mensageria e a slice do Catalog que guarda o último preço de cada criptomoeda (decisão D5).

## 1. Fluxo de eventos

```
Catalog                              RabbitMQ (puccrypto.events)                 MarketData
───────                              ───────────────────────────                 ──────────
CreateCrypto  ── CryptoRegistered ─▶ marketdata.CryptoRegistered ─▶ TrackAsset ──▶ CoinGecko (90 dias)
                                                                              │
UpdateLatestPrice ◀─ catalog.PricesIngested ◀── PricesIngested ◀──────────────┤
                                                                              │
                                     POST /prices/collect ─▶ CollectPrices ───┘──▶ CoinGecko (preço atual)

DeleteCrypto  ── CryptoRemoved ────▶ marketdata.CryptoRemoved ───▶ UntrackAsset (apaga o histórico)
```

| Evento | Publicador | Consumidor | Fila | Efeito |
|---|---|---|---|---|
| `CryptoRegistered` | Catalog (`CreateCrypto`) | MarketData (`TrackAsset`) | `marketdata.CryptoRegistered` | Acompanha o ativo e carrega o histórico diário de 90 dias |
| `CryptoRemoved` | Catalog (`DeleteCrypto`) | MarketData (`UntrackAsset`) | `marketdata.CryptoRemoved` | Apaga o ativo e o histórico |
| `PricesIngested` | MarketData (`TrackAsset`, `CollectPrices`) | Catalog (`UpdateLatestPrice`) | `catalog.PricesIngested` | Guarda o último preço na criptomoeda |

Campos de `PricesIngested`: `cryptocurrencyId`, `coinGeckoId`, `count`, `latestPriceUsd`, `latestTimestamp`, `occurredAt`. É publicado um evento por criptomoeda a cada carga ou coleta. O CRUD manual de preços não publica evento.

## 2. Endpoints do MarketData

| Rota | Slice | Autenticação | Sucesso | Falhas |
|---|---|---|---|---|
| `POST /prices/collect` | `CollectPrices` | Cabeçalho `X-Api-Key` | 200 com os preços coletados e os identificadores não encontrados | 401, 503 (CoinGecko indisponível) |
| `GET /assets` | `ListTrackedAssets` | JWT | 200 | — |
| `POST /prices` | `CreatePricePoint` | JWT | 201 | 400, 404 (ativo não acompanhado), 409 (instante repetido) |
| `GET /prices?cryptocurrencyId=&from=&to=&limit=` | `ListPricePoints` | JWT | 200, em ordem cronológica | 400 |
| `GET /prices/{id}` | `GetPricePoint` | JWT | 200 | 404 |
| `PUT /prices/{id}` | `UpdatePricePoint` | JWT | 200 | 400, 404 |
| `DELETE /prices/{id}` | `DeletePricePoint` | JWT | 204 | 404 |

`ListPricePoints` devolve os preços mais recentes dentro do limite (padrão e máximo de 1.000), do mais antigo ao mais recente. É a rota que o BFF usará para montar o gráfico e enviar a série à Function de previsão.

`POST /prices/collect` é chamado pela Function agendada (fase 6), que não tem usuário; por isso usa uma chave própria em vez do JWT (ADR-037).

## 3. Componentes criados

### MarketData — Domain

| Classe | Responsabilidade |
|---|---|
| `TrackedAssets/TrackedAsset` | Cópia local de uma criptomoeda do Catalog (mesmo id), alimentada por eventos (ADR-008) |
| `PricePoints/PricePoint` | Preço em dólar em um instante (UTC); o preço precisa ser positivo |
| `PricePoints/PriceSource` | Origem do preço: `CoinGecko` ou `Manual` |

### MarketData — Application

| Tipo | Responsabilidade |
|---|---|
| 9 slices em `Features/` (seção 2, mais `TrackAsset` e `UntrackAsset`) | Um caso de uso cada |
| `TrackAsset/TrackAssetConsumer`, `UntrackAsset/UntrackAssetConsumer` | Entradas das slices pelos eventos do Catalog |
| `Abstractions/ITrackedAssetRepository`, `IPricePointRepository` | Portas de persistência |
| `Abstractions/IMarketPriceProvider`, `MarketPrice`, `MarketPriceUnavailableException` | Porta da fonte de preços |
| `Common/PricePointResponse`, `MarketDataErrors` | Resposta e erros compartilhados |
| `Common/PricesIngestedPublisher` | Monta e publica `PricesIngested`; usado por `TrackAsset` e `CollectPrices` |
| `IntegrationEvents/CryptoRegistered`, `CryptoRemoved`, `PricesIngested` | Contratos dos eventos consumidos e publicado |

### MarketData — Infrastructure

| Classe | Responsabilidade | Implementa |
|---|---|---|
| `Persistence/MongoMappings` | Mapeia as entidades para documentos sem atributos no Domain (ADR-036) | — |
| `Persistence/MarketDataMongoContext` | Coleções `tracked_assets` e `price_points` | — |
| `Persistence/MongoIndexExtensions` | Cria os índices na inicialização | — |
| `Persistence/TrackedAssetRepository` | Persistência dos ativos | `ITrackedAssetRepository` |
| `Persistence/PricePointRepository` | Persistência dos preços; gravação em lote com upsert por (ativo, instante) | `IPricePointRepository` |
| `CoinGecko/CoinGeckoClient`, `CoinGeckoOptions` | Cliente HTTP da CoinGecko; falhas viram `MarketPriceUnavailableException` | `IMarketPriceProvider` |

### Catalog — acréscimos

| Tipo | Responsabilidade |
|---|---|
| `Cryptocurrency.LatestPriceUsd`, `LatestPriceAt`, `UpdateLatestPrice` | Último preço; um preço mais antigo que o atual é ignorado |
| `Features/UpdateLatestPrice` (`Consumer`, `Command`, `Handler`) | Slice acionada por `PricesIngested` |
| `IntegrationEvents/PricesIngested` | Contrato do evento consumido |
| Migration `AddLatestPrice` | Colunas `latest_price_usd` (`decimal(28,10)`) e `latest_price_at` |
| `CryptoResponse`, `UserCryptoResponse` | Passam a incluir `latestPriceUsd` e `latestPriceAt` |

### BuildingBlocks — lado consumidor da mensageria (ADR-035)

| Tipo | Projeto | Responsabilidade |
|---|---|---|
| `Events/IEventConsumer<TEvent>` | Abstractions | Contrato da entrada de uma slice por evento |
| `Events/EventSubscription`, `EventConsumerExtensions.AddEventConsumers` | Abstractions | Registra os consumidores de um assembly e as inscrições |
| `RabbitMq/RabbitMqConsumerService` | Messaging | Serviço em segundo plano que cria as filas, consome e entrega as mensagens |
| `RabbitMqOptions.ServiceName` | Messaging | Prefixo das filas do serviço |
| `ErrorType.Unavailable` | Abstractions | Falha de dependência externa, convertida em 503 |

As três cópias de `BuildingBlocks.Abstractions` (Identity, Catalog e MarketData) e as duas de `Messaging` e `Authentication` (Catalog e MarketData) são idênticas.

## 4. Dependências

| Componente | Depende de |
|---|---|
| MarketData | MongoDB, RabbitMQ (consome e publica), API CoinGecko, chave do JWT, chave de coleta |
| MarketData → Catalog | Apenas eventos; nenhuma chamada |
| Catalog | Passa a consumir `PricesIngested` |

## 5. Fluxos

**Cadastro de criptomoeda até o último preço no Catalog**

1. O Catalog cadastra a criptomoeda e publica `CryptoRegistered`.
2. `RabbitMqConsumerService` do MarketData entrega a mensagem a `TrackAssetConsumer`, que chama `TrackAssetHandler`.
3. O handler grava o `TrackedAsset` e pede a `IMarketPriceProvider` o histórico diário de 90 dias.
4. Grava os preços com upsert e publica `PricesIngested` com o preço mais recente.
5. O Catalog entrega o evento a `UpdateLatestPriceConsumer`, que chama `UpdateLatestPriceHandler`; a criptomoeda passa a ter `latestPriceUsd`.

Se a CoinGecko não responder no passo 3, o ativo continua acompanhado e o histórico fica para a próxima coleta.

**Coleta (`CollectPrices`)**

1. A Function agendada (ou um cliente com a chave) chama `POST /prices/collect` com `X-Api-Key`.
2. O handler lista os ativos e faz uma única chamada à CoinGecko com todos os identificadores.
3. Para cada ativo com preço: grava o preço e publica `PricesIngested`. Identificadores que a CoinGecko não conhece voltam em `notFoundCoinGeckoIds`.

## 6. Modelo de dados — MongoDB

| Coleção | Campos | Índices |
|---|---|---|
| `tracked_assets` | `_id` (id da criptomoeda no Catalog), `coinGeckoId`, `symbol`, `name`, `trackedSince` | Único em `coinGeckoId` |
| `price_points` | `_id`, `cryptocurrencyId`, `timestamp`, `priceUsd` (Decimal128), `source` | Único em (`cryptocurrencyId`, `timestamp`) |

`cryptocurrencyId` referencia a criptomoeda do Catalog, que está em outro banco; não há vínculo entre os bancos.

## 7. Testes

| Projeto | Testes |
|---|---|
| `PucCrypto.MarketData.UnitTests` | 21: entidades, `TrackAsset` e `UntrackAsset` (inclusive evento repetido e CoinGecko fora do ar), `CollectPrices`, CRUD de preços, validadores, leitura das respostas da CoinGecko |
| `PucCrypto.MarketData.ArchitectureTests` | 7: mesmas regras dos outros serviços, agora também para consumidores (`<Slice>Consumer`) |
| `PucCrypto.Catalog.UnitTests` | 34 (3 novos, de `UpdateLatestPrice`) |

## 8. Ambiente local

| Arquivo | Mudança |
|---|---|
| `docker-compose.yml` (raiz) | Entram o MongoDB (porta 27040) e o MarketData (porta 5103) |
| `marketdata/docker-compose.yml` | Sobe o MarketData sozinho, com MongoDB e RabbitMQ |
| `.env.example` | Entram `COLLECTOR_API_KEY` e `COINGECKO_API_KEY` (opcional) |

## 9. Verificação realizada

A CoinGecko não pôde ser chamada desta máquina: o DNS da rede local responde `api.coingecko.com` com o endereço 146.112.61.106, que parece ser a página de bloqueio de um filtro de DNS (Cisco Umbrella/OpenDNS); com outro servidor DNS, o nome resolve para o endereço real. O filtro não foi contornado. O fluxo foi testado com uma CoinGecko simulada, um servidor local que responde no mesmo formato da API real, apontado por `CoinGecko__BaseUrl`. A chamada à API real fica para a verificação na nuvem (fase 9).

- `dotnet build`: 0 avisos e 0 erros nos três serviços.
- `dotnet test`: MarketData 28, Catalog 41, Identity 26 testes aprovados.
- No Compose do sistema completo:
  - na inicialização, o Catalog passa a consumir `catalog.PricesIngested` e o MarketData, `marketdata.CryptoRegistered` e `marketdata.CryptoRemoved`;
  - o Catalog cadastrou `bitcoin` e um identificador inexistente; o MarketData passou a acompanhar os dois e carregou 91 preços diários de `bitcoin` e nenhum do inexistente;
  - o Catalog recebeu `PricesIngested` e passou a mostrar o último preço de `bitcoin`;
  - coleta sem chave e com chave errada: 401; com a chave: 200, com o preço de `bitcoin` e o identificador inexistente em `notFoundCoinGeckoIds`; o histórico passou a 92 preços e o último preço no Catalog foi atualizado;
  - CRUD de preços: criar 201; repetir o instante 409; ativo não acompanhado 404; instante no futuro 400; ler, alterar e excluir; ler depois de excluir 404; listagem com limite;
  - sem token: 401; listagem sem `cryptocurrencyId`: 400;
  - o Catalog excluiu as duas criptomoedas; o MarketData recebeu `CryptoRemoved` e apagou os ativos e o histórico;
  - as três filas terminaram vazias.
- Swagger do MarketData: interface responde 200; o documento lista as sete rotas, o parâmetro `X-Api-Key` da coleta e os parâmetros da listagem.
- Compose do repositório `marketdata/`, sozinho: serviço, Swagger, recusa sem token e coleta sem ativos funcionam.
- O usuário criado no teste foi removido; as criptomoedas e preços foram removidos pelo próprio fluxo.

## 10. Limitações e pendências

- A chamada real à CoinGecko não foi testada desta rede (ver seção 9).
- Sem chave, a API pública da CoinGecko tem limite baixo de requisições. A coleta faz uma única chamada para todos os ativos; a carga inicial faz uma por criptomoeda cadastrada.
- Uma mensagem que falha duas vezes é descartada, sem fila de mensagens mortas (ADR-035).
- Fase 6: Function `GetForecast` e Function agendada que chama `POST /prices/collect`.
