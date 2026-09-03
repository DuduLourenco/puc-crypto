/**
 * Catálogo de mercado por símbolo.
 *
 * O banco guarda apenas `name` e `symbol`. Preço, variação e demais métricas
 * vêm daqui, para que o dashboard continue recebendo o payload completo que ele
 * já espera. Quando houver cotação real (CoinGecko e afins), é este módulo que
 * será trocado — as rotas não mudam.
 */

const MARKET_OVERVIEW = {
  "totalMarketCapBrl": 14850000000000,
  "totalVolume24hBrl": 485900000000,
  "btcDominancePercent": 57.2,
  "ethDominancePercent": 18.4,
  "solDominancePercent": 8.5,
  "marketTrend": "bullish",
  "marketChange24h": 2.7
};

const MARKET_CATALOG = {
  BTC: {
    "slug": "bitcoin",
    "iconUrl": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    "priceBrl": 348920.5,
    "change24h": 3.92,
    "high24h": 352100,
    "low24h": 341500,
    "volume24hBrl": 145890200,
    "marketCapBrl": 6890450120300,
    "circulatingSupply": "19.7M BTC",
    "rating": 5,
    "lastModified": "21 Out, 2026",
    "category": "layer1",
    "sparkline7d": [
      330000,
      334000,
      332000,
      339000,
      342500,
      345000,
      348920.5
    ]
  },
  ETH: {
    "slug": "ethereum",
    "iconUrl": "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    "priceBrl": 18450.2,
    "change24h": -0.74,
    "high24h": 18900,
    "low24h": 18200,
    "volume24hBrl": 85200300,
    "marketCapBrl": 2220100450000,
    "circulatingSupply": "120.2M ETH",
    "rating": 5,
    "lastModified": "15 Out, 2026",
    "category": "layer1",
    "sparkline7d": [
      18900,
      18750,
      18600,
      18300,
      18550,
      18400,
      18450.2
    ]
  },
  SOL: {
    "slug": "solana",
    "iconUrl": "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    "priceBrl": 982.4,
    "change24h": 8.24,
    "high24h": 995,
    "low24h": 905,
    "volume24hBrl": 36400000,
    "marketCapBrl": 456000000000,
    "circulatingSupply": "465.1M SOL",
    "rating": 4,
    "lastModified": "10 Out, 2026",
    "category": "layer1",
    "sparkline7d": [
      890,
      905,
      920,
      915,
      940,
      960,
      982.4
    ]
  },
  ADA: {
    "slug": "cardano",
    "iconUrl": "https://assets.coingecko.com/coins/images/975/large/cardano.png",
    "priceBrl": 3.48,
    "change24h": 1.85,
    "high24h": 3.55,
    "low24h": 3.39,
    "volume24hBrl": 12400000,
    "marketCapBrl": 124500000000,
    "circulatingSupply": "35.6B ADA",
    "rating": 4,
    "lastModified": "08 Out, 2026",
    "category": "layer1",
    "sparkline7d": [
      3.35,
      3.38,
      3.42,
      3.4,
      3.45,
      3.44,
      3.48
    ]
  },
  XRP: {
    "slug": "ripple",
    "iconUrl": "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
    "priceBrl": 3.22,
    "change24h": -1.15,
    "high24h": 3.3,
    "low24h": 3.18,
    "volume24hBrl": 18500000,
    "marketCapBrl": 178000000000,
    "circulatingSupply": "56.1B XRP",
    "rating": 4,
    "lastModified": "05 Out, 2026",
    "category": "layer1",
    "sparkline7d": [
      3.3,
      3.28,
      3.25,
      3.2,
      3.22,
      3.24,
      3.22
    ]
  },
  DOT: {
    "slug": "polkadot",
    "iconUrl": "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
    "priceBrl": 38.6,
    "change24h": -0.72,
    "high24h": 39.5,
    "low24h": 37.8,
    "volume24hBrl": 7100000,
    "marketCapBrl": 56000000000,
    "circulatingSupply": "1.4B DOT",
    "rating": 4,
    "lastModified": "02 Out, 2026",
    "category": "layer1",
    "sparkline7d": [
      39.2,
      39,
      38.4,
      38.1,
      38.8,
      38.5,
      38.6
    ]
  },
  AVAX: {
    "slug": "avalanche-2",
    "iconUrl": "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
    "priceBrl": 168.9,
    "change24h": 4.6,
    "high24h": 172,
    "low24h": 159,
    "volume24hBrl": 21300000,
    "marketCapBrl": 67000000000,
    "circulatingSupply": "398.2M AVAX",
    "rating": 5,
    "lastModified": "01 Out, 2026",
    "category": "layer1",
    "sparkline7d": [
      158,
      160,
      163,
      162,
      165,
      166,
      168.9
    ]
  },
  LINK: {
    "slug": "chainlink",
    "iconUrl": "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
    "priceBrl": 84.15,
    "change24h": 2.1,
    "high24h": 86,
    "low24h": 82.3,
    "volume24hBrl": 15800000,
    "marketCapBrl": 51000000000,
    "circulatingSupply": "608.1M LINK",
    "rating": 4,
    "lastModified": "29 Set, 2026",
    "category": "defi",
    "sparkline7d": [
      81,
      82,
      83,
      82.5,
      84,
      83.8,
      84.15
    ]
  },
  UNI: {
    "slug": "uniswap",
    "iconUrl": "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png",
    "priceBrl": 45.3,
    "change24h": 5.4,
    "high24h": 46.5,
    "low24h": 42.8,
    "volume24hBrl": 9800000,
    "marketCapBrl": 27000000000,
    "circulatingSupply": "600.4M UNI",
    "rating": 4,
    "lastModified": "28 Set, 2026",
    "category": "defi",
    "sparkline7d": [
      42,
      42.8,
      43.5,
      44,
      44.8,
      45,
      45.3
    ]
  },
  USDT: {
    "slug": "tether",
    "iconUrl": "https://assets.coingecko.com/coins/images/325/large/Tether.png",
    "priceBrl": 5.62,
    "change24h": 0.08,
    "high24h": 5.64,
    "low24h": 5.6,
    "volume24hBrl": 95000000,
    "marketCapBrl": 650000000000,
    "circulatingSupply": "118.4B USDT",
    "rating": 5,
    "lastModified": "27 Set, 2026",
    "category": "stablecoin",
    "sparkline7d": [
      5.61,
      5.62,
      5.61,
      5.63,
      5.62,
      5.62,
      5.62
    ]
  },
};


/**
 * Símbolo -> id do ícone SVG embutido no front (COIN_ICON_PRESETS).
 * Serve de padrão para moedas conhecidas cadastradas sem ícone explícito.
 */
const ICON_PRESET_BY_SYMBOL = {
  BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether', BNB: 'bnb', SOL: 'solana',
  XRP: 'xrp', ADA: 'cardano', DOGE: 'dogecoin', DOT: 'polkadot', LINK: 'chainlink',
  LTC: 'litecoin', AVAX: 'avalanche', POL: 'polygon', USDC: 'usdc', TRX: 'tron',
  XMR: 'monero', SHIB: 'shiba',
};

/** Ícone gerado localmente para símbolos fora do catálogo (sem dependência externa) */
function placeholderIcon(symbol) {
  const initials = (symbol || '?').slice(0, 4);
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    '<circle cx="32" cy="32" r="32" fill="#e2e8f0"/>' +
    '<text x="32" y="41" font-family="sans-serif" font-size="20" font-weight="600" ' +
    'fill="#475569" text-anchor="middle">' + initials + '</text></svg>';
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

/** Métricas neutras para uma moeda que ainda não tem cotação */
function unlistedMarket(symbol) {
  return {
    slug: symbol.toLowerCase(),
    iconUrl: placeholderIcon(symbol),
    priceBrl: 0,
    change24h: 0,
    high24h: 0,
    low24h: 0,
    volume24hBrl: 0,
    marketCapBrl: 0,
    circulatingSupply: '—',
    category: undefined,
    sparkline7d: [],
    listed: false,
  };
}

/**
 * Combina o documento do Mongo (fonte da verdade de name/symbol) com o
 * catálogo de mercado. `rank` não vem daqui: é calculado em rankByMarketCap.
 */
function enrichCrypto(doc) {
  const symbol = doc.symbol;
  const market = MARKET_CATALOG[symbol]
    ? { ...MARKET_CATALOG[symbol], listed: true }
    : unlistedMarket(symbol);

  return {
    id: doc._id.toString(),
    name: doc.name,
    symbol,
    ...market,
    // ícone exibido no dashboard: PNG enviado > URL do seed > catálogo/placeholder
    iconUrl: doc.iconDataUrl || doc.iconUrl || market.iconUrl,
    // campos que a tela de cadastro usa para redesenhar o preset SVG
    iconSource: doc.iconSource,
    iconPresetId: doc.iconPresetId || ICON_PRESET_BY_SYMBOL[symbol],
    iconDataUrl: doc.iconDataUrl,
    iconFileName: doc.iconFileName,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/** Atribui rank por valor de mercado decrescente; sem cotação vai para o fim */
function rankByMarketCap(list) {
  return [...list]
    .sort((a, b) => b.marketCapBrl - a.marketCapBrl)
    .map((item, i) => ({ ...item, rank: i + 1 }));
}

module.exports = {
  MARKET_OVERVIEW,
  MARKET_CATALOG,
  ICON_PRESET_BY_SYMBOL,
  enrichCrypto,
  rankByMarketCap,
  placeholderIcon,
};
