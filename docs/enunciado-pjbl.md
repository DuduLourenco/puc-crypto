# Enunciado do PJBL — Arquitetura Completa

Transcrição do enunciado fornecido pelo professor, mantida aqui como referência dos requisitos. Em caso de dúvida, este texto prevalece sobre as decisões registradas nos ADRs.

## Objetivo

Desenvolver e demonstrar uma aplicação distribuída utilizando microservices, BFF, microfrontend e Azure Functions, aplicando padrões modernos como:

- Clean Architecture
- Vertical Slice
- Event-Driven Architecture
- API Gateway + BFF + Microservice + Database Service + Serverless
- Integração com múltiplos bancos

## Arquitetura da solução

### 1. Microfrontend

- Interface do usuário (SPA).
- Pode ser feito com React ou Angular.
- Responsável por consumir o BFF (não acessa microservices diretamente).

### 2. BFF (Backend for Frontend) — Node.js

- Implementado com Node.js preferencialmente (ex.: Express ou NestJS).
- Responsabilidades: agregação de dados; proxy de requisições (CRUD); comunicação com os microservices e com a Function (HTTP Trigger).
- Endpoint obrigatório: `GET /aggregated-data`. Consome o Microserviço 1, o Microserviço 2 e a Azure Function, e retorna tudo em um único response.

### 3. Microserviço 1 (MongoDB)

- Banco: MongoDB Atlas (Free Tier).
- Responsável por um domínio (ex.: Produtos).
- CRUD completo.
- Swagger documentado.

### 4. Microserviço 2 (Azure SQL)

- Banco: Azure SQL Database (Free 1 DTU).
- Responsável por outro domínio (ex.: Pedidos).
- CRUD completo.
- Swagger documentado.

### 5. Azure Function

- Tipo: HTTP Trigger / Message Trigger.
- Pode simular cálculo ou enriquecimento de dados.
- Exposta via endpoint HTTP.

### 6. API Gateway (opcional, mas exigido na entrega)

- Pode usar: AWS Gateway.
- Responsável por roteamento, segurança e centralização de entrada.

## Fluxo da aplicação

1. O usuário acessa o Microfrontend.
2. O front chama o BFF.
3. O BFF consulta o Microserviço Mongo, o Microserviço SQL e a Azure Function.
4. O BFF agrega tudo.
5. Retorna um único JSON.

## Dockerização

Publicar no Docker Hub, para cada serviço (microservices + BFF):

```bash
docker build -t <registry>/<repo>/<imagem>:<tag> .
docker login <registry>
docker push <registry>/<repo>/<imagem>:<tag>
```

Exemplo:

```bash
docker build -t dockerhubuser/pjbl/bff:v1 .
docker push dockerhubuser/pjbl/bff:v1
```

## Requisitos de código

- **Clean Architecture:** separação em camadas Domain, Application, Infrastructure e API.
- **Vertical Slice:** organização por feature (ex.: CreateOrder, GetOrder).
- **Testes:** testes unitários e testes de arquitetura.

## Repositórios (GitHub)

Publicar tudo em repositórios públicos no GitHub:

- Microfrontend
- BFF
- Microserviço Mongo
- Microserviço SQL
- Azure Function

## README.md (em cada projeto)

Deve conter:

- Descrição da arquitetura
- Tecnologias utilizadas
- Como rodar localmente (a apresentação em vídeo deve demonstrar URLs da internet/cloud, não localhost)
- Nome dos alunos

## Documentação (PDF da Entrega 3)

O ARC42 deve conter os links de:

- GitHub (todos os projetos)
- Docker Hub (imagens)
- Swagger: BFF e microservices
- Eventos
- Frontend
- API Gateway
- Vídeo no YouTube

Outros artefatos obrigatórios:

- C4 Model atualizado: contexto, containers e componentes
- Canvas
- Prints: Swagger do BFF, Swagger dos microservices, frontend funcionando, API Gateway

## Correspondência com o PucCrypto

| Enunciado | PucCrypto |
|---|---|
| Microfrontend | Shell e remotes em React (`frontend/`) |
| BFF Node.js | BFF em NestJS (`bff/`) |
| Microserviço 1 (MongoDB) | MarketData (`marketdata/`) |
| Microserviço 2 (Azure SQL) | Catalog (`catalog/`) |
| Azure Function | `GetForecast` (`forecast-function/`) |
| API Gateway | Gateway gerenciado na nuvem, na frente do BFF |
| — (acréscimo do grupo) | Identity, com PostgreSQL (`identity/`) |
