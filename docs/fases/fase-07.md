# Fase 7 — BFF em NestJS

Esta fase entrega o BFF, o "BFF (Backend for Frontend) — Node.js" do enunciado: o endpoint obrigatório `GET /aggregated-data`, que consome os dois microsserviços e a Azure Function e devolve tudo em uma única resposta, o repasse do login e dos CRUDs, Swagger, testes unitários e testes de arquitetura. A partir daqui, o frontend tem um único backend para chamar.

## 1. Rotas

| Rota | Slice | Chama | Autenticação |
|---|---|---|---|
| `GET /aggregated-data` | `get-aggregated-data` | Catalog, MarketData, Function | JWT |
| `POST /auth/register` | `register-user` | Identity | Pública |
| `POST /auth/login` | `login-user` | Identity | Pública |
| `GET /cryptos`, `GET /cryptos/{id}` | `list-cryptos`, `get-crypto` | Catalog | JWT |
| `POST /cryptos`, `PUT /cryptos/{id}`, `DELETE /cryptos/{id}` | `create-crypto`, `update-crypto`, `delete-crypto` | Catalog | JWT |
| `GET /user-cryptos`, `GET /user-cryptos/{id}` | `list-user-cryptos`, `get-user-crypto` | Catalog | JWT |
| `POST /user-cryptos`, `PUT /user-cryptos/{id}`, `DELETE /user-cryptos/{id}` | `add-user-crypto`, `update-user-crypto`, `remove-user-crypto` | Catalog | JWT |
| `GET /assets` | `list-tracked-assets` | MarketData | JWT |
| `GET /prices`, `GET /prices/{id}` | `list-price-points`, `get-price-point` | MarketData | JWT |
| `POST /prices`, `PUT /prices/{id}`, `DELETE /prices/{id}` | `create-price-point`, `update-price-point`, `delete-price-point` | MarketData | JWT |
| `GET /health` | — | — | Pública |

São 20 operações em 11 caminhos. O Swagger fica em `/swagger`, e o documento em `/swagger/v1/swagger.json`, como nos microsserviços.

## 2. `GET /aggregated-data`

Fluxo do `GetAggregatedDataHandler`:

1. `CatalogGateway.listUserCryptos`: as criptomoedas monitoradas pelo usuário do token.
2. Para cada uma, em paralelo, `MarketDataGateway.listPricePoints`: os preços mais recentes (padrão 90).
3. Se há pelo menos 14 preços, `ForecastGateway.getForecast`: a previsão para o horizonte pedido (padrão 7).
4. `buildCryptoAggregate` (Domain) combina os três resultados e calcula a variação percentual no período.

Tratamento de falhas:

| Situação | Resultado |
|---|---|
| Catalog devolve erro ou não responde | A requisição falha com o status do Catalog, ou 502 |
| MarketData falha para uma criptomoeda | Ela volta com `historyStatus: "unavailable"` e `forecastStatus: "unavailable"`; as demais não são afetadas |
| Function falha | `historyStatus: "ok"`, com o histórico, e `forecastStatus: "unavailable"` |
| Menos de 14 preços | A Function não é chamada; `forecastStatus: "insufficient-history"` |

A estrutura da resposta está no [README do BFF](../../bff/README.md).

## 3. Componentes criados (`bff/src`)

### Domain

| Arquivo | Conteúdo |
|---|---|
| `domain/models.ts` | Modelos de leitura: `Crypto`, `UserCrypto`, `PricePoint`, `TrackedAsset`, `Forecast`, `RegisteredUser`, `AccessToken` |
| `domain/aggregated-data.ts` | `AggregatedData`, `CryptoAggregate`, os resultados possíveis de histórico e previsão, e as regras: `canForecast`, `periodChangePercent`, `buildCryptoAggregate` |

### Application

| Arquivo | Conteúdo |
|---|---|
| `application/features/<slice>/` | 19 slices, cada uma com a entrada (`*.query.ts` ou `*.command.ts`) e o handler (`*.handler.ts`) |
| `application/ports/` | Portas como classes abstratas: `IdentityGateway`, `CatalogGateway`, `MarketDataGateway`, `ForecastGateway`, `TokenVerifier` |
| `application/errors/upstream.errors.ts` | `UpstreamError` (o serviço respondeu com erro) e `UpstreamUnavailableError` (o serviço não respondeu) |

### Infrastructure

| Arquivo | Conteúdo | Implementa |
|---|---|---|
| `infrastructure/http/upstream-http.client.ts` | Cliente HTTP sobre o `fetch` do Node: token, tempo máximo, conversão de erros | — |
| `infrastructure/http/*-http.gateway.ts` | Um adaptador por serviço | As quatro portas de gateway |
| `infrastructure/auth/jwt-token-verifier.ts` | Validação do JWT (HS256, emissor, audiência, validade) | `TokenVerifier` |
| `infrastructure/config/bff.config.ts` | Leitura e validação das variáveis de ambiente | — |
| `infrastructure/infrastructure.module.ts` | Liga cada porta ao seu adaptador (módulo global) | — |

### API

| Arquivo | Conteúdo |
|---|---|
| `api/controllers/*.controller.ts` | Seis controllers, por recurso: `AggregatedData`, `Auth`, `Cryptos`, `UserCryptos`, `Prices`, `Health` |
| `api/dto/*.dto.ts` | Classes que documentam requisições e respostas no Swagger; validam os parâmetros de consulta |
| `api/auth/jwt-auth.guard.ts`, `access-token.decorator.ts` | Exigem o JWT e entregam o token ao controller |
| `api/filters/problem.filter.ts` | Respostas de erro no formato Problem Details |
| `api/api.module.ts` | Registra os controllers e cria cada handler com as portas de que ele precisa |
| `api/configure-app.ts` | Validação, filtro de erros e Swagger; usado pela aplicação e pelos testes |

`src/main.ts` e `src/app.module.ts` são a raiz de composição.

## 4. Dependências

| Componente | Depende de |
|---|---|
| BFF | Identity, Catalog, MarketData (HTTP), Function `GetForecast` (HTTP, chave da Function), chave do JWT |
| Frontend (fase 8) | Apenas o BFF |

O BFF não tem banco e não participa da mensageria.

## 5. Segurança e erros

- O BFF valida o JWT (assinatura, emissor, audiência e validade) antes de chamar qualquer serviço e repassa o token aos microsserviços, que o validam de novo (ADR-021 e ADR-044).
- A Function é chamada com a chave `x-functions-key`; o token do usuário não é enviado a ela.
- Um erro devolvido por um serviço chega ao cliente com o mesmo status e o mesmo corpo. Assim, o frontend recebe o mesmo formato Problem Details, venha o erro do BFF ou de um serviço.
- Serviço que não responde (rede, tempo esgotado, resposta ilegível): 502 `Bff.UpstreamUnavailable`.

## 6. Testes

| Tipo | Quantidade | Conteúdo |
|---|---|---|
| Unitários e da API (Jest, Supertest) | 48 | Domínio; `GetAggregatedDataHandler` com portas simuladas; slices de repasse; cliente HTTP e gateways com `fetch` simulado; JWT; configuração; camada API com as portas substituídas por dublês |
| Arquitetura (dependency-cruiser) | 7 regras | Ver abaixo |

Regras de arquitetura (`bff/.dependency-cruiser.cjs`):

| Regra | O que proíbe |
|---|---|
| `domain-nao-depende-de-nada` | Domain importar qualquer coisa fora de `src/domain`, inclusive pacotes npm |
| `application-nao-depende-de-camadas-externas` | Application importar Infrastructure ou API |
| `application-nao-depende-de-frameworks` | Application importar NestJS ou qualquer pacote npm ou módulo do Node |
| `infrastructure-nao-depende-de-api` | Adaptadores importarem a camada API |
| `api-nao-depende-de-infrastructure` | Controllers importarem adaptadores |
| `slices-nao-referenciam-outras-slices` | Uma pasta de `application/features` importar outra |
| `sem-dependencias-circulares` | Ciclos de importação |

Com violações inseridas de propósito em Domain, Application e API, cinco regras falharam; as violações foram removidas em seguida.

## 7. Ambiente local

| Arquivo | Mudança |
|---|---|
| `bff/Dockerfile` | Build em duas etapas sobre `node:22-alpine` |
| `bff/docker-compose.yml` | Sobe só o BFF, apontando para os serviços da máquina |
| `bff/.env.example` | Variáveis para rodar com `npm run start:dev` |
| `docker-compose.yml` (raiz) | Entra o BFF em http://localhost:5100, o ponto de entrada local do frontend |
| `.env.example` (raiz) | Entra `FORECAST_FUNCTION_KEY` |

No ambiente local não há API Gateway (ADR-028): o frontend chama o BFF diretamente.

## 8. Verificação realizada

- `npm run build`: sem erros. `npm test`: 48 testes aprovados e nenhuma violação de arquitetura (80 módulos).
- No Compose do sistema completo (com a CoinGecko simulada da fase 5), tudo pelo BFF:
  - cadastro 201; e-mail repetido 409 `Identity.EmailAlreadyRegistered`; dados inválidos 400 com os erros por campo do Identity; login com senha errada 401; login correto devolve o token;
  - sem token e com token inválido: 401 nas rotas protegidas;
  - CRUD do catálogo e da lista do usuário: criação, listagem, alteração, 404 para id inexistente, 409 `Catalog.CryptoAlreadyRegistered` repassado;
  - preços: `GET /assets`, histórico com limite, criação manual, alteração, 409 `MarketData.PricePointAlreadyExists` repassado;
  - `GET /aggregated-data?horizon=5` com três criptomoedas: `bitcoin` e `ethereum` com 90 preços, variação no período e 5 pontos de previsão; uma criptomoeda com um único preço, com `forecastStatus: "insufficient-history"`;
  - horizonte 99: 400;
  - com o contêiner da Function parado: histórico presente e `forecastStatus: "unavailable"` para as criptomoedas com histórico suficiente;
  - Swagger: interface 200; documento com 20 operações em 11 caminhos e seis tags.
- Os dados de teste foram removidos pelo próprio BFF.

## 9. Limitações e pendências

- A previsão é recalculada a cada chamada de `/aggregated-data`, uma chamada à Function por criptomoeda; não há cache.
- As mensagens de validação dos parâmetros de consulta do BFF saem em inglês (padrão do `class-validator`).
- O BFF não valida o corpo das requisições repassadas; a validação é do serviço de destino, e o erro é repassado.
- Fase 8: o frontend consome o BFF. Fase 9: o API Gateway na nuvem fica na frente do BFF.
