# PUC Crypto - Plataforma de Cotações & Dashboard Informativo

Projeto desenvolvido com **React + TypeScript + Vite** integrado a um backend **Serverless no Microsoft Azure (Azure Functions em Node.js)** para acompanhamento de cotações de criptomoedas em Reais (BRL), métricas globais e informações de perfil de usuário.

---

## ☁️ Criando e Publicando Direto no Azure via Cloud Shell (CLI)

Se você preferir criar e subir a API direto pelo **Azure Cloud Shell (Bash)**, basta colar o script abaixo:

```bash
# 1. Definir variáveis (nomes únicos)
RAND=$RANDOM
RESOURCE_GROUP="rg-puc-crypto"
LOCATION="brazilsouth" # ou "eastus"
STORAGE_ACCOUNT="stpucrypto${RAND}"
FUNCTION_APP="puc-crypto-api-${RAND}"

# 2. Criar Grupo de Recursos e Storage Account
az group create --name $RESOURCE_GROUP --location $LOCATION
az storage account create --name $STORAGE_ACCOUNT --location $LOCATION --resource-group $RESOURCE_GROUP --sku Standard_LRS

# 3. Criar a Function App (Node.js 20 Linux)
az functionapp create \
  --resource-group $RESOURCE_GROUP \
  --consumption-plan-location $LOCATION \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4 \
  --name $FUNCTION_APP \
  --storage-account $STORAGE_ACCOUNT \
  --os-type Linux

# 4. Configurar CORS para permitir o React
az functionapp cors add \
  --resource-group $RESOURCE_GROUP \
  --name $FUNCTION_APP \
  --allowed-origins "http://localhost:3000" "*"
```

---

## 📁 Estrutura do Projeto Frontend

- `src/components/layout/`: Barra de navegação slim, Cabeçalho, Subheader com abas.
- `src/components/dashboard/`: Hero Banner, Highlights Globais em R$, Tabela de Criptomoedas, Módulo para Futuro Gráfico e Card de Favoritos.
- `src/services/`: Cliente HTTP resiliente (`apiClient.ts`) com fallback transparente para mock caso a API Azure esteja offline.
- `openapi.yaml` / `openapi.json`: Especificação completa OpenAPI 3.0 para a API.

---

## ⚡ Como Criar e Estruturar o Backend Azure Functions (Node.js)

### 1. Inicializar o Projeto Azure Functions (Node.js v4)
Se estiver usando a CLI do Azure Functions (`azure-functions-core-tools`):

```bash
# Instalar a CLI do Azure Functions (se ainda não tiver)
npm install -g azure-functions-core-tools@4 --unsafe-perm true

# Criar a pasta do backend
mkdir puc-crypto-backend
cd puc-crypto-backend

# Inicializar projeto Node.js v4
func init --model V4 --worker-runtime node --language javascript
```

---

### 2. Criar os Endpoints

#### A) Endpoint `GET /api/cryptos` (`src/functions/cryptos.js`)

```javascript
const { app } = require('@azure/functions');

// Dados iniciais de cotação em Reais (BRL)
const CRYPTOS_DATA = [
  {
    rank: 1,
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    iconUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    priceBrl: 348920.50,
    change24h: 3.92,
    high24h: 352100.00,
    low24h: 341500.00,
    volume24hBrl: 145890200.00,
    marketCapBrl: 6890450120300.00,
    circulatingSupply: '19.7M BTC',
    category: 'layer1',
    sparkline7d: [330000, 334000, 332000, 339000, 342500, 345000, 348920.50],
  },
  {
    rank: 2,
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    iconUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    priceBrl: 18450.20,
    change24h: -0.74,
    high24h: 18900.00,
    low24h: 18200.00,
    volume24hBrl: 85200300.00,
    marketCapBrl: 2220100450000.00,
    circulatingSupply: '120.2M ETH',
    category: 'layer1',
    sparkline7d: [18900, 18750, 18600, 18300, 18550, 18400, 18450.20],
  },
  {
    rank: 3,
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    iconUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    priceBrl: 982.40,
    change24h: 8.24,
    high24h: 995.00,
    low24h: 905.00,
    volume24hBrl: 36400000.00,
    marketCapBrl: 456000000000.00,
    circulatingSupply: '465.1M SOL',
    category: 'layer1',
    sparkline7d: [890, 905, 920, 915, 940, 960, 982.40],
  },
];

app.http('cryptos', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const search = request.query.get('search')?.toLowerCase();
    const category = request.query.get('category');

    let result = [...CRYPTOS_DATA];

    if (search) {
      result = result.filter(
        (c) => c.name.toLowerCase().includes(search) || c.symbol.toLowerCase().includes(search)
      );
    }

    if (category && category !== 'all') {
      result = result.filter((c) => c.category === category);
    }

    return {
      status: 200,
      jsonBody: {
        success: true,
        timestamp: new Date().toISOString(),
        currency: 'BRL',
        total: result.length,
        data: result,
        marketOverview: {
          totalMarketCapBrl: 14850000000000.00,
          totalVolume24hBrl: 485900000000.00,
          btcDominancePercent: 57.2,
          ethDominancePercent: 18.4,
          solDominancePercent: 8.5,
          marketChange24h: 2.7,
        },
      },
    };
  },
});
```

---

#### B) Endpoint `GET /api/me` (`src/functions/me.js`)

```javascript
const { app } = require('@azure/functions');

app.http('me', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          id: 'usr_puc_991823',
          name: 'Eduardo Lourenço',
          email: 'eduardo@puc-crypto.com.br',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: 'Analista de Mercado',
          organization: 'PUC Minas / Crypto Lab',
          watchlist: [
            {
              id: 'fav_1',
              cryptoId: 'bitcoin',
              symbol: 'BTC',
              name: 'Bitcoin (BTC)',
              iconUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
              addedAt: 'Adicionado recentemente',
            },
            {
              id: 'fav_2',
              cryptoId: 'solana',
              symbol: 'SOL',
              name: 'Solana (SOL)',
              iconUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
              addedAt: 'Adicionado recentemente',
            },
          ],
          preferences: {
            currency: 'BRL',
            theme: 'light',
            language: 'pt-BR',
            notificationsEnabled: true,
          },
          createdAt: '2025-01-15T10:00:00Z',
          lastLogin: 'Hoje',
        },
        unreadNotifications: 2,
        serverRegion: 'brazilsouth (Azure)',
      },
    };
  },
});
```

---

### 3. Configurar CORS (Fundamental para o React acessar a Function)

No arquivo `local.settings.json` do Azure Functions:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node"
  },
  "Host": {
    "CORS": "*"
  }
}
```

No **Portal do Azure** (quando publicar):
1. Vá na sua **Function App**.
2. No menu lateral esquerdo, vá em **API** -> **CORS**.
3. Adicione `http://localhost:3000` (desenvolvimento) e o domínio de produção.

---

### 4. Rodar Localmente e Conectar ao Frontend

```bash
# No backend Azure Functions:
func start
# A API estará rodando em: http://localhost:7071/api
```

No arquivo `.env` do frontend React (`puc-crypto/.env`):
```env
VITE_AZURE_API_URL=http://localhost:7071/api
VITE_USE_MOCK_FALLBACK=true
```

Em seguida, execute o frontend:
```bash
npm run dev
```
