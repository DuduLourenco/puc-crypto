const { MongoClient } = require('mongodb');

/**
 * A conexão é criada uma única vez por instância da Function e reaproveitada
 * entre invocações (evita estourar o limite de conexões do Atlas em cold starts).
 */
let clientPromise = null;
let indexesReady = false;

function getClient() {
  if (!clientPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('Variável de ambiente MONGODB_URI não configurada');
    }

    clientPromise = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 8000,
      retryWrites: true,
    })
      .connect()
      .catch((err) => {
        // Zera o cache para que a próxima invocação tente conectar de novo
        clientPromise = null;
        throw err;
      });
  }

  return clientPromise;
}

/**
 * Retorna a collection de criptomoedas, garantindo o índice único de símbolo.
 */
async function getCryptosCollection() {
  const client = await getClient();
  const collection = client.db(process.env.MONGODB_DB || 'puccrypto').collection('cryptos');

  if (!indexesReady) {
    await collection.createIndex({ symbol: 1 }, { unique: true });
    indexesReady = true;
  }

  return collection;
}

module.exports = { getClient, getCryptosCollection };
