# PucCrypto

Projeto da disciplina de Arquitetura de Software. Site com cadastro e login, CRUD de criptomoedas monitoradas por usuário e dashboard com preço histórico e previsão por machine learning.

## Estilos arquiteturais

Microfrontend, API Gateway, BFF, Microservices com Database per Service, arquitetura orientada a eventos, Serverless e Clean Architecture com Vertical Slice, verificados por testes de arquitetura.

## Stack

- Backend: .NET 8, YARP, Azure Functions, ML.NET
- Frontend: React, Vite, Module Federation
- Dados e mensageria: PostgreSQL, RabbitMQ (local), Azure Service Bus (nuvem)
- Ambiente local: Docker Compose

## Como executar

Requisitos: Docker e SDK do .NET 8.

```bash
cp .env.example .env
docker compose up -d --build
curl http://localhost:8080/health
```

O Gateway responde em http://localhost:8080 e é o único ponto de entrada. Para compilar fora do Docker: `dotnet build PucCrypto.sln`.

## Documentação

- [Fase 1 — estrutura do repositório e plano de fases](docs/fases/fase-01.md)
- [Fase 2 — scaffold da solução](docs/fases/fase-02.md)
- [Decisões de arquitetura (ADRs)](docs/ADRs.md)

## Estado

Fase 2 concluída: solução com os projetos vazios, ambiente local em Docker Compose, um banco por serviço e Gateway com as rotas iniciais. As APIs respondem apenas `/health`.
