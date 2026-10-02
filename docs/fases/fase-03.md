# Fase 3 — Serviço Identity

Esta fase entrega o serviço Identity completo, com cadastro e login por JWT. Ele é o modelo de referência de Clean Architecture + Vertical Slice que os demais serviços seguem. A fase também traz os primeiros testes de arquitetura e a validação do token no Gateway.

## 1. Endpoints

| Rota no Gateway | Rota no Identity | Slice | Sucesso | Falhas |
|---|---|---|---|---|
| `POST /api/auth/register` | `POST /auth/register` | `RegisterUser` | 201 com `id`, `name`, `email` | 400 (validação), 409 (e-mail já cadastrado) |
| `POST /api/auth/login` | `POST /auth/login` | `LoginUser` | 200 com `accessToken`, `expiresAt` | 400 (validação), 401 (credenciais inválidas) |

As falhas seguem o formato Problem Details (RFC 9457). O campo `title` traz o código do erro, por exemplo `Identity.EmailAlreadyRegistered`.

As rotas `/api/auth/*` são públicas. As demais rotas `/api/*` exigem um JWT válido no cabeçalho `Authorization: Bearer`; sem ele, o Gateway responde 401 e não encaminha a requisição.

## 2. Componentes criados

### Domain — `PucCrypto.Identity.Domain`

| Classe | Responsabilidade | Depende de |
|---|---|---|
| `Users/User` | Entidade do usuário. Cria usuários e normaliza o e-mail | Nada |

### Application — `PucCrypto.Identity.Application`

| Classe | Responsabilidade | Depende de |
|---|---|---|
| `Features/RegisterUser/RegisterUserEndpoint` | Mapeia `POST /auth/register` e converte o resultado em resposta HTTP | `RegisterUserHandler` (pela interface), `RegisterUserValidator` (pelo filtro) |
| `Features/RegisterUser/RegisterUserCommand` | Dados de entrada: nome, e-mail e senha | — |
| `Features/RegisterUser/RegisterUserValidator` | Valida formato e tamanho dos campos | `User` (limites de tamanho) |
| `Features/RegisterUser/RegisterUserHandler` | Recusa e-mail duplicado, gera o hash da senha e grava o usuário | `IUserRepository`, `IPasswordHasher`, `TimeProvider`, `User` |
| `Features/RegisterUser/RegisterUserResponse` | Dados de saída: id, nome e e-mail | — |
| `Features/LoginUser/LoginUserEndpoint` | Mapeia `POST /auth/login` | `LoginUserHandler` (pela interface), `LoginUserValidator` (pelo filtro) |
| `Features/LoginUser/LoginUserCommand` | Dados de entrada: e-mail e senha | — |
| `Features/LoginUser/LoginUserValidator` | Exige e-mail e senha preenchidos | — |
| `Features/LoginUser/LoginUserHandler` | Confere as credenciais e pede a emissão do token | `IUserRepository`, `IPasswordHasher`, `IJwtTokenGenerator` |
| `Features/LoginUser/LoginUserResponse` | Dados de saída: token e validade | — |
| `Abstractions/IUserRepository` | Porta de persistência de usuários | `User` |
| `Abstractions/IPasswordHasher` | Porta de hash e verificação de senha | — |
| `Abstractions/IJwtTokenGenerator`, `AccessToken` | Porta de emissão do token | `User` |
| `DependencyInjection` | Registra endpoints, handlers e validadores do assembly | BuildingBlocks |

### Infrastructure — `PucCrypto.Identity.Infrastructure`

| Classe | Responsabilidade | Implementa |
|---|---|---|
| `Persistence/IdentityDbContext` | Contexto do EF Core para o `identity_db` | — |
| `Persistence/Configurations/UserConfiguration` | Mapeia `User` para a tabela `users` | — |
| `Persistence/Repositories/UserRepository` | Consulta e grava usuários | `IUserRepository` |
| `Persistence/Migrations/*` | Migration `InitialCreate` | — |
| `Persistence/MigrationExtensions` | Aplica as migrations pendentes na inicialização | — |
| `Security/BCryptPasswordHasher` | Hash de senha com BCrypt | `IPasswordHasher` |
| `Security/JwtTokenGenerator`, `JwtOptions` | Emite o JWT assinado com HS256 | `IJwtTokenGenerator` |
| `DependencyInjection` | Registra banco, repositório e segurança; valida a configuração do JWT | — |

### Api — `PucCrypto.Identity.Api`

`Program.cs` é a raiz de composição: registra Application e Infrastructure, aplica as migrations e mapeia os endpoints. Não contém regra de negócio.

### BuildingBlocks — `PucCrypto.BuildingBlocks.Abstractions`

| Tipo | Responsabilidade |
|---|---|
| `Handlers/ICommandHandler`, `IQueryHandler` | Contratos dos casos de uso |
| `Handlers/HandlerExtensions` | Registra os handlers de um assembly |
| `Results/Result`, `Error`, `ErrorType` | Resultado de um caso de uso, sem exceções para falhas esperadas |
| `Endpoints/IEndpoint` | Contrato do endpoint de uma slice |
| `Endpoints/EndpointExtensions` | Registra e mapeia os endpoints; `WithValidation` liga o validador à rota |
| `Endpoints/ValidationFilter` | Executa o validador antes do handler |
| `Endpoints/ResultExtensions` | Converte um `Error` em Problem Details com o status HTTP correspondente |

### Gateway — `PucCrypto.Gateway`

Passou a validar o JWT (emissor, audiência, assinatura e validade). A rota do BFF usa a política de autorização padrão; a rota do Identity continua pública.

## 3. Fluxo de cada caso de uso

**Cadastro (`RegisterUser`)**

1. O cliente envia `POST /api/auth/register` ao Gateway, que encaminha ao Identity como `POST /auth/register`.
2. `ValidationFilter` executa `RegisterUserValidator`. Se houver erro, responde 400.
3. `RegisterUserEndpoint` chama `RegisterUserHandler`.
4. O handler normaliza o e-mail e consulta `IUserRepository.ExistsByEmailAsync`. Se já existe, devolve `Identity.EmailAlreadyRegistered` (409).
5. O handler gera o hash com `IPasswordHasher`, cria o `User` e chama `IUserRepository.AddAsync`.
6. O endpoint responde 201 com `RegisterUserResponse`.

**Login (`LoginUser`)**

1. O cliente envia `POST /api/auth/login` ao Gateway, que encaminha ao Identity como `POST /auth/login`.
2. `ValidationFilter` executa `LoginUserValidator`.
3. `LoginUserHandler` busca o usuário com `IUserRepository.GetByEmailAsync` e confere a senha com `IPasswordHasher.Verify`.
4. Se o usuário não existe ou a senha não confere, devolve `Identity.InvalidCredentials` (401). A resposta é a mesma nos dois casos.
5. O handler chama `IJwtTokenGenerator.Generate` e o endpoint responde 200 com `LoginUserResponse`.

## 4. Modelo de dados — `identity_db`

Tabela `users`:

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | `uuid` | Chave primária, gerada pela aplicação |
| `name` | `varchar(100)` | |
| `email` | `varchar(254)` | Índice único; gravado em minúsculas |
| `password_hash` | `text` | Hash BCrypt |
| `created_at` | `timestamptz` | |

## 5. Token JWT

| Claim | Conteúdo |
|---|---|
| `sub` | Id do usuário |
| `email`, `name` | Dados do usuário |
| `iss`, `aud` | `puccrypto-identity` e `puccrypto` |
| `iat`, `nbf`, `exp` | Emissão e validade (60 minutos) |
| `jti` | Identificador único do token |

O token é assinado com HS256. A chave vem de `Jwt:SigningKey` (variável `JWT_SIGNING_KEY` no `.env`) e é compartilhada entre o Identity, que assina, e o Gateway, que valida (ADR-017).

## 6. Eventos

O Identity não publica nem consome eventos.

## 7. Testes de arquitetura

`tests/PucCrypto.ArchitectureTests` tem 15 testes. As regras por serviço ficam em `ServiceArchitectureTests`; `IdentityArchitectureTests` as aplica ao Identity. Os próximos serviços ganham uma classe derivada de uma linha.

| Regra exigida | Teste |
|---|---|
| Domain não depende de nada | `Domain_NaoDependeDeOutrasCamadasNemDeFrameworks`, `Domain_ReferenciaApenasABibliotecaBaseDoDotNet` |
| Application não depende de Infrastructure | `Application_NaoDependeDeInfrastructureNemDeApi`, `Application_NaoDependeDeTecnologiasDeInfraestrutura` |
| Dependências apontam para dentro | `Infrastructure_NaoDependeDeApi` |
| Slices não referenciam outras slices | `Slices_NaoReferenciamOutrasSlices` |
| Nomes consistentes | `Slices_SeguemAConvencaoDeNomes` |
| Serviços não referenciam outros serviços | `ServiceIsolationTests` (dois testes para cada um dos quatro serviços) |

## 8. Como executar

```bash
docker compose up -d --build

curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ana Souza","email":"ana@example.com","password":"senha-segura-1"}'

curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana@example.com","password":"senha-segura-1"}'

dotnet test PucCrypto.sln
```

Para rodar o Identity fora do Docker, com o PostgreSQL do Compose no ar: `dotnet run --project src/Services/Identity/PucCrypto.Identity.Api`. Para criar uma migration: `dotnet tool restore` e depois `dotnet ef migrations add <Nome> --project src/Services/Identity/PucCrypto.Identity.Infrastructure --startup-project src/Services/Identity/PucCrypto.Identity.Api --output-dir Persistence/Migrations`.

## 9. Verificação realizada

- `dotnet build PucCrypto.sln`: 0 avisos, 0 erros.
- `dotnet test`: 15 testes aprovados. Com violações inseridas de propósito (uma slice referenciando outra e um endpoint fora de `Features`), os testes correspondentes falharam; as violações foram removidas em seguida.
- Pelo Gateway, no Docker Compose:
  - cadastro: 201;
  - cadastro com o mesmo e-mail em maiúsculas: 409;
  - cadastro com campos inválidos: 400 com os erros por campo;
  - login com senha errada e com e-mail inexistente: 401, mesma resposta;
  - login correto: 200 com o token e as claims esperadas;
  - rota protegida sem token: 401; com token: encaminhada ao BFF (404, pois o BFF ainda não tem endpoints); com token adulterado: 401.
- Banco: a migration `InitialCreate` foi aplicada na inicialização e o usuário foi gravado com hash BCrypt.
- `dotnet run` fora do Docker: o serviço sobe e responde com a configuração de desenvolvimento.

## 10. Limitações e pendências

- As mensagens de validação do FluentValidation saem em inglês; as mensagens de erro dos handlers estão em português.
- Dois cadastros simultâneos com o mesmo e-mail: o índice único impede a duplicidade, mas o segundo recebe 500 em vez de 409.
- Não há renovação de token (refresh token) nem logout; estão fora do escopo.
- Fase 4: definir como BFF e Catalog obtêm a identidade do usuário a partir do token encaminhado pelo Gateway.
