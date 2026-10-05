# PucCrypto — BFF

Backend for Frontend do PucCrypto, em Node.js com NestJS. É o único backend que o microfrontend conhece: agrega os microsserviços e a Azure Function em `GET /aggregated-data` e repassa o login e os CRUDs.

## Arquitetura

O PucCrypto é uma aplicação distribuída. O microfrontend chama apenas este BFF, exposto por um API Gateway. O BFF chama:

| Serviço | Papel no enunciado | O que o BFF usa |
|---|---|---|
| Catalog (Azure SQL) | Microsserviço SQL | Catálogo de criptomoedas e lista do usuário |
| MarketData (MongoDB) | Microsserviço MongoDB | Histórico de preços |
| Forecast Function | Azure Function (HTTP) | Previsão a partir do histórico |
| Identity (PostgreSQL) | Acréscimo do grupo | Cadastro e login |

### `GET /aggregated-data`

1. Valida o JWT do usuário.
2. Busca no **Catalog** as criptomoedas monitoradas pelo usuário.
3. Para cada uma, em paralelo, busca o histórico de preços no **MarketData**.
4. Envia o histórico à **Azure Function** `GetForecast`, que devolve a previsão.
5. Devolve tudo em um único JSON.

```json
{
  "generatedAt": "2026-10-05T21:51:48.385Z",
  "cryptos": [
    {
      "userCryptoId": "…", "cryptocurrencyId": "…",
      "symbol": "BTC", "name": "Bitcoin", "coinGeckoId": "bitcoin", "notes": "longo prazo",
      "latestPriceUsd": 65000, "latestPriceAt": "2026-10-05T21:51:40Z",
      "historyStatus": "ok",
      "history": [{ "timestamp": "2026-07-08T00:00:00Z", "priceUsd": 52144.44 }],
      "periodChangePercent": 24.65,
      "forecastStatus": "ok",
      "forecast": {
        "model": "ML.NET SDCA: regressão linear sobre as variações dos 7 preços anteriores",
        "horizon": 7,
        "points": [{ "timestamp": "2026-10-06T21:51:40Z", "priceUsd": 65145.59, "lowerUsd": 64012.1, "upperUsd": 66279.08 }]
      }
    }
  ]
}
```

Parâmetros opcionais: `horizon` (1 a 30, padrão 7) e `historyLimit` (1 a 365, padrão 90).

Se o Catalog falhar, a requisição falha, pois sem ele não há o que agregar. Se o MarketData ou a Function falharem para uma criptomoeda, ela volta com `historyStatus` ou `forecastStatus` igual a `unavailable` e as demais não são afetadas. Com menos de 14 preços, a Function não é chamada e o `forecastStatus` é `insufficient-history`.

### Rotas

| Rota | Repassa a | Autenticação |
|---|---|---|
| `GET /aggregated-data` | Catalog, MarketData e Function | JWT |
| `POST /auth/register`, `POST /auth/login` | Identity | Pública |
| `GET/POST /cryptos`, `GET/PUT/DELETE /cryptos/{id}` | Catalog | JWT |
| `GET/POST /user-cryptos`, `GET/PUT/DELETE /user-cryptos/{id}` | Catalog | JWT |
| `GET/POST /prices`, `GET/PUT/DELETE /prices/{id}`, `GET /assets` | MarketData | JWT |
| `GET /health` | — | Pública |

O BFF valida o JWT emitido pelo Identity e o repassa aos microsserviços, que também o validam. Um erro devolvido por um serviço chega ao cliente com o mesmo status e o mesmo corpo (Problem Details). Se um serviço não responder, o BFF devolve 502.

### Camadas

Clean Architecture, com uma pasta por camada em `src/` e dependências apontando para dentro:

| Camada | Pasta | Conteúdo | Pode importar |
|---|---|---|---|
| Domain | `src/domain` | Modelos e as regras de agregação (`buildCryptoAggregate`, `canForecast`, `periodChangePercent`) | Nada |
| Application | `src/application` | Casos de uso em `features/`, portas em `ports/`, erros em `errors/` | Domain |
| Infrastructure | `src/infrastructure` | Clientes HTTP dos serviços, validação do JWT, configuração | Application, Domain |
| API | `src/api` | Controllers, DTOs do Swagger, guard de autenticação, filtro de erros | Application, Domain |

`src/main.ts` e `src/app.module.ts` são a raiz de composição: só eles juntam a API aos adaptadores da Infrastructure.

Domain e Application são TypeScript puro, sem NestJS nem bibliotecas HTTP. As portas são classes abstratas (`CatalogGateway`, `MarketDataGateway`, `ForecastGateway`, `IdentityGateway`, `TokenVerifier`), implementadas na Infrastructure.

### Vertical Slices

Cada caso de uso é uma pasta em `src/application/features`, com a entrada (`*.query.ts` ou `*.command.ts`) e o handler (`*.handler.ts`):

`get-aggregated-data`, `register-user`, `login-user`, `list-cryptos`, `get-crypto`, `create-crypto`, `update-crypto`, `delete-crypto`, `list-user-cryptos`, `get-user-crypto`, `add-user-crypto`, `update-user-crypto`, `remove-user-crypto`, `list-tracked-assets`, `list-price-points`, `get-price-point`, `create-price-point`, `update-price-point`, `delete-price-point`.

Uma slice não importa outra. Os controllers, na camada API, são agrupados por recurso e chamam os handlers.

## Tecnologias

- Node.js 22, TypeScript, NestJS 11
- Swagger (`@nestjs/swagger`)
- `fetch` nativo do Node para as chamadas HTTP; `jsonwebtoken` para validar o JWT
- Jest e Supertest (testes unitários e da API)
- dependency-cruiser (testes de arquitetura)
- Docker

## Como rodar localmente

O BFF precisa dos serviços que ele chama. O caminho mais simples é o `docker-compose.yml` da área de trabalho do projeto, que sobe o sistema inteiro, com o BFF em http://localhost:5100.

Para rodar só o BFF, com os serviços já no ar na máquina (Identity 5101, Catalog 5102, MarketData 5103, Function 7071):

```bash
# com Docker
docker compose up -d --build

# ou com Node 22
npm install
cp .env.example .env
npm run start:dev
```

- API: http://localhost:5100
- Swagger: http://localhost:5100/swagger (documento em `/swagger/v1/swagger.json`)

Exemplo:

```bash
TOKEN=$(curl -s -X POST http://localhost:5100/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana@example.com","password":"senha-segura-1"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).accessToken')

curl http://localhost:5100/aggregated-data -H "Authorization: Bearer $TOKEN"
```

### Configuração

| Variável | Descrição |
|---|---|
| `PORT` | Porta HTTP (padrão 5100; 3000 na imagem Docker) |
| `CORS_ORIGINS` | Origens aceitas, separadas por vírgula (padrão `*`) |
| `IDENTITY_URL`, `CATALOG_URL`, `MARKETDATA_URL` | Endereços dos serviços |
| `FORECAST_URL` | Endereço da Function, com o prefixo `/api` |
| `FORECAST_FUNCTION_KEY` | Chave da Function (`x-functions-key`) |
| `JWT_SIGNING_KEY` | Chave de assinatura do JWT, a mesma do Identity |
| `JWT_ISSUER`, `JWT_AUDIENCE` | Emissor e audiência esperados (padrões `puccrypto-identity` e `puccrypto`) |
| `UPSTREAM_TIMEOUT_MS` | Tempo máximo de cada chamada a um serviço (padrão 20000) |

## Testes

```bash
npm test            # unitários e de arquitetura
npm run test:unit   # Jest
npm run test:arch   # dependency-cruiser
```

- **Unitários (`test/`)**: regras de agregação do domínio; `GetAggregatedDataHandler` com portas simuladas (caminho feliz, histórico insuficiente, falha da Function, falha do MarketData para uma criptomoeda, falha do Catalog); slices de repasse; cliente HTTP e gateways com `fetch` simulado; validação do JWT; configuração; e a camada API com Supertest (rotas, autenticação, repasse de erros, validação e documento do Swagger).
- **Arquitetura (`.dependency-cruiser.cjs`)**: Domain não importa nada; Application não importa Infrastructure, API nem pacotes npm; Infrastructure não importa API; API não importa Infrastructure; slices não importam outras slices; não há dependências circulares.

## Imagem Docker

```bash
docker build -t <usuario>/puccrypto/bff:v1 .
```

## URLs na nuvem

| Recurso | URL |
|---|---|
| BFF pelo API Gateway | _a preencher após o deploy_ |
| Swagger | _a preencher após o deploy_ |
| Imagem no Docker Hub | _a preencher após a publicação_ |

## Alunos

- _Nome do aluno 1_
- _Nome do aluno 2_
- _Nome do aluno 3_
