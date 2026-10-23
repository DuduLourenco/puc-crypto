# Checklist de insumos para a entrega final

Lista do que o enunciado pede no PDF da Entrega 3 (ARC42, C4, Canvas, prints e vídeo), com o link ou o arquivo de cada item. Os itens marcados como pendentes dependem do grupo.

**Grupo:** Eduardo Lourenço da Silva, Gabriel Pereira Lugon Moulin, João Pedro Novak Rausis e Vitor Vieira Machado.

## 1. Links para o ARC42

| Item do enunciado | Link | Situação |
|---|---|---|
| GitHub (todos os projetos) | https://github.com/DuduLourenco/puc-crypto | Pronto. Repositório único, autorizado pelo professor (ADR-049) |
| — Microfrontend | https://github.com/DuduLourenco/puc-crypto/tree/main/frontend | Pronto |
| — BFF | https://github.com/DuduLourenco/puc-crypto/tree/main/bff | Pronto |
| — Microsserviço Mongo (MarketData) | https://github.com/DuduLourenco/puc-crypto/tree/main/marketdata | Pronto |
| — Microsserviço SQL (Catalog) | https://github.com/DuduLourenco/puc-crypto/tree/main/catalog | Pronto |
| — Azure Function | https://github.com/DuduLourenco/puc-crypto/tree/main/forecast-function | Pronto |
| — Identity (acréscimo do grupo) | https://github.com/DuduLourenco/puc-crypto/tree/main/identity | Pronto |
| Docker Hub (imagens) | https://hub.docker.com/u/lourencodu | Pronto |
| — BFF | https://hub.docker.com/r/lourencodu/puccrypto-bff | Pronto |
| — MarketData | https://hub.docker.com/r/lourencodu/puccrypto-marketdata | Pronto |
| — Catalog | https://hub.docker.com/r/lourencodu/puccrypto-catalog | Pronto |
| — Identity | https://hub.docker.com/r/lourencodu/puccrypto-identity | Pronto |
| — Frontend | https://hub.docker.com/r/lourencodu/puccrypto-frontend | Pronto |
| Swagger do BFF | https://puccrypto-bff.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io/swagger | Pronto |
| Swagger dos microsserviços | Catalog: https://puccrypto-catalog.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io/swagger<br>MarketData: https://puccrypto-marketdata.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io/swagger<br>Identity: https://puccrypto-identity.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io/swagger | Pronto |
| Eventos | https://github.com/DuduLourenco/puc-crypto/blob/main/asyncapi.yaml (AsyncAPI 3.0) | Pronto. Pode ser aberto no https://studio.asyncapi.com para gerar a página e o print |
| Frontend | https://puccrypto-frontend.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io | Pronto. Conta `demo@puccrypto.dev`, senha `PucCrypto-demo-996f85` |
| API Gateway | https://apim-puccrypto-f43a29.azure-api.net/api/swagger (Swagger do BFF servido pelo Gateway; as rotas ficam sob `/api`, como `/api/health`. A raiz `/api` sozinha responde 404) | Pronto |
| Azure Function | https://func-puccrypto-f43a29.azurewebsites.net/api/health | Pronto (não exigido como link, mas útil) |
| Vídeo no YouTube | — | **Pendente** (roteiro na seção 5) |

## 2. Prints exigidos

| Print | Arquivo | Situação |
|---|---|---|
| Swagger do BFF | [entrega-deploy/swagger-1-bff.png](entrega-deploy/swagger-1-bff.png) | Pronto |
| Swagger dos microsserviços | [swagger-2-catalog.png](entrega-deploy/swagger-2-catalog.png), [swagger-3-marketdata.png](entrega-deploy/swagger-3-marketdata.png), [swagger-4-identity.png](entrega-deploy/swagger-4-identity.png) | Pronto |
| Frontend funcionando | [site-1-acesso.png](entrega-deploy/site-1-acesso.png), [site-2-criptomoedas.png](entrega-deploy/site-2-criptomoedas.png), [site-3-dashboard.png](entrega-deploy/site-3-dashboard.png), [site-4-dashboard-tooltip.png](entrega-deploy/site-4-dashboard-tooltip.png) | Pronto |
| API Gateway | Print do API Management no portal (item 4 abaixo). Para mostrar o Gateway funcionando, o Swagger do BFF abre pela URL do Gateway: https://apim-puccrypto-f43a29.azure-api.net/api/swagger | **Pendente** (exige o login no portal) |
| Docker Hub (outra tarefa) | [entrega-deploy/dockerhub-0-perfil.png](entrega-deploy/dockerhub-0-perfil.png) e seguintes | Pronto |
| Portal Azure (outra tarefa) | — | **Pendente** (ver abaixo) |

Prints que só podem ser tirados com o login do grupo no portal (https://portal.azure.com):

1. **Grupos de recursos → `rg-puccrypto`**: todos os recursos do projeto.
2. **`puccrypto-frontend` → Visão geral**: status "Em execução" e a URL do site.
3. **`puccrypto-frontend` → Aplicativo → Contêineres**: imagem `docker.io/lourencodu/puccrypto-frontend@sha256:…`, vinda do Docker Hub.
4. **`apim-puccrypto-f43a29` → APIs → PucCrypto BFF**: a API do Gateway, com o caminho `/api` e o encaminhamento para o BFF. Este é o print de "API Gateway" exigido no enunciado.

## 3. C4 — elementos de cada nível

### Contexto (nível 1)

| Elemento | Tipo | Relação com o PucCrypto |
|---|---|---|
| Usuário | Pessoa | Acompanha criptomoedas pelo site: cadastro, lista e dashboard |
| PucCrypto | Sistema | O sistema documentado |
| CoinGecko | Sistema externo | Fornece os preços (API HTTP) |
| MongoDB Atlas | Sistema externo | Banco do MarketData |
| CloudAMQP | Sistema externo | Broker RabbitMQ dos eventos |

### Containers (nível 2)

| Container | Tecnologia | Responsabilidade | Comunica com |
|---|---|---|---|
| Frontend (shell + `mfe-auth`, `mfe-cryptos`, `mfe-dashboard`) | React, Vite, Module Federation, nginx | Interface; carrega os microfrontends em tempo de execução | API Gateway (HTTPS) |
| API Gateway | Azure API Management | Entrada única, encaminha `/api/*` ao BFF | BFF |
| BFF | NestJS | `GET /aggregated-data`, repasse do login e dos CRUDs, validação do JWT | Identity, Catalog, MarketData, Function (HTTPS) |
| Identity | .NET 8 | Cadastro, login, emissão do JWT | Azure SQL (`identity_db`) |
| Catalog | .NET 8 | Catálogo e lista do usuário; publica e consome eventos | Azure SQL (`catalog_db`), RabbitMQ |
| MarketData | .NET 8 | Histórico de preços, coleta na CoinGecko; publica e consome eventos | MongoDB Atlas, RabbitMQ, CoinGecko |
| Function `GetForecast` + coleta agendada | Azure Functions (Flex Consumption), ML.NET | Previsão por machine learning; dispara a coleta | MarketData (coleta) |
| Bancos | Azure SQL Database (2 bancos), MongoDB Atlas | Um banco por serviço | — |
| Broker | RabbitMQ (CloudAMQP) | Exchange `puccrypto.events` | Catalog, MarketData |

### Componentes (nível 3)

O inventário de componentes de cada container, com responsabilidades e dependências, está nos documentos das fases:

| Container | Documento |
|---|---|
| Identity | [fase-03.md](fases/fase-03.md), seção 2 (estrutura atualizada em [fase-03R.md](fases/fase-03R.md)) |
| Catalog | [fase-04R.md](fases/fase-04R.md), seção 3, e [fase-05.md](fases/fase-05.md) (consumo de `PricesIngested`) |
| MarketData | [fase-05.md](fases/fase-05.md), seção 3 |
| Function | [fase-06.md](fases/fase-06.md), seção 3 |
| BFF | [fase-07.md](fases/fase-07.md), seção 3 |
| Frontend | [fase-08.md](fases/fase-08.md), seção 2 |

Padrão comum aos serviços .NET: em cada slice, `Endpoint` (ou `Consumer`) → `Handler` → portas (`I...Repository`, `IEventBus`, `IMarketPriceProvider`) → adaptadores na Infrastructure.

## 4. Software Architecture Canvas — insumos

| Seção | Conteúdo |
|---|---|
| Proposta de valor | Acompanhar criptomoedas em um só lugar: lista pessoal, histórico de preços e previsão por machine learning |
| Stakeholders | Usuário final; grupo de desenvolvimento; professor da disciplina |
| Requisitos de qualidade | Modularidade e independência de componentes (microsserviços, microfrontends); disponibilidade parcial (`/aggregated-data` funciona sem a previsão); segurança (JWT, chave da Function, Gateway); testabilidade (testes unitários e de arquitetura); custo baixo na nuvem |
| Contexto | Usuário, CoinGecko, MongoDB Atlas, CloudAMQP, Azure (seção 3) |
| Funcionalidades | Cadastro e login; CRUD do catálogo e da lista; coleta de preços; previsão; dashboard agregado |
| Tecnologias | React + Module Federation; NestJS; .NET 8; Azure Functions + ML.NET; Azure SQL; MongoDB Atlas; RabbitMQ; Azure Container Apps; API Management; Docker Hub |
| Decisões | [ADRs.md](ADRs.md), com 52 decisões; destaques: database per service (027), eventos com RabbitMQ (030, 035), previsão em Function HTTP (029, 039), BFF sem framework na Application (042), microfrontends em tempo de execução (045), publicação no Azure (051) |
| Riscos | Partida lenta após inatividade (escala a zero e Azure SQL serverless); evento perdido se a publicação falhar depois da gravação, sem outbox (022); chave do JWT compartilhada (017); modelo de previsão simples (039) |
| Lacunas | Sem outbox nem fila de mensagens mortas; sem papéis de administrador; sem cache no BFF |

## 5. Roteiro sugerido para o vídeo (cerca de 5 minutos, só URLs da nuvem)

1. **Arquitetura (30 s):** mostrar o diagrama de containers do C4 e dizer o papel de cada componente.
2. **Frontend e login (45 s):** abrir a URL do frontend, entrar com a conta de demonstração e mostrar que o endereço é da Azure.
3. **CRUD (1 min):** em Criptomoedas, cadastrar uma moeda nova (por exemplo, Cardano), adicioná-la à lista, editar a anotação. Em seguida, apontar no MarketData Swagger ou no dashboard que o histórico chegou pelos eventos.
4. **Agregação (1 min):** no dashboard, mostrar o gráfico com histórico e previsão; abrir `GET /aggregated-data` no Swagger do BFF (botão "Authorize" com o token) e mostrar o JSON único com Catalog, MarketData e Function.
5. **Gateway e Swagger (45 s):** mostrar a chamada pela URL do API Gateway e o Swagger dos microsserviços.
6. **Docker Hub e Azure (45 s):** mostrar as imagens públicas no Docker Hub e o grupo `rg-puccrypto` no portal.
7. **Código (30 s):** mostrar no GitHub a estrutura de uma pasta (camadas e `Features/`) e rodar os testes de arquitetura.

Antes de gravar, abrir o site e o Swagger uma vez: os apps que escalam a zero e o Azure SQL serverless demoram alguns segundos na primeira chamada.

## 6. Pendências do grupo

- [ ] Prints do Portal Azure (seção 2).
- [ ] Vídeo no YouTube e o link no ARC42.
- [ ] Atualizar o PDF da documentação (`docs/documentacao.pdf`) com os links da seção 1, se ainda não estiverem lá.
- [ ] Depois da avaliação, apagar os recursos: `az group delete -n rg-puccrypto`.
