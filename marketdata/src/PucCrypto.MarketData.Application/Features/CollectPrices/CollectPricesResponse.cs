namespace PucCrypto.MarketData.Application.Features.CollectPrices;

public sealed record CollectPricesResponse(
    IReadOnlyList<CollectedPrice> Collected,
    IReadOnlyList<string> NotFoundCoinGeckoIds);

public sealed record CollectedPrice(Guid CryptocurrencyId, string CoinGeckoId, decimal PriceUsd, DateTime Timestamp);
