# Análise de impacto — enunciado final do PJBL

Data: 02/10/2026. Situação do repositório na data: fases 1 a 4 concluídas no branch `v2-microservices` (último commit `eb0e79f`).

Este documento compara o que já foi construído com a arquitetura exigida pelo enunciado final e lista o que permanece, o que muda e o que precisa de decisão. Nenhum código foi alterado.

## 1. Resumo

A regra de negócio escrita até aqui é aproveitada quase toda. O Identity fica como está. O Catalog mantém Domain e Application e troca apenas a Infrastructure de banco, o que é o ganho esperado da Clean Architecture. As maiores mudanças são estruturais:

- o repositório único vira seis repositórios públicos;
- o BFF passa de .NET para NestJS;
- o Prediction deixa de ser um microsserviço com banco e vira uma Azure Function HTTP;
- o Catalog vai para Azure SQL e o MarketData para MongoDB Atlas;
- todos os projetos passam a exigir testes unitários e Swagger.

O que é descartado é pouco: o Gateway em YARP (21 linhas), o BFF .NET vazio, a API vazia do Prediction e a configuração de PostgreSQL dos três serviços que mudam de banco.

## 2. O que permanece sem alteração

| Item | Situação |
|---|---|
| Identity: `User`, slices `RegisterUser` e `LoginUser`, PostgreSQL, BCrypt, JWT | Mantido por inteiro |
| Padrão de slice (`Endpoint`, `Command`/`Query`, `Validator`, `Handler`) e camadas | Mantido; passa a valer também para o BFF e a Function |
| BuildingBlocks: `Result`, handlers, `IEndpoint`, filtro de validação, `IEventBus`, adaptador RabbitMQ, validação do JWT | Código mantido; muda a forma de compartilhar (seção 4.2) |
| Catalog: entidades, as cinco slices atuais, validações, evento `CryptoRegistered` | Mantido, com acréscimos (seção 3) |
| Regras dos testes de arquitetura | Mantidas; passam a existir em cada repositório |
| RabbitMQ no ambiente local, com mensagens em JSON simples | Mantido |
| Linguagem do ML: .NET com ML.NET | Mantida, como pede o enunciado |
| Prática de ADRs e de inventário por fase em `docs/` | Mantida |

## 3. Impacto por componente

| Componente | Hoje | Enunciado final | O que muda | Esforço |
|---|---|---|---|---|
| Identity | Completo, sem Swagger nem testes unitários | Mantido, em repositório próprio | Acrescentar Swagger, testes unitários, Dockerfile e README próprios | Pequeno |
| Catalog | Completo em PostgreSQL; CRUD da lista do usuário; publica `CryptoRegistered` | Azure SQL; CRUD de criptomoedas e lista do usuário; publica `CryptoRegistered` e `CryptoRemoved`; Swagger | Trocar o provider do EF Core e regerar a migration; criar o CRUD explícito de criptomoedas; novo evento; Swagger; testes unitários | Médio |
| MarketData | Projetos vazios, planejado em PostgreSQL | MongoDB Atlas; CRUD completo; coleta na CoinGecko; consome eventos do Catalog; publica `PricesIngested`; Swagger | Nada a refazer. O plano muda de EF Core para o driver do MongoDB e ganha o CRUD e o consumo de eventos | Grande (trabalho novo) |
| Prediction | Quatro projetos vazios, mais um projeto de Functions vazio; planejado com banco e gatilho por mensagem | Azure Function `GetForecast`, HTTP, que recebe a série e devolve a previsão; sem banco | Remover a API e o banco; a Function passa a ser a camada de API; saem as entidades `Forecast` e `ModelRun` e o evento `ForecastGenerated` | Médio (trabalho novo, menor que o planejado) |
| BFF | Projeto .NET vazio | NestJS + TypeScript; `GET /aggregated-data`; proxy dos CRUDs e do login; Swagger; Clean Architecture, Vertical Slice, testes unitários e de arquitetura | Descartar o projeto .NET e escrever o BFF em Node | Grande (trabalho novo) |
| Gateway | YARP, com rotas para Identity e BFF e validação do JWT | Gateway na nuvem, na frente do BFF | O Gateway deixa de rotear para o Identity; o login passa pelo BFF. A tecnologia depende da decisão D2 | Pequeno a médio |
| Frontend | Não iniciado | Shell e remotes, consumindo só o BFF pelo Gateway | Nada a refazer. O dashboard passa a usar `/aggregated-data` | — |
| Function de coleta | Projeto vazio, planejada dentro do MarketData | Opcional | Depende da decisão D7 | Pequeno |

### Detalhe: Catalog

- **Banco.** `Npgsql.EntityFrameworkCore.PostgreSQL` dá lugar a `Microsoft.EntityFrameworkCore.SqlServer`; `UseNpgsql` vira `UseSqlServer`; a migration `InitialCreate` é regerada (os tipos mudam, por exemplo `uuid` para `uniqueidentifier`). Domain e Application não são tocados.
- **Modelo do CRUD.** Hoje a criptomoeda é criada de forma implícita, quando o primeiro usuário a adiciona à sua lista. O enunciado pede "CRUD de criptomoedas e lista do usuário" e cita slices como `CreateCrypto` e `GetCrypto`. Ver decisão D4.
- **Evento novo.** `CryptoRemoved`, publicado quando uma criptomoeda sai do catálogo.
- **Ambiente local.** O `catalog_db` sai do PostgreSQL do Compose e entra um SQL Server (risco R1).

### Detalhe: fluxo de previsão

Antes: `PricesIngested` disparava uma Function, que lia o histórico no MarketData, gravava a previsão e publicava `ForecastGenerated`; o BFF lia a previsão gravada.

Agora: o BFF busca o histórico no MarketData e o envia à Function `GetForecast`, que devolve a previsão na mesma chamada. A previsão não é gravada.

`PricesIngested` continua sendo publicado pelo MarketData, mas perde seu consumidor. Ver decisão D5.

## 4. Impactos transversais

### 4.1 Repositórios separados

O enunciado pede repositórios públicos separados: frontend, BFF, Catalog, MarketData, Azure Function e Identity. Hoje existe uma solução única com 25 projetos e referências diretas entre eles. Ver decisão D1.

Consequências, em qualquer das opções:

- cada repositório tem sua própria solução, `Directory.Build.props`, `Directory.Packages.props`, `global.json`, Dockerfile, README e testes;
- o Dockerfile único parametrizado (ADR-015) é substituído por um Dockerfile por repositório;
- o projeto único de testes de arquitetura (ADR-013) é dividido em um por repositório;
- a regra "serviços não referenciam outros serviços" passa a ser garantida pela separação física; o teste `ServiceIsolationTests` deixa de fazer sentido;
- `docs/`, `asyncapi.yaml`, o Compose do sistema completo e a configuração do Gateway não pertencem a nenhum dos seis repositórios e precisam de um lugar.

### 4.2 Código compartilhado

`BuildingBlocks` e `Contracts` são hoje referenciados por projeto. Entre repositórios isso não é possível. Ver decisão D8.

### 4.3 Testes unitários

Exigência nova para todos os projetos. Hoje só existem testes de arquitetura. É preciso criar testes de handlers e de entidades para Identity e Catalog, e incluí-los desde o início em MarketData, Function e BFF.

### 4.4 Swagger

Exigência nova. Identity e Catalog não têm; MarketData e BFF nascem com ele.

### 4.5 Eventos

| Evento | Antes | Agora |
|---|---|---|
| `CryptoRegistered` | Catalog → MarketData | Igual |
| `CryptoRemoved` | Não existia | Catalog → MarketData |
| `PricesIngested` | MarketData → Function de previsão | MarketData → consumidor a definir (D5) |
| `ForecastGenerated` | Function de previsão → BFF | Removido |

Novidades: o lado consumidor da mensageria (ainda não escrito), o arquivo `asyncapi.yaml` e um broker acessível na nuvem (decisão D3).

### 4.6 Segurança e roteamento

- O Gateway fica só na frente do BFF. A rota `/api/auth/*` direto para o Identity deixa de existir; o BFF faz o proxy do login.
- O JWT continua emitido pelo Identity e validado por quem recebe a requisição: Gateway, BFF, Catalog e MarketData.
- A Function `GetForecast` é chamada só pelo BFF e protegida por chave de função.

### 4.7 Publicação na nuvem

Tudo precisa estar em URLs públicas: frontend, BFF, Identity, Catalog, MarketData, Function, Gateway, três bancos e o broker. O plano anterior previa apenas um servidor PostgreSQL e o Service Bus.

## 5. ADRs afetados

| ADR | Decisão atual | Situação |
|---|---|---|
| 001 | Monorepo único | Substituído: repositórios separados |
| 004 | Um servidor PostgreSQL com um banco por serviço | Substituído: PostgreSQL (Identity), Azure SQL (Catalog), MongoDB Atlas (MarketData) |
| 005, 023 | `IEventBus`; RabbitMQ local e Service Bus na nuvem | Abstração mantida; broker da nuvem a decidir (D3); acrescenta o lado consumidor |
| 006 | Functions como parte do serviço dono | Substituído: Function independente, em repositório próprio |
| 007, 016 | Gateway roteia para Identity e para o BFF | Substituído: Gateway roteia só para o BFF |
| 009 | Prediction lê o histórico pela API do MarketData | Substituído: o BFF envia a série à Function |
| 010 | Prediction em ML.NET, como microsserviço | Alterado: ML.NET mantido, agora em uma Function HTTP sem banco |
| 013 | Testes de arquitetura em um único projeto | Substituído: um projeto por repositório; BFF com ferramenta de Node |
| 014 | Build e versões de pacotes centralizados | Alterado: centralização por repositório |
| 015 | Dockerfile único parametrizado | Substituído: um Dockerfile por repositório |
| 017, 021 | JWT HS256 validado no Gateway e nos serviços | Mantidos; acrescenta BFF e MarketData como validadores |
| 019 | Migrations do EF Core na inicialização | Mantido para Identity e Catalog; não se aplica ao MongoDB |
| 008, 018, 020, 022, 024 | `TrackedAsset`, `Result` e validação, BCrypt, sem outbox, `Application/Common` | Mantidos |

## 6. Decisões necessárias

**D1 — Como separar os repositórios.**
Recomendação: manter este repositório como área de trabalho, reorganizado em seis pastas autossuficientes (`identity/`, `catalog/`, `marketdata/`, `forecast-function/`, `bff/`, `frontend/`), sem nenhuma referência entre elas. Cada pasta é exportada para o seu repositório público com `git subtree push`, que pode ser repetido a cada fase. Este repositório continua guardando `docs/`, `asyncapi.yaml`, o Compose do sistema completo e a configuração do Gateway.
Alternativa: criar os seis repositórios agora e trabalhar em seis clones. Dá mais atrito a cada fase e deixa a documentação comum sem lugar.

**D2 — Tecnologia do Gateway na nuvem.**
Recomendação: Azure API Management, no plano Consumption. A lista de repositórios da entrega não inclui um repositório de gateway, o que indica um serviço gerenciado. O YARP atual seria removido.
Alternativa: publicar o YARP atual como contêiner, em um sétimo repositório.

**D3 — Broker na nuvem.**
Recomendação: RabbitMQ gerenciado no CloudAMQP (plano gratuito). O adaptador RabbitMQ já escrito serve para o ambiente local e para a nuvem; `IEventBus` continua sendo a abstração.
Alternativa: Azure Service Bus. Exige o plano Standard (pago) para tópicos e um segundo adaptador.

**D4 — Modelo do CRUD do Catalog.**
Recomendação: separar em dois recursos. `/cryptos` é o CRUD do catálogo (`CreateCrypto`, `GetCrypto`, `ListCryptos`, `UpdateCrypto`, `DeleteCrypto`), e `CreateCrypto` e `DeleteCrypto` publicam `CryptoRegistered` e `CryptoRemoved`. A lista do usuário vai para `/user-cryptos` e passa a referenciar uma criptomoeda existente. As slices atuais são adaptadas, não reescritas.
Alternativa: manter a criação implícita e publicar `CryptoRemoved` quando o último usuário remover a moeda. Não atende à leitura literal de "CRUD de criptomoedas".

**D5 — Consumidor de `PricesIngested`.**
Recomendação: o Catalog consome o evento e guarda o último preço de cada criptomoeda, para a lista mostrar o preço atual sem consultar o MarketData. Dá um segundo sentido ao fluxo de eventos.
Alternativa: publicar o evento sem consumidor e apenas documentá-lo no AsyncAPI.

**D6 — Nome das imagens no Docker Hub.**
O padrão pedido, `<usuario>/puccrypto/<servico>:<tag>`, tem dois níveis depois do usuário. Pelo que conheço, o Docker Hub aceita apenas `<usuario>/<repositorio>:<tag>`. Recomendação: usar `<usuario>/puccrypto-<servico>:<tag>` e confirmar com o professor.

**D7 — Function agendada de coleta (opcional no enunciado).**
Recomendação: incluir, como uma Function de timer que apenas chama um endpoint de coleta do MarketData. É pequena e mantém a coleta funcionando mesmo que o contêiner do MarketData hiberne na nuvem.
Alternativa: coletar só quando uma moeda é registrada e sob demanda.

**D8 — Código compartilhado entre repositórios.**
Recomendação: copiar os BuildingBlocks para dentro de cada repositório .NET e declarar os contratos de evento em cada serviço. O contrato comum passa a ser o `asyncapi.yaml`.
Alternativa: publicar os BuildingBlocks como pacote NuGet. É mais correto para reuso, mas acrescenta um sétimo repositório e um fluxo de publicação.

## 7. Riscos

| Id | Risco | Tratamento |
|---|---|---|
| R1 | A imagem do SQL Server é feita para x64 e a máquina de desenvolvimento é ARM64; só roda por emulação | Testar no início da fase 4. Se não rodar, desenvolver o Catalog direto contra o Azure SQL |
| R2 | Continua sem confirmação que o forecasting do ML.NET roda em ARM64 | Testar no início da fase 6; alternativa já prevista no ADR-010 |
| R3 | Planos gratuitos hibernam (Azure SQL, Functions, contêineres); a primeira chamada da demo pode demorar ou falhar | Retentativas nas conexões e uma rotina de "aquecimento" antes da demo |
| R4 | O PostgreSQL do Identity precisa de hospedagem na nuvem, e o enunciado não indica qual | Decidir na fase 9 |
| R5 | A previsão passa a ser calculada a cada chamada de `/aggregated-data` | Série limitada e cache curto no BFF |

## 8. Plano de fases revisado

| Fase | Entrega |
|---|---|
| 3R | Reorganização do repositório em pastas autossuficientes. Identity ganha Swagger, testes unitários, Dockerfile e README |
| 4 | Catalog em Azure SQL: CRUD de criptomoedas e lista do usuário, `CryptoRegistered` e `CryptoRemoved`, Swagger, testes |
| 5 | MarketData em MongoDB: CRUD, coleta na CoinGecko, consumo dos eventos do Catalog, `PricesIngested`, Swagger, testes |
| 6 | Azure Function `GetForecast` em ML.NET (e a Function de coleta, se aprovada) |
| 7 | BFF em NestJS: `/aggregated-data`, proxies, Swagger, testes unitários e de arquitetura |
| 8 | Frontend: shell e remotes consumindo o BFF |
| 9 | Dockerfiles, Docker Hub, deploy na nuvem, Gateway, READMEs, `asyncapi.yaml`, exportação para os repositórios públicos |
| 10 | Checklist para a documentação: URLs e telas para os prints |

A fase 3R é a única acrescentada à lista do enunciado. Ela existe porque a reorganização e os ajustes do Identity precisam acontecer antes de o Catalog ser refeito.

## 9. O que será necessário do grupo

- Usuário do Docker Hub.
- Cluster gratuito no MongoDB Atlas.
- Assinatura do Azure e o tipo dela (por exemplo, Azure for Students), para saber quais planos gratuitos estão disponíveis.
- Conta no CloudAMQP, se a decisão D3 for aprovada.
- Criação dos seis repositórios públicos no GitHub.
- Nomes dos alunos para os READMEs.

Nenhum desses itens é necessário antes da fase 9, exceto o Azure SQL, caso o risco R1 se confirme.

## 10. Aprovação

As recomendações D1 a D8 foram aprovadas pelo grupo em 02/10/2026, com a condição de não conflitarem com o enunciado do professor ([enunciado-pjbl.md](enunciado-pjbl.md)). Conferência feita contra o enunciado:

| Decisão | Conferência |
|---|---|
| D1, D8 | O enunciado exige repositórios públicos separados; a exportação por pasta atende |
| D2 | O enunciado diz que o Gateway "pode usar AWS Gateway"; é uma sugestão, e um serviço gerenciado equivalente atende. O produto é escolhido na fase 9 |
| D3 | O enunciado não define o broker |
| D4 | O enunciado pede "CRUD completo" em cada microsserviço; o CRUD explícito atende |
| D5, D7 | Acréscimos que não contrariam o enunciado. A Function exigida é a de gatilho HTTP |
| D6 | **Ajustada.** O enunciado traz o exemplo `dockerhubuser/pjbl/bff:v1`. Na fase 9, esse formato é tentado primeiro (`<usuario>/puccrypto/<servico>:<tag>`); o formato com hífen só será usado se o Docker Hub recusar |

O registro das decisões está nos ADRs 025 a 032. D4, D5, D6 e D7 são registradas nas fases em que forem implementadas.
