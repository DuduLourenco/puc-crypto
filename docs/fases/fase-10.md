# Fase 10 — Insumos para a documentação final

Esta fase reúne o que o grupo precisa para montar o PDF da entrega: os links do ARC42, a lista de prints, os elementos do C4 e do Software Architecture Canvas e um roteiro para o vídeo. Não há código novo. O checklist completo está em [checklist-entrega.md](../checklist-entrega.md).

## 1. O que foi entregue

| Item do enunciado | Onde está | Situação |
|---|---|---|
| Links do ARC42 (GitHub, Docker Hub, Swagger, eventos, frontend, API Gateway) | [checklist-entrega.md](../checklist-entrega.md), seção 1 | Pronto |
| Prints do Swagger do BFF e dos microsserviços | [entrega-deploy/](../entrega-deploy/README.md) | Pronto |
| Prints do frontend | [entrega-deploy/](../entrega-deploy/README.md) | Pronto |
| Print do API Gateway e do Portal Azure | Passo a passo no checklist, seção 2 | Pendente: exige o login do grupo no portal |
| C4 (contexto, containers, componentes) | Checklist, seção 3, com links para o inventário de cada fase | Insumos prontos; o desenho é do grupo |
| Software Architecture Canvas | Checklist, seção 4 | Insumos prontos; o preenchimento é do grupo |
| Vídeo no YouTube | Roteiro no checklist, seção 5 | Pendente: gravação do grupo |

## 2. Verificação realizada

- Todos os links da seção 1 do checklist responderam 200, incluindo o Swagger do BFF pela URL do API Gateway (`/api/swagger`). A raiz do Gateway, `/api`, responde 404, porque o BFF não tem rota na raiz; por isso o link do Gateway aponta para `/api/swagger`.
- Login da conta de demonstração pelo API Gateway e `GET /aggregated-data` com Bitcoin, Ethereum e Solana, com histórico e previsão, depois da mudança do Identity para o Azure SQL (fase 9, seção 7).

## 3. Correção da previsão

Ao revisar o dashboard publicado, a previsão levava o SOL a zero em 7 dias e o ETH em 30. A correção está no ADR-053.

**Causa.** Dos 90 preços de cada moeda, 44 eram diários (a carga inicial da CoinGecko) e 43 vinham da coleta agendada, a cada 30 minutos. O modelo trata cada intervalo como um passo igual e usa cada variação prevista como entrada da seguinte; com variações diárias e de 30 minutos misturadas, o erro crescia a cada passo até o preço chegar a zero (no SOL: 102 → 105 → 93 → 119 → 35 → 96 → 0). Rodando o modelo na máquina com a série da nuvem, os mesmos números se repetiram; com só a parte diária ou só a de 30 minutos, a previsão ficava estável. Com séries curtas, de 14 a 20 pontos, o modelo também decorava a série: o BTC subia 60% em 30 dias, com uma faixa de confiança quase nula.

| Componente | Arquivo | Mudança |
|---|---|---|
| MarketData | `Features/CollectPrices/CollectPricesHandler.cs` | A coleta grava o preço atual e remove os preços anteriores do mesmo dia (UTC): um preço por dia |
| MarketData | `IPricePointRepository`, `PricePointRepository` | Novo `DeleteInRangeAsync` |
| Function | `Domain/Forecasting/PriceSeries.cs` | Intervalo típico pela mediana ponderada pela duração; série com intervalos misturados regularizada |
| Function | `MachineLearning/LagRegressionForecastModel.cs` | Variação prevista limitada à faixa do histórico; regularização L2 forte no SDCA |
| Nuvem | Dados do MarketData | Preços de 30 minutos já gravados reduzidos a um por dia, pela API |

Testes novos, cada um conferido falhando sem a correção correspondente: coleta que mantém um preço por dia (MarketData); regularização e intervalo típico de séries misturadas (`PriceSeries`); série misturada que não leva o preço a zero e série curta sem variações extremas (modelo).

Comparação na máquina, com a série real do SOL (último preço 103,81), previsão para 7 e 30 passos:

| Série | Antes | Depois |
|---|---|---|
| 90 preços da nuvem, misturados | 0,00 e 0,00 | 103,82 e 103,90 (faixa de 71 a 137 em 30 dias) |
| 14 preços diários do BTC (último 84.082) | 94.055 e 135.933 | 85.904 e 91.531 |

Verificação na nuvem, depois do deploy do MarketData e da Function:

- A coleta nova apagou sozinha, já na primeira execução, os preços de 30 minutos do dia; a limpeza pela API removeu os 2 restantes do dia anterior em cada moeda. Ficaram 91 preços em 91 dias para BTC, ETH e SOL.
- As coletas seguintes (22:00 e 22:30 UTC) substituíram o preço do dia, sem acrescentar outro; o último preço no Catalog acompanhou cada coleta.
- `GET /aggregated-data` pelo Gateway, com histórico de 30, 90 e 180 preços e previsão de 7, 14 e 30 dias: em todas as combinações, histórico e previsão `ok`, previsão em passos de um dia e variação em 30 dias entre −6,1% e +4,0%, com a faixa de 95% abrindo com o horizonte.
- Navegador: fluxo de demonstração sem erros no console; prints do dashboard refeitos, e o novo [site-5-dashboard-sol-30-dias.png](../entrega-deploy/site-5-dashboard-sol-30-dias.png) mostra o SOL com previsão de 30 dias (US$ 103,49 → US$ 107,66).

## 4. Partida a frio do login

Durante a verificação, o primeiro login depois de cerca de 20 minutos sem uso devolveu 502. Pelos logs do Azure, o Identity, que escalava a zero, levou quase um minuto para iniciar, e o BFF desistiu depois de 20 segundos. Com o Identity ativo, um novo teste depois de 15 minutos parado levou 47 segundos, desta vez esperando o contêiner do BFF (44 segundos para iniciar). O frontend voltou em 5 segundos.

Correção (ADR-054), no `infra/azure/deploy.sh` e aplicada na nuvem: Identity e BFF mantêm uma réplica ativa (cerca de US$ 6 por mês cada), e o BFF espera até 60 segundos pelos serviços, o que cobre a partida a frio da Function.

Depois da mudança, às 23:33 UTC, com uma réplica ativa no BFF e no Identity: primeiro login pelo Gateway em 4,9 segundos, os seguintes em cerca de 2 segundos, e `/aggregated-data` com previsão de 30 dias em 4,5 segundos. A coleta das 23:30 também substituiu o preço do dia. Um teste agendado no meio do caminho foi descartado: o computador que media entrou em repouso durante a execução.

## 5. Pendências do grupo

- Prints do Portal Azure: grupo de recursos, Container App do frontend com a imagem do Docker Hub e a API no API Management.
- Gravação do vídeo e o link no ARC42.
- Diagramas do C4 e o Canvas, a partir dos insumos do checklist.
- Depois da avaliação, apagar os recursos da nuvem: `az group delete -n rg-puccrypto`.
