namespace PucCrypto.MarketData.Application.IntegrationEvents;

/// <summary>
/// Novos preços de uma criptomoeda foram gravados.
/// Publicado por: MarketData (coleta e carga inicial). Consumido por: Catalog.
/// </summary>
public sealed record PricesIngested(
    Guid CryptocurrencyId,
    string CoinGeckoId,
    int Count,
    decimal LatestPriceUsd,
    DateTime LatestTimestamp,
    DateTime OccurredAt);
