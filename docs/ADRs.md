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
| 014 | Configuração de build e versões de pacotes centralizadas | 2 | Aceita |
| 015 | Dockerfile único parametrizado para os serviços .NET | 2 | Aceita |
| 016 | Rotas do Gateway com prefixo `/api` removido | 2 | Aceita |
| 017 | JWT assinado com HS256 e validado no Gateway | 3 | Aceita |
| 018 | Falhas como `Result` e validação por filtro de endpoint | 3 | Aceita |
| 019 | Migrations do EF Core aplicadas na inicialização da API | 3 | Aceita |
| 020 | Senhas com BCrypt | 3 | Aceita |
| 021 | Serviços validam o JWT repassado | 4 | Aceita |
| 022 | Evento publicado após a gravação, sem outbox | 4 | Aceita |
| 023 | Topologia de eventos: uma exchange topic e nome do evento como chave | 4 | Aceita |
| 024 | Código comum a várias slices em `Application/Common` | 4 | Aceita |

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

## ADR-014 — Configuração de build e versões de pacotes centralizadas

**Contexto.** A solução tem 24 projetos que precisam usar a mesma versão do .NET e as mesmas versões de pacotes.

**Decisão.** `Directory.Build.props` define o framework alvo e as opções de compilação de todos os projetos. `Directory.Packages.props` define as versões dos pacotes NuGet (Central Package Management). `global.json` fixa o SDK na linha 8.0.

**Alternativas.** Repetir framework e versões em cada `.csproj`.

**Justificativa.** Evita divergência de versões entre serviços e reduz cada `.csproj` às suas referências, o que deixa as dependências entre projetos fáceis de ler.

**Consequências.** Um `.csproj` não declara versão de pacote; um pacote novo precisa ser registrado primeiro em `Directory.Packages.props`. Atualizar uma versão afeta todos os projetos de uma vez.

## ADR-015 — Dockerfile único parametrizado para os serviços .NET

**Contexto.** Gateway, BFF e as quatro APIs são aplicações ASP.NET Core com o mesmo processo de build.

**Decisão.** Um único Dockerfile, `infra/docker/dotnet-service.Dockerfile`, recebe a pasta e o nome do projeto como argumentos de build. O contexto de build é a raiz do repositório.

**Alternativas.** Um Dockerfile por projeto.

**Justificativa.** Seis Dockerfiles seriam idênticos, exceto pelo nome do projeto. Um arquivo só mantém as imagens consistentes e serve tanto ao Compose quanto ao deploy na nuvem.

**Consequências.** Cada imagem copia toda a pasta `src`, portanto uma alteração em qualquer projeto invalida o cache de build de todas. As Functions usam outra imagem base e terão Dockerfile próprio, se forem executadas em contêiner.

## ADR-016 — Rotas do Gateway com prefixo `/api` removido

**Contexto.** O Gateway precisa de uma convenção de caminhos que separe a autenticação do restante e que não vaze para os serviços.

**Decisão.** Todas as rotas externas começam com `/api`. `/api/auth/*` vai para o Identity e as demais `/api/*` vão para o BFF. O Gateway remove o prefixo `/api` antes de encaminhar. As rotas ficam na configuração do YARP, não em código.

**Alternativas.** Manter o prefixo completo nos serviços. Um prefixo por serviço (`/identity`, `/bff`).

**Justificativa.** O frontend enxerga uma API única, sem saber quantos serviços existem. Os serviços definem caminhos próprios, independentes da convenção do Gateway.

**Consequências.** O caminho visto pelo cliente difere do caminho visto pelo serviço, o que precisa aparecer nos diagramas de sequência. Uma rota nova do Identity fora de `/auth` exige ajuste na configuração do Gateway.

## ADR-017 — JWT assinado com HS256 e validado no Gateway

**Contexto.** O Identity emite o token de acesso e os demais componentes precisam confiar nele. Era uma pendência da fase 1.

**Decisão.** O token é um JWT assinado com HS256. A chave simétrica vem da configuração (`Jwt:SigningKey`) e é compartilhada entre o Identity, que assina, e o Gateway, que valida emissor, audiência, assinatura e validade. As rotas do Gateway que exigem autenticação são marcadas com `AuthorizationPolicy` na configuração do YARP.

**Alternativas.** RS256, com chave privada apenas no Identity e chave pública distribuída por um endpoint JWKS. Validar o token somente dentro de cada serviço.

**Justificativa.** A chave simétrica dispensa geração e distribuição de pares de chaves, o que simplifica o ambiente local e o deploy. Validar no Gateway barra requisições não autenticadas antes que cheguem aos serviços.

**Consequências.** Todo componente que valida o token também conseguiria emitir um, pois conhece a chave. Em um sistema de produção, o adequado seria RS256. A troca fica restrita a `JwtTokenGenerator` e à configuração de autenticação do Gateway.

## ADR-018 — Falhas como `Result` e validação por filtro de endpoint

**Contexto.** As slices precisam de uma forma uniforme de validar a entrada e de devolver falhas esperadas, como e-mail duplicado ou credenciais inválidas.

**Decisão.** Os handlers devolvem `Result<T>`, que carrega o valor ou um `Error` com código, mensagem e tipo. `ResultExtensions.ToProblem` converte o tipo do erro em status HTTP no formato Problem Details. A validação da entrada usa FluentValidation e é executada por `ValidationFilter`, ligado à rota com `WithValidation<T>()`, antes do handler.

**Alternativas.** Lançar exceções para falhas de negócio e tratá-las em um middleware. Chamar o validador dentro de cada handler.

**Justificativa.** As falhas esperadas ficam visíveis na assinatura do handler e não dependem de fluxo por exceção. O filtro evita repetir a chamada de validação em cada endpoint e mantém o handler concentrado na regra de negócio.

**Consequências.** `PucCrypto.BuildingBlocks.Abstractions` passa a conter, além de contratos, pequenas implementações de apoio (registro de endpoints e handlers, filtro de validação, conversão de erros) e depende do ASP.NET Core e do FluentValidation. O Domain não referencia esse projeto.

## ADR-019 — Migrations do EF Core aplicadas na inicialização da API

**Contexto.** Cada serviço é dono do esquema do seu banco e precisa criá-lo e evoluí-lo.

**Decisão.** O esquema é versionado por migrations do EF Core, mantidas em `Infrastructure/Persistence/Migrations`. A API aplica as migrations pendentes ao iniciar. A ferramenta `dotnet-ef` é registrada como ferramenta local do repositório.

**Alternativas.** Aplicar as migrations em uma etapa separada do deploy. Scripts SQL manuais.

**Justificativa.** Subir o ambiente passa a exigir um único comando, e o esquema fica sempre alinhado ao código em execução.

**Consequências.** O usuário de banco da aplicação precisa de permissão para alterar o esquema. Com mais de uma instância do mesmo serviço iniciando ao mesmo tempo, as migrations poderiam concorrer; o projeto roda uma instância por serviço.

## ADR-020 — Senhas com BCrypt

**Contexto.** O Identity precisa armazenar senhas de forma segura.

**Decisão.** As senhas são gravadas como hash BCrypt, pela biblioteca BCrypt.Net-Next, atrás da porta `IPasswordHasher`.

**Alternativas.** PBKDF2 com o `PasswordHasher` do ASP.NET Core Identity. Argon2.

**Justificativa.** BCrypt é um algoritmo consolidado para senhas, com sal embutido no hash e uma API de duas chamadas.

**Consequências.** O BCrypt considera apenas os primeiros 72 bytes da senha; por isso o validador limita a senha a 72 caracteres. Trocar o algoritmo exige apenas outra implementação de `IPasswordHasher`.

## ADR-021 — Serviços validam o JWT repassado

**Contexto.** O Catalog precisa saber qual usuário está fazendo a requisição. O Gateway já valida o token (ADR-017), mas o Catalog fica atrás do Gateway e do BFF.

**Decisão.** O token é repassado no cabeçalho `Authorization` até o serviço. Cada serviço que precisa da identidade do usuário valida o JWT novamente e lê o id da claim `sub`. A configuração de validação fica em um projeto compartilhado, `PucCrypto.BuildingBlocks.Authentication`, usado pelo Gateway e pelas APIs.

**Alternativas.** O Gateway validar o token e repassar o id do usuário em um cabeçalho próprio, como `X-User-Id`, em que os serviços confiam.

**Justificativa.** O serviço não depende de confiar em quem o chamou: uma requisição que chegue a ele por outro caminho, sem token válido, é recusada. A identidade trafega em um formato único, assinado.

**Consequências.** Todo serviço que valida o token precisa da chave de assinatura (ver a consequência do ADR-017). A validação é repetida a cada salto, com custo desprezível para este sistema.

## ADR-022 — Evento publicado após a gravação, sem outbox

**Contexto.** Ao adicionar uma criptomoeda nova, o Catalog grava no banco e publica `CryptoRegistered`. Banco e broker não participam da mesma transação.

**Decisão.** O handler grava no banco e, em seguida, publica o evento, aguardando a confirmação do broker.

**Alternativas.** Padrão Transactional Outbox: gravar o evento em uma tabela na mesma transação dos dados e publicá-lo por um processo em segundo plano.

**Justificativa.** O outbox exigiria uma tabela, um publicador em segundo plano e controle de reenvio em cada serviço, o que foge da simplicidade pedida para o projeto.

**Consequências.** Se a publicação falhar depois da gravação, o dado fica salvo e o evento se perde: a requisição devolve erro, e uma nova tentativa não republica, porque a moeda já existe no catálogo. Em produção, o outbox seria o caminho adequado.

## ADR-023 — Topologia de eventos: uma exchange topic e nome do evento como chave

**Contexto.** O ADR-005 definiu a abstração `IEventBus`. Faltava definir como os eventos são organizados no broker.

**Decisão.** No RabbitMQ, todos os eventos vão para a exchange `puccrypto.events`, do tipo topic e durável. A chave de roteamento é o nome do tipo do evento. Cada consumidor terá sua própria fila, ligada às chaves que lhe interessam. As mensagens são persistentes, e o publicador aguarda a confirmação do broker. No Azure Service Bus, o equivalente será um tópico por evento com uma assinatura por consumidor.

**Alternativas.** Uma exchange por evento. Filas diretas entre publicador e consumidor.

**Justificativa.** O publicador não conhece os consumidores: um novo consumidor apenas cria sua fila e sua ligação. Uma exchange única é simples de inspecionar e de documentar.

**Consequências.** Um evento publicado sem nenhuma fila ligada é descartado. O adaptador de Service Bus ainda não existe; será escrito na fase 9, junto com o deploy.

## ADR-024 — Código comum a várias slices em `Application/Common`

**Contexto.** As slices não podem referenciar umas às outras, mas no Catalog quatro slices devolvem a mesma representação do item monitorado e três usam o mesmo erro de "não encontrado".

**Decisão.** Tipos usados por mais de uma slice ficam em `Application/Common` (respostas e erros) ou em `Application/Abstractions` (portas). As slices podem depender dessas pastas e do Domain, nunca de outra slice. O corpo HTTP (`Request`) é separado do `Command`, que inclui o id do usuário obtido do token.

**Alternativas.** Repetir o tipo de resposta em cada slice. Permitir que uma slice use tipos de outra.

**Justificativa.** Repetir quatro vezes o mesmo tipo e o mesmo mapeamento criaria divergência sem ganho. Uma pasta comum, pequena e explícita, mantém a regra de independência entre slices verificável por teste.

**Consequências.** `Common` precisa permanecer restrito a tipos realmente compartilhados, para não virar um depósito de código.
