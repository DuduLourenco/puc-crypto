# Registro de decisões de arquitetura (ADRs)

Cada decisão registra o contexto, o que foi decidido, as alternativas consideradas e a justificativa. O arquivo recebe novas entradas ao fim de cada fase. Uma decisão revista não é apagada: ganha o status "Substituída" e aponta para a nova.

| ADR | Título | Fase | Status |
|---|---|---|---|
| 001 | Monorepo único | 1 | Aceita |
| 002 | Clean Architecture + Vertical Slice com a slice completa em Application | 1 | Aceita |
| 003 | Interfaces próprias de handler | 1 | Aceita |
| 004 | Um servidor PostgreSQL com um banco e um usuário por serviço | 1 | Aceita |
| 005 | Abstração própria de mensageria com JSON simples | 1 | Aceita |
| 006 | Azure Functions como parte do serviço dono | 1 | Aceita |
| 007 | Gateway expõe apenas Identity e BFF | 1 | Aceita |
| 008 | Tabela `TrackedAsset` no MarketData | 1 | Aceita |
| 009 | Prediction lê o histórico pela API do MarketData | 1 | Aceita |
| 010 | Prediction em ML.NET | 1 | Aceita, com verificação pendente |
| 011 | .NET 8 | 1 | Aceita |
| 012 | Microfrontends com Module Federation e npm workspaces | 1 | Aceita |
| 013 | Testes de arquitetura em um único projeto | 1 | Aceita |

---

## ADR-001 — Monorepo único

**Contexto.** O sistema tem quatro microsserviços, um BFF, um Gateway, duas Functions e quatro aplicações de frontend. O repositório já existia com uma versão anterior do projeto (React, Azure Functions em JavaScript e MongoDB).

**Decisão.** Todo o código fica neste repositório, em uma única solução .NET (`PucCrypto.sln`) e um workspace npm em `src/Web`. O projeto anterior permanece apenas no histórico do Git.

**Alternativas.** Um repositório por serviço. Um repositório novo, separado do antigo.

**Justificativa.** Um repositório único facilita a avaliação, a documentação e os testes de arquitetura que verificam regras entre serviços. A independência dos serviços é garantida por testes, não pela separação física.

**Consequências.** Os serviços podem, em tese, referenciar uns aos outros; os testes de arquitetura (ADR-013) impedem isso. O workflow antigo do Static Web Apps precisa ser removido antes do primeiro push.

## ADR-002 — Clean Architecture + Vertical Slice com a slice completa em Application

**Contexto.** Cada serviço deve combinar camadas (Domain, Application, Infrastructure) com casos de uso organizados em `Features/<CasoDeUso>`, contendo endpoint, command ou query, handler e validação.

**Decisão.** Cada serviço tem quatro projetos: Domain, Application, Infrastructure e Api. A slice inteira, inclusive o endpoint, fica em `Application/Features/<CasoDeUso>`. O projeto Api contém apenas o `Program.cs` e o registro de dependências.

**Alternativas.** Manter o endpoint no projeto Api, com a slice dividida entre dois projetos. Usar um único projeto por serviço, com camadas em pastas.

**Justificativa.** A slice em uma pasta só é mais fácil de localizar e de representar nos diagramas de componentes e de classes. Projetos separados fazem o compilador reforçar a direção das dependências.

**Consequências.** Application depende das abstrações HTTP do ASP.NET Core. Os testes de arquitetura continuam proibindo que ela dependa de Infrastructure, EF Core, Npgsql e bibliotecas de mensageria.

## ADR-003 — Interfaces próprias de handler

**Contexto.** As slices precisam de um contrato comum para commands, queries e handlers.

**Decisão.** `ICommandHandler` e `IQueryHandler` são definidas em `PucCrypto.BuildingBlocks.Abstractions`. O endpoint recebe o handler por injeção de dependência e o chama diretamente. A validação usa FluentValidation.

**Alternativas.** MediatR.

**Justificativa.** As versões recentes do MediatR têm licença comercial. O sistema não precisa de pipeline de mediação, e a chamada direta deixa os diagramas de sequência mais simples.

**Consequências.** Comportamentos transversais, se surgirem, são implementados como decoradores.

## ADR-004 — Um servidor PostgreSQL com um banco e um usuário por serviço

**Contexto.** O estilo Database per Service exige que cada serviço tenha seu banco e não acesse o dos outros. As portas 5432 e 5433 da máquina de desenvolvimento já estão ocupadas por outros projetos.

**Decisão.** O Docker Compose sobe um contêiner PostgreSQL dedicado na porta 5440, com quatro bancos (`identity_db`, `catalog_db`, `marketdata_db`, `prediction_db`) e quatro usuários. Cada usuário tem permissão apenas no seu banco. Não há FKs entre bancos. Na nuvem, o mesmo desenho é aplicado em um Azure Database for PostgreSQL Flexible Server.

**Alternativas.** Um servidor por serviço. Reutilizar um PostgreSQL já existente na máquina.

**Justificativa.** O isolamento lógico por banco e usuário atende ao estilo com custo e complexidade menores que quatro servidores. Um contêiner dedicado torna o ambiente reproduzível para todo o grupo.

**Consequências.** Os serviços compartilham o mesmo servidor, portanto não há isolamento de recursos nem de falhas no nível do banco. Separar em servidores distintos exige apenas trocar as connection strings.

## ADR-005 — Abstração própria de mensageria com JSON simples

**Contexto.** Os eventos trafegam por RabbitMQ no ambiente local e por Azure Service Bus na nuvem. As Azure Functions leem as mensagens diretamente pelo gatilho nativo.

**Decisão.** `IEventBus` é definida em `PucCrypto.BuildingBlocks.Abstractions`. `PucCrypto.BuildingBlocks.Messaging` traz um adaptador para RabbitMQ e outro para Service Bus, escolhidos por configuração. As mensagens são JSON simples, sem envelope. Os contratos dos eventos ficam em `PucCrypto.Contracts`.

**Alternativas.** MassTransit. Usar o cliente RabbitMQ diretamente em cada serviço.

**Justificativa.** As versões recentes do MassTransit têm licença comercial, e seu envelope de mensagem dificulta a leitura pelos gatilhos nativos das Functions. Uma abstração pequena deixa explícito o ponto de troca do broker.

**Consequências.** Recursos como retentativa e fila de mensagens mortas ficam a cargo do broker e são configurados apenas no que o projeto precisar. `PucCrypto.Contracts` é compartilhado por todos os serviços e é a única dependência comum além dos BuildingBlocks.

## ADR-006 — Azure Functions como parte do serviço dono

**Contexto.** A coleta agendada de preços e a geração de previsão rodam em Azure Functions, mas os dados pertencem aos serviços MarketData e Prediction.

**Decisão.** Cada Function é um projeto dentro da pasta do seu serviço (`PucCrypto.MarketData.Functions`, `PucCrypto.Prediction.Functions`). Ela é um adaptador fino: recebe o gatilho e chama um handler da Application do próprio serviço, usando o banco desse serviço.

**Alternativas.** Functions independentes que chamam endpoints internos dos serviços para gravar dados.

**Justificativa.** A Function e a API são duas formas de implantar o mesmo serviço e compartilham as mesmas regras de negócio. Isso mantém o Database per Service sem criar endpoints internos de ingestão.

**Consequências.** API e Function de um mesmo serviço são implantadas separadamente, mas evoluem juntas e compartilham o esquema do banco.

## ADR-007 — Gateway expõe apenas Identity e BFF

**Contexto.** O Gateway é o único ponto de entrada, e o BFF agrega dados para o frontend web.

**Decisão.** O Gateway (YARP) encaminha `/api/auth/*` ao Identity e as demais rotas `/api/*` ao BFF. Catalog, MarketData e Prediction não são expostos externamente. O BFF repassa o CRUD ao Catalog e monta o dashboard.

**Alternativas.** Rotear o CRUD do Gateway diretamente para o Catalog e usar o BFF só para o dashboard.

**Justificativa.** Uma única porta de entrada para os dados do frontend simplifica os diagramas de contêiner e mantém os microsserviços livres de preocupações de apresentação.

**Consequências.** O CRUD passa por um salto a mais. O BFF precisa repassar a identidade do usuário aos serviços.

## ADR-008 — Tabela `TrackedAsset` no MarketData

**Contexto.** A Function de coleta precisa saber quais criptomoedas buscar na CoinGecko. Essa informação nasce no Catalog, e o MarketData não pode consultar o banco do Catalog.

**Decisão.** O MarketData mantém a tabela `TrackedAsset`, alimentada pelo evento `CryptoRegistered`.

**Alternativas.** Derivar a lista dos `PricePoint` já gravados. Consultar a API do Catalog a cada coleta.

**Justificativa.** A réplica local alimentada por evento é o padrão usual em EDA, mantém o MarketData autônomo e torna explícito o papel do evento.

**Consequências.** É a única entidade adicionada ao modelo de dados original. A lista do MarketData pode ficar momentaneamente atrás do Catalog (consistência eventual).

## ADR-009 — Prediction lê o histórico pela API do MarketData

**Contexto.** Para treinar o modelo, a Function de previsão precisa do histórico de preços, que pertence ao MarketData.

**Decisão.** Ao receber `PricesIngested`, a Function de previsão consulta o histórico pela API HTTP interna do MarketData.

**Alternativas.** Levar os preços dentro do evento e manter uma cópia no banco do Prediction.

**Justificativa.** Evita duplicar o histórico em dois bancos e mantém o evento pequeno.

**Consequências.** Há um acoplamento síncrono entre Prediction e MarketData: se o MarketData estiver fora, a previsão falha e depende de retentativa da mensagem.

## ADR-010 — Prediction em ML.NET

**Contexto.** O enunciado permite Python com scikit-learn ou ML.NET para o serviço de previsão.

**Decisão.** O Prediction é escrito em .NET com ML.NET.

**Alternativas.** Python com scikit-learn.

**Justificativa.** Com uma única stack, os quatro serviços seguem o mesmo padrão, reutilizam os BuildingBlocks e são cobertos pelos mesmos testes de arquitetura. Python exigiria reimplementar mensageria, validação de JWT e testes de arquitetura.

**Consequências.** Pendência: não está confirmado que o forecasting de séries temporais (SSA) do ML.NET roda em ARM64, a arquitetura da máquina de desenvolvimento. Isso é verificado no início da fase 6. Se não rodar, o modelo passa a ser uma regressão sobre janelas de preços, ainda em ML.NET.

## ADR-011 — .NET 8

**Contexto.** O enunciado define .NET 8 para o backend.

**Decisão.** Todos os projetos de backend usam .NET 8, com as Functions no modelo isolated worker.

**Alternativas.** .NET 10.

**Justificativa.** Segue o enunciado da disciplina.

**Consequências.** O suporte oficial ao .NET 8 termina em novembro de 2026. A migração para o .NET 10 exige alterar a versão alvo em `Directory.Build.props` e atualizar os pacotes.

## ADR-012 — Microfrontends com Module Federation e npm workspaces

**Contexto.** O frontend é composto por um shell e três microfrontends em React e Vite.

**Decisão.** O shell é o host e carrega `mfe-auth`, `mfe-cryptos` e `mfe-dashboard` em tempo de execução com o plugin `@module-federation/vite`. As cinco pastas de `src/Web` formam um workspace npm. O pacote `shared` contém o cliente HTTP e os tipos. O gráfico usa Recharts.

**Alternativas.** `@originjs/vite-plugin-federation`. Composição em tempo de build por pacotes npm.

**Justificativa.** O plugin é mantido pelo projeto Module Federation. A carga em tempo de execução é o que caracteriza o estilo microfrontend, com build e implantação independentes.

**Consequências.** React é compartilhado como singleton entre host e remotos. A sessão do usuário fica no shell e é entregue aos MFEs.

## ADR-013 — Testes de arquitetura em um único projeto

**Contexto.** As regras de dependência precisam ser verificadas por testes: Domain não depende de nada, Application não depende de Infrastructure, slices não referenciam outras slices e serviços não referenciam outros serviços.

**Decisão.** Um projeto `tests/PucCrypto.ArchitectureTests` com NetArchTest, com uma classe de teste por serviço e uma para as regras entre serviços.

**Alternativas.** Um projeto de testes por serviço. ArchUnitNET.

**Justificativa.** Um projeto único vê todos os assemblies, o que é necessário para as regras entre serviços, e roda com um único `dotnet test`. O NetArchTest cobre as regras exigidas com uma API mais simples.

**Consequências.** O projeto de testes referencia todos os serviços. Ele é o único lugar em que isso é permitido.
