# Evidências de publicação — Docker Hub e Azure Container Apps

**Grupo:** Eduardo Lourenço da Silva, Gabriel Pereira Lugon Moulin, João Pedro Novak Rausis e Vitor Vieira Machado.

O PucCrypto está publicado no Azure Container Apps, com as imagens públicas no Docker Hub. O site, o BFF e os microsserviços rodam em Container Apps, cada um a partir da sua imagem do Docker Hub. A previsão roda em uma Azure Function, e o API Gateway é um Azure API Management.

## URL do site na Azure

https://puccrypto-frontend.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io

Conta de demonstração, já com Bitcoin, Ethereum e Solana na lista: `demo@puccrypto.dev`, senha `PucCrypto-demo-996f85`.

## URLs das imagens públicas no Docker Hub

| Serviço | Imagem | Página |
|---|---|---|
| Frontend (shell e microfrontends) | `lourencodu/puccrypto-frontend:v1` | https://hub.docker.com/r/lourencodu/puccrypto-frontend |
| BFF | `lourencodu/puccrypto-bff:v1` | https://hub.docker.com/r/lourencodu/puccrypto-bff |
| Catalog (Azure SQL) | `lourencodu/puccrypto-catalog:v1` | https://hub.docker.com/r/lourencodu/puccrypto-catalog |
| MarketData (MongoDB) | `lourencodu/puccrypto-marketdata:v1` | https://hub.docker.com/r/lourencodu/puccrypto-marketdata |
| Identity | `lourencodu/puccrypto-identity:v1` | https://hub.docker.com/r/lourencodu/puccrypto-identity |

Perfil com todas as imagens: https://hub.docker.com/u/lourencodu

Todas as imagens têm as tags `v1` e `latest`, para `linux/amd64` e `linux/arm64`. O Docker Hub não aceita o formato com dois níveis do exemplo do enunciado (`usuario/pjbl/bff`); por isso os nomes usam hífen.

## Demais URLs na nuvem

| Componente | URL |
|---|---|
| API Gateway (Azure API Management) | https://apim-puccrypto-f43a29.azure-api.net/api |
| BFF — Swagger | https://puccrypto-bff.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io/swagger |
| Catalog — Swagger | https://puccrypto-catalog.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io/swagger |
| MarketData — Swagger | https://puccrypto-marketdata.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io/swagger |
| Identity — Swagger | https://puccrypto-identity.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io/swagger |
| Azure Function (saúde) | https://func-puccrypto-f43a29.azurewebsites.net/api/health |
| Código-fonte | https://github.com/DuduLourenco/puc-crypto |

## Prints

### Docker Hub (incluídos nesta pasta)

| Arquivo | O que mostra |
|---|---|
| [dockerhub-0-perfil.png](dockerhub-0-perfil.png) | Perfil `lourencodu` com os cinco repositórios `puccrypto-*` |
| [dockerhub-1-identity.png](dockerhub-1-identity.png) a [dockerhub-5-frontend.png](dockerhub-5-frontend.png) | Página de tags de cada imagem: `v1` e `latest`, `linux/amd64` e `linux/arm64`, e o comando `docker pull` |

### Site na Azure (incluídos nesta pasta)

| Arquivo | O que mostra |
|---|---|
| [site-1-acesso.png](site-1-acesso.png) | Tela de acesso na URL da Azure |
| [site-2-criptomoedas.png](site-2-criptomoedas.png) | Lista do usuário e catálogo, com os preços coletados da CoinGecko |
| [site-3-dashboard.png](site-3-dashboard.png) | Dashboard com histórico de 90 dias, previsão por ML.NET e intervalo de 95% |
| [site-4-dashboard-tooltip.png](site-4-dashboard-tooltip.png) | Tooltip do gráfico |
| [site-5-dashboard-sol-30-dias.png](site-5-dashboard-sol-30-dias.png) | Solana com previsão de 30 dias |
| [swagger-1-bff.png](swagger-1-bff.png) a [swagger-4-identity.png](swagger-4-identity.png) | Swagger do BFF e dos microsserviços, na nuvem |

### Portal Azure (a tirar com o login do grupo)

O portal exige login, então estes prints precisam ser tirados por alguém do grupo:

1. **Grupo de recursos.** Em https://portal.azure.com, abra **Grupos de recursos → `rg-puccrypto`**. A lista mostra os cinco Container Apps (`puccrypto-frontend`, `puccrypto-bff`, `puccrypto-catalog`, `puccrypto-marketdata`, `puccrypto-identity`), o ambiente `cae-puccrypto`, a Function `func-puccrypto-f43a29`, o API Management `apim-puccrypto-f43a29` e os bancos.
2. **Container App do site.** Clique em **`puccrypto-frontend`**. Na **Visão geral**, aparecem o status **Em execução** e a **URL do aplicativo**, a mesma informada acima.
3. **Imagem do Docker Hub.** No mesmo app, abra **Aplicativo → Contêineres**. O campo de imagem mostra `docker.io/lourencodu/puccrypto-frontend@sha256:…`, a imagem pública do Docker Hub.
4. **Opcional, API Gateway.** Abra **`apim-puccrypto-f43a29` → APIs → PucCrypto BFF**. Aparecem a URL `https://apim-puccrypto-f43a29.azure-api.net/api` e o encaminhamento para o BFF.

## Texto curto para a entrega

> O PucCrypto foi publicado no Azure Container Apps a partir de imagens públicas no Docker Hub.
> Site: https://puccrypto-frontend.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io
> Imagens: https://hub.docker.com/u/lourencodu (por exemplo, https://hub.docker.com/r/lourencodu/puccrypto-frontend).
> Os prints mostram o portal do Azure com os Container Apps em execução e a imagem do Docker Hub usada por cada um, e as páginas públicas das imagens no Docker Hub.
