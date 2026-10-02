namespace PucCrypto.Contracts;

/// <summary>
/// Uma criptomoeda entrou no catálogo pela primeira vez.
/// Publicado por: Catalog. Consumido por: MarketData.
/// </summary>
public sealed record CryptoRegistered(
    Guid CryptocurrencyId,
    string Symbol,
    string Name,
    string CoinGeckoId,
    DateTime OccurredAt);
