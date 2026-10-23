# Fase 9 — Publicação na nuvem

Esta fase publica o PucCrypto: imagens públicas no Docker Hub, todos os componentes no Azure, o API Gateway na frente do BFF, o contrato dos eventos em `asyncapi.yaml` e as URLs nos READMEs. Com autorização do professor, o projeto fica em um único repositório (ADR-049), integrado à `main` ao fim da fase.

Antes desta fase, os testes de arquitetura do backend passaram a usar ArchUnitNET e ArchUnitTS (ADR-048, commit `65d2c98`).

## 1. URLs

| Componente | URL |
|---|---|
| Site (frontend) | https://puccrypto-frontend.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io |
| API Gateway | https://apim-puccrypto-f43a29.azure-api.net/api |
| BFF — Swagger | https://puccrypto-bff.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io/swagger |
| Catalog — Swagger | https://puccrypto-catalog.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io/swagger |
| MarketData — Swagger | https://puccrypto-marketdata.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io/swagger |
| Identity — Swagger | https://puccrypto-identity.delightfulcoast-0aa4a01d.canadacentral.azurecontainerapps.io/swagger |
| Azure Function | https://func-puccrypto-f43a29.azurewebsites.net/api/health |
| Docker Hub | https://hub.docker.com/u/lourencodu |

Conta de demonstração: `demo@puccrypto.dev`, senha `PucCrypto-demo-996f85`, com Bitcoin, Ethereum e Solana na lista. Os prints da publicação estão em [docs/entrega-deploy](../entrega-deploy/README.md).

## 2. Topologia na nuvem

| Componente | Serviço | Onde | Escala |
|---|---|---|---|
| Frontend (shell e microfrontends, nginx) | Azure Container Apps | canadacentral | 0 a 2 réplicas |
| BFF | Azure Container Apps | canadacentral | 0 a 2 |
| Identity | Azure Container Apps + Azure Database for PostgreSQL B1ms | canadacentral | 0 a 2 |
| Catalog | Azure Container Apps + Azure SQL Database (oferta gratuita, serverless) | canadacentral | 1 a 2 (consome eventos) |
| MarketData | Azure Container Apps + MongoDB Atlas (M0) | canadacentral + Atlas | 1 a 2 (consome eventos) |
| Function `GetForecast` e coleta agendada | Azure Functions, plano Flex Consumption | canadacentral | Escala a zero |
| API Gateway | Azure API Management, plano Consumption | eastus2 | Gerenciado |
| Broker | RabbitMQ no CloudAMQP (plano gratuito) | Fora do Azure | Gerenciado |

Todos os recursos do Azure estão no grupo `rg-puccrypto`. Cada Container App usa 0,25 vCPU e 0,5 GiB.

Fluxo na nuvem: navegador → API Gateway (`/api/*`) → BFF → Identity, Catalog, MarketData e a Function. O CORS do BFF aceita apenas a origem do frontend. O BFF chama a Function com a chave da Function.

## 3. Componentes e arquivos criados

| Arquivo | Responsabilidade |
|---|---|
| `infra/azure/deploy.sh` | Provisiona os recursos, publica as imagens, implanta os Container Apps, publica o código da Function e configura o API Management. Pode ser executado de novo |
| `infra/publish-images.sh` | Gera as imagens para amd64 e arm64 e publica no Docker Hub, com até três tentativas por imagem |
| `infra/lib.sh` | Leitura dos arquivos de configuração e mensagens do script |
| `infra/README.md` | Como executar o deploy e os custos |
| `.env.cloud.example` | Modelo da configuração da nuvem; o `.env.cloud`, com as URLs do Atlas e do CloudAMQP, não é versionado |
| `.env.cloud.secrets` (não versionado) | Senhas e chaves geradas pelo script, reaproveitadas a cada execução |
| `asyncapi.yaml` | Contrato dos três eventos (AsyncAPI 3.0), validado com o parser oficial |
| Dockerfiles dos serviços, do BFF e do frontend | Compilação na arquitetura da máquina; imagem final para amd64 e arm64 |

Imagens no Docker Hub (tags `v1` e `latest`): `lourencodu/puccrypto-identity`, `-catalog`, `-marketdata`, `-bff` e `-frontend`. A Function é publicada como código.

## 4. Eventos

Os eventos não mudaram: `CryptoRegistered` e `CryptoRemoved` (Catalog → MarketData) e `PricesIngested` (MarketData → Catalog), pela exchange `puccrypto.events`. Na nuvem, o broker é o CloudAMQP, acessado com TLS (`amqps://`) pelo mesmo adaptador do ambiente local. O contrato está em [asyncapi.yaml](../../asyncapi.yaml).

## 5. Problemas encontrados e como foram resolvidos

| Problema | Solução |
|---|---|
| O Docker Hub recusou o formato do enunciado, `lourencodu/puccrypto/identity` ("push access denied … insufficient_scope") | Nome com hífen, `lourencodu/puccrypto-identity` (ADR-050) |
| Na assinatura Azure for Students, eastus2 e eastus não aceitam novos servidores de Azure SQL nem de PostgreSQL | Serviços e bancos em canadacentral, região permitida que aceita os dois e tem Container Apps e Flex Consumption (ADR-051) |
| A tentativa de criar o SQL em eastus deixou o nome do servidor reservado naquela região | A região passou a fazer parte do nome dos servidores de banco |
| O ambiente do Container Apps foi criado na modalidade "express", que não aceita sufixo de revisão | Variável `DEPLOYED_AT` com a data do deploy, que também cria uma revisão nova |
| Mesmo com a imagem nova no Docker Hub, o Container App continuou servindo a versão anterior da tag `v1` | O deploy fixa a imagem pelo digest (`@sha256:…`) |
| O MarketData reiniciava em loop: o Atlas recusava a conexão TLS (`tlsv1 alert internal error`) | Liberação de `0.0.0.0/0` no Network Access do Atlas |
| Comandos da CLI do Azure 2.90 com nomes de parâmetro diferentes (banco e firewall do PostgreSQL) | Script ajustado aos nomes atuais |
| Tempo esgotado ao baixar a imagem base do registro da Microsoft durante o build | Até três tentativas por imagem |

## 6. Verificação realizada

- Docker Hub: as cinco imagens publicadas, públicas, com `v1` e `latest` para amd64 e arm64.
- Saúde: frontend, BFF, Identity, Catalog e MarketData respondem 200; a Function responde 200 em `/api/health`.
- Function: `POST /api/forecast` sem chave responde 401; com a chave, devolve a previsão de uma série de teste.
- API Gateway: `GET /api/health` chega ao BFF; rota protegida sem token responde 401; login e listagem do catálogo pelo Gateway funcionam; o preflight de CORS devolve a origem do frontend.
- Fluxo completo no navegador (Chrome sem interface, controlado por script), na URL pública do frontend:
  - criação da conta de demonstração e login;
  - cadastro de Bitcoin, Ethereum e Solana e inclusão na lista;
  - preços reais recebidos da CoinGecko pelos eventos (Catalog → MarketData → Catalog), para as três moedas;
  - dashboard com 90 dias de histórico, previsão por ML.NET e intervalo de 95%, sem erros no console.
- Coleta agendada: o último preço foi atualizado pela Function de coleta, sem ação do usuário.
- Na nuvem, a CoinGecko real foi alcançada; a chamada que estava bloqueada pelo DNS da rede de desenvolvimento (fase 5) foi validada aqui.
- Os usuários de teste foram removidos do banco da nuvem; ficou apenas a conta de demonstração.

## 7. Custos e encerramento

O maior custo fixo é o PostgreSQL B1ms. Catalog e MarketData mantêm uma réplica ativa; os demais apps e a Function escalam a zero; Azure SQL, API Management (Consumption), Atlas M0 e CloudAMQP estão em planos gratuitos. Tudo é cobrado do crédito da assinatura de estudante. Para apagar os recursos depois da avaliação: `az group delete -n rg-puccrypto`.

## 8. Limitações e pendências

- A senha da conta de demonstração está na documentação, de propósito, para a apresentação.
- A primeira chamada depois de um período sem uso é mais lenta: os apps que escalam a zero, a Function e o Azure SQL serverless precisam iniciar.
- Os prints do Portal Azure exigem o login do grupo; o passo a passo está em [docs/entrega-deploy](../entrega-deploy/README.md).
- A chave de assinatura do JWT é compartilhada entre Identity, BFF e microsserviços (ADR-017).
- Fase 10: checklist de insumos para a documentação (URLs, prints e vídeo).
