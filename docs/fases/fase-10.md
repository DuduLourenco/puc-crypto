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

## 3. Pendências do grupo

- Prints do Portal Azure: grupo de recursos, Container App do frontend com a imagem do Docker Hub e a API no API Management.
- Gravação do vídeo e o link no ARC42.
- Diagramas do C4 e o Canvas, a partir dos insumos do checklist.
- Depois da avaliação, apagar os recursos da nuvem: `az group delete -n rg-puccrypto`.
