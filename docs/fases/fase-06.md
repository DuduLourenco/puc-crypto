# Fase 6 — Azure Function de previsão e coleta agendada

Esta fase entrega o componente serverless do PucCrypto: um Function App com a Function `GetForecast` (gatilho HTTP), que recebe a série de preços e devolve a previsão por machine learning, e a Function `CollectPrices` (gatilho agendado), que dispara a coleta de preços no MarketData. No enunciado, é a "Azure Function" consumida pelo BFF em `/aggregated-data`.

## 1. Verificação do ML.NET em ARM64 (pendência desde a fase 1)

O ADR-010 deixou pendente confirmar se o forecasting de séries temporais do ML.NET (SSA) rodava na máquina de desenvolvimento, que é ARM64. O teste foi feito no início da fase, com ML.NET 5.0:

| Abordagem | ARM64 (nativo) | x64 (contêiner, como na nuvem) |
|---|---|---|
| `ForecastBySsa` (Microsoft.ML.TimeSeries) | Falha: `DllNotFoundException: MklImports` | Falha: `MklImports` ausente; exigiria o pacote da Intel MKL, que só existe para x64 |
| Regressão SDCA (Microsoft.ML) | Funciona | Funciona |

O SSA depende da biblioteca Intel MKL, que não tem versão para ARM64. Foi adotada a alternativa já prevista no ADR-010: uma regressão do ML.NET sobre os preços anteriores (ADR-039).

## 2. Functions

| Function | Gatilho | Autorização | Slice |
|---|---|---|---|
| `GetForecast` | HTTP `POST /api/forecast` | Chave da Function (`x-functions-key`) | `GetForecast` |
| `CollectPrices` | Agendado, `CollectPricesSchedule` (padrão a cada 30 minutos) | — | `TriggerPriceCollection` |
| `Health` | HTTP `GET /api/health` | Anônima | — |

O contrato de `POST /api/forecast` está no [README da Function](../../forecast-function/README.md). A série aceita o mesmo formato de preço devolvido por `GET /prices` do MarketData, para que o BFF possa repassá-la sem conversão.

## 3. Componentes criados (`forecast-function/`)

### Domain — `PucCrypto.Forecast.Domain`

| Tipo | Responsabilidade |
|---|---|
| `Forecasting/PriceSeries` | Série pronta para a previsão: ordena por instante, mantém a última observação de instantes repetidos, exige de 14 a 1.000 pontos e preços positivos, calcula o intervalo típico (mediana) e os instantes futuros |
| `Forecasting/PriceObservation` | Preço em um instante |
| `Forecasting/ForecastPoint` | Preço previsto com o intervalo de 95% |

### Application — `PucCrypto.Forecast.Application`

| Tipo | Responsabilidade |
|---|---|
| `Features/GetForecast/GetForecastQuery`, `PriceInput` | Entrada: série e horizonte (padrão 7, máximo 30) |
| `Features/GetForecast/GetForecastValidator` | Tamanho da série, preços positivos, horizonte |
| `Features/GetForecast/GetForecastHandler` | Monta a `PriceSeries`, pede os valores ao modelo e associa cada um ao seu instante |
| `Features/GetForecast/GetForecastResponse` | Modelo usado, pontos de treino, intervalo, última observação e previsão |
| `Features/TriggerPriceCollection/*` | Pede a coleta ao MarketData; falha vira `Unavailable` |
| `Abstractions/IForecastModel`, `ForecastValue` | Porta do modelo de machine learning |
| `Abstractions/IPriceCollectionTrigger`, `PriceCollectionSummary`, `PriceCollectionUnavailableException` | Porta da coleta no MarketData |

### Infrastructure — `PucCrypto.Forecast.Infrastructure`

| Classe | Responsabilidade | Implementa |
|---|---|---|
| `MachineLearning/LagRegressionForecastModel` | Treina, a cada chamada, a regressão SDCA do ML.NET sobre as variações dos 7 preços anteriores e projeta a série passo a passo | `IForecastModel` |
| `MarketData/MarketDataCollectionClient`, `MarketDataOptions` | `POST /prices/collect` no MarketData, com a chave `X-Api-Key` | `IPriceCollectionTrigger` |

### API — `PucCrypto.Forecast.Api` (Function App)

| Classe | Responsabilidade |
|---|---|
| `Program` | Raiz de composição; integração com ASP.NET Core; JSON sem escapar acentos |
| `Functions/GetForecastFunction` | Lê o corpo, valida, chama o handler e devolve 200 ou Problem Details |
| `Functions/CollectPricesFunction` | Executa a coleta no agendamento e registra o resultado no log |
| `Functions/HealthFunction` | Verificação de disponibilidade |
| `Functions/ProblemResults` | Converte erros de validação e de caso de uso em Problem Details, como nos microsserviços |

Os gatilhos ficam na camada API porque dependem do SDK do Azure Functions; a Application não depende dele (ADR-040).

## 4. Dependências

| Componente | Depende de |
|---|---|
| `GetForecast` | Nada externo: recebe a série e calcula |
| `CollectPrices` | MarketData (`POST /prices/collect`), chave de coleta |
| Runtime do Function App | Azure Storage (Azurite no ambiente local), exigido pelo gatilho agendado |
| BFF (fase 7) → `GetForecast` | Chave da Function |

## 5. Eventos

A Function não publica nem consome eventos. A coleta que ela dispara faz o MarketData publicar `PricesIngested`, consumido pelo Catalog (fase 5).

## 6. Fluxos

**Previsão (como o BFF fará na fase 7)**

1. O BFF chama `GET /prices?cryptocurrencyId=...` no MarketData e recebe o histórico.
2. Envia a lista a `POST /api/forecast` com `x-functions-key`.
3. `GetForecastFunction` valida o corpo e chama `GetForecastHandler`.
4. O handler monta a `PriceSeries` e chama `IForecastModel.Predict`.
5. `LagRegressionForecastModel` treina o modelo com a série e devolve os valores previstos.
6. A Function responde 200 com a previsão.

**Coleta agendada**

1. O runtime dispara `CollectPricesFunction` no horário configurado.
2. `TriggerPriceCollectionHandler` chama `IPriceCollectionTrigger`.
3. `MarketDataCollectionClient` chama `POST /prices/collect` no MarketData com `X-Api-Key`.
4. O MarketData coleta na CoinGecko, grava os preços e publica `PricesIngested`; o Catalog atualiza o último preço.

## 7. Testes

| Projeto | Testes | Conteúdo |
|---|---|---|
| `PucCrypto.Forecast.UnitTests` | 20 | `PriceSeries`, handlers, validador, modelo ML.NET treinado com séries sintéticas (constante, alta, queda, oscilação, determinismo, intervalo), cliente do MarketData |
| `PucCrypto.Forecast.ArchitectureTests` | 7 | Mesmas regras dos outros repositórios |

Os testes do modelo rodam o ML.NET de verdade e passam tanto em ARM64 quanto em x64 (contêiner).

**Correção nos testes de arquitetura dos outros repositórios.** Ao gerar os testes do Catalog e do MarketData a partir dos do Identity, uma substituição de texto trocou `Microsoft.IdentityModel` por `Microsoft.CatalogModel` e `Microsoft.MarketDataModel` na lista de tecnologias proibidas em Domain e Application. Com isso, esses dois repositórios não verificavam essa regra. A lista foi corrigida nos quatro repositórios e ganhou `Microsoft.ML` e `Microsoft.Azure.Functions`; todos os testes continuam passando.

## 8. Ambiente local

| Arquivo | Mudança |
|---|---|
| `forecast-function/Dockerfile` | Compila na arquitetura da máquina e usa a imagem do runtime do Azure Functions (x64) |
| `forecast-function/docker-compose.yml` | Function App e Azurite |
| `forecast-function/local/host-secrets.json` | Chaves fixas de desenvolvimento, montadas no contêiner (`x-functions-key: puccrypto-dev-function-key`) |
| `docker-compose.yml` (raiz) | Entram o Azurite e o Function App (porta 7071) |
| `.env.example` | Entra `COLLECT_PRICES_SCHEDULE` |

## 9. Verificação realizada

- `dotnet build`: 0 avisos e 0 erros. `dotnet test`: Forecast 27, Identity 26, Catalog 41 e MarketData 28 testes aprovados.
- Contêiner da Function: as três Functions são carregadas; `GET /api/health` responde 200; `POST /api/forecast` sem chave ou com chave errada responde 401; com a chave, devolve a previsão; série curta e horizonte acima do limite respondem 400 com os erros por campo; JSON inválido responde 400.
- No Compose do sistema completo (com a CoinGecko simulada da fase 5):
  - o histórico de 91 dias de `bitcoin`, lido do MarketData, foi enviado à Function, que devolveu a previsão de 7 dias;
  - com o agendamento a cada minuto, a Function `CollectPrices` executou com sucesso; o MarketData passou a 92 preços e o Catalog atualizou o último preço.
- Uma série em alta linear (de 3.000 a 3.290) gerou previsão crescente (3.300, 3.310, 3.320).
- Compose do repositório `forecast-function/`, sozinho: Function e previsão funcionam.
- Os dados de teste foram removidos.

## 10. Limitações e pendências

- O modelo é simples e serve para demonstração: segue a tendência recente e não prevê mudanças bruscas.
- O modelo é treinado a cada chamada. Com séries de até 1.000 pontos, o tempo é pequeno, mas o primeiro acesso a um Function App em plano de consumo tem a demora de inicialização (cold start).
- As chaves de desenvolvimento ficam versionadas em `local/host-secrets.json`; na nuvem, as chaves são geradas pelo Azure e não são versionadas.
- A Function não tem Swagger: o enunciado exige Swagger no BFF e nos microsserviços; o contrato está documentado no README.
- Fase 7: o BFF chama `GetForecast` em `/aggregated-data`.
