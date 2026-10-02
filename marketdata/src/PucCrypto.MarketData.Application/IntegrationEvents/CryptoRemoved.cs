namespace PucCrypto.MarketData.Application.IntegrationEvents;

/// <summary>
/// Uma criptomoeda foi excluída do catálogo.
/// Publicado por: Catalog. Consumido por: MarketData, que apaga o histórico dela.
/// </summary>
public sealed record CryptoRemoved(Guid CryptocurrencyId, string CoinGeckoId, DateTime OccurredAt);
