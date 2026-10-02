namespace PucCrypto.Catalog.Application.IntegrationEvents;

/// <summary>
/// Uma criptomoeda foi excluída do catálogo.
/// Publicado por: Catalog. Consumido por: MarketData.
/// </summary>
public sealed record CryptoRemoved(Guid CryptocurrencyId, string CoinGeckoId, DateTime OccurredAt);
