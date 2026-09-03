# PUC Crypto — API (Azure Functions + MongoDB Atlas)

CRUD de criptomoedas (`name` + `symbol`) em Azure Functions Node.js (modelo de
programação v4), com persistência no MongoDB Atlas.

## Endpoints

| Método | Rota                 | Descrição                          |
| ------ | -------------------- | ---------------------------------- |
| GET    | `/api/cryptos`       | Listagem (`?search=`, `?limit=`)   |
| GET    | `/api/cryptos/{id}`  | Detalhe                            |
| POST   | `/api/cryptos`       | Cadastro                           |
| PUT    | `/api/cryptos/{id}`  | Edição                             |
| DELETE | `/api/cryptos/{id}`  | Exclusão                           |

Corpo de cadastro/edição:

```json
{ "name": "Bitcoin", "symbol": "BTC" }
```

Resposta padrão:

```json
{ "success": true, "data": { "id": "…", "name": "Bitcoin", "symbol": "BTC" } }
```

## Rodando localmente

```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true   # uma vez
cd api
npm install
cp local.settings.json.example local.settings.json               # preencha MONGODB_URI
npm start                                                        # http://localhost:7071/api/cryptos
```

`local.settings.json` está no `.gitignore` — a connection string do Atlas nunca
vai para o repositório. Em produção ela vive nas *Application settings* do
Function App.

## Variáveis de ambiente

| Nome          | Descrição                                    |
| ------------- | -------------------------------------------- |
| `MONGODB_URI` | Connection string do cluster no Atlas         |
| `MONGODB_DB`  | Nome do banco (padrão: `puccrypto`)           |
