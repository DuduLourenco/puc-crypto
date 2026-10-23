# Deploy na nuvem

Imagens no Docker Hub e sistema completo no Azure, com dois scripts:

| Script | O que faz |
|---|---|
| [publish-images.sh](publish-images.sh) | Gera as imagens (amd64 e arm64) e publica em `docker.io/<usuário>/puccrypto-<serviço>` (identity, catalog, marketdata, bff, frontend) |
| [azure/deploy.sh](azure/deploy.sh) | Provisiona os recursos no Azure, publica as imagens, implanta os contêineres e publica o código da Function |

## Arquitetura na nuvem

| Componente | Serviço |
|---|---|
| Frontend (shell e microfrontends) | Azure Container Apps (nginx) |
| API Gateway | Azure API Management (Consumption), prefixo `/api`, encaminha tudo ao BFF |
| BFF | Azure Container Apps |
| Identity | Azure Container Apps + Azure Database for PostgreSQL (B1ms) |
| Catalog | Azure Container Apps + Azure SQL Database (oferta gratuita) |
| MarketData | Azure Container Apps + MongoDB Atlas (M0) |
| Forecast (Azure Functions) | Function App no plano Flex Consumption (serverless) + Storage Account |
| Eventos | RabbitMQ gerenciado no CloudAMQP (plano gratuito) |

## Pré-requisitos

1. `docker login -u <usuário do Docker Hub>`
2. `az login`
3. Conta no MongoDB Atlas (cluster M0, usuário do banco, acesso liberado para `0.0.0.0/0`).
4. Instância gratuita no CloudAMQP (copiar a URL `amqps://`).
5. `cp .env.cloud.example .env.cloud` e preencher.

## Executar

```bash
infra/azure/deploy.sh                  # primeira vez: tudo
SKIP_IMAGES=1 infra/azure/deploy.sh    # reimplantar sem gerar as imagens
infra/publish-images.sh bff            # publicar só uma imagem
```

O script pode ser executado de novo: reaproveita os recursos e os segredos gerados (`.env.cloud.secrets`, fora do Git) e cria uma nova revisão de cada app. Sem `MONGODB_URI` e `RABBITMQ_URI`, ele provisiona a infraestrutura e o Identity e para antes do Catalog. No fim, mostra as URLs.

O SDK do .NET 8 é necessário para publicar o código da Function.

## Custos

Catalog e MarketData ficam com uma réplica sempre ativa (0,25 vCPU e 0,5 GiB), para consumir os eventos do RabbitMQ; os demais apps e a Function escalam para zero. O PostgreSQL B1ms é o maior custo fixo. Para apagar tudo depois da avaliação:

```bash
az group delete -n <grupo de recursos>
```
