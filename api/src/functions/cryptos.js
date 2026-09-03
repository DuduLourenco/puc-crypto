const { app } = require('@azure/functions');
const { getCryptosCollection } = require('../shared/mongo');
const { ok, created, fail, parseId, validateCrypto, readJson } = require('../shared/http');
const { MARKET_OVERVIEW, enrichCrypto, rankByMarketCap } = require('../shared/market');

const DUPLICATE_KEY = 11000;

const SORTABLE = ['rank', 'name', 'priceBrl', 'change24h', 'marketCapBrl', 'volume24hBrl'];

/** Ordena a lista já enriquecida, respeitando ?sortBy= e ?order= */
function applySort(list, sortBy, order) {
  const field = SORTABLE.includes(sortBy) ? sortBy : 'rank';
  const dir = order === 'desc' ? -1 : 1;

  return [...list].sort((a, b) => {
    const x = a[field];
    const y = b[field];
    if (typeof x === 'string') return x.localeCompare(y, 'pt-BR') * dir;
    return (x - y) * dir;
  });
}

/**
 * GET /api/cryptos
 * Listagem para o dashboard: o banco é a fonte de name/symbol e o catálogo
 * completa as métricas de mercado. Aceita ?search=, ?sortBy=, ?order=, ?limit=
 */
app.http('listCryptos', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'cryptos',
  handler: async (request, context) => {
    try {
      const search = (request.query.get('search') || '').trim();
      const limit = Math.min(Number(request.query.get('limit')) || 100, 200);
      const category = (request.query.get('category') || '').trim();

      const filter = search
        ? {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { symbol: { $regex: search, $options: 'i' } },
            ],
          }
        : {};

      const collection = await getCryptosCollection();
      const docs = await collection.find(filter).toArray();

      let data = rankByMarketCap(docs.map(enrichCrypto));
      if (category) data = data.filter((c) => c.category === category);
      data = applySort(data, request.query.get('sortBy'), request.query.get('order')).slice(0, limit);

      return ok(data, {
        timestamp: new Date().toISOString(),
        currency: 'BRL',
        total: data.length,
        marketOverview: MARKET_OVERVIEW,
      });
    } catch (err) {
      context.error('Erro ao listar criptomoedas', err);
      return fail(500, 'Erro ao consultar o banco de dados', err.message);
    }
  },
});

/**
 * GET /api/cryptos/{id}
 */
app.http('getCrypto', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'cryptos/{id}',
  handler: async (request, context) => {
    const _id = parseId(request.params.id);
    if (!_id) return fail(400, 'Id inválido');

    try {
      const collection = await getCryptosCollection();
      const doc = await collection.findOne({ _id });
      if (!doc) return fail(404, 'Criptomoeda não encontrada');

      return ok(enrichCrypto(doc));
    } catch (err) {
      context.error('Erro ao buscar criptomoeda', err);
      return fail(500, 'Erro ao consultar o banco de dados', err.message);
    }
  },
});

/**
 * POST /api/cryptos  { "name": "Bitcoin", "symbol": "BTC" }
 */
app.http('createCrypto', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'cryptos',
  handler: async (request, context) => {
    const body = await readJson(request);
    const { errors, data } = validateCrypto(body);
    if (errors.length) return fail(400, 'Dados inválidos', errors);

    try {
      const collection = await getCryptosCollection();
      const now = new Date().toISOString();
      const doc = { ...data, createdAt: now, updatedAt: now };

      const result = await collection.insertOne(doc);
      return created(enrichCrypto({ _id: result.insertedId, ...doc }));
    } catch (err) {
      if (err.code === DUPLICATE_KEY) {
        return fail(409, `Já existe uma criptomoeda com o símbolo ${data.symbol}`);
      }
      context.error('Erro ao cadastrar criptomoeda', err);
      return fail(500, 'Erro ao gravar no banco de dados', err.message);
    }
  },
});

/**
 * PUT /api/cryptos/{id}
 */
app.http('updateCrypto', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'cryptos/{id}',
  handler: async (request, context) => {
    const _id = parseId(request.params.id);
    if (!_id) return fail(400, 'Id inválido');

    const body = await readJson(request);
    const { errors, data } = validateCrypto(body, { partial: true });
    if (errors.length) return fail(400, 'Dados inválidos', errors);

    try {
      const collection = await getCryptosCollection();
      const doc = await collection.findOneAndUpdate(
        { _id },
        { $set: { ...data, updatedAt: new Date().toISOString() } },
        { returnDocument: 'after' }
      );

      if (!doc) return fail(404, 'Criptomoeda não encontrada');

      return ok(enrichCrypto(doc));
    } catch (err) {
      if (err.code === DUPLICATE_KEY) {
        return fail(409, `Já existe uma criptomoeda com o símbolo ${data.symbol}`);
      }
      context.error('Erro ao editar criptomoeda', err);
      return fail(500, 'Erro ao gravar no banco de dados', err.message);
    }
  },
});

/**
 * DELETE /api/cryptos/{id}
 */
app.http('deleteCrypto', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'cryptos/{id}',
  handler: async (request, context) => {
    const _id = parseId(request.params.id);
    if (!_id) return fail(400, 'Id inválido');

    try {
      const collection = await getCryptosCollection();
      const result = await collection.deleteOne({ _id });
      if (result.deletedCount === 0) return fail(404, 'Criptomoeda não encontrada');

      return ok({ id: request.params.id, deleted: true });
    } catch (err) {
      context.error('Erro ao excluir criptomoeda', err);
      return fail(500, 'Erro ao gravar no banco de dados', err.message);
    }
  },
});
