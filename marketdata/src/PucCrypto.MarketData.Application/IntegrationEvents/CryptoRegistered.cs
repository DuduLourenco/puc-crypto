namespace PucCrypto.MarketData.Application.IntegrationEvents;

/// <summary>
/// Uma criptomoeda foi cadastrada no catálogo.
/// Publicado por: Catalog. Consumido por: MarketData, que passa a acompanhá-la.
/// </summary>
public sealed record CryptoRegistered(
    Guid CryptocurrencyId,
    string Symbol,
    string Name,
    string CoinGeckoId,
    DateTime OccurredAt);
