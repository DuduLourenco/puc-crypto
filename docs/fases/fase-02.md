# Fase 2 — Scaffold da solução

Esta fase cria a solução .NET com todos os projetos vazios, o ambiente local em Docker Compose, os quatro bancos e o Gateway com as rotas iniciais. Ainda não há regra de negócio: cada API responde apenas `GET /health`.

## 1. Componentes criados

| Componente | Projeto | O que existe nesta fase |
|---|---|---|
| Gateway | `src/Gateway/PucCrypto.Gateway` | YARP com as rotas para Identity e BFF, e `/health` |
| BFF | `src/Bff/PucCrypto.Bff.Web` | API mínima com `/health` |
| Identity | `src/Services/Identity/PucCrypto.Identity.{Domain,Application,Infrastructure,Api}` | Camadas vazias; Api com `/health` |
| Catalog | `src/Services/Catalog/PucCrypto.Catalog.{Domain,Application,Infrastructure,Api}` | Camadas vazias; Api com `/health` |
| MarketData | `src/Services/MarketData/PucCrypto.MarketData.{Domain,Application,Infrastructure,Api,Functions}` | Camadas vazias; Api com `/health`; Functions sem gatilhos |
| Prediction | `src/Services/Prediction/PucCrypto.Prediction.{Domain,Application,Infrastructure,Api,Functions}` | Camadas vazias; Api com `/health`; Functions sem gatilhos |
| BuildingBlocks | `src/BuildingBlocks/PucCrypto.BuildingBlocks.Abstractions`, `PucCrypto.BuildingBlocks.Messaging`, `PucCrypto.Contracts` | Projetos vazios |
| Testes de arquitetura | `tests/PucCrypto.ArchitectureTests` | Projeto com NetArchTest e xUnit, ainda sem testes |

A solução `PucCrypto.sln` reúne os 24 projetos.

## 2. Dependências entre projetos

As referências já seguem a regra de dependência da Clean Architecture (ADR-002).

| Projeto | Referencia |
|---|---|
| `<Servico>.Domain` | Nada |
| `<Servico>.Application` | `<Servico>.Domain`, `BuildingBlocks.Abstractions` e, exceto no Identity, `Contracts` |
| `<Servico>.Infrastructure` | `<Servico>.Application` e, exceto no Identity, `BuildingBlocks.Messaging` |
| `<Servico>.Api` | `<Servico>.Application`, `<Servico>.Infrastructure` |
| `<Servico>.Functions` | `<Servico>.Application`, `<Servico>.Infrastructure` |
| `BuildingBlocks.Messaging` | `BuildingBlocks.Abstractions` |
| `BuildingBlocks.Abstractions`, `Contracts` | Nada |
| `Gateway`, `Bff.Web` | Nenhum projeto da solução |
| `ArchitectureTests` | Domain, Application, Infrastructure e Api dos quatro serviços |

O Identity não publica nem consome eventos, por isso não referencia `Contracts` nem `BuildingBlocks.Messaging`. O BFF receberá as referências de mensageria na fase 7.

## 3. Ambiente local (Docker Compose)

| Serviço do Compose | Imagem ou projeto | Porta no host | Papel |
|---|---|---|---|
| `gateway` | `PucCrypto.Gateway` | 8080 | Ponto único de entrada |
| `bff` | `PucCrypto.Bff.Web` | 5100 | BFF do frontend web |
| `identity-api` | `PucCrypto.Identity.Api` | 5101 | Serviço Identity |
| `catalog-api` | `PucCrypto.Catalog.Api` | 5102 | Serviço Catalog |
| `marketdata-api` | `PucCrypto.MarketData.Api` | 5103 | Serviço MarketData |
| `prediction-api` | `PucCrypto.Prediction.Api` | 5104 | Serviço Prediction |
| `postgres` | `postgres:16-alpine` | 5440 | Servidor com os quatro bancos |
| `rabbitmq` | `rabbitmq:4-management-alpine` | 5672 e 15672 (painel) | Broker de eventos |
| `azurite` | `mcr.microsoft.com/azure-storage/azurite` | 10000–10002 | Storage exigido pelas Azure Functions |

Só o Gateway é publicado em todas as interfaces. As demais portas ficam em `127.0.0.1` e existem apenas para depuração; na nuvem, apenas o Gateway terá entrada externa.

As imagens do Gateway, do BFF e das APIs são geradas por um único Dockerfile parametrizado, `infra/docker/dotnet-service.Dockerfile` (ADR-015). As Functions entram no Compose nas fases 5 e 6.

## 4. Bancos de dados

O script `infra/local/postgres/init-databases.sh` roda na primeira inicialização do volume e cria um banco e um usuário por serviço. Cada usuário é dono do seu banco, e o privilégio de conexão é retirado dos demais.

| Serviço | Banco | Usuário |
|---|---|---|
| Identity | `identity_db` | `identity_user` |
| Catalog | `catalog_db` | `catalog_user` |
| MarketData | `marketdata_db` | `marketdata_user` |
| Prediction | `prediction_db` | `prediction_user` |

Cada API recebe apenas a connection string do seu banco, na variável `ConnectionStrings__Database`. As senhas vêm do arquivo `.env`, que não é versionado; `.env.example` traz os valores de desenvolvimento.

## 5. Rotas do Gateway

| Rota externa | Destino | Caminho recebido pelo destino |
|---|---|---|
| `/api/auth/{**}` | Identity | `/auth/{**}` |
| `/api/{**}` | BFF | `/{**}` |
| `/health` | O próprio Gateway | — |

O prefixo `/api` é removido antes do encaminhamento (ADR-016). As rotas ficam em `appsettings.json`; os endereços dos destinos são sobrescritos por variáveis de ambiente no Compose.

## 6. Eventos

Nenhum evento é publicado ou consumido nesta fase. O RabbitMQ já sobe no Compose, mas nenhum serviço se conecta a ele ainda.

## 7. Como executar

```bash
cp .env.example .env
docker compose up -d --build
curl http://localhost:8080/health

dotnet build PucCrypto.sln
```

O painel do RabbitMQ fica em http://localhost:15672, com o usuário e a senha definidos em `.env`.

## 8. Verificação realizada

- `dotnet build PucCrypto.sln`: 24 projetos compilados, sem avisos nem erros.
- `docker compose up`: nove contêineres no ar; PostgreSQL e RabbitMQ saudáveis.
- `GET /health` respondeu `200 Healthy` no Gateway, no BFF e nas quatro APIs.
- Roteamento: o log do Gateway mostra `/api/auth/ping` encaminhado para `identity-api/auth/ping` e `/api/cryptos` para `bff/cryptos`. Ambas devolvem 404, o esperado enquanto os destinos não têm endpoints.
- Bancos: os quatro existem, cada um com seu dono. `catalog_user` conecta em `catalog_db` e é recusado em `identity_db` ("User does not have CONNECT privilege").
- `dotnet test` roda, mas informa que não há testes; eles chegam na fase 3.

## 9. Pendências para as próximas fases

- Fase 3: connection string para rodar as APIs fora do Docker (`dotnet run`), assinatura e validação do JWT, primeiros testes de arquitetura.
- Fases 5 e 6: execução local das Functions. A imagem oficial das Functions pode não ter versão para ARM64; nesse caso será preciso instalar o Azure Functions Core Tools.
- Fase 8: `src/Web` continua apenas com as pastas vazias.
