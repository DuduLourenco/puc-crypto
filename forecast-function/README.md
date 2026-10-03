# PucCrypto — Forecast Function

Azure Function do PucCrypto. Recebe uma série de preços de uma criptomoeda e devolve a previsão dos próximos dias, calculada com machine learning (ML.NET). Também contém a Function agendada que dispara a coleta de preços no microsserviço MarketData.

## Arquitetura

O PucCrypto é uma aplicação distribuída: um microfrontend consome um BFF, exposto por um API Gateway. Em `GET /aggregated-data`, o BFF busca o histórico de preços no MarketData e o envia a esta Function, que devolve a previsão na mesma chamada. A Function não tem banco de dados.

| Function | Gatilho | Descrição |
|---|---|---|
| `GetForecast` | HTTP `POST /api/forecast` (chave da Function) | Prevê os próximos preços a partir da série recebida |
| `CollectPrices` | Agendado (`CollectPricesSchedule`, padrão a cada 30 minutos) | Chama `POST /prices/collect` do MarketData |
| `Health` | HTTP `GET /api/health` (anônimo) | Indica que o Function App está no ar |

O projeto segue Clean Architecture, com um projeto por camada e dependências apontando para dentro:

| Camada | Projeto | Conteúdo |
|---|---|---|
| Domain | `src/PucCrypto.Forecast.Domain` | `PriceSeries` (ordena, remove instantes repetidos, calcula o intervalo típico), `PriceObservation`, `ForecastPoint`. Não depende de nada |
| Application | `src/PucCrypto.Forecast.Application` | Casos de uso em `Features/` e portas em `Abstractions/` |
| Infrastructure | `src/PucCrypto.Forecast.Infrastructure` | Modelo ML.NET e cliente HTTP do MarketData |
| API | `src/PucCrypto.Forecast.Api` | Function App (Azure Functions, isolated worker): os gatilhos ficam em `Functions/` |

Os casos de uso são Vertical Slices em `Application/Features`; a entrada de cada um é uma Function na camada API.

| Slice | Entrada | Arquivos |
|---|---|---|
| `GetForecast` | `GetForecastFunction` | `GetForecastQuery`, `GetForecastValidator`, `GetForecastHandler`, `GetForecastResponse` |
| `TriggerPriceCollection` | `CollectPricesFunction` | `TriggerPriceCollectionCommand`, `TriggerPriceCollectionHandler` |

### Modelo de previsão

Regressão linear do ML.NET (SDCA) que aprende a próxima variação percentual do preço a partir das 7 variações anteriores. As entradas são padronizadas; a previsão é feita passo a passo, e cada variação prevista entra como dado do passo seguinte. O intervalo de 95% vem do erro do modelo na própria série e aumenta com o número de passos. A mesma série produz sempre a mesma previsão.

O modelo é treinado a cada chamada, com a série recebida. É um modelo simples, adequado para demonstração; não é uma recomendação de investimento.

### Contrato de `POST /api/forecast`

Requisição (o formato de cada preço é o mesmo devolvido por `GET /prices` do MarketData; campos extras são ignorados):

```json
{
  "prices": [
    { "timestamp": "2026-07-01T00:00:00Z", "priceUsd": 60123.45 },
    { "timestamp": "2026-07-02T00:00:00Z", "priceUsd": 60456.78 }
  ],
  "horizon": 7
}
```

- `prices`: entre 14 e 1.000 instantes distintos, com preços positivos. A ordem não importa.
- `horizon`: de 1 a 30 passos (padrão 7). O passo é o intervalo típico entre os preços recebidos.

Resposta 200:

```json
{
  "model": "ML.NET SDCA: regressão linear sobre as variações dos 7 preços anteriores",
  "trainingPoints": 90,
  "horizon": 7,
  "intervalSeconds": 86400,
  "lastObservation": { "timestamp": "2026-09-28T00:00:00Z", "priceUsd": 63149.2 },
  "forecast": [
    { "timestamp": "2026-09-29T00:00:00Z", "priceUsd": 63210.4, "lowerUsd": 61180.2, "upperUsd": 65240.6 }
  ]
}
```

Erros: 400 (corpo inválido ou validação, no formato Problem Details) e 401 (sem a chave da Function no cabeçalho `x-functions-key`).

`src/BuildingBlocks` contém o código de apoio comum aos serviços .NET do PucCrypto (contratos de handler, `Result`, validação), copiado para este repositório.

## Tecnologias

- .NET 8, Azure Functions v4 (isolated worker, integração com ASP.NET Core)
- ML.NET (regressão SDCA)
- FluentValidation
- xUnit e NetArchTest
- Docker (imagem do runtime do Azure Functions) e Azurite

## Como rodar localmente

Requisitos: Docker. Para compilar e testar fora do Docker, SDK do .NET 8.

```bash
docker compose up -d --build
```

Sobe o Function App e o Azurite (storage exigido pelo runtime). A imagem do runtime é x64; em Macs com processador ARM, roda por emulação.

```bash
curl http://localhost:7071/api/health

curl -X POST http://localhost:7071/api/forecast \
  -H 'x-functions-key: puccrypto-dev-function-key' -H 'Content-Type: application/json' \
  -d @serie.json
```

A chave `puccrypto-dev-function-key` vem de `local/host-secrets.json`, montado no contêiner apenas no ambiente local. Na nuvem, as chaves são geradas pelo Azure.

A Function agendada chama o MarketData em `MarketData__BaseUrl` (no Compose deste repositório, um MarketData rodando na máquina, porta 5103). Para o sistema completo, use o `docker-compose.yml` da área de trabalho do projeto.

Com o Azure Functions Core Tools instalado, também é possível rodar sem Docker: copie `src/PucCrypto.Forecast.Api/local.settings.json.example` para `local.settings.json` e execute `func start` nessa pasta.

### Configuração

| Chave | Descrição |
|---|---|
| `AzureWebJobsStorage` | Storage do runtime (Azurite no ambiente local) |
| `CollectPricesSchedule` | Expressão CRON de seis campos da coleta (ex.: `0 */30 * * * *`) |
| `MarketData__BaseUrl` | Endereço do MarketData |
| `MarketData__CollectorApiKey` | Chave exigida por `POST /prices/collect` |

## Testes

```bash
dotnet test
```

- `tests/PucCrypto.Forecast.UnitTests`: série de preços, validação, handlers, o modelo ML.NET treinado com séries sintéticas (constante, alta, queda, oscilação) e o cliente do MarketData.
- `tests/PucCrypto.Forecast.ArchitectureTests`: Domain não depende de nada; Application não depende de Infrastructure, do ML.NET nem do SDK do Azure Functions; slices não referenciam outras slices e seguem a convenção de nomes.

## URLs na nuvem

| Recurso | URL |
|---|---|
| `POST /api/forecast` | _a preencher após o deploy_ |
| `GET /api/health` | _a preencher após o deploy_ |

## Alunos

- _Nome do aluno 1_
- _Nome do aluno 2_
- _Nome do aluno 3_
