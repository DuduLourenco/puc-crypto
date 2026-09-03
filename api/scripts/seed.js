/**
 * Popula a collection `cryptos` com as moedas do catálogo de mercado.
 *
 *   npm run seed            (lê MONGODB_URI de local.settings.json)
 *
 * É idempotente: usa upsert por símbolo, então rodar de novo não duplica nada
 * nem sobrescreve o nome que alguém tenha editado pela API.
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { MARKET_CATALOG } = require('../src/shared/market');

function loadEnv() {
  if (process.env.MONGODB_URI) {
    return { uri: process.env.MONGODB_URI, db: process.env.MONGODB_DB || 'puccrypto' };
  }
  const file = path.join(__dirname, '..', 'local.settings.json');
  if (!fs.existsSync(file)) {
    throw new Error('Defina MONGODB_URI ou crie api/local.settings.json');
  }
  const { Values } = JSON.parse(fs.readFileSync(file, 'utf8'));
  return { uri: Values.MONGODB_URI, db: Values.MONGODB_DB || 'puccrypto' };
}

// Nome de exibição por símbolo — o catálogo guarda métricas, não o nome
const NOMES = {
  BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana', ADA: 'Cardano', XRP: 'XRP',
  DOT: 'Polkadot', AVAX: 'Avalanche', LINK: 'Chainlink', UNI: 'Uniswap', USDT: 'Tether',
};

(async () => {
  const { uri, db } = loadEnv();
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });

  try {
    await client.connect();
    const col = client.db(db).collection('cryptos');
    await col.createIndex({ symbol: 1 }, { unique: true });

    const now = new Date().toISOString();
    let inseridos = 0;

    for (const symbol of Object.keys(MARKET_CATALOG)) {
      const res = await col.updateOne(
        { symbol },
        {
          $setOnInsert: {
            name: NOMES[symbol] || symbol,
            symbol,
            iconUrl: MARKET_CATALOG[symbol].iconUrl,
            createdAt: now,
          },
          $set: { updatedAt: now },
        },
        { upsert: true }
      );
      // backfill: preenche o ícone de quem foi criado antes deste campo existir,
      // sem tocar em quem já tem um ícone customizado pelo CRUD
      await col.updateOne(
        { symbol, $or: [{ iconUrl: { $exists: false } }, { iconUrl: '' }] },
        { $set: { iconUrl: MARKET_CATALOG[symbol].iconUrl } }
      );

      if (res.upsertedCount) {
        inseridos++;
        console.log(`+ ${symbol} — ${NOMES[symbol]}`);
      } else {
        console.log(`· ${symbol} já existia`);
      }
    }

    console.log(`\n${inseridos} inseridos. Total na collection: ${await col.countDocuments()}`);
  } finally {
    await client.close();
  }
})().catch((err) => {
  console.error(`✗ ${err.name}: ${err.message.split('\n')[0]}`);
  process.exit(1);
});
