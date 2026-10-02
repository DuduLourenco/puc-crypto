namespace PucCrypto.Catalog.Application.IntegrationEvents;

/// <summary>
/// Novos preços de uma criptomoeda foram gravados.
/// Publicado por: MarketData. Consumido por: Catalog, para guardar o último preço.
/// </summary>
public sealed record PricesIngested(
    Guid CryptocurrencyId,
    string CoinGeckoId,
    int Count,
    decimal LatestPriceUsd,
    DateTime LatestTimestamp,
    DateTime OccurredAt);
