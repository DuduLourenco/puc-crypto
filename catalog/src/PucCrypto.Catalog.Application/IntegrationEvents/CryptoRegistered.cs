namespace PucCrypto.Catalog.Application.IntegrationEvents;

/// <summary>
/// Uma criptomoeda foi cadastrada no catálogo.
/// Publicado por: Catalog. Consumido por: MarketData.
/// </summary>
public sealed record CryptoRegistered(
    Guid CryptocurrencyId,
    string Symbol,
    string Name,
    string CoinGeckoId,
    DateTime OccurredAt);
