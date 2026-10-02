# PucCrypto

Projeto da disciplina de Arquitetura de Software. Site com cadastro e login, CRUD de criptomoedas monitoradas por usuário e dashboard com preço histórico e previsão por machine learning.

## Estilos arquiteturais

Microfrontend, API Gateway, BFF, Microservices com Database per Service, arquitetura orientada a eventos, Serverless e Clean Architecture com Vertical Slice, verificados por testes de arquitetura.

## Stack

- Backend: .NET 8, YARP, Azure Functions, ML.NET
- Frontend: React, Vite, Module Federation
- Dados e mensageria: PostgreSQL, RabbitMQ (local), Azure Service Bus (nuvem)
- Ambiente local: Docker Compose

## Documentação

- [Estrutura do repositório e plano de fases](docs/fases/fase-01.md)
- [Decisões de arquitetura (ADRs)](docs/ADRs.md)

## Estado

Fase 1 concluída: estrutura de pastas, plano e decisões iniciais. Ainda não há código executável.
