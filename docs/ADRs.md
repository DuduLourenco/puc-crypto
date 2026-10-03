# Registro de decisões de arquitetura (ADRs)

Cada decisão registra o contexto, o que foi decidido, as alternativas consideradas e a justificativa. O arquivo recebe novas entradas ao fim de cada fase. Uma decisão revista não é apagada: ganha o status "Substituída" e aponta para a nova.

As decisões 025 a 032 decorrem do enunciado final do PJBL ([enunciado-pjbl.md](enunciado-pjbl.md)); a comparação com a arquitetura anterior está em [analise-impacto-pjbl.md](analise-impacto-pjbl.md).

| ADR | Título | Fase | Status |
|---|---|---|---|
| 001 | Monorepo único | 1 | Substituída pelo ADR-025 |
| 002 | Clean Architecture + Vertical Slice com a slice completa em Application | 1 | Aceita |
| 003 | Interfaces próprias de handler | 1 | Aceita |
| 004 | Um servidor PostgreSQL com um banco e um usuário por serviço | 1 | Substituída pelo ADR-027 |
| 005 | Abstração própria de mensageria com JSON simples | 1 | Alterada pelos ADR-026 e ADR-030 |
| 006 | Azure Functions como parte do serviço dono | 1 | Substituída pelo ADR-029 |
| 007 | Gateway expõe apenas Identity e BFF | 1 | Substituída pelo ADR-028 |
| 008 | Tabela `TrackedAsset` no MarketData | 1 | Aceita |
| 009 | Prediction lê o histórico pela API do MarketData | 1 | Substituída pelo ADR-029 |
| 010 | Prediction em ML.NET | 1 | Alterada pelos ADR-029 e ADR-039 |
| 011 | .NET 8 | 1 | Aceita |
| 012 | Microfrontends com Module Federation e npm workspaces | 1 | Aceita |
| 013 | Testes de arquitetura em um único projeto | 1 | Substituída pelo ADR-031 |
| 014 | Configuração de build e versões de pacotes centralizadas | 2 | Alterada pelo ADR-025 |
| 015 | Dockerfile único parametrizado para os serviços .NET | 2 | Substituída pelo ADR-025 |
| 016 | Rotas do Gateway com prefixo `/api` removido | 2 | Substituída pelo ADR-028 |
| 017 | JWT assinado com HS256 e validado no Gateway | 3 | Alterada pelo ADR-028 |
| 018 | Falhas como `Result` e validação por filtro de endpoint | 3 | Aceita |
| 019 | Migrations do EF Core aplicadas na inicialização da API | 3 | Aceita |
| 020 | Senhas com BCrypt | 3 | Aceita |
| 021 | Serviços validam o JWT repassado | 4 | Aceita |
| 022 | Evento publicado após a gravação, sem outbox | 4 | Aceita |
| 023 | Topologia de eventos: uma exchange topic e nome do evento como chave | 4 | Alterada pelo ADR-030 |
| 024 | Código comum a várias slices em `Application/Common` | 4 | Aceita |
| 025 | Repositórios separados, com este repositório como área de trabalho | 3R | Aceita |
| 026 | Código compartilhado copiado em cada repositório | 3R | Aceita |
| 027 | Um tipo de banco por serviço | 3R | Aceita |
| 028 | Gateway gerenciado na nuvem, apenas na frente do BFF | 3R | Aceita |
| 029 | Previsão como Azure Function HTTP, sem banco | 3R | Aceita |
| 030 | RabbitMQ gerenciado como broker da nuvem | 3R | Aceita |
| 031 | Testes unitários e de arquitetura em cada repositório | 3R | Aceita |
| 032 | Swagger em todos os serviços | 3R | Aceita |
| 033 | CRUD do catálogo separado da lista do usuário | 4R | Aceita |
| 034 | Catalog em Azure SQL com EF Core, retentativa e datas em UTC | 4R | Aceita |
| 035 | Consumo de eventos como entrada de slice, com uma reentrega | 5 | Aceita |
| 036 | MarketData em MongoDB sem atributos do driver no Domain | 5 | Aceita |
| 037 | Coleta da CoinGecko por endpoint protegido por chave | 5 | Aceita |
| 038 | Catalog guarda o último preço a partir de `PricesIngested` | 5 | Aceita |
| 039 | Previsão por regressão SDCA do ML.NET sobre variações de preço | 6 | Aceita |
| 040 | Function App em camadas, com os gatilhos na camada API | 6 | Aceita |
| 041 | Coleta agendada por Function que chama o MarketData | 6 | Aceita |

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

## ADR-025 — Repositórios separados, com este repositório como área de trabalho

**Contexto.** O enunciado final exige repositórios públicos separados para microfrontend, BFF, cada microsserviço e a Azure Function. O projeto vinha sendo desenvolvido em um repositório único (ADR-001), com uma solução .NET e referências diretas entre projetos.

**Decisão.** Este repositório passa a ter uma pasta autossuficiente por componente (`identity/`, `catalog/`, `marketdata/`, `forecast-function/`, `bff/`, `frontend/`). Cada pasta tem a sua solução, os seus arquivos de build, Dockerfile, README e testes, e não referencia nada fora dela. Cada pasta é exportada para o seu repositório público com `git subtree push`. A documentação comum, o `asyncapi.yaml`, o Compose do sistema completo e a configuração do Gateway ficam na raiz deste repositório.

**Alternativas.** Criar os repositórios desde já e trabalhar em um clone de cada um.

**Justificativa.** O desenvolvimento continua em um único lugar, com um commit por fase, e a entrega em repositórios separados é atendida pela exportação, que pode ser repetida a cada fase. O que é comum ao sistema tem um lugar que não pertence a nenhum componente.

**Consequências.** Substitui o ADR-001 e o ADR-015 (cada pasta tem o seu Dockerfile) e altera o ADR-014 (a centralização de build passa a ser por pasta). A independência das pastas precisa ser mantida: uma referência entre elas quebraria a exportação.

## ADR-026 — Código compartilhado copiado em cada repositório

**Contexto.** `BuildingBlocks` e `Contracts` eram compartilhados por referência de projeto, o que não funciona entre repositórios.

**Decisão.** Os projetos de `BuildingBlocks` são copiados para `src/BuildingBlocks` de cada serviço .NET que os utiliza. Os contratos de evento deixam de existir como projeto comum: cada serviço declara, na sua camada Application, os eventos que publica ou consome. O contrato comum entre os serviços passa a ser o documento `asyncapi.yaml`.

**Alternativas.** Publicar os BuildingBlocks como pacote NuGet. Submódulo Git.

**Justificativa.** Um pacote NuGet exigiria mais um repositório e um fluxo de publicação e versionamento. A cópia mantém cada repositório compilável sozinho, e a quantidade de código é pequena.

**Consequências.** Uma correção nos BuildingBlocks precisa ser replicada nas cópias. Os serviços ficam acoplados apenas pelo formato das mensagens, descrito no AsyncAPI, e não por uma biblioteca comum.

## ADR-027 — Um tipo de banco por serviço

**Contexto.** O enunciado exige um microsserviço com MongoDB Atlas e outro com Azure SQL Database, e cita a integração com múltiplos bancos. O plano anterior usava um servidor PostgreSQL com um banco por serviço (ADR-004).

**Decisão.** O Identity mantém o PostgreSQL. O Catalog passa a usar Azure SQL Database (SQL Server no ambiente local). O MarketData usa MongoDB Atlas (MongoDB no ambiente local). Continua valendo: nenhum serviço acessa o banco de outro e não há chaves entre bancos.

**Alternativas.** Nenhuma compatível com o enunciado.

**Justificativa.** Exigência do enunciado. O histórico de preços se ajusta bem a documentos, e o catálogo, com relacionamentos entre moeda e lista do usuário, a um banco relacional.

**Consequências.** Substitui o ADR-004. No Catalog, a troca fica restrita à camada Infrastructure. O ambiente local passa a ter três bancos diferentes.

## ADR-028 — Gateway gerenciado na nuvem, apenas na frente do BFF

**Contexto.** O enunciado pede um API Gateway responsável por roteamento, segurança e centralização de entrada, e define que o frontend consome somente o BFF. O plano anterior tinha um Gateway próprio em YARP, que roteava para o Identity e para o BFF (ADR-007 e ADR-016).

**Decisão.** O Gateway é um serviço gerenciado de API Gateway na nuvem, configurado para encaminhar todas as rotas ao BFF. O login deixa de ir do Gateway direto ao Identity: o BFF faz o proxy. O projeto YARP foi removido. No ambiente local não há Gateway; o frontend chama o BFF diretamente.

**Alternativas.** Publicar o YARP como contêiner, em um repositório adicional.

**Justificativa.** A lista de repositórios do enunciado não inclui um gateway, e o exemplo dado é um serviço gerenciado. Um serviço gerenciado atende roteamento, segurança e entrada única sem código próprio para manter.

**Consequências.** Substitui o ADR-007 e o ADR-016 e altera o ADR-017: o JWT continua sendo validado por quem recebe a requisição (BFF, Catalog, MarketData), e a validação no Gateway passa a ser configuração do serviço gerenciado. O produto específico é definido na fase 9.

## ADR-029 — Previsão como Azure Function HTTP, sem banco

**Contexto.** O enunciado define a Azure Function como um componente exposto por HTTP, consumido pelo BFF em `/aggregated-data`. O plano anterior tinha um microsserviço Prediction com banco próprio e uma Function disparada por mensagem (ADR-006, ADR-009 e ADR-010).

**Decisão.** A previsão passa a ser a Function `GetForecast`, com gatilho HTTP: recebe a série de preços e devolve a previsão na mesma chamada. Não há banco, e as entidades `Forecast` e `ModelRun` e o evento `ForecastGenerated` deixam de existir. O BFF busca o histórico no MarketData e o envia à Function. A linguagem do ML continua sendo .NET com ML.NET. A Function tem repositório próprio e segue as mesmas camadas dos serviços.

**Alternativas.** Manter o microsserviço Prediction além da Function.

**Justificativa.** Atende ao enunciado com menos componentes. Uma função sem estado, que só calcula, é o uso típico de serverless.

**Consequências.** Substitui o ADR-006 e o ADR-009 e altera o ADR-010. A previsão é recalculada a cada chamada, o que exige limitar o tamanho da série. O evento `PricesIngested` perde o consumidor previsto; um novo consumidor é definido na fase 5.

## ADR-030 — RabbitMQ gerenciado como broker da nuvem

**Contexto.** Os eventos precisam de um broker acessível na nuvem, mantendo o RabbitMQ no ambiente local. O plano anterior previa Azure Service Bus na nuvem (ADR-005 e ADR-023).

**Decisão.** Na nuvem, o broker é um RabbitMQ gerenciado. O mesmo adaptador de `IEventBus` atende o ambiente local e a nuvem, mudando apenas a configuração de conexão.

**Alternativas.** Azure Service Bus, com um segundo adaptador.

**Justificativa.** Tópicos no Service Bus exigem um plano pago e um adaptador que não poderia ser testado localmente. Um RabbitMQ gerenciado tem plano gratuito e usa o código já validado.

**Consequências.** Altera o ADR-005 e o ADR-023: a topologia continua a mesma, e a correspondência com tópicos do Service Bus deixa de ser necessária. A abstração `IEventBus` permanece, de modo que outro broker ainda pode ser adotado com um novo adaptador. A conexão na nuvem exige TLS, a ser tratado no adaptador.

## ADR-031 — Testes unitários e de arquitetura em cada repositório

**Contexto.** O enunciado exige testes unitários e de arquitetura em todos os projetos. Antes havia um único projeto de testes de arquitetura para todos os serviços (ADR-013) e nenhum teste unitário.

**Decisão.** Cada repositório .NET tem dois projetos de teste: `<Servico>.UnitTests` (xUnit) e `<Servico>.ArchitectureTests` (xUnit e NetArchTest). Os testes unitários usam dublês escritos à mão para as portas. O BFF usará as ferramentas equivalentes do ecossistema Node.

**Alternativas.** Biblioteca de mocks para os testes unitários.

**Justificativa.** As portas da camada Application são pequenas, e dublês explícitos deixam os testes legíveis sem acrescentar dependência.

**Consequências.** Substitui o ADR-013. A regra "serviços não referenciam outros serviços" deixa de ser verificada por teste e passa a ser garantida pela separação dos repositórios. As regras de arquitetura são repetidas em cada repositório.

## ADR-032 — Swagger em todos os serviços

**Contexto.** O enunciado exige Swagger documentado no BFF e nos microsserviços.

**Decisão.** Os serviços .NET usam Swashbuckle, com a interface em `/swagger`, habilitada em todos os ambientes. Cada endpoint declara, na própria slice, nome, resumo e respostas possíveis.

**Alternativas.** Habilitar o Swagger apenas em desenvolvimento.

**Justificativa.** A demonstração e os prints exigidos usam as URLs da nuvem, portanto o Swagger precisa estar disponível lá.

**Consequências.** A documentação da API fica exposta publicamente, o que é aceitável para um projeto acadêmico. A descrição do endpoint fica junto do código que ele documenta.

## ADR-033 — CRUD do catálogo separado da lista do usuário

**Contexto.** Na fase 4 original, uma criptomoeda entrava no catálogo de forma implícita, quando o primeiro usuário a adicionava à sua lista. O enunciado final exige CRUD completo no microsserviço e o grupo pediu os eventos `CryptoRegistered` e `CryptoRemoved` (decisão D4 da análise de impacto).

**Decisão.** O Catalog tem dois recursos. `/cryptos` é o CRUD do catálogo (`CreateCrypto`, `ListCryptos`, `GetCrypto`, `UpdateCrypto`, `DeleteCrypto`); `CreateCrypto` publica `CryptoRegistered` e `DeleteCrypto` publica `CryptoRemoved`. `/user-cryptos` é a lista do usuário (`AddUserCrypto`, `ListUserCryptos`, `GetUserCrypto`, `UpdateUserCrypto`, `RemoveUserCrypto`) e referencia uma criptomoeda já cadastrada. O `coinGeckoId` não pode ser alterado. A exclusão de uma criptomoeda que está na lista de algum usuário é recusada com 409.

**Alternativas.** Manter a criação implícita e publicar `CryptoRemoved` quando o último usuário removesse a moeda. Excluir em cascata os itens das listas.

**Justificativa.** Dois recursos com CRUD próprio correspondem à leitura literal do enunciado e deixam claro quando cada evento acontece. Bloquear a exclusão evita que um usuário apague itens da lista de outros. O `coinGeckoId` é a chave pela qual o MarketData coleta o histórico; mudá-lo exigiria outro evento.

**Consequências.** Para excluir uma criptomoeda, ela precisa sair antes de todas as listas. Qualquer usuário autenticado pode manter o catálogo, pois não há papéis de administrador.

## ADR-034 — Catalog em Azure SQL com EF Core, retentativa e datas em UTC

**Contexto.** O enunciado exige Azure SQL Database (plano gratuito) para o microsserviço SQL. O plano gratuito pausa o banco quando ocioso, e a primeira conexão depois da pausa pode falhar. A máquina de desenvolvimento é ARM64, e a imagem do SQL Server é apenas x64.

**Decisão.** O Catalog usa `Microsoft.EntityFrameworkCore.SqlServer` com `EnableRetryOnFailure`. No ambiente local, o banco é um SQL Server 2022 em contêiner, executado por emulação. As datas são gravadas em UTC e um conversor as marca como UTC na leitura. As migrations continuam sendo aplicadas na inicialização (ADR-019).

**Alternativas.** Desenvolver direto contra o Azure SQL. Azure SQL Edge, que tem imagem ARM64 mas foi descontinuado.

**Justificativa.** O SQL Server em contêiner é o mesmo motor do Azure SQL, roda sem custo e foi testado nesta máquina. A retentativa cobre o despertar do banco pausado sem código adicional. Sem o conversor, as datas voltariam do banco sem a indicação de UTC.

**Consequências.** Domain e Application não mudaram com a troca de banco; apenas a Infrastructure e a migration. O contêiner emulado demora mais para iniciar. Com retentativa ativa, transações explícitas precisariam usar a estratégia de execução do EF Core; o Catalog não usa transações explícitas.

## ADR-035 — Consumo de eventos como entrada de slice, com uma reentrega

**Contexto.** O MarketData consome `CryptoRegistered` e `CryptoRemoved`, e o Catalog consome `PricesIngested`. Até aqui só existia o lado publicador da mensageria (ADR-005, ADR-023 e ADR-030).

**Decisão.** Uma slice acionada por evento tem um `<Slice>Consumer`, que implementa `IEventConsumer<TEvent>`, monta o command e chama o handler, como o endpoint faz para HTTP. `AddEventConsumers` registra os consumidores do assembly e cria uma inscrição por evento. No RabbitMQ, `RabbitMqConsumerService` cria, para cada inscrição, uma fila durável `<servico>.<NomeDoEvento>` ligada à exchange pelo nome do evento, e entrega cada mensagem em um escopo próprio de injeção de dependência. Uma mensagem que falha é reentregue uma vez; se falhar de novo, é descartada e registrada no log. Os handlers acionados por eventos são idempotentes.

**Alternativas.** Tratar a mensagem diretamente no serviço em segundo plano, fora das slices. Fila de mensagens mortas.

**Justificativa.** Tratar o evento como mais uma entrada de slice mantém o mesmo padrão de endpoint, command e handler, e o mesmo teste de convenção de nomes. Uma fila por serviço e evento garante que cada consumidor receba sua cópia. A reentrega única cobre falhas passageiras sem prender a fila com uma mensagem que sempre falha.

**Consequências.** Uma mensagem que falha duas vezes se perde; em produção, uma fila de mensagens mortas seria o adequado. Repetir um evento não duplica dados, porque os handlers usam upsert ou ignoram dados mais antigos.

## ADR-036 — MarketData em MongoDB sem atributos do driver no Domain

**Contexto.** O MarketData usa MongoDB (ADR-027). O driver costuma ser configurado por atributos nas classes, o que colocaria uma dependência do MongoDB no Domain.

**Decisão.** O mapeamento é feito em `MongoMappings`, na Infrastructure, com `BsonClassMap`: nomes de campo em camelCase, preço em Decimal128, origem do preço como texto, GUIDs no formato padrão. As entidades são reconstruídas pelos seus construtores privados. Os índices são criados na inicialização da API. O histórico é gravado com upsert por (criptomoeda, instante).

**Alternativas.** Atributos do driver nas entidades. Classes de documento separadas, com conversão para as entidades.

**Justificativa.** O Domain continua sem dependências, o que o teste de arquitetura verifica. O mapeamento explícito evita duplicar cada entidade em uma classe de documento. Decimal128 preserva o valor exato do preço. O upsert torna a coleta e a carga inicial repetíveis.

**Consequências.** Toda propriedade nova de uma entidade precisa ser mapeada em `MongoMappings`. Não há migrations: o esquema é o das classes, e os índices são criados de forma idempotente.

## ADR-037 — Coleta da CoinGecko por endpoint protegido por chave

**Contexto.** O enunciado indica a CoinGecko como fonte de preços e prevê, como opcional, uma Function agendada de coleta (decisão D7). A Function não tem usuário e, portanto, não tem JWT.

**Decisão.** O MarketData expõe `POST /prices/collect`, que coleta o preço atual de todos os ativos em uma única chamada à CoinGecko e publica `PricesIngested` por ativo. A rota exige a chave configurada em `Collector:ApiKey` no cabeçalho `X-Api-Key`. A carga inicial de 90 dias acontece quando o MarketData recebe `CryptoRegistered`. O acesso à CoinGecko fica atrás da porta `IMarketPriceProvider`; o endereço é configurável, e a chave do plano Demo é opcional.

**Alternativas.** Agendar a coleta dentro do próprio MarketData. Uma Function que acessasse diretamente o banco do MarketData.

**Justificativa.** O agendamento fica na Function, que é o componente serverless do sistema, e a coleta, no serviço dono dos dados. Um contêiner em plano gratuito pode hibernar, o que interromperia um agendamento interno. A Function não acessa o banco de outro serviço.

**Consequências.** A chave de coleta é um segredo compartilhado entre o MarketData e a Function. O endereço configurável permitiu testar o fluxo localmente com uma CoinGecko simulada, já que a API real está bloqueada pelo DNS da rede de desenvolvimento.

## ADR-038 — Catalog guarda o último preço a partir de `PricesIngested`

**Contexto.** Com a previsão passando a ser uma chamada HTTP (ADR-029), `PricesIngested` ficou sem consumidor. A lista do usuário se beneficia de mostrar o preço atual de cada criptomoeda (decisão D5).

**Decisão.** O Catalog consome `PricesIngested` na slice `UpdateLatestPrice` e guarda `latestPriceUsd` e `latestPriceAt` na criptomoeda. Um preço mais antigo que o já guardado é ignorado, e um evento de uma criptomoeda já excluída também. Os dois campos aparecem nas respostas do catálogo e da lista do usuário.

**Alternativas.** Publicar o evento sem consumidor. O Catalog consultar o MarketData a cada listagem.

**Justificativa.** O evento passa a ter efeito visível, e o fluxo entre Catalog e MarketData fica nos dois sentidos, sem chamadas síncronas entre eles.

**Consequências.** O último preço no Catalog é uma cópia com consistência eventual: pode estar alguns instantes atrás do MarketData. O histórico completo continua só no MarketData.

## ADR-039 — Previsão por regressão SDCA do ML.NET sobre variações de preço

**Contexto.** O ADR-010 escolheu o ML.NET e deixou pendente confirmar que o forecasting por SSA (Singular Spectrum Analysis) rodava na máquina de desenvolvimento, que é ARM64. O teste feito no início da fase 6 mostrou que o SSA depende da Intel MKL: falha em ARM64 e, em x64, exige um pacote nativo adicional e grande.

**Decisão.** A previsão usa a regressão SDCA do ML.NET, que é totalmente gerenciada. O modelo aprende a próxima variação percentual do preço a partir das 7 variações anteriores, com as entradas padronizadas, e projeta a série passo a passo. O intervalo de 95% vem do desvio padrão do erro do modelo na própria série e cresce com a raiz do número de passos. O treino usa semente fixa, uma thread e nenhum embaralhamento, para que a mesma série gere sempre a mesma previsão. O modelo é treinado a cada chamada, com a série recebida.

**Alternativas.** SSA com o pacote da Intel MKL, rodando apenas em x64. Regressão sobre os preços normalizados, em vez das variações. Modelo treinado previamente e armazenado.

**Justificativa.** O SDCA roda nas duas arquiteturas, o que permite executar os testes do modelo na máquina de desenvolvimento e na nuvem, e não aumenta o pacote da Function. Nos testes com séries sintéticas, a regressão sobre preços normalizados amortecia tendências (uma série em alta gerava previsão em queda); sobre as variações, e com entradas padronizadas, a tendência é preservada. Treinar a cada chamada dispensa armazenamento e mantém a Function sem estado.

**Consequências.** Altera o ADR-010: a linguagem e a biblioteca continuam as mesmas, e muda a técnica. O modelo é simples, adequado para demonstração; segue a tendência recente e não antecipa mudanças bruscas. O tempo de treino cresce com o tamanho da série, limitada a 1.000 pontos.

## ADR-040 — Function App em camadas, com os gatilhos na camada API

**Contexto.** O enunciado exige Clean Architecture e Vertical Slice em todos os projetos, inclusive na Azure Function. Nos microsserviços, o endpoint fica dentro da slice, na Application (ADR-002). Os gatilhos de uma Function, porém, dependem do SDK do Azure Functions.

**Decisão.** O repositório da Function tem as mesmas quatro camadas dos microsserviços. A camada API é o próprio Function App: as classes de gatilho (`GetForecastFunction`, `CollectPricesFunction`) ficam em `Api/Functions` e apenas validam a entrada e chamam o handler da slice. A Application contém query ou command, validador e handler, e não depende do SDK do Azure Functions nem do ML.NET, o que os testes de arquitetura verificam. `GetForecast` exige a chave da Function; as respostas de erro seguem o formato Problem Details dos microsserviços. No ambiente local, a Function roda na imagem oficial do runtime, com chaves fixas de desenvolvimento.

**Alternativas.** Colocar os gatilhos na Application, como os endpoints. Uma Function sem camadas.

**Justificativa.** Manter o SDK do Azure Functions fora da Application preserva a regra de dependência: a lógica de previsão não sabe se é chamada por HTTP, por agendamento ou por um teste. A chave da Function protege a rota sem exigir o JWT do usuário, que o BFF não precisa repassar.

**Consequências.** A slice da Function fica dividida entre a Application e a classe de gatilho na API, diferente dos microsserviços; os testes de convenção de nomes valem para a parte que está na Application. A Function não tem Swagger; o contrato está documentado no README.

## ADR-041 — Coleta agendada por Function que chama o MarketData

**Contexto.** A decisão D7 incluiu a Function agendada de coleta, prevista como opcional no enunciado. O ADR-037 definiu que a coleta é feita pelo MarketData, em `POST /prices/collect`, protegido por chave.

**Decisão.** A Function `CollectPrices`, com gatilho agendado (CRON configurável em `CollectPricesSchedule`, padrão a cada 30 minutos), chama `POST /prices/collect` no MarketData com a chave de coleta. A Function não acessa a CoinGecko nem o banco do MarketData. Ela fica no mesmo Function App de `GetForecast`.

**Alternativas.** Um Function App separado para a coleta. A Function acessar a CoinGecko e o MongoDB diretamente.

**Justificativa.** Um único Function App reduz o número de recursos a publicar e manter. A coleta continua no serviço dono dos dados, e a Function cuida só do agendamento, o papel típico de um componente serverless.

**Consequências.** Substitui, para a coleta, o ADR-006 (a Function não faz mais parte do serviço dono). O gatilho agendado exige um Azure Storage para o runtime (Azurite no ambiente local). Se o MarketData estiver fora do ar, a execução registra o erro e a próxima tenta de novo.
