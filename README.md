# PucCrypto

Projeto PJBL da disciplina de Arquitetura de Software. Site com cadastro e login, CRUD de criptomoedas monitoradas por usuário e dashboard com preço histórico e previsão por machine learning.

Este repositório é a área de trabalho do projeto. Cada pasta de componente é autossuficiente e é publicada em um repositório próprio; aqui ficam também a documentação comum e o ambiente local do sistema completo.

## Componentes

| Pasta | Componente | Tecnologia | Papel no enunciado | Estado |
|---|---|---|---|---|
| [identity/](identity/) | Identity | .NET 8, PostgreSQL | Acréscimo do grupo (login com JWT) | Pronto |
| [catalog/](catalog/) | Catalog | .NET 8, Azure SQL | Microsserviço 2 (SQL) | Pronto, exceto deploy |
| [marketdata/](marketdata/) | MarketData | .NET 8, MongoDB Atlas | Microsserviço 1 (MongoDB) | A fazer |
| [forecast-function/](forecast-function/) | GetForecast | Azure Functions, ML.NET | Azure Function | A fazer |
| [bff/](bff/) | BFF | NestJS | BFF Node.js | A fazer |
| [frontend/](frontend/) | Shell e remotes | React, Vite, Module Federation | Microfrontend | A fazer |

O API Gateway é um serviço gerenciado na nuvem, na frente do BFF.

## Fluxo

1. O usuário acessa o microfrontend, que chama apenas o BFF, pelo API Gateway.
2. O BFF repassa o login ao Identity e os CRUDs ao Catalog e ao MarketData.
3. Em `GET /aggregated-data`, o BFF consulta o Catalog, o MarketData e a Function `GetForecast` e devolve um único JSON.
4. Catalog e MarketData trocam eventos (`CryptoRegistered`, `CryptoRemoved`, `PricesIngested`) por um broker RabbitMQ.

## Como executar o que já existe

Requisitos: Docker. Para compilar e testar fora do Docker, SDK do .NET 8.

```bash
cp .env.example .env
docker compose up -d --build
```

- Identity: http://localhost:5101/swagger
- Catalog: http://localhost:5102/swagger
- Painel do RabbitMQ: http://localhost:15672

Cada pasta tem a sua própria solução: `cd identity && dotnet test`.

## Documentação

- [Enunciado do PJBL](docs/enunciado-pjbl.md)
- [Análise de impacto do enunciado final](docs/analise-impacto-pjbl.md)
- [Decisões de arquitetura (ADRs)](docs/ADRs.md)
- Inventário por fase: [1](docs/fases/fase-01.md), [2](docs/fases/fase-02.md), [3](docs/fases/fase-03.md), [4](docs/fases/fase-04.md), [3R](docs/fases/fase-03R.md), [4R](docs/fases/fase-04R.md)

As fases 1 a 4 descrevem a arquitetura anterior ao enunciado final. A fase 3R registra a reorganização e a 4R, o Catalog revisado.

## Alunos

- _Nome do aluno 1_
- _Nome do aluno 2_
- _Nome do aluno 3_
