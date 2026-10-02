# PucCrypto — Identity

Microsserviço de identidade do PucCrypto: cadastro de usuários e login com emissão de JWT. Os demais componentes do sistema validam esse token para identificar o usuário.

## Arquitetura

O PucCrypto é uma aplicação distribuída: um microfrontend consome um BFF, exposto por um API Gateway; o BFF agrega os microsserviços Catalog (Azure SQL) e MarketData (MongoDB) e uma Azure Function de previsão. O Identity atende o login, por meio do BFF.

Este serviço segue Clean Architecture, com um projeto por camada e dependências apontando para dentro:

| Camada | Projeto | Conteúdo |
|---|---|---|
| Domain | `src/PucCrypto.Identity.Domain` | Entidade `User`. Não depende de nada |
| Application | `src/PucCrypto.Identity.Application` | Casos de uso em `Features/` e portas em `Abstractions/` |
| Infrastructure | `src/PucCrypto.Identity.Infrastructure` | EF Core com PostgreSQL, BCrypt, emissão do JWT |
| API | `src/PucCrypto.Identity.Api` | Raiz de composição, Swagger |

Os casos de uso são organizados em Vertical Slices. Cada pasta de `Application/Features` reúne o endpoint, o command, o validador e o handler de um caso de uso:

| Slice | Rota | Descrição |
|---|---|---|
| `RegisterUser` | `POST /auth/register` | Cadastra um usuário |
| `LoginUser` | `POST /auth/login` | Autentica e devolve o JWT |

`src/BuildingBlocks` contém o código de apoio comum aos serviços .NET do PucCrypto (contratos de handler, `Result`, endpoints e validação), copiado para este repositório.

## Tecnologias

- .NET 8, ASP.NET Core (Minimal APIs)
- Entity Framework Core com PostgreSQL
- FluentValidation, BCrypt.Net, JWT (HS256)
- Swagger (Swashbuckle)
- xUnit e NetArchTest
- Docker

## Como rodar localmente

Requisitos: Docker. Para compilar e testar fora do Docker, SDK do .NET 8.

```bash
docker compose up -d --build
```

- API: http://localhost:5101
- Swagger: http://localhost:5101/swagger

Exemplo:

```bash
curl -X POST http://localhost:5101/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ana Souza","email":"ana@example.com","password":"senha-segura-1"}'

curl -X POST http://localhost:5101/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana@example.com","password":"senha-segura-1"}'
```

Para rodar a API fora do Docker, com o PostgreSQL do Compose no ar:

```bash
docker compose up -d postgres
dotnet run --project src/PucCrypto.Identity.Api
```

### Configuração

| Chave | Descrição |
|---|---|
| `ConnectionStrings__Database` | Connection string do PostgreSQL |
| `Jwt__SigningKey` | Chave de assinatura do JWT, com pelo menos 32 bytes |
| `Jwt__Issuer`, `Jwt__Audience`, `Jwt__ExpirationMinutes` | Emissor, audiência e validade do token |

As migrations do banco são aplicadas quando a API inicia.

## Testes

```bash
dotnet test
```

- `tests/PucCrypto.Identity.UnitTests`: entidade, handlers, validadores, hash de senha e emissão do token.
- `tests/PucCrypto.Identity.ArchitectureTests`: Domain não depende de nada; Application não depende de Infrastructure; slices não referenciam outras slices e seguem a convenção de nomes.

## Imagem Docker

```bash
docker build -t <usuario>/puccrypto/identity:v1 .
```

## URLs na nuvem

| Recurso | URL |
|---|---|
| API | _a preencher após o deploy_ |
| Swagger | _a preencher após o deploy_ |
| Imagem no Docker Hub | _a preencher após a publicação_ |

## Alunos

- _Nome do aluno 1_
- _Nome do aluno 2_
- _Nome do aluno 3_
