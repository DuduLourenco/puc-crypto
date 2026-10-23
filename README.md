# PucCrypto

Projeto PJBL da disciplina de Arquitetura de Software. Site com cadastro e login, CRUD de criptomoedas monitoradas por usuário e dashboard com preço histórico e previsão por machine learning.

Todo o projeto fica neste repositório, com uma pasta autossuficiente por componente (código, testes, Dockerfile e README próprios). Aqui ficam também a documentação comum, o contrato dos eventos ([asyncapi.yaml](asyncapi.yaml)), o ambiente local do sistema completo e os scripts de deploy ([infra/](infra/)).

## Componentes

| Pasta | Componente | Tecnologia | Papel no enunciado | Estado |
|---|---|---|---|---|
| [identity/](identity/) | Identity | .NET 8, PostgreSQL | Acréscimo do grupo (login com JWT) | Publicado |
| [catalog/](catalog/) | Catalog | .NET 8, Azure SQL | Microsserviço 2 (SQL) | Publicado |
| [marketdata/](marketdata/) | MarketData | .NET 8, MongoDB Atlas | Microsserviço 1 (MongoDB) | Publicado |
| [forecast-function/](forecast-function/) | GetForecast | Azure Functions, ML.NET | Azure Function | Publicado |
| [bff/](bff/) | BFF | NestJS | BFF Node.js | Publicado |
| [frontend/](frontend/) | Shell e remotes | React, Vite, Module Federation | Microfrontend | Publicado |

O API Gateway é um serviço gerenciado na nuvem, na frente do BFF.

## Fluxo

1. O usuário acessa o microfrontend, que chama apenas o BFF, pelo API Gateway.
2. O BFF repassa o login ao Identity e os CRUDs ao Catalog e ao MarketData.
3. Em `GET /aggregated-data`, o BFF consulta o Catalog, o MarketData e a Function `GetForecast` e devolve um único JSON.
4. Catalog e MarketData trocam eventos (`CryptoRegistered`, `CryptoRemoved`, `PricesIngested`) por um broker RabbitMQ.

## Na nuvem

| Componente | URL |
|---|---|
| Site (frontend) | https://puccrypto-frontend.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io |
| API Gateway | https://apim-puccrypto-f43a29.azure-api.net/api |
| BFF — Swagger | https://puccrypto-bff.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io/swagger |
| Catalog — Swagger | https://puccrypto-catalog.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io/swagger |
| MarketData — Swagger | https://puccrypto-marketdata.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io/swagger |
| Identity — Swagger | https://puccrypto-identity.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io/swagger |
| Azure Function | https://func-puccrypto-f43a29.azurewebsites.net/api/health |
| Imagens no Docker Hub | https://hub.docker.com/u/lourencodu |

Conta de demonstração: `demo@puccrypto.dev`, senha `PucCrypto-demo-996f85`. Evidências e prints da publicação: [docs/entrega-deploy](docs/entrega-deploy/README.md). Deploy: [infra/](infra/).

## Como executar

Requisitos: Docker. Para compilar e testar fora do Docker, SDK do .NET 8 e Node 22.

```bash
cp .env.example .env
docker compose up -d --build
```

- Frontend: http://localhost:5200
- BFF (ponto de entrada local): http://localhost:5100/swagger
- Identity: http://localhost:5101/swagger
- Catalog: http://localhost:5102/swagger
- MarketData: http://localhost:5103/swagger
- Forecast Function: http://localhost:7071/api/health (previsão em `POST /api/forecast`, com `x-functions-key: puccrypto-dev-function-key`)
- Painel do RabbitMQ: http://localhost:15672

Cada pasta tem a sua própria solução e os seus testes: `cd identity && dotnet test`, `cd bff && npm install && npm test`.

## Documentação

- [Enunciado do PJBL](docs/enunciado-pjbl.md)
- [Análise de impacto do enunciado final](docs/analise-impacto-pjbl.md)
- [Decisões de arquitetura (ADRs)](docs/ADRs.md)
- Inventário por fase: [1](docs/fases/fase-01.md), [2](docs/fases/fase-02.md), [3](docs/fases/fase-03.md), [4](docs/fases/fase-04.md), [3R](docs/fases/fase-03R.md), [4R](docs/fases/fase-04R.md), [5](docs/fases/fase-05.md), [6](docs/fases/fase-06.md), [7](docs/fases/fase-07.md), [8](docs/fases/fase-08.md), [9](docs/fases/fase-09.md)

As fases 1 a 4 descrevem a arquitetura anterior ao enunciado final. A fase 3R registra a reorganização e a 4R, o Catalog revisado.

## Alunos

- Eduardo Lourenço da Silva
- Gabriel Pereira Lugon Moulin
- João Pedro Novak Rausis
- Vitor Vieira Machado
